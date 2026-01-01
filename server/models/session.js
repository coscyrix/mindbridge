//models/session.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import db from '../utils/db.js';
import logger from '../config/winston.js';
import Common from './common.js';
import Form from './form.js';
import UserProfile from './userProfile.js';
import UserForm from './userForm.js';
import Invoice from './invoice.js';
import SendEmail from '../middlewares/sendEmail.js';
import EmailTmplt from './emailTmplt.js';
import { splitIsoDatetime } from '../utils/common.js';
import { clientSessionRescheduleEmail, sessionReminderEmail } from '../utils/emailTmplt.js';
import { formatDateTimeInTimezone, getFriendlyTimezoneName, getDefaultTimezone } from '../utils/timezone.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

export default class Session {
  constructor() {
    this.common = new Common();
    this.form = new Form();
    this.sendEmail = new SendEmail();
    this.userProfile = new UserProfile();
    this.userForm = new UserForm();
    this.emailTmplt = new EmailTmplt();
    this.invoice = new Invoice();
  }
  //////////////////////////////////////////

  // Helper: get today's date string in a specific timezone as YYYY-MM-DD
  getTodayInTimezone(tz) {
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: tz,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).formatToParts(new Date());
      const year = parts.find(p => p.type === 'year')?.value;
      const month = parts.find(p => p.type === 'month')?.value;
      const day = parts.find(p => p.type === 'day')?.value;
      if (year && month && day) return `${year}-${month}-${day}`;
    } catch (e) {}
    return new Date().toISOString().slice(0, 10);
  }

  async postSession(data) {
    try {
      // Get the therapy request to find the counselor and tenant
      const counselorId = await this.common.getThrpyReqById(data.thrpy_req_id);
      if (!counselorId || !counselorId[0]) {
        logger.error('Therapy request not found');
        return { message: 'Therapy request not found', error: -1 };
      }

      const tenantId = await this.common.getUserTenantId({
        user_profile_id: counselorId[0].counselor_id,
      });
      if (!tenantId || !tenantId[0]) {
        logger.error('Tenant not found');
        return { message: 'Tenant not found', error: -1 };
      }

      // Get the service details
      const [svc] = await this.common.getServiceById(data.service_id);
      if (!svc) {
        logger.error('Service not found');
        return { message: 'Service not found', error: -1 };
      }

      // Get reference fees for the tenant
      const ref_fees = await this.common.getRefFeesByTenantId(tenantId[0].tenant_id);
      if (!ref_fees || ref_fees.error) {
        logger.error('Error getting reference fees');
        return { message: 'Error getting reference fees', error: -1 };
      }

      // Calculate session amounts using tenant tax percentage (not service GST)
      const total_invoice = Number(svc.total_invoice);
      const taxAmount = total_invoice * (ref_fees[0].tax_pcnt / 100);
      const basePrice = total_invoice - taxAmount;
      const systemAmount = basePrice * (ref_fees[0].system_pcnt / 100);
      const counselorAmount = basePrice - systemAmount;

      // Split intake_date into date and time components
      let intakeDate = data.intake_date;
      let scheduledTime = data.scheduled_time;
      
      // If intake_date is provided in ISO format, split it
      if (data.intake_date && typeof data.intake_date === 'string' && data.intake_date.includes('T')) {
        const splitResult = splitIsoDatetime(data.intake_date);
        
        if (splitResult.error) {
          logger.error('Error splitting intake_date in postSession:', splitResult.message);
          return { message: 'Invalid intake_date format', error: -1 };
        }
        
        intakeDate = splitResult.date; // 'YYYY-MM-DD'
        // Only use split time if scheduled_time wasn't provided separately
        if (!scheduledTime) {
          scheduledTime = splitResult.time; // 'HH:mm:ss.SSSZ'
        }
        
        // Debug logging
        console.log('🔍 DEBUG: Session creation - parsed date/time:', {
          original_intake_date: data.intake_date,
          parsed_intake_date: intakeDate,
          parsed_scheduled_time: scheduledTime
        });
      } else if (data.intake_date && !scheduledTime) {
        // If only date is provided without time, use default time
        intakeDate = data.intake_date;
        scheduledTime = '09:00:00.000Z';
        logger.warn('⚠️ WARNING: No time provided in intake_date, using default time 09:00:00.000Z');
      }

      // Validate that we have valid date and time
      if (!intakeDate || !scheduledTime) {
        logger.error('Invalid date/time in postSession:', { intakeDate, scheduledTime, original_data: data });
        return { message: 'Invalid date/time format provided', error: -1 };
      }

      // Check for session time collision
      const collisionCheck = await this.common.checkSessionTimeCollision(
        counselorId[0].counselor_id,
        intakeDate,
        scheduledTime,
      );

      if (collisionCheck.error) {
        logger.warn('Session time collision detected, preventing double booking', {
          counselor_id: counselorId[0].counselor_id,
          intake_date: intakeDate,
          scheduled_time: scheduledTime,
        });
        return collisionCheck;
      }

      const tmpSession = {
        thrpy_req_id: data.thrpy_req_id,
        service_id: data.service_id,
        session_format: data.session_format,
        intake_date: intakeDate,
        scheduled_time: scheduledTime,
        session_code: svc.service_code,
        session_description: svc.service_code,
        is_additional: svc.is_additional && svc.is_additional === 1 ? 1 : 0,
        is_report: svc.is_report && svc.is_report === 1 ? 1 : 0,
        tenant_id: tenantId[0].tenant_id, // Use actual tenant_id, not tenant_generated_id
        session_price: total_invoice,
        session_taxes: taxAmount,
        session_counselor_amt: counselorAmount,
        session_system_amt: systemAmount,
        video_link: data.video_link || null, // Add video link for online sessions
      };
      
      // Preserve session_status if provided (e.g., INACTIVE)
      if (data.session_status) {
        tmpSession.session_status = data.session_status;
      }

      // If intake_date is in the past, mark as NO-SHOW (3). Compare using Pacific time date.
      // Only override if session_status wasn't explicitly set (e.g., not INACTIVE)
      try {
        const todayPacific = this.getTodayInTimezone('America/Los_Angeles');
        // Use the parsed intakeDate (already in YYYY-MM-DD format)
        const intakeDatePart = intakeDate;
        if (intakeDatePart && intakeDatePart < todayPacific && tmpSession.is_report !== 1 && !data.session_status) {
          tmpSession.session_status = 3; // NO-SHOW
        }
      } catch (e) {
        // Fallback: ignore and let DB default handle
      }

      const postSession = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .insert(tmpSession);

      if (!postSession) {
        logger.error('Error creating session');
        return { message: 'Error creating session', error: -1 };
      }

      return { message: 'Session created successfully' };
    } catch (error) {
      console.log("error", error);
      return { message: 'Error creating session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async postAdditionalSession(data) {
    try {
      let tmpSession;
      const counselorId = await this.common.getThrpyReqById(data.thrpy_req_id);
      const tenantId = await this.common.getUserTenantId({
        user_profile_id: counselorId[0].counselor_id,
      });
      data.tenant_id = Number(tenantId[0].tenant_id);

      // Function to split the date and time from the intake date
      const splitResult = splitIsoDatetime(data.intake_date);
      
      if (splitResult.error) {
        logger.error('Error splitting intake_date in postAdditionalSession:', splitResult.message);
        return { message: 'Invalid intake_date format', error: -1 };
      }
      
      const { date: req_dte, time: req_time } = splitResult;
      
      // Validate that we have valid date and time
      if (!req_dte || !req_time) {
        logger.error('Invalid date/time from splitIsoDatetime in postAdditionalSession:', { req_dte, req_time, original_intake_date: data.intake_date });
        return { message: 'Invalid date/time format in intake_date', error: -1 };
      }
      
      // Debug logging
      console.log('🔍 DEBUG: Additional session creation - parsed date/time:', {
        original_intake_date: data.intake_date,
        parsed_req_dte: req_dte,
        parsed_req_time: req_time
      });

      // Check if the ThrpyReq is discharged
      const checkThrpyReqDischarge = await this.common.checkThrpyReqDischarge({
        req_id: data.thrpy_req_id,
      });

      if (checkThrpyReqDischarge.error) {
        logger.warn(checkThrpyReqDischarge.message);
        return { message: checkThrpyReqDischarge.message, error: -1 };
      }

      const [svc] = await this.common.getServiceById(data.service_id);

      if (!svc) {
        logger.warn('Service not found');
        return { message: 'Service not found', error: -1 };
      }

      if (svc.is_additional[0] === 0) {
        logger.warn('Service is not additional');
        return { message: 'Service is not additional', error: -1 };
      }

      // Fetch reference fees for the tenant
      const ref_fees = await this.common.getRefFeesByTenantId(data.tenant_id);
      console.log('ref_fees', ref_fees); 
      if (!ref_fees || ref_fees.error) {
        logger.error('Error getting reference fees');
        return { message: 'Error getting reference fees', error: -1 };
      }

      // Calculate session amounts
      const total_invoice = Number(svc.total_invoice);
      const service_gst = Number(svc.gst) || 0;
      const tax_pcnt = Number(ref_fees[0].tax_pcnt);
      const counselor_pcnt = Number(ref_fees[0].counselor_pcnt);
      const system_pcnt = Number(ref_fees[0].system_pcnt);

      // total_invoice already includes tax, so we need to extract the base price
      let basePrice = total_invoice;
      let session_taxes = 0;
      
      if (service_gst && service_gst > 0) {
        // Calculate base price by removing the tax that's already included
        // total_invoice = basePrice + (basePrice * service_gst / 100)
        // total_invoice = basePrice * (1 + service_gst / 100)
        // basePrice = total_invoice / (1 + service_gst / 100)
        basePrice = total_invoice / (1 + service_gst / 100);
        session_taxes = total_invoice - basePrice;
      } else {
        // Fallback: use ref_fees tax percentage if service GST is not available
        session_taxes = total_invoice * (tax_pcnt / 100);
        basePrice = total_invoice - session_taxes;
      }

      const session_price = total_invoice; // Keep the original total_invoice as session_price
      const session_system_amt = basePrice * (system_pcnt / 100);
      // Counselor gets the remaining amount after system fees
      const session_counselor_amt = basePrice - session_system_amt;

      tmpSession = {
        thrpy_req_id: data.thrpy_req_id,
        service_id: data.service_id,
        session_format: data.session_format,
        intake_date: req_dte,
        scheduled_time: req_time,
        session_description: svc.service_code,
        is_additional: svc.is_additional && svc.is_additional === 1 ? 1 : 0,
        is_report: svc.is_report && svc.is_report === 1 ? 1 : 0,
        tenant_id: data.tenant_id,
        session_price,
        session_taxes,
        session_counselor_amt,
        session_system_amt,
      };

      // If intake_date is in the past, mark as NO-SHOW (3). Compare using Pacific time date.
      try {
        const todayPacific = this.getTodayInTimezone('America/Los_Angeles');
        const intakeDatePart = req_dte; // already 'YYYY-MM-DD'
        if (intakeDatePart && intakeDatePart < todayPacific && tmpSession.is_report !== 1) {
          tmpSession.session_status = 3; // NO-SHOW
        }
      } catch (e) {
        // Fallback: ignore and let DB default handle
      }

      const postSession = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .insert(tmpSession);

      if (!postSession) {
        logger.error('Error creating session');
        return { message: 'Error creating session', error: -1 };
      }

      // const sendAdditionalServiceEmail =
      //   this.emailTmplt.sendAdditionalServiceEmail({
      //     session_id: postSession[0],
      //   });

      return { message: 'Session created successfully' };
    } catch (error) {
      logger.error(error);

      return { message: 'Error creating session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async putSessionById(data) {
    try {
      console.log('data', data);
      // Check if session is ongoing
      const checkSessionIfOngoing = await this.checkSessionONGOING(
        data.session_id,
      );

      if (!data.invoice_nbr) {
        if (data.role_id != 4 && data.role_id != 3) {
          if (checkSessionIfOngoing.rec.length > 0) {
            console.log('checkSessionIfOngoing', checkSessionIfOngoing);
            logger.error('Session is ongoing');
            return { message: 'Session is ongoing', error: -1 };
          }
        }
      }

      const recSession = await this.getSessionById({
        session_id: data.session_id,
      });

      // Check if the ThrpyReq is discharged
      const checkThrpyReqDischarge = await this.common.checkThrpyReqDischarge({
        req_id: recSession[0].thrpy_req_id,
      });

      if (checkThrpyReqDischarge.error) {
        logger.warn(checkThrpyReqDischarge.message);
        return { message: checkThrpyReqDischarge.message, error: -1 };
      }

      // Check if user has access to update session. Can make an update even if a session is ongoing
      if (data.role_id == 4 || data.role_id == 3) {
        const checkUserAccess = await this.common.checkUserRole({
          user_profile_id: data.user_profile_id,
          role_id: data.role_id,
        });

        if (checkUserAccess.error) {
          logger.error('Error checking user role');
          return { message: checkUserAccess.message, error: -1 };
        }
      }

      const dischargeCodeEnv = process.env.DISCHARGE_SERVICE_CODE;
      const dischargeCodes = [
        dischargeCodeEnv?.toUpperCase(),
        'OTR_SUM_REP',
        'OTR_TRNS_REP',
      ].filter(Boolean);
      const sessionCodeUpper = (recSession[0]?.session_code || '').toUpperCase();
      const isDischargeSession = dischargeCodes.some((code) =>
        sessionCodeUpper.includes(code),
      );

      // Check if session is a discharge session
      if (isDischargeSession && recSession[0]) {
        // Update all sessions with the same therapy request id to No Show if status is scheduled
        let putSessionsQuery = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('thrpy_req_id', recSession[0].thrpy_req_id)
          .andWhere('session_status', 1);

        if (dischargeCodeEnv) {
          putSessionsQuery = putSessionsQuery.whereRaw(
            'LOWER(session_code) NOT LIKE LOWER(?)',
            [`%${dischargeCodeEnv}%`],
          );
        }

        ['OTR_SUM_REP', 'OTR_TRNS_REP'].forEach((code) => {
          putSessionsQuery = putSessionsQuery.whereRaw(
            'LOWER(session_code) NOT LIKE LOWER(?)',
            [`%${code}%`],
          );
        });

        const putSessions = await putSessionsQuery.update({
          session_status: 3,
        });

        if (putSessions === 0) {
          logger.warn('No sessions were updated as their status was not 1.');
        } else if (!putSessions) {
          logger.error('Error updating sessions');
          return { message: 'Error updating sessions', error: -1 };
        }

        // Update the discharge session to discharged
        let dischargeSessionQuery = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('thrpy_req_id', recSession[0].thrpy_req_id);

        dischargeSessionQuery = dischargeSessionQuery.where(function () {
          if (dischargeCodeEnv) {
            this.whereRaw('LOWER(session_code) LIKE LOWER(?)', [
              `%${dischargeCodeEnv}%`,
            ])
              .orWhereRaw('LOWER(session_code) LIKE LOWER(?)', ['%OTR_SUM_REP%'])
              .orWhereRaw('LOWER(session_code) LIKE LOWER(?)', [
                '%OTR_TRNS_REP%',
              ]);
          } else {
            this.whereRaw('LOWER(session_code) LIKE LOWER(?)', ['%OTR_SUM_REP%'])
              .orWhereRaw('LOWER(session_code) LIKE LOWER(?)', [
                '%OTR_TRNS_REP%',
              ]);
          }
        });

        const putDischargeSession = await dischargeSessionQuery.update({
          session_status: 'DISCHARGED',
        });

        if (!putDischargeSession) {
          logger.error('Error updating discharge session');
          return { message: 'Error updating discharge session', error: -1 };
        }

        const tmpThrpyReq = {
          thrpy_status: 2,
        };

        const putThrpyReq = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('thrpy_req')
          .where('req_id', recSession[0].thrpy_req_id)
          .update(tmpThrpyReq);

        if (!putThrpyReq) {
          logger.error('Error updating therapy request');
          return { message: 'Error updating therapy request', error: -1 };
        }

        // Send discharge email
        const checkThrpyReq = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('v_thrpy_req')
          .where('status_yn', 1)
          .andWhere('req_id', recSession[0].thrpy_req_id);

        const dischargeEmlTmplt = this.emailTmplt.sendDischargeEmail({
          client_id: checkThrpyReq[0].client_id,
        });
      }

      let tmpSession;
      if (data.session_status) {
        tmpSession = {
          ...(data.session_status && { session_status: data.session_status }),
          // ...data.thrpy_req_id && {thrpy_req_id: data.thrpy_req_id},
          ...(data.service_id && { service_id: data.service_id }),
          ...(data.session_format && { session_format: data.session_format }),
          ...(data.intake_date && { intake_date: data.intake_date }),
          ...(data.scheduled_time && { scheduled_time: data.scheduled_time }),
          // ...data.session_description && {session_description: data.session_description},
          // ...data.is_additional && {is_additional: data.is_additional},
          // ...data.is_report && {is_report: data.is_report},
        };
      }

      if (data.scheduled_time || data.intake_date) {
        // Handle scheduled_time format - could be ISO format or space-separated
        let parsedScheduledTime = data.scheduled_time;
        let parsedIntakeDate = data.intake_date;

        // If scheduled_time is in ISO format (contains 'T'), split it
        if (data.scheduled_time && data.scheduled_time.includes('T')) {
          const splitResult = splitIsoDatetime(data.scheduled_time);
          if (!splitResult.error) {
            // Use split date if intake_date wasn't provided separately
            parsedIntakeDate = parsedIntakeDate || splitResult.date;
            parsedScheduledTime = splitResult.time;
          } else {
            // Fallback: try to extract time from ISO format manually
            const timePart = data.scheduled_time.split('T')[1];
            if (timePart) {
              // Extract time part: "HH:mm:ss" or "HH:mm:ss.SSSZ"
              parsedScheduledTime = timePart.split('.')[0];
              if (timePart.includes('Z')) {
                parsedScheduledTime += 'Z';
              }
            }
          }
        } else if (data.scheduled_time && data.scheduled_time.includes(' ')) {
          // Handle space-separated format: "YYYY-MM-DD HH:mm:ssZ"
          parsedScheduledTime = data.scheduled_time.split(' ')[1]; // Extract time part 'HH:mm:ssZ'
        }

        // Get the new date and time values for collision check
        const newIntakeDate = parsedIntakeDate || recSession[0].intake_date;
        const newScheduledTime = parsedScheduledTime || recSession[0].scheduled_time;

        // Get counselor_id from therapy request for collision check
        const thrpyReq = await this.common.getThrpyReqById(recSession[0].thrpy_req_id);
        if (!thrpyReq || !thrpyReq[0] || !thrpyReq[0].counselor_id) {
          logger.error('Therapy request not found or missing counselor_id');
          return { message: 'Therapy request not found', error: -1 };
        }

        // Check for session time collision (exclude current session being updated)
        const collisionCheck = await this.common.checkSessionTimeCollision(
          thrpyReq[0].counselor_id,
          newIntakeDate,
          newScheduledTime,
          data.session_id, // Exclude the current session from collision check
        );

        if (collisionCheck.error) {
          logger.warn('Session time collision detected, preventing double booking', {
            counselor_id: thrpyReq[0].counselor_id,
            intake_date: newIntakeDate,
            scheduled_time: newScheduledTime,
            session_id: data.session_id,
          });
          return collisionCheck;
        }

        tmpSession = {
          ...tmpSession, // Preserve any existing tmpSession data
          ...(parsedScheduledTime && { scheduled_time: parsedScheduledTime }),
          ...(parsedIntakeDate && { intake_date: parsedIntakeDate }),
        };
      }
      
// TODO: RECHECK THE BELOW CODE

      // If session is being cancelled, set prices to 0 (same behavior as NO-SHOW)
      // Check this after all tmpSession assignments to ensure it applies
      if (data.session_status === 'CANCELLED' || data.session_status === 'CANCELLATION') {
        if (!tmpSession) {
          tmpSession = {};
        }
        tmpSession.session_price = 0;
        tmpSession.session_taxes = 0;
        tmpSession.session_counselor_amt = 0;
        tmpSession.session_system_amt = 0;
      }

      if (data.invoice_nbr) {
        // Check if invoice number already exists
        const checkInvoice = await this.invoice.getInvoiceOr({
          invoice_nbr: data.invoice_nbr,
        });

        if (checkInvoice.error) {
          logger.error('Error getting invoice');
          return { message: 'Error getting invoice', error: -1 };
        }

        if (checkInvoice.rec.length > 0) {
          logger.warn('Invoice number already used');
          return { message: 'Invoice number already used', error: -1 };
        }

        // Check if session has already been invoiced
        const checkInvoiceSession = await this.invoice.getInvoiceOr({
          session_id: data.session_id,
        });

        if (checkInvoiceSession.error) {
          logger.error('Error getting invoice');
          return { message: 'Error getting invoice', error: -1 };
        }

        // Delete invoice if it exists to save the new one
        if (checkInvoiceSession.rec.length > 0) {
          const delInvoice = await this.invoice.delInvoiceBySessionId({
            session_id: data.session_id,
          });
        }

        if (checkInvoice.rec.length === 0) {
          const tmpInvoice = {
            session_id: data.session_id,
            invoice_nbr: data.invoice_nbr,
          };

          const postInvoice = await this.invoice.postInvoice(tmpInvoice);

          if (postInvoice.error) {
            logger.error('Error creating invoice');
            return { message: 'Error creating invoice', error: -1 };
          }
        }
      }
      if (data.session_status === 3 && data.notes) {
        const sessionNotes = this.common.postNotes({
          session_id: data.session_id,
          message: data.notes,
        });

        if (sessionNotes.error) {
          logger.error('Error adding notes');
          return { message: 'Error adding notes', error: -1 };
        }
      }

      // Update session if it is not a discharge session and has not been invoiced
      if (
        (tmpSession &&
          Object.keys(tmpSession).length > 0 &&
          recSession[0].is_additional === 1) ||
        (tmpSession &&
          Object.keys(tmpSession).length > 0 &&
          !(
            dischargeCodeEnv &&
            sessionCodeUpper.includes(`_${dischargeCodeEnv?.toUpperCase()}`)
          ))
        && !sessionCodeUpper.includes('_OTR_SUM_REP')
        && !sessionCodeUpper.includes('_OTR_TRNS_REP')
      ) {
        const putSession = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('session_id', data.session_id)
          .update(tmpSession);

        console.log('////////////////3/////////////////');

        if (data.session_status) {
          if (recSession[0].is_additional != 1) {
            if (recSession[0].is_report != 1) {
              const sendTools = await this.emailTmplt.sendTreatmentToolEmail({
                session_id: data.session_id,
              });

              if (sendTools?.warn !== -1) {
                if (sendTools?.error) {
                  logger.error(sendTools?.message);
                  console.log(
                    'Error sending treatment tools email',
                    sendTools.error,
                  );
                }

                // Update forms based on environment variable
                const formMode = process.env.FORM_MODE || 'auto';
                
                if (formMode === 'treatment_target') {
                  // Treatment target mode: only update treatment target session forms
                  const TreatmentTargetSessionForms = (await import('./treatmentTargetSessionForms.js')).default;
                  const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
                  
                  const updateTreatmentTargetForms = await treatmentTargetSessionForms.updateTreatmentTargetSessionFormsBySessionId({
                    session_id: data.session_id,
                    is_sent: true,
                  });

                  if (updateTreatmentTargetForms.error) {
                    console.log('error updating treatment target session forms', updateTreatmentTargetForms.error);
                    logger.error('Error updating treatment target session forms');
                    return { message: 'Error updating treatment target session forms', error: -1 };
                  }
                } else {
                  // Service mode or auto mode: update user forms (service-based forms)
                  const uptUserForm = await this.userForm.putUserFormBySessionId({
                    session_id: data.session_id,
                    is_sent: 1,
                  });

                  if (uptUserForm.error) {
                    console.log('error updating user form', uptUserForm.error);
                    logger.error('Error updating user form');
                    return { message: 'Error updating user form', error: -1 };
                  }
                  
                  // In auto mode, also try to update treatment target forms if they exist
                  if (formMode === 'auto') {
                    const TreatmentTargetSessionForms = (await import('./treatmentTargetSessionForms.js')).default;
                    const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
                    
                    const updateTreatmentTargetForms = await treatmentTargetSessionForms.updateTreatmentTargetSessionFormsBySessionId({
                      session_id: data.session_id,
                      is_sent: true,
                    });

                    // Don't return error for treatment target forms in auto mode, just log it
                    if (updateTreatmentTargetForms.error) {
                      console.log('error updating treatment target session forms', updateTreatmentTargetForms.error);
                      logger.error('Error updating treatment target session forms');
                    }
                  }
                }
              }
            }
          }
        }

        if (!putSession) {
          logger.error('Error updating session');
          return { message: 'Error updating session', error: -1 };
        }

        // Check if session was rescheduled (date or time changed) and send email to client
        if (tmpSession && (tmpSession.intake_date || tmpSession.scheduled_time)) {
          const oldDate = recSession[0].intake_date;
          const oldTime = recSession[0].scheduled_time;
          const newDate = tmpSession.intake_date || oldDate;
          const newTime = tmpSession.scheduled_time || oldTime;
          
          // Check if date or time actually changed
          const isRescheduled = (oldDate !== newDate) || (oldTime !== newTime);
          
          if (isRescheduled) {
            try {
              // Get therapy request to get client info and cancel_hash
              const thrpyReqData = await this.common.getThrpyReqById(recSession[0].thrpy_req_id);
              if (thrpyReqData && thrpyReqData[0]) {
                const clientId = thrpyReqData[0].client_id;
                
                // Get client profile
                const clientProfile = await this.common.getUserProfileByUserProfileId(clientId);
                if (clientProfile && clientProfile[0]) {
                  const clientName = `${clientProfile[0].user_first_name} ${clientProfile[0].user_last_name}`;
                  
                  // Get client email
                  const clientUser = await this.common.getUserById(clientProfile[0].user_id);
                  if (clientUser && clientUser[0] && clientUser[0].email) {
                    const clientEmail = clientUser[0].email;
                    
                    // Get cancel_hash from therapy request for secure link
                    const thrpyReqFull = await db
                      .withSchema(`${process.env.MYSQL_DATABASE}`)
                      .from('thrpy_req')
                      .where('req_id', recSession[0].thrpy_req_id)
                      .first();
                    
                    const cancelHash = thrpyReqFull?.cancel_hash;
                    const secureLink = cancelHash 
                      ? `${process.env.BASE_URL || 'https://mindapp.mindbridge.solutions/'}session-management?hash=${encodeURIComponent(cancelHash)}`
                      : `${process.env.BASE_URL || 'https://mindapp.mindbridge.solutions/'}session-management`;
                    
                    // Get client timezone (prefer client, fallback to counselor, then env default)
                    const clientTimezone = clientProfile[0].timezone 
                      || (thrpyReqData[0].counselor_timezone) 
                      || process.env.TIMEZONE 
                      || 'UTC';
                    
                    // Format new date and time in client's timezone
                    const { localDate, localTime } = formatDateTimeInTimezone(
                      newDate,
                      newTime,
                      clientTimezone
                    );
                    
                    // Get counselor email for Reply-To
                    let counselorEmail = null;
                    if (thrpyReqData[0].counselor_id) {
                      const counselorProfile = await this.common.getUserProfileByUserProfileId(thrpyReqData[0].counselor_id);
                      if (counselorProfile && counselorProfile[0] && counselorProfile[0].user_id) {
                        const counselorUser = await this.common.getUserById(counselorProfile[0].user_id);
                        if (counselorUser && counselorUser[0]) {
                          counselorEmail = counselorUser[0].email;
                        }
                      }
                    }
                    
                    // Format date and time for email (e.g., "January 15, 2025 at 2:30 PM")
                    const formattedDateTime = `${localDate} at ${localTime}`;
                    
                    // Send reschedule email to client
                    const rescheduleEmail = clientSessionRescheduleEmail(
                      clientEmail,
                      clientName,
                      formattedDateTime,
                      secureLink,
                      counselorEmail
                    );
                    
                    const emailResult = await this.sendEmail.sendMail(rescheduleEmail);
                    if (emailResult?.error) {
                      logger.error('Error sending reschedule email to client:', emailResult.message);
                      // Don't fail the update if email fails
                    } else {
                      logger.info('Reschedule email sent successfully to client:', clientEmail);
                    }
                  } else {
                    logger.warn('Client email not found for session reschedule notification', {
                      session_id: data.session_id,
                      client_id: clientId,
                    });
                  }
                } else {
                  logger.warn('Client profile not found for session reschedule notification', {
                    session_id: data.session_id,
                    client_id: clientId,
                  });
                }
              }
            } catch (emailError) {
              logger.error('Error sending reschedule email to client:', emailError);
              // Don't fail the session update if email fails
            }
          }
        }
      }

      return { message: 'Session updated successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);

      return { message: 'Error updating session', error: -1 };
    }
  }

  //////////////////////////////////////////

  // async SendTreatmentToolsEmail(data) {
  //   try {
  //     const recSession = await this.getSessionById({
  //       session_id: data.session_id,
  //     });
  //     if (!recSession || !Array.isArray(recSession)) {
  //       logger.error('Session not found');
  //       return { message: 'Session not found', error: -1 };
  //     }

  //     const recThrpy = await this.common.getThrpyReqById(
  //       recSession[0].thrpy_req_id,
  //     );

  //     if (!recThrpy || !Array.isArray(recThrpy)) {
  //       logger.error('Therapy request not found');
  //       return { message: 'Therapy request not found', error: -1 };
  //     }

  //     const recUser = await this.common.getUserProfileByUserProfileId(
  //       recThrpy[0].client_id,
  //     );

  //     if (!recUser || !Array.isArray(recUser)) {
  //       logger.error('User profile not found');
  //       return { message: 'User profile not found', error: -1 };
  //     }

  //     recSession.forEach(async (session) => {
  //       for (const arry of session.forms_array) {
  //         const [form] = await this.form.getFormByFormId({ form_id: arry });
  //         const form_name = form.form_cde;
  //         const client_full_name =
  //           recUser[0].user_first_name + ' ' + recUser[0].user_last_name;
  //         const toolsEmail = treatmentToolsEmail(
  //           recUser[0].email,
  //           client_full_name,
  //           form_name,
  //         );

  //         const email = this.sendEmail.sendMail(toolsEmail);

  //         if (email.error) {
  //           logger.error('Error sending email');
  //           return { message: 'Error sending email', error: -1 };
  //         }
  //       }
  //     });
  //   } catch (error) {
  //     console.log(error);
  //     logger.error(error);
  //     return { message: 'Something went wrong' };
  //   }
  // }

  //////////////////////////////////////////

  async delSessionById(data) {
    try {
      const tmpSession = {
        status_yn: 2,
      };

      const delSession = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .where('session_id', data.session_id)
        .update(tmpSession);

      if (!delSession) {
        logger.error('Error deleting session');
        return { message: 'Error deleting session', error: -1 };
      }

      return { message: 'Session deleted successfully' };
    } catch (error) {
      logger.error(error);

      return { message: 'Error deleting session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getSessionById(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_session')
        .where('status_yn', 1);

      if (data.session_id) {
        query = query.andWhere('session_id', data.session_id);
      }

      if (data.thrpy_req_id) {
        query = query.andWhere('thrpy_req_id', data.thrpy_req_id);
      }

      if (data.service_code) {
        query = query.andWhere('service_code', data.service_code);
      }

      if (data.session_status) {
        query = query.andWhere('session_status', data.session_status);
      }

      if (data.tenant_id) {
        query = query.andWhere('tenant_id', data.tenant_id);
      }

      const rec = await query;
      if (!rec) {
        logger.error('Error getting session');
        return { message: 'Error getting session', error: -1 };
      }
      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getSessionByThrpyReqId(data) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_session')
        .where('thrpy_req_id', data.thrpy_req_id)
        .whereNot('session_status', 1);
      if (!rec) {
        logger.error('Error getting session');
        return { message: 'Error getting session', error: -1 };
      }
      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getSessionTodayAndTomorrow(data) {
    try {
      // Get current date in user's timezone
      const user_timezone = data.user_timezone || 'UTC'; // Default to UTC if not provided
      const currentDate = new Date();
      const tomorrowDate = new Date();
      tomorrowDate.setDate(currentDate.getDate() + 1);

      const formatDate = (date) => {
        return new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: user_timezone,
        }).format(date);
      };

      const formattedCurrentDate = formatDate(currentDate);
      const formattedTomorrowDate = formatDate(tomorrowDate);

      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_session')
        .where('intake_date_formatted', formattedCurrentDate)
        .andWhere('thrpy_status', 'ONGOING')
        .andWhere('status_yn', 'y') // Only active sessions
        .whereNot('session_status', 'DISCHARGED') // Exclude discharged sessions
        .whereNot('session_status', 'INACTIVE'); // Exclude inactive sessions

      // Apply role-based filtering
      console.log('Session filtering - role_id:', data.role_id, 'tenant_id:', data.tenant_id, 'counselor_id:', data.counselor_id);
      
      console.log('data',{data});
      

      if (data.role_id == 2 && data.counselor_id) {
        query.andWhere('counselor_id', data.counselor_id);
        console.log('Filtering by counselor_id:', data.counselor_id);
      } else if (data.role_id == 3 && data.tenant_id) {
        query.andWhere('tenant_id', data.tenant_id);
        console.log('Filtering by tenant_id:', data.tenant_id);
        
        // If counselor_id is provided, also filter by specific counselor
        if (data.counselor_id) {
          query.andWhere('counselor_id', data.counselor_id);
          console.log('Also filtering by counselor_id:', data.counselor_id);
        }
      } else if (data.role_id == 4) {
        // No additional filtering needed for admin role - show all sessions
        console.log('No filtering for admin role');
      } else if (data.counselor_id) {
        // Default case: filter by counselor_id if provided
        query.andWhere('counselor_id', data.counselor_id);
        console.log('Default filtering by counselor_id:', data.counselor_id);
      } else {
        console.log('No filtering applied');
      }
      const recToday = await query;

      if (!recToday) {
        logger.error('Error getting session');
        return { message: 'Error getting session', error: -1 };
      }

      const query2 = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_session')
        .where('intake_date_formatted', formattedTomorrowDate)
        .andWhere('thrpy_status', 'ONGOING')
        .andWhere('status_yn', 'y') // Only active sessions
        .whereNot('session_status', 'DISCHARGED') // Exclude discharged sessions
        .whereNot('session_status', 'INACTIVE'); // Exclude inactive sessions

      // Apply role-based filtering for tomorrow's sessions
      if (data.role_id == 2 && data.counselor_id) {
        query2.andWhere('counselor_id', data.counselor_id);
      } else if (data.role_id == 3 && data.tenant_id) {
        query2.andWhere('tenant_id', data.tenant_id);
        
        // If counselor_id is provided, also filter by specific counselor
        if (data.counselor_id) {
          query2.andWhere('counselor_id', data.counselor_id);
        }
      } else if (data.role_id == 4) {
        // No additional filtering needed for admin role - show all sessions
      } else if (data.counselor_id) {
        // Default case: filter by counselor_id if provided
        query2.andWhere('counselor_id', data.counselor_id);
      }
      const recTomorrow = await query2;

      if (!recTomorrow) {
        logger.error('Error getting session');
        return { message: 'Error getting session', error: -1 };
      }

      return { session_today: recToday, session_tomorrow: recTomorrow };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async dailyUpdateSessionStatus() {
    try {
      // Use Pacific time for determining "today"
      const currentDate = this.getTodayInTimezone('America/Los_Angeles');
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .where('intake_date', '<', currentDate) // fix for 4 defect
        .andWhere('session_status', 1)
        .andWhereNot('is_report', 1)
        .update({ session_status: 3 });

      if (typeof rec !== 'number') {
        logger.error('Error updating session.');
        return { message: 'Error updating session', error: -1 };
      }

      return { message: 'Session updated successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error updating session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async checkSessionONGOING(session_id) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .where('session_id', session_id)
        .whereNot('session_status', 1); // where not scheduled which is 1 (Default)

      if (!rec) {
        logger.error('Error getting session');
        return { message: 'Error getting session', error: -1 };
      }

      if (rec.length > 0) {
        return { message: 'Session is ongoing', rec };
      }

      return { message: 'Session is not ongoing', rec: [] };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getAssessmentStats(data) {
    try {
      // Get form mode from environment variable
      const formMode = process.env.FORM_MODE || 'auto';
      
      let query;

      if (formMode === 'treatment_target') {
        // Treatment target mode: query treatment target session forms
        query = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('treatment_target_session_forms as tt')
          .join('user_profile as client', 'tt.client_id', 'client.user_profile_id')
          .join('forms as f', 'tt.form_id', 'f.form_id')
          .join('thrpy_req as tr', 'tt.req_id', 'tr.req_id')
          .leftJoin('feedback as fb', function() {
            this.on('fb.form_id', '=', 'tt.form_id')
                .andOn(function() {
                  this.on('fb.session_id', '=', 'tt.session_id')
                      .orOnNull('fb.session_id');
                });
          })
          .select(
            'tt.req_id as thrpy_req_id',
            'tt.client_id',
            'client.user_first_name as client_first_name',
            'client.user_last_name as client_last_name',
            'tt.counselor_id',
            'tt.tenant_id',
            'tt.form_id',
            'f.form_cde',
            'tt.sent_at as date_sent',
            'tt.is_sent',
            'fb.feedback_id',
            db.raw(`
              CASE 
                WHEN fb.feedback_id IS NOT NULL THEN 'completed'
                WHEN tt.is_sent = 1 AND fb.feedback_id IS NULL THEN 'pending'
                WHEN tt.is_sent = 0 OR tt.is_sent IS NULL THEN 'upcoming'
                ELSE 'pending'
              END as status
            `)
          )
          .where('client.status_yn', 'y')
          .andWhere('tr.thrpy_status', '!=', 2)
          .andWhere('f.form_cde', '!=', 'SESSION SUM REPORT') // Exclude attendance forms
          .orderBy('tt.sent_at', 'desc');
      } else {
        // Service mode or auto mode: query user forms
        query = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('v_user_form as vuf')
          .leftJoin('thrpy_req as tr', 'vuf.thrpy_req_id', 'tr.req_id')
          .leftJoin('feedback as fb', function() {
            this.on('fb.form_id', '=', 'vuf.form_id')
                .andOn(function() {
                  this.on('fb.session_id', '=', 'vuf.session_id')
                      .orOn(function() {
                        this.on('fb.client_id', '=', 'vuf.client_id')
                            .andOnNull('fb.session_id');
                      });
                });
          })
          .select(
            'vuf.thrpy_req_id',
            'vuf.client_id',
            'vuf.client_first_name',
            'vuf.client_last_name',
            'vuf.counselor_id',
            'vuf.tenant_id',
            'vuf.form_id',
            'vuf.form_cde',
            'vuf.updated_at as date_sent',
            'vuf.is_sent',
            'fb.feedback_id',
            db.raw(`
              CASE 
                WHEN fb.feedback_id IS NOT NULL THEN 'completed'
                WHEN vuf.is_sent = 1 AND fb.feedback_id IS NULL THEN 'pending'
                WHEN vuf.is_sent = 0 OR vuf.is_sent IS NULL THEN 'upcoming'
                ELSE 'pending'
              END as status
            `)
          )
          .andWhere('vuf.client_status_yn', 'y')
          .andWhere('vuf.form_cde', '!=', 'SESSION SUM REPORT') // Exclude attendance forms
          .andWhere(function() {
            this.where('tr.thrpy_status', '!=', 2).orWhereNull('tr.thrpy_status');
          })
          .orderBy('vuf.updated_at', 'desc');
      }

      console.log('Assessment stats query mode:', formMode);
      console.log('Assessment stats query params:', data);

      // Apply filters based on role
      if (data.role_id === 2) {
        if (data.counselor_id) {
          if (formMode === 'treatment_target') {
            query.andWhere('tt.counselor_id', data.counselor_id);
          } else {
            query.andWhere('vuf.counselor_id', data.counselor_id);
          }
          
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            if (formMode === 'treatment_target') {
              query.andWhere('tt.tenant_id', Number(tenantId[0].tenant_id));
            } else {
              query.andWhere('vuf.tenant_id', Number(tenantId[0].tenant_id));
            }
          }
        }

        if (data.thrpy_req_id) {
          if (formMode === 'treatment_target') {
            query.andWhere('tt.req_id', data.thrpy_req_id);
          } else {
            query.andWhere('vuf.thrpy_req_id', data.thrpy_req_id);
          }
        }
      }

      if (data.role_id === 3) {
        if (data.tenant_id) {
          if (formMode === 'treatment_target') {
            query.andWhere('tt.tenant_id', Number(data.tenant_id));
          } else {
            query.andWhere('vuf.tenant_id', Number(data.tenant_id));
          }
        } else if (data.counselor_id) {
          const tenantId = await this.common.getUserTenantId({
            user_profile_id: data.counselor_id,
          });
          if (tenantId && !tenantId.error && tenantId.length > 0) {
            if (formMode === 'treatment_target') {
              query.andWhere('tt.tenant_id', Number(tenantId[0].tenant_id));
            } else {
              query.andWhere('vuf.tenant_id', Number(tenantId[0].tenant_id));
            }
          }
        }
        
        if (data.counselor_id) {
          if (formMode === 'treatment_target') {
            query.andWhere('tt.counselor_id', data.counselor_id);
          } else {
            query.andWhere('vuf.counselor_id', data.counselor_id);
          }
        }

        if (data.thrpy_req_id) {
          if (formMode === 'treatment_target') {
            query.andWhere('tt.req_id', data.thrpy_req_id);
          } else {
            query.andWhere('vuf.thrpy_req_id', data.thrpy_req_id);
          }
        }
      }

      // Handle other role_ids
      if (data.role_id !== 2 && data.role_id !== 3 && data.counselor_id) {
        const tenantId = await this.common.getUserTenantId({
          user_profile_id: data.counselor_id,
        });
        if (tenantId && !tenantId.error && tenantId.length > 0) {
          if (formMode === 'treatment_target') {
            query.andWhere('tt.tenant_id', Number(tenantId[0].tenant_id));
          } else {
            query.andWhere('vuf.tenant_id', Number(tenantId[0].tenant_id));
          }
        }
        
        if (formMode === 'treatment_target') {
          query.andWhere('tt.counselor_id', data.counselor_id);
        } else {
          query.andWhere('vuf.counselor_id', data.counselor_id);
        }

        if (data.thrpy_req_id) {
          if (formMode === 'treatment_target') {
            query.andWhere('tt.req_id', data.thrpy_req_id);
          } else {
            query.andWhere('vuf.thrpy_req_id', data.thrpy_req_id);
          }
        }
      }

      console.log('Assessment stats FINAL SQL query:', query.toQuery());

      const assessments = await query;

      console.log('Assessment stats raw query result count:', assessments?.length || 0);
      if (assessments && assessments.length > 0) {
        console.log('First assessment:', assessments[0]);
      }

      if (!assessments || assessments.length === 0) {
        return { message: 'No assessments found', error: -1 };
      }

      // Group by therapy request
      const groupedData = {};
      assessments.forEach((assessment) => {
        const key = assessment.thrpy_req_id;
        
        if (!groupedData[key]) {
          groupedData[key] = {
            thrpy_req_id: assessment.thrpy_req_id,
            client_id: assessment.client_id,
            client_first_name: assessment.client_first_name,
            client_last_name: assessment.client_last_name,
            counselor_id: assessment.counselor_id,
            tenant_id: assessment.tenant_id,
            total_assessments: 0,
            total_completed: 0,
            total_pending: 0,
            total_upcoming: 0,
            completed_assessments: [],
            pending_assessments: [],
            upcoming_assessments: []
          };
        }

        groupedData[key].total_assessments++;
        
        if (assessment.status === 'completed') {
          groupedData[key].total_completed++;
          groupedData[key].completed_assessments.push({
            form_id: assessment.form_id,
            form_cde: assessment.form_cde,
            date_sent: assessment.date_sent,
            feedback_id: assessment.feedback_id
          });
        } else if (assessment.status === 'pending') {
          groupedData[key].total_pending++;
          groupedData[key].pending_assessments.push({
            form_id: assessment.form_id,
            form_cde: assessment.form_cde,
            date_sent: assessment.date_sent
          });
        } else if (assessment.status === 'upcoming') {
          groupedData[key].total_upcoming++;
          groupedData[key].upcoming_assessments.push({
            form_id: assessment.form_id,
            form_cde: assessment.form_cde,
            date_sent: assessment.date_sent
          });
        }
      });

      // Calculate completion rate and convert to array
      const result = Object.values(groupedData).map(item => ({
        ...item,
        completion_rate: item.total_assessments > 0 
          ? Math.round((item.total_completed / item.total_assessments) * 100) 
          : 0
      }));

      return result;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error getting assessment stats', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get the path to the session reminder tracking file
   */
  getReminderTrackingFilePath() {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    return path.join(__dirname, '../logs', 'session_reminders_sent.json');
  }

  /**
   * Load sent reminders tracking data from JSON file
   */
  async loadSentReminders() {
    try {
      const filePath = this.getReminderTrackingFilePath();
      const data = await fs.readFile(filePath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet, return empty object
      if (error.code === 'ENOENT') {
        return {};
      }
      logger.error('Error loading sent reminders:', error);
      return {};
    }
  }

  /**
   * Save sent reminders tracking data to JSON file
   */
  async saveSentReminders(data) {
    try {
      const filePath = this.getReminderTrackingFilePath();
      const dir = path.dirname(filePath);
      
      // Ensure directory exists
      await fs.mkdir(dir, { recursive: true });
      
      await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
      return true;
    } catch (error) {
      logger.error('Error saving sent reminders:', error);
      return false;
    }
  }

  /**
   * Check if reminder has already been sent for a session
   */
  async hasReminderBeenSent(sessionId) {
    const tracking = await this.loadSentReminders();
    return tracking[sessionId] === true;
  }

  /**
   * Mark reminder as sent for a session
   */
  async markReminderAsSent(sessionId) {
    const tracking = await this.loadSentReminders();
    tracking[sessionId] = true;
    await this.saveSentReminders(tracking);
  }

  /**
   * Send 24-hour session reminders to clients
   * Runs hourly and checks for sessions scheduled 23-25 hours in the future
   */
  async send24HourSessionReminders() {
    try {
      logger.info('Running 24-hour session reminder cron job...');
      
      const now = new Date();
      const hours23 = new Date(now.getTime() + 23 * 60 * 60 * 1000);
      const hours25 = new Date(now.getTime() + 25 * 60 * 60 * 1000);

      // Format dates for query (YYYY-MM-DD)
      const formatDate = (date) => date.toISOString().split('T')[0];
      
      // Get all sessions scheduled between 23-25 hours from now
      // We need to check sessions that have intake_date and scheduled_time
      const sessions = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select(
          'session.*',
          'thrpy_req.client_id',
          'thrpy_req.counselor_id',
          'thrpy_req.session_format_id',
          'thrpy_req.cancel_hash',
          'thrpy_req.video_link as thrpy_req_video_link'
        )
        .from('session')
        .join('thrpy_req', 'session.thrpy_req_id', 'thrpy_req.req_id')
        .where('session.session_status', 'SCHEDULED')
        .where('session.status_yn', 'y')
        .whereNotNull('session.intake_date')
        .whereNotNull('session.scheduled_time')
        .where(function() {
          // Check if session date falls within the 23-25 hour window
          this.whereBetween('session.intake_date', [formatDate(hours23), formatDate(hours25)]);
        });

      logger.info(`Found ${sessions.length} sessions scheduled 23-25 hours from now`);

      let remindersSent = 0;
      let errors = 0;
      let skippedCount = 0;
      const skipReasons = {
        alreadySent: 0,
        timeWindow: 0,
        clientProfile: 0,
        clientEmail: 0,
        counselorProfile: 0
      };

      for (const session of sessions) {
        try {
          logger.info(`Processing session ${session.session_id}...`);
          
          // Check if reminder already sent
          if (await this.hasReminderBeenSent(session.session_id)) {
            logger.info(`Reminder already sent for session ${session.session_id}, skipping`);
            skipReasons.alreadySent++;
            skippedCount++;
            continue;
          }

          // Parse session date and time
          const sessionDate = session.intake_date; // YYYY-MM-DD
          const sessionTime = session.scheduled_time; // HH:mm:ss.SSSZ or HH:mm:ss

          // Create full datetime for comparison
          const sessionDateTime = new Date(`${sessionDate}T${sessionTime}`);
          
          // Check if session is actually in the 23-25 hour range
          const hoursUntilSession = (sessionDateTime - now) / (1000 * 60 * 60);
          logger.info(`Session ${session.session_id}: ${hoursUntilSession.toFixed(2)} hours until session (date: ${sessionDate}, time: ${sessionTime})`);
          
          // Use environment variable to allow wider window for testing (default: 23-25 hours)
          const MIN_HOURS = parseInt(process.env.SESSION_REMINDER_MIN_HOURS || '23', 10);
          const MAX_HOURS = parseInt(process.env.SESSION_REMINDER_MAX_HOURS || '25', 10);
          
          if (hoursUntilSession < MIN_HOURS || hoursUntilSession > MAX_HOURS) {
            logger.info(`Session ${session.session_id} outside ${MIN_HOURS}-${MAX_HOURS} hour window (${hoursUntilSession.toFixed(2)} hours), skipping`);
            skipReasons.timeWindow++;
            skippedCount++;
            continue;
          }

          // Get client profile and email
          const clientProfile = await this.common.getUserProfileByUserProfileId(session.client_id);
          if (!clientProfile || clientProfile.length === 0) {
            logger.warn(`Client profile not found for client_id ${session.client_id}, session ${session.session_id}`);
            skipReasons.clientProfile++;
            skippedCount++;
            continue;
          }

          const clientUser = await this.common.getUserById(clientProfile[0].user_id);
          if (!clientUser || clientUser.length === 0 || !clientUser[0].email) {
            logger.warn(`Client email not found for session ${session.session_id}`);
            skipReasons.clientEmail++;
            skippedCount++;
            continue;
          }

          const clientEmail = clientUser[0].email;
          const clientName = `${clientProfile[0].user_first_name} ${clientProfile[0].user_last_name || ''}`.trim();

          // Get counselor/therapist profile and email
          const counselorProfile = await this.common.getUserProfileByUserProfileId(session.counselor_id);
          if (!counselorProfile || counselorProfile.length === 0) {
            logger.warn(`Counselor profile not found for counselor_id ${session.counselor_id}, session ${session.session_id}`);
            skipReasons.counselorProfile++;
            skippedCount++;
            continue;
          }

          const counselorUser = await this.common.getUserById(counselorProfile[0].user_id);
          const counselorEmail = counselorUser && counselorUser.length > 0 ? counselorUser[0].email : null;
          const therapistName = `${counselorProfile[0].user_first_name} ${counselorProfile[0].user_last_name || ''}`.trim();

          // Get timezone (prefer client, fallback to counselor, then default)
          let timezone = clientProfile[0].timezone || counselorProfile[0].timezone;
          if (!timezone) {
            // Try to get tenant timezone
            const tenantId = session.tenant_id || counselorProfile[0].tenant_id;
            if (tenantId) {
              const tenant = await this.common.getTenantByTenantId(tenantId);
              if (!tenant.error && tenant.length > 0 && tenant[0].timezone) {
                timezone = tenant[0].timezone;
              }
            }
          }
          timezone = timezone || getDefaultTimezone();
          const timezoneDisplay = getFriendlyTimezoneName(timezone);

          // Format session date and time in client's timezone
          const { localDate, localTime } = formatDateTimeInTimezone(sessionDate, sessionTime, timezone);

          // Get session format (ONLINE or IN-PERSON)
          // Prefer session.session_format, fallback to thrpy_req.session_format_id
          const sessionFormat = session.session_format || session.session_format_id || 'ONLINE';

          // Get location or video link based on session format
          let locationOrLink = null;
          if (sessionFormat === 'ONLINE') {
            // For online sessions, use video_link from session or therapy request
            locationOrLink = session.video_link || session.thrpy_req_video_link || null;
          } else {
            // For in-person sessions, try to get address from onboarding_requests first
            // Then fallback to counselor_profile.location
            let address = null;
            
            // Try to get address from onboarding_requests by matching counselor email
            if (counselorEmail) {
              try {
                const onboardingResult = await db
                  .withSchema(`${process.env.MYSQL_DATABASE}`)
                  .select('address')
                  .from('onboarding_requests')
                  .where('email', counselorEmail)
                  .orderBy('created_at', 'desc')
                  .limit(1)
                  .first();
                
                if (onboardingResult && onboardingResult.address) {
                  address = onboardingResult.address;
                }
              } catch (error) {
                logger.warn(`Error fetching onboarding address for counselor ${session.counselor_id}:`, error);
              }
            }
            
            // If no address from onboarding_requests, get from counselor profile
            if (!address) {
              const CounselorProfile = (await import('./counselorProfile.js')).default;
              const counselorProfileModel = new CounselorProfile();
              const counselorProfileData = await counselorProfileModel.getCounselorProfile({
                user_profile_id: session.counselor_id
              });
              if (counselorProfileData.rec && counselorProfileData.rec.length > 0) {
                address = counselorProfileData.rec[0].location || null;
              }
            }
            
            locationOrLink = address;
          }

          // Generate secure link for cancel/reschedule
          const secureLink = session.cancel_hash 
            ? `${process.env.BASE_URL || 'https://mindapp.mindbridge.solutions/'}session-management?hash=${encodeURIComponent(session.cancel_hash)}`
            : `${process.env.BASE_URL || 'https://mindapp.mindbridge.solutions/'}session-management`;

          // Create and send email
          const emailTemplate = sessionReminderEmail(
            clientEmail,
            clientName,
            therapistName,
            localDate,
            localTime,
            timezoneDisplay,
            sessionFormat,
            locationOrLink,
            secureLink,
            counselorEmail
          );

          const emailResult = await this.sendEmail.sendMail(emailTemplate);
          
          if (emailResult && !emailResult.error) {
            // Mark reminder as sent
            await this.markReminderAsSent(session.session_id);
            remindersSent++;
            logger.info(`✅ Session reminder sent successfully for session ${session.session_id} to ${clientEmail}`);
          } else {
            errors++;
            logger.error(`❌ Failed to send reminder for session ${session.session_id}:`, emailResult?.message || 'Unknown error');
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

        } catch (error) {
          errors++;
          logger.error(`Error processing session reminder for session ${session.session_id}:`, error);
        }
      }

      logger.info(`Session reminder cron job completed. Sent: ${remindersSent}, Errors: ${errors}, Skipped: ${skippedCount}`);
      logger.info(`Skip reasons: ${JSON.stringify(skipReasons)}`);
      return { remindersSent, errors, skipped: skippedCount, skipReasons, totalChecked: sessions.length };
    } catch (error) {
      logger.error('Error in send24HourSessionReminders:', error);
      return { message: 'Error sending session reminders', error: -1 };
    }
  }
}
