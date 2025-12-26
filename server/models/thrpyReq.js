//models/thrpyReq

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import db from '../utils/db.js';
import dotenv from 'dotenv';
import logger from '../config/winston.js';
import prisma from '../utils/prisma.js';
import Session from './session.js';
import Service from './service.js';
import UserProfile from './userProfile.js';
import UserForm from './userForm.js';
import Form from './form.js';
import EmailTmplt from './emailTmplt.js';
import Common from './common.js';
import { capitalizeFirstLetter, splitIsoDatetime } from '../utils/common.js';
import {
  therapyRequestDetailsEmail,
  dischargeEmail,
  sessionCancellationNotificationEmail,
  sessionRescheduleNotificationEmail,
} from '../utils/emailTmplt.js';
import { formatDateTimeInTimezone, getTimezoneByCountryCode, getDefaultTimezone } from '../utils/timezone.js';
import SendEmail from '../middlewares/sendEmail.js';
import UserTargetOutcome from './userTargetOutcome.js';

dotenv.config();
// Database connection is handled by getDb() function above

export default class ThrpyReq {
  //////////////////////////////////////////
  constructor() {
    this.session = new Session();
    this.service = new Service();
    this.form = new Form();
    this.userProfile = new UserProfile();
    this.userForm = new UserForm();
    this.sendEmail = new SendEmail();
    this.emailTmplt = new EmailTmplt();
    this.common = new Common();
    this.userTargetOutcome = new UserTargetOutcome();
  }


  // Helper function to calculate session amounts
  calculateSessionAmounts(totalInvoice, refFees, serviceGst) {
    // ALWAYS use tenant's tax percentage, not service GST
    const taxAmount = totalInvoice * (refFees.tax_pcnt / 100);
    const basePrice = totalInvoice - taxAmount;
    
    // Calculate system amount based on base price
    const systemAmount = basePrice * (refFees.system_pcnt / 100);
    // Counselor gets the remaining amount after taxes and system fees
    const counselorAmount = basePrice - systemAmount;
    
    return {
      session_price: totalInvoice, // Keep the original total_invoice as session_price
      session_taxes: taxAmount,
      session_system_amt: systemAmount,
      session_counselor_amt: counselorAmount
    };
  }

  //////////////////////////////////////////

  async postThrpyReq(data) {
    try {
      const tmpSessionObj = [];
      const tenantId = await this.common.getUserTenantId({
        user_profile_id: data.counselor_id,
      });

      // Parse the intake date and time from the ISO string
      let req_dte, req_time;
      
      if (data.intake_dte && data.intake_dte.includes('T')) {
        // Standard ISO format: "2024-01-15T14:30:00.000Z"
        const parts = data.intake_dte.split('T');
        req_dte = parts[0]; // 'YYYY-MM-DD'
        req_time = parts[1]; // 'HH:mm:ss.sssZ'
      } else if (data.intake_dte) {
        // Only date provided, use default time
        req_dte = data.intake_dte;
        req_time = '09:00:00.000Z'; // Default to 9:00 AM UTC
        console.log('⚠️ WARNING: No time provided in intake_dte, using default time 09:00:00.000Z');
      } else {
        // No date provided, use current date and default time
        req_dte = new Date().toISOString().split('T')[0];
        req_time = '09:00:00.000Z';
        console.log('⚠️ WARNING: No intake_dte provided, using current date and default time');
      }
      
      const currentDte = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
      
      // Debug logging
      console.log('🔍 DEBUG: Parsed date/time from intake_dte:', {
        original_intake_dte: data.intake_dte,
        parsed_req_dte: req_dte,
        parsed_req_time: req_time
      });
      
      // Validate that we have valid date and time
      if (!req_dte || !req_time) {
        logger.error('Invalid date/time parsing result:', { req_dte, req_time });
        return {
          message: 'Invalid date/time format provided',
          error: -1,
        };
      }

      // Check if counselor in data role is for a counselor
      const recCounselor = await this.userProfile.getUserProfileById({
        user_profile_id: data.counselor_id,
      });

      if (!recCounselor || !recCounselor.rec || !recCounselor.rec[0]) {
        logger.error('Counselor profile not found');
        return {
          message: 'Counselor profile not found',
          error: -1,
        };
      }

      if (recCounselor.rec[0].role_id !== 2) {
        logger.error(
          'The specified counselor does not have the counselor role',
        );
        return {
          message: 'The specified counselor does not have the counselor role',
          error: -1,
        };
      }

      // Check if client in data role is for a client
      const recClient = await this.userProfile.getUserProfileById({
        user_profile_id: data.client_id,
      });

      console.log('recClient--------->', tenantId[0].tenant_id);

      if (!recClient || !recClient.rec || !recClient.rec[0]) {
        logger.error('Client profile not found');
        return { message: 'Client profile not found', error: -1 };
      }

      if (recClient.rec[0].role_id !== 1) {
        logger.error('The specified client does not have the client role');
        return {
          message: 'The specified client does not have the client role',
          error: -1,
        };
      }

      // Get client's target outcome to determine treatment target
      let treatmentTarget = null;
      try {
        const clientTargetOutcome = await this.userTargetOutcome.getUserTargetOutcomeLatest({
          user_profile_id: data.client_id,
        });

        if (clientTargetOutcome && clientTargetOutcome.length > 0) {
          const targetOutcomeId = clientTargetOutcome[0].target_outcome_id;
          
          // Get the treatment target name from ref_target_outcomes
          const targetOutcome = await this.common.getTargetOutcomeById(targetOutcomeId);
          if (targetOutcome && targetOutcome.length > 0) {
            treatmentTarget = targetOutcome[0].target_name;
            logger.info(`Mapped client target outcome ${targetOutcomeId} to treatment target: ${treatmentTarget}`);
          }
        }
      } catch (error) {
        logger.warn('Could not determine treatment target from client target outcome:', error);
        // Continue without treatment target - will use service-based forms
      }

      // Retrieve the service details from the database
      const servc = await this.service.getServiceById({
        service_id: data.service_id,
      });

      if (!servc || !servc.rec || !servc.rec[0]) {
        logger.error(`Service not found for service_id: ${data.service_id}`);
        return { message: `Service not found for service_id: ${data.service_id}`, error: -1 };
      }

      const svc = servc.rec[0];
      const dischargeReportCodeMap = {
        OTR_ST: 'OTR_SUM_REP',
        OTR_TS: 'OTR_Trns_REP',
      };
      const dischargeReportCode =
        dischargeReportCodeMap[svc.service_code] || 'DR';
      

      // Get tenant-specific discharge service
      // First try to find by the resolved discharge report code in the current tenant
      let drService = await this.service.getServiceById({
        service_code: dischargeReportCode,
        tenant_id: tenantId[0].tenant_generated_id,
        is_report: 1,
      });

      console.log('🔍 DEBUG: First discharge service lookup result:', {
        tenant_id: tenantId[0].tenant_generated_id,
        service_code: dischargeReportCode,
        is_report: 1,
        result: drService
      });

      // If not found, try to find by the same code using tenant_generated_id
      if (!drService || !drService.rec || !drService.rec[0]) {
        console.log('🔍 DEBUG: First lookup failed, trying tenant_generated_id lookup');
        drService = await this.service.getServiceById({
          service_code: dischargeReportCode,
          tenant_id: tenantId[0].tenant_generated_id,
          is_report: 1,
        });
        
        console.log('🔍 DEBUG: Second discharge service lookup result:', {
          tenant_id: tenantId[0].tenant_generated_id,
          service_code: dischargeReportCode,
          is_report: 1,
          result: drService
        });
      }

      console.log('🔍 DEBUG: Final drService result:', drService);
      console.log('🔍 DEBUG: tenantId data:', tenantId);
      console.log('🔍 DEBUG: data.tenant_id:', data.tenant_id);

      if (!drService || !drService.rec || !drService.rec[0]) {
        logger.error(`Discharge report service not found for tenant_id: ${tenantId[0].tenant_generated_id} with code ${dischargeReportCode}`);
        return { message: `Discharge report service not found for tenant_id: ${tenantId[0].tenant_generated_id} with code ${dischargeReportCode}`, error: -1 };
      }

      const drSvc = drService.rec[0];

      if (svc.is_additional === 1) {
        logger.error('Additional services cannot be requested');
        return {
          message: 'Additional services cannot be requested',
          error: -1,
        };
      }

      if (svc.is_report === 1) {
        logger.error('Report services cannot be requested');
        return {
          message: 'Report services cannot be requested',
          error: -1,
        };
      }

      // Use the tenant ID for the next phase

      const ref_fees = await this.common.getRefFeesByTenantId(tenantId[0].tenant_id);

      if (!ref_fees) {
        logger.error('Error getting reference fees');
        return { message: 'Error getting reference fees', error: -1 };
      }



      // Parse svc_report_formula if needed
      if (svc.svc_report_formula_typ === 'standard') {
        if (typeof svc.svc_report_formula === 'string') {
          try {
            svc.svc_report_formula = JSON.parse(svc.svc_report_formula);
          } catch (e) {
            logger.error('Failed to parse svc_report_formula');
            return {
              message: 'Unexpected report formula format',
              error: -1,
            };
          }
        }
      }

      // Convert session_format_id from string/number "1"/"2" or 1/2 to Prisma enum values
      const sessionFormatId = 
        data.session_format_id === "1" || data.session_format_id === 1 ? "ONLINE" :
        data.session_format_id === "2" || data.session_format_id === 2 ? "IN_PERSON" :
        data.session_format_id === "ONLINE" || data.session_format_id === "IN_PERSON" || data.session_format_id === "IN-PERSON" 
          ? data.session_format_id === "IN-PERSON" ? "IN_PERSON" : data.session_format_id
          : "ONLINE"; // Default to ONLINE

      // Generate a unique hash for cancel/reschedule functionality
      const crypto = require('crypto');
      const hashData = `${data.counselor_id}-${data.client_id}-${data.service_id}-${Date.now()}`;
      const cancelHash = crypto.createHash('sha256').update(hashData).digest('base64url');

      // Prepare the therapy request object
      const tmpThrpyReq = {
        counselor_id: data.counselor_id,
        client_id: data.client_id,
        service_id: data.service_id,
        session_format_id: sessionFormatId,
        req_dte: req_dte,
        req_time: req_time,
        session_desc: svc.service_code,
        tenant_id: data.tenant_id,
        treatment_target: treatmentTarget, // Add treatment target to therapy request
        cancel_hash: cancelHash, // Add cancel/reschedule hash
      };

      // Insert the therapy request into the database using Prisma
      const postThrpyReq = await prisma.thrpy_req.create({
        data: tmpThrpyReq,
      });

      if (!postThrpyReq || !postThrpyReq.req_id) {
        logger.error('Error creating therapy request');
        return { message: 'Error creating therapy request', error: -1 };
      }

      // Process sessions based on svc_formula_typ
      if (svc.svc_formula_typ === 's') {
        // Handle standard interval formula
        let svcFormula = svc.svc_formula; // Use it directly without parsing

        if (!Array.isArray(svcFormula) || svcFormula.length !== 1) {
          logger.error('Unexpected formula format for service');
          return { message: 'Unexpected formula format', error: -2 };
        }

        // Initialize currentDate using UTC to avoid timezone issues
        let currentDate = new Date(`${req_dte}T00:00:00Z`);

        // Determine the active session limit
        const activeSessionLimit = data.number_of_sessions ? Number(data.number_of_sessions) : svc.nbr_of_sessions;

        // For the first session, ensure it's not on a weekend
        while (
          currentDate.getUTCDay() === 0 || // Sunday
          currentDate.getUTCDay() === 6 // Saturday
        ) {
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        for (let i = 0; i < svc.nbr_of_sessions; i++) {
          if (i !== 0) {
            // Add the interval from svcFormula
            currentDate.setUTCDate(currentDate.getUTCDate() + svcFormula[0]);

            // Skip weekends
            while (
              currentDate.getUTCDay() === 0 || // Sunday
              currentDate.getUTCDay() === 6 // Saturday
            ) {
              currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
          }

          // Format the date as 'YYYY-MM-DD'
          const intakeDate = currentDate.toISOString().split('T')[0];

          // Prepare the session object
          const sessionAmounts = this.calculateSessionAmounts(Number(svc.total_invoice), ref_fees[0], Number(svc.gst));
          const tmpSession = {
            thrpy_req_id: postThrpyReq.req_id,
            service_id: data.service_id,
            intake_date: intakeDate,
            scheduled_time: req_time,
            session_format: data.session_format_id,
            session_code: svc.service_code,
            session_description: svc.service_code,
            tenant_id: data.tenant_id,
            ...sessionAmounts
          };

          // Set session_status to INACTIVE if session number exceeds the limit
          // Only apply to regular sessions (not reports or discharge sessions)
          if (i + 1 > activeSessionLimit) {
            tmpSession.session_status = 'INACTIVE';
          }

          // Debug logging for session creation
          console.log(`🔍 DEBUG: Creating session ${i + 1}/${svc.nbr_of_sessions}:`, {
            session_id: 'new',
            intake_date: tmpSession.intake_date,
            scheduled_time: tmpSession.scheduled_time,
            service_name: svc.service_name,
            is_report: 0
          });

          console.log('session_system_amt--------->1', {
            total_invoice: Number(svc.total_invoice),
            tax_pcnt: Number(ref_fees[0].tax_pcnt),
            counselor_pcnt: Number(ref_fees[0].counselor_pcnt),
            system_pcnt: Number(ref_fees[0].system_pcnt),
          });

          // Handle reports based on svc_report_formula
          if (
            svc.svc_report_formula &&
            Array.isArray(svc.svc_report_formula.position) &&
            svc.svc_report_formula.position.includes(i + 1)
          ) {
            const reportIndex = svc.svc_report_formula.position.indexOf(i + 1);
            const reportServiceId = svc.svc_report_formula.service_id[reportIndex];
            
            console.log('🔍 DEBUG: Found report position:', {
              position: i + 1,
              reportServiceId,
              currentTenantId: data.tenant_id,
              serviceTenantId: svc.tenant_id
            });

            // First try to find the report service in the current tenant
            let reportService = await this.service.getServiceById({
              service_id: reportServiceId,
              tenant_id: data.tenant_id,
              is_report: 1,
            });

            // If not found in current tenant, try to find by service_code in current tenant
            if (!reportService || !reportService.rec || !reportService.rec[0]) {
              console.log(`🔍 DEBUG: Report service ${reportServiceId} not found in tenant ${data.tenant_id}, trying to find by service_code`);
              
              // Get the service details to find its service_code
              const originalService = await this.service.getServiceById({
                service_id: reportServiceId,
                tenant_id: svc.tenant_id,
                is_report: 1,
              });

              if (originalService && originalService.rec && originalService.rec[0]) {
                const serviceCode = originalService.rec[0].service_code;
                console.log(`🔍 DEBUG: Found service_code: ${serviceCode}, looking for it in tenant ${data.tenant_id}`);
                
                // Look for service with same code in current tenant
                reportService = await this.service.getServiceById({
                  service_code: serviceCode,
                  tenant_id: tenantId[0].tenant_generated_id,
                  is_report: 1,
                });
              }
            }

            console.log('🔍 DEBUG: Final reportService result:', reportService);

            if (reportService && reportService.rec && reportService.rec[0]) {
              console.log('reportService.rec[0].total_invoice', reportService.rec[0].total_invoice);
              console.log('reportService.rec[0].gst', reportService.rec[0].gst);
              
              // Create a NEW report session object (don't modify the existing one)
              const reportSessionAmounts = this.calculateSessionAmounts(Number(reportService.rec[0].total_invoice), ref_fees[0], Number(reportService.rec[0].gst));
              const reportSession = {
                thrpy_req_id: postThrpyReq.req_id,
                service_id: reportService.rec[0].service_id,
                intake_date: intakeDate,
                scheduled_time: req_time,
                session_format: data.session_format_id,
                session_code: `${svc.service_code}_${reportService.rec[0].service_code}`,
                session_description: `${svc.service_code} ${reportService.rec[0].service_name}`,
                is_report: 1,
                tenant_id: data.tenant_id,
                ...reportSessionAmounts
              };
              
              console.log(`🔍 DEBUG: Created additional report session: ${reportSession.session_code} with service_id: ${reportSession.service_id}`);
              console.log(`🔍 DEBUG: Report session object:`, reportSession);
              
              // Add the report session to the array
              tmpSessionObj.push(reportSession);
              console.log(`🔍 DEBUG: Added report session to array. Current array length: ${tmpSessionObj.length}`);
            } else {
              // Log error if report service not found
              logger.error(`Report service not found for service_id: ${reportServiceId}, tenant_id: ${tenantId[0].tenant_generated_id}`);
              console.log(`🔍 DEBUG: Report service not found for service_id: ${reportServiceId}, tenant_id: ${tenantId[0].tenant_generated_id}`);
              
              // Continue without report - this session will be a regular session
              console.log(`🔍 DEBUG: Continuing without report for position ${i + 1}`);
            }
          }

          // Add the session to the array
          tmpSessionObj.push(tmpSession);
        }

        // Add the discharge report session after the last interval
        currentDate.setUTCDate(currentDate.getUTCDate() + svcFormula[0]);

        // Skip weekends for the discharge report
        while (
          currentDate.getUTCDay() === 0 || // Sunday
          currentDate.getUTCDay() === 6 // Saturday
        ) {
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        const dischargeDate = currentDate.toISOString().split('T')[0];

        // Prepare the discharge session object
        const dischargeSessionAmounts = this.calculateSessionAmounts(Number(drSvc.total_invoice), ref_fees[0], Number(drSvc.gst));
        const dischargeSession = {
          thrpy_req_id: postThrpyReq.req_id,
          service_id: drSvc.service_id,
          intake_date: dischargeDate,
          scheduled_time: req_time,
          session_format: data.session_format_id,
          session_code: `${svc.service_code}_${drSvc.service_code}`,
          session_description: `${svc.service_code} ${drSvc.service_name}`,
          is_report: 1,
          tenant_id: data.tenant_id,
          ...dischargeSessionAmounts
        };

        console.log('session_system_amt--------->2', {
          total_invoice: Number(svc.total_invoice),
          tax_pcnt: Number(ref_fees[0].tax_pcnt),
          counselor_pcnt: Number(ref_fees[0].counselor_pcnt),
          system_pcnt: Number(ref_fees[0].system_pcnt),
        });

        // Add the discharge session to the array
        tmpSessionObj.push(dischargeSession);
      } else if (svc.svc_formula_typ === 'd') {
        // Handle days apart formula
        let svcFormula;

        console.log('🔍 DEBUG: Processing days apart formula:', {
          formula_type: svc.svc_formula_typ,
          formula: svc.svc_formula,
          number_of_sessions: svc.nbr_of_sessions
        });

        // Check if svc_formula is a string before parsing
        if (typeof svc.svc_formula === 'string') {
          try {
            svcFormula = JSON.parse(svc.svc_formula);
            console.log('🔍 DEBUG: Parsed svc_formula from string:', svcFormula);
          } catch (e) {
            logger.error('Failed to parse svc_formula');
            return {
              message: 'Unexpected formula format',
              error: -1,
            };
          }
        } else if (Array.isArray(svc.svc_formula)) {
          svcFormula = svc.svc_formula; // Already an array
          console.log('🔍 DEBUG: svc_formula is already an array:', svcFormula);
        } else {
          logger.error('svc_formula is neither a string nor an array');
          return { message: 'Unexpected formula format', error: -1 };
        }

        // Validate the formula length
        if (parseInt(svc.nbr_of_sessions) - 1 !== svcFormula.length) {
          logger.error('Unexpected formula format for service');
          return { message: 'Unexpected formula format', error: -2 };
        }

        // Debug: Show report formula details
        console.log('🔍 DEBUG: Report formula details (days apart):', {
          has_report_formula: !!svc.svc_report_formula,
          report_formula: svc.svc_report_formula,
          report_positions: svc.svc_report_formula?.position || [],
          report_service_ids: svc.svc_report_formula?.service_id || []
        });

        // Initialize currentDate using UTC to avoid timezone issues
        let currentDate = new Date(`${req_dte}T00:00:00Z`);

        // Determine the active session limit
        const activeSessionLimit = data.number_of_sessions ? Number(data.number_of_sessions) : svc.nbr_of_sessions;

        for (let i = 0; i < svc.nbr_of_sessions; i++) {
          if (i !== 0) {
            let daysToAdd = svcFormula[i - 1];

            // If daysToAdd is zero, schedule the session on the same day
            if (daysToAdd !== 0) {
              currentDate.setUTCDate(currentDate.getUTCDate() + daysToAdd);

              // Skip weekends
              while (
                currentDate.getUTCDay() === 0 || // Sunday
                currentDate.getUTCDay() === 6 // Saturday
              ) {
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
              }
            }
            // If daysToAdd is zero, do not change currentDate
          } else {
            // For the first session, ensure it's not on a weekend
            while (
              currentDate.getUTCDay() === 0 || // Sunday
              currentDate.getUTCDay() === 6 // Saturday
            ) {
              currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
          }

          // Format the date as 'YYYY-MM-DD'
          const intakeDate = currentDate.toISOString().split('T')[0];

          // Prepare the session object
          const sessionAmounts = this.calculateSessionAmounts(Number(svc.total_invoice), ref_fees[0], Number(svc.gst));
          const tmpSession = {
            thrpy_req_id: postThrpyReq.req_id,
            service_id: data.service_id,
            intake_date: intakeDate,
            scheduled_time: req_time,
            session_format: data.session_format_id,
            session_code: svc.service_code,
            session_description: svc.service_code,
            tenant_id: data.tenant_id,
            ...sessionAmounts
          };

          // Set session_status to INACTIVE if session number exceeds the limit
          // Only apply to regular sessions (not reports or discharge sessions)
          if (i + 1 > activeSessionLimit) {
            tmpSession.session_status = 'INACTIVE';
          }

          console.log('🔍 DEBUG: Created session object (days apart):', {
            session_number: i + 1,
            session: tmpSession
          });

          console.log('session_system_amt--------->3', {
            total_invoice: Number(svc.total_invoice),
            tax_pcnt: Number(ref_fees[0].tax_pcnt),
            counselor_pcnt: Number(ref_fees[0].counselor_pcnt),
            system_pcnt: Number(ref_fees[0].system_pcnt),
          });

          // Handle reports based on svc_report_formula
          if (
            svc.svc_report_formula &&
            Array.isArray(svc.svc_report_formula.position) &&
            svc.svc_report_formula.position.includes(i + 1)
          ) {
            const reportIndex = svc.svc_report_formula.position.indexOf(i + 1);
            const reportServiceId = svc.svc_report_formula.service_id[reportIndex];
            
            console.log('🔍 DEBUG: Found report position:', {
              position: i + 1,
              reportServiceId,
              currentTenantId: data.tenant_id,
              serviceTenantId: svc.tenant_id
            });

            // First try to find the report service in the current tenant
            let reportService = await this.service.getServiceById({
              service_id: reportServiceId,
              tenant_id: data.tenant_id,
              is_report: 1,
            });

            // If not found in current tenant, try to find by service_code in current tenant
            if (!reportService || !reportService.rec || !reportService.rec[0]) {
              console.log(`🔍 DEBUG: Report service ${reportServiceId} not found in tenant ${data.tenant_id}, trying to find by service_code`);
              
              // Get the service details to find its service_code
              const originalService = await this.service.getServiceById({
                service_id: reportServiceId,
                tenant_id: svc.tenant_id,
                is_report: 1,
              });

              if (originalService && originalService.rec && originalService.rec[0]) {
                const serviceCode = originalService.rec[0].service_code;
                console.log(`🔍 DEBUG: Found service_code: ${serviceCode}, looking for it in tenant ${data.tenant_id}`);
                
                // Look for service with same code in current tenant
                reportService = await this.service.getServiceById({
                  service_code: serviceCode,
                  tenant_id: tenantId[0].tenant_generated_id,
                  is_report: 1,
                });
              }
            }

            console.log('🔍 DEBUG: Final reportService result:', reportService);

            if (reportService && reportService.rec && reportService.rec[0]) {
              // Create a NEW report session object (don't modify the existing one)
              const reportSessionAmounts = this.calculateSessionAmounts(Number(reportService.rec[0].total_invoice), ref_fees[0], Number(reportService.rec[0].gst));
              const reportSession = {
                thrpy_req_id: postThrpyReq.req_id,
                service_id: reportService.rec[0].service_id,
                intake_date: intakeDate,
                scheduled_time: req_time,
                session_format: data.session_format_id,
                session_code: `${svc.service_code}_${reportService.rec[0].service_code}`,
                session_description: `${svc.service_code} ${reportService.rec[0].service_name}`,
                is_report: 1,
                tenant_id: data.tenant_id,
                ...reportSessionAmounts
              };
              
              console.log(`🔍 DEBUG: Created additional report session: ${reportSession.session_code} with service_id: ${reportSession.service_id}`);
              
              // Add the report session to the array
              tmpSessionObj.push(reportSession);
            } else {
              // Log error if report service not found
              logger.error(`Report service not found for service_id: ${reportServiceId}, tenant_id: ${tenantId[0].tenant_generated_id}`);
              console.log(`🔍 DEBUG: Report service not found for service_id: ${reportServiceId}, tenant_id: ${tenantId[0].tenant_generated_id}`);
              
              // Continue without report - this session will be a regular session
              console.log(`🔍 DEBUG: Continuing without report for position ${i + 1}`);
            }
          }

          // Add the session to the array
          tmpSessionObj.push(tmpSession);
        }

        // Add the discharge report session a week after the last session
        currentDate.setUTCDate(currentDate.getUTCDate() + 7);

        // Skip weekends for the discharge report
        while (
          currentDate.getUTCDay() === 0 || // Sunday
          currentDate.getUTCDay() === 6 // Saturday
        ) {
          currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }

        const dischargeDate = currentDate.toISOString().split('T')[0];

        // Prepare the discharge session object
        const dischargeSessionAmounts = this.calculateSessionAmounts(Number(drSvc.total_invoice), ref_fees[0], Number(drSvc.gst));
        const dischargeSession = {
          thrpy_req_id: postThrpyReq.req_id,
          service_id: drSvc.service_id,
          intake_date: dischargeDate,
          scheduled_time: req_time,
          session_format: data.session_format_id,
          session_code: `${svc.service_code}_${drSvc.service_code}`,
          session_description: `${svc.service_code} ${drSvc.service_name}`,
          is_report: 1,
          tenant_id: data.tenant_id,
          ...dischargeSessionAmounts
        };

        console.log('🔍 DEBUG: Created discharge session object (days apart):', {
          session: dischargeSession,
          drSvc_details: {
            service_id: drSvc.service_id,
            service_name: drSvc.service_name,
            service_code: drSvc.service_code
          }
        });

        // Add the discharge session to the array
        tmpSessionObj.push(dischargeSession);
      } else {
        
        // Handle unexpected svc_formula_typ values
        logger.error(`Unsupported svc_formula_typ: ${svc.svc_formula_typ}`);
        return { message: 'Unsupported formula type', error: -1 };
      }

      // Insert the session array into the database

      console.log('🔍 DEBUG: About to insert sessions into database');
      console.log('🔍 DEBUG: Total sessions to create:', tmpSessionObj.length);
      console.log('🔍 DEBUG: Session objects:', JSON.stringify(tmpSessionObj, null, 2));
      
      // Debug: Show session breakdown
      const regularSessions = tmpSessionObj.filter(s => s.is_report !== 1);
      const reportSessions = tmpSessionObj.filter(s => s.is_report === 1);
      
      console.log('🔍 DEBUG: Session breakdown:');
      console.log(`  - Regular sessions: ${regularSessions.length}`);
      console.log(`  - Report sessions: ${reportSessions.length}`);
      console.log(`  - Total: ${tmpSessionObj.length}`);
      
      if (reportSessions.length > 0) {
        console.log('🔍 DEBUG: Report sessions found:');
        reportSessions.forEach((session, index) => {
          console.log(`  ${index + 1}. ${session.session_code} (${session.service_id}) - ${session.session_description}`);
        });
      }
      
      // Create sessions individually since postSession expects a single session object
      for (const sessionData of tmpSessionObj) {
        const postSessionResult = await this.session.postSession(sessionData);
        if (!postSessionResult || postSessionResult.error) {
          logger.error('Error posting session:', postSessionResult?.message || 'Unknown error');
          console.error('Error posting session:', postSessionResult?.colliding_session || 'Unknown error');
          return {
            message: postSessionResult?.message || 'Unknown error',
            error: -1,
          };
        }
      }

      // Load forms using the new mode-based system
      const loadForms = await this.loadSessionFormsWithMode({
        req_id: postThrpyReq.req_id,
        tenant_id: data.tenant_id,
        mode: "treatment_target",
        number_of_sessions: data.number_of_sessions, // Pass number_of_sessions for Priority 1 matching
        treatment_target: treatmentTarget,
      });

      if (loadForms.error) {
        logger.error('Error loading session forms:', loadForms.message);
        // Don't return error - continue without forms
      } else {
        logger.info('Session forms loaded successfully:', loadForms.message);
      }

      const ThrpyReq = await this.getThrpyReqById({
        req_id: postThrpyReq.req_id,
      });

      if (!ThrpyReq) {
        logger.error('Error getting therapy request');
        return { message: 'Error getting therapy request', error: -1 };
      }

      // Send an email to the client with the therapy request details
      const thrpyReqEmlTmplt = this.emailTmplt.sendThrpyReqDetailsEmail({
        email: recClient.rec[0].email,
        big_thrpy_req_obj: ThrpyReq[0],
        cancel_hash: postThrpyReq.cancel_hash, // Pass the cancel hash to email template
      });

      // Return a success message
      return {
        message: 'Therapy request, sessions, and reports created successfully',
        rec: ThrpyReq,
      };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return {
        message: `Error creating therapy request, sessions, and reports: ${error}`,
        error: -1,
      };
    }
  }

  //////////////////////////////////////////

  async putThrpyReqById(data) {
    try {
      if (data.session_obj) {
        var session_obj = data.session_obj;
        delete data.session_obj;
      }

      // Check if the therapy request is ongoing
      const checkIfThrpyReqIsOngoing = await this.checkThrpyReqIsONGOING(
        data.req_id,
      );

      if (checkIfThrpyReqIsOngoing.error) {
        logger.error('Error checking if therapy request is ongoing');
        return {
          message: 'Error checking if therapy request is ongoing',
          error: -1,
        };
      }

      // Check if the therapy request is discharged
      if (
        checkIfThrpyReqIsOngoing.rec &&
        data.status_yn &&
        !checkIfThrpyReqIsOngoing.rec[0].session_status == 'DISCHARGED'
      ) {
        const checkIfThrpyReqIsDischarged =
          await this.common.checkThrpyReqDischarge({
            req_id: data.req_id,
          });

        if (checkIfThrpyReqIsDischarged.error) {
          logger.warn(checkIfThrpyReqIsDischarged.message);
          return {
            message: checkIfThrpyReqIsDischarged.message,
            error: -1,
          };
        }
      }

      if (checkIfThrpyReqIsOngoing.rec && !data.thrpy_status) {
        // Last element of the array which is the Discharge Report
        var checkIfThrpyReqIsOngoing_LastSession =
          checkIfThrpyReqIsOngoing.rec.slice(-1)[0];

        if (
          checkIfThrpyReqIsOngoing_LastSession.session_status == 'SCHEDULED' &&
          checkIfThrpyReqIsOngoing.rec
        ) {
          logger.warn('Cannot update therapy request with ongoing sessions');
          return {
            message: 'Cannot update therapy request with ongoing sessions',
            error: -1,
          };
        }
      }

      const checkThrpyReq = await this.getThrpyReqById({
        req_id: data.req_id,
      });

      if (checkThrpyReq.error) {
        logger.error('Error getting therapy request');
        return { message: 'Error getting therapy request', error: -1 };
      }

      if (!checkThrpyReq || checkThrpyReq.length === 0) {
        logger.warn('Therapy request not found');
        return { message: 'Therapy request not found', error: -1 };
      }

      if (data.intake_dte) {
        // Parse the intake date and time from the ISO string
        var req_dte = data.intake_dte.split('T')[0]; // 'YYYY-MM-DD'
        var req_time = data.intake_dte.split('T')[1]; // 'HH:mm:ss.sssZ'
      }

      const tmpThrpyReq = {
        ...(data.counselor_id && { counselor_id: data.counselor_id }),
        ...(data.client_id && { client_id: data.client_id }),
        ...(data.service_id && { service_id: data.service_id }),
        ...(data.session_format_id && {
          session_format_id: data.session_format_id,
        }),
        ...(req_dte && { req_dte: req_dte }),
        ...(req_time && { req_time: req_time }),
        ...(data.session_desc && { session_desc: data.session_desc }),
        ...(data.status_yn && { status_yn: data.status_yn }),
        ...(data.thrpy_status && { thrpy_status: data.thrpy_status }),
      };

      // Logic for deleting a therapy request with sessions
      if (data.status_yn) {
        // Admin cannot delete a therapy request
        if (data.role_id == 4) {
          logger.warn('Admin cannot delete a therapy request');
          return {
            message: 'Admin cannot delete a therapy request',
            error: -1,
          };
        }
        if (data.role_id == 3) {
          logger.warn('Manager cannot delete a therapy request');
          return {
            message: 'Manager cannot delete a therapy request',
            error: -1,
          };
        }

        if (
          checkThrpyReq[0].session_obj.slice(-1)[0].session_status ==
            'SCHEDULED' ||
          checkIfThrpyReqIsOngoing_LastSession.session_status == 'SCHEDULED'
        ) {
          var thrpySessions = await this.session.getSessionByThrpyReqId({
            thrpy_req_id: data.req_id,
          });

          if (thrpySessions.error) {
            logger.error('Error getting therapy sessions');
            return {
              message: 'Error getting therapy sessions',
              error: -1,
            };
          }

          if (thrpySessions && thrpySessions.length > 0) {
            logger.warn(
              'Cannot delete therapy request with sessions that were updated',
            );
            return {
              message:
                'Cannot delete therapy request with sessions that were updated',
              error: -1,
            };
          }
        }

        if (
          thrpySessions ||
          checkIfThrpyReqIsOngoing_LastSession.session_status == 'DISCHARGED'
        ) {
          const updatedSessions = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('session')
            .where('thrpy_req_id', data.req_id)
            .update('status_yn', 2);

          if (!updatedSessions) {
            logger.error('Error deleting therapy sessions');
            return {
              message: 'Error deleting therapy sessions',
              error: -1,
            };
          }
        }
      }

      // Logic for discharging a therapy request
      if (data.thrpy_status) {
        // Check if the Discharge Report has been sent
        const checkDischargeReport = await this.common.getSessionById({
          thrpy_req_id: data.req_id,
          service_code: process.env.DISCHARGE_SERVICE_CODE,
        });

        if (checkDischargeReport.error) {
          logger.error('Error getting discharge report');
          return {
            message: 'Error getting discharge report',
            error: -1,
          };
        }

        if (![2, 3].includes(checkDischargeReport[0].session_status)) {
          logger.warn(
            'Cannot proceed with discharge as the discharge report has not been completed',
          );
          return {
            message:
              'Cannot proceed with discharge as the discharge report has not been completed',
            error: -1,
          };
        }

        // Update all sessions with status SCHEDULED to NO-SHOW
        const putSessions = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('thrpy_req_id', parseInt(data.req_id))
          .andWhere('session_status', 1)
          .update({ session_status: 3 });

        if (!putSessions) {
          logger.error('Error updating sessions');
          return { message: 'Error updating sessions', error: -1 };
        }

        // Send an email to the client with the discharge details

        const sendDischargeEmail = await this.emailTmplt.sendDischargeEmail({
          client_id: checkThrpyReq[0].client_id,
        });
      }

      const putThrpyReq = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('thrpy_req')
        .where('req_id', data.req_id)
        .update(tmpThrpyReq);

      if (!putThrpyReq) {
        logger.error('Error updating therapy request');
        return { message: 'Error updating therapy request', error: -1 };
      }

      if (session_obj) {
        for (const post of session_obj) {
          const putSession = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('session')
            .where('session_id', post.session_id)
            .update(post);

          if (!putSession) {
            logger.error('Error updating session');
            return { message: 'Error updating session', error: -1 };
          }
        }
      }

      return { message: 'Therapy request updated successfully' };
    } catch (error) {
      console.error(error);
      logger.error(error);

      return { message: 'Error updating therapy request', error: -1 };
    }
  }

  //////////////////////////////////////////

  async delThrpyReqById(data) {
    try {
      const checkThrpyReq = await this.getThrpyReqById({
        thrpy_id: data.thrpy_id,
      });

      if (checkThrpyReq.error) {
        logger.error('Error getting therapy request');
        return { message: 'Error getting therapy request', error: -1 };
      }

      if (!checkThrpyReq || checkThrpyReq.length === 0) {
        logger.warn('Therapy request not found');
        return { message: 'Therapy request not found', error: -1 };
      }

      const thrpySessions = await this.session.getSessionByThrpyReqId({
        thrpy_req_id: data.thrpy_id,
      });

      if (thrpySessions.error) {
        logger.error('Error getting therapy sessions');
        return { message: 'Error getting therapy sessions', error: -1 };
      }

      if (thrpySessions && thrpySessions.length > 0) {
        logger.warn(
          'Cannot delete therapy request with sessions that were updated',
        );
        return {
          message:
            'Cannot delete therapy request with sessions that were updated',
          error: -1,
        };
      }

      const delThrpyReq = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('thrpy_req')
        .where('req_id', data.thrpy_id)
        .update('status_yn', 2);
      if (!delThrpyReq) {
        logger.error('Error deleting therapy request');
        return { message: 'Error deleting therapy request', error: -1 };
      }

      if (thrpySessions) {
        const updatedSessions = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('thrpy_req_id', data.thrpy_id)
          .update('status_yn', 2);

        if (!updatedSessions) {
          logger.error('Error deleting therapy sessions');
          return {
            message: 'Error deleting therapy sessions',
            error: -1,
          };
        }
      }

      return { message: 'Therapy request deleted successfully' };
    } catch (error) {
      console.error(error);
      logger.error(error);

      return { message: 'Error deleting therapy request', error: -1 };
    }
  }

  //////////////////////////////////////////

  //This function is for Hard delete
  async deleteThrpyReqById(req_id) {
    try {
      const deletedSessions = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .where('thrpy_req_id', req_id)
        .del();

      if (!deletedSessions) {
        logger.error('Error deleting therapy sessions');
        return {
          message: 'Error deleting therapy sessions',
          error: -1,
        };
      }

      const delThrpyReq = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('thrpy_req')
        .where('req_id', req_id)
        .del();
      if (!delThrpyReq) {
        logger.error('Error deleting therapy request');
        return { message: 'Error deleting therapy request', error: -1 };
      }

      return {
        message: 'Therapy request and sessions deleted successfully',
      };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error deleting therapy request', error: -1 };
    }
  }

  //////////////////////////////////////////

  // async putThrpyDischarge(data) {
  //   try {
  //     const putSessions = await db
  //       .withSchema(`${process.env.MYSQL_DATABASE}`)
  //       .from('session')
  //       .where('thrpy_req_id', data.req_id)
  //       .andWhere('session_status', 1)
  //       .update({ session_status: 3 });

  //     if (!putSessions) {
  //       logger.error('Error updating sessions');
  //       return { message: 'Error updating sessions', error: -1 };
  //     }

  //     const tmpThrpyReq = {
  //       thrpy_status: data.thrpy_status,
  //     };

  //     const putThrpyReq = await db
  //       .withSchema(`${process.env.MYSQL_DATABASE}`)
  //       .from('thrpy_req')
  //       .where('req_id', data.req_id)
  //       .update(tmpThrpyReq);

  //     if (!putThrpyReq) {
  //       logger.error('Error discharging therapy request');
  //       return { message: 'Error discharging therapy request', error: -1 };
  //     }
  //     return { message: 'Therapy request updated successfully' };
  //   } catch (error) {
  //     logger.error(error);

  //     return { message: 'Error updating therapy request', error: -1 };
  //   }
  // }

  //////////////////////////////////////////

  async getThrpyReqById(data) {
    try {
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_thrpy_req')
        .where('status_yn', 1)
        .orderBy('created_at', 'desc');

      // filters used by APIs
      if (data.req_id) {
        query.andWhere('req_id', data.req_id);
      }

      if (data.counselor_id) {
        query.andWhere('counselor_id', data.counselor_id);
      }

      if (data.client_id) {
        query.andWhere('client_id', data.client_id);
      }

      if (data.service_id) {
        query.andWhere('service_id', data.service_id);
      }

      if (data.thrpy_status) {
        query.andWhere('thrpy_status', data.thrpy_status);
      }

      if (data.tenant_id) {
        query.andWhere('tenant_id', data.tenant_id);
      }

      if (data.role_id === 2) {
        if (data.req_id) {
          query.andWhere('req_id', data.req_id);
        }

        if (data.counselor_id) {
          query.andWhere('counselor_id', data.counselor_id);
        }

        if (data.user_profile_id) {
          query.andWhere('counselor_id', data.user_profile_id);
        }

        if (data.client_id) {
          query.andWhere('client_id', data.client_id);
        }

        if (data.service_id) {
          query.andWhere('service_id', data.service_id);
        }

        if (data.thrpy_status) {
          query.andWhere('thrpy_status', data.thrpy_status);
        }

        if (data.tenant_id) {
          query.andWhere('tenant_id', data.tenant_id);
        }
      }

      // if (data.role_id === 3) {
      //   // If the user is a manager, filter by tenant_id
      //   const tenantId = await this.common.getUserTenantId({
      //     user_profile_id: data.counselor_id,
      //   });
      //   query.where('tenant_id', Number(tenantId[0].tenant_id));
      // }

      console.log('query----->',query.toQuery());

      const rec = await query;

      if (!data.req_id && !data.counselor_id && !data.client_id) {
        rec.forEach((thrpyReq) => {
          delete thrpyReq.session_obj;
        });
      }

      const orderSessionObj = (rec) => {
        rec.forEach((thrpyReq) => {
          if (thrpyReq.session_obj) {
            thrpyReq.session_obj = thrpyReq.session_obj.sort(
              (a, b) => a.session_id - b.session_id,
            );
          }
        });
      };

      orderSessionObj(rec);
      if (rec && Array.isArray(rec)) {
        for (const thrpyReq of rec) {
          if (thrpyReq.session_obj && Array.isArray(thrpyReq.session_obj)) {
            for (const session of thrpyReq.session_obj) {
              // Get treatment target forms for this session
              const TreatmentTargetSessionForms = (await import('./treatmentTargetSessionForms.js')).default;
              const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
              
              const treatmentTargetForms = await treatmentTargetSessionForms.getTreatmentTargetSessionFormsBySessionId({
                session_id: session.session_id,
                tenant_id: thrpyReq.tenant_id
              });
              
              // Update session with treatment target forms
              if (!treatmentTargetForms.error && treatmentTargetForms.rec && treatmentTargetForms.rec.length > 0) {
                session.forms_array = treatmentTargetForms.rec.map(form => form.form_id);
                session.form_mode = 'treatment_target';
              } else {
                // If no treatment target forms exist, use empty array
                session.forms_array = [];
                session.form_mode = 'treatment_target';
              }
            }
          }
        }
      }

      // Add fee split management data to each therapy request
      if (rec && Array.isArray(rec)) {
        for (const thrpyReq of rec) {
          try {
            // Import and instantiate FeeSplitManagement model
            const FeeSplitManagement = (await import('./feeSplitManagement.js')).default;
            const feeSplitManagement = new FeeSplitManagement();
            
            // Get fee split configuration for this tenant and specific counselor only
            const feeSplitConfig = await feeSplitManagement.getFeeSplitConfigurationForCounselor(
              thrpyReq.tenant_id, 
              thrpyReq.counselor_id
            );
            
            if (!feeSplitConfig.error) {
              thrpyReq.fee_split_management = feeSplitConfig;
            } else {
              // If there's an error, provide default fee split configuration
              thrpyReq.fee_split_management = {
                is_fee_split_enabled: false,
                tenant_share_percentage: 0,
                counselor_share_percentage: 100,
                counselor_user_id: thrpyReq.counselor_id,
                counselor_info: null
              };
            }
          } catch (feeSplitError) {
            console.error('Error fetching fee split management:', feeSplitError);
            // Provide default fee split configuration on error
            thrpyReq.fee_split_management = {
              is_fee_split_enabled: false,
              tenant_share_percentage: 0,
              counselor_share_percentage: 100,
              counselor_user_id: thrpyReq.counselor_id,
              counselor_info: null
            };
          }
        }
      }

      if (!rec) {
        logger.error('Error getting therapy request');
        return { message: 'Error getting therapy request', error: -1 };
      }

      return rec;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error getting therapy request', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getThrpyReqByIdWithTreatmentTargetForms(data) {
    try {
      // First get the regular therapy request data
      const rec = await this.getThrpyReqById(data);
      
      if (rec.error) {
        return rec;
      }

      // Enhance with treatment target forms information
      if (rec && Array.isArray(rec)) {
        for (const thrpyReq of rec) {
          if (thrpyReq.session_obj && Array.isArray(thrpyReq.session_obj)) {
            const TreatmentTargetSessionForms = (await import('./treatmentTargetSessionForms.js')).default;
            const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
            
            for (const session of thrpyReq.session_obj) {
              // Get treatment target forms for this session
              const treatmentTargetForms = await treatmentTargetSessionForms.getTreatmentTargetSessionFormsBySessionId({
                session_id: session.session_id,
                tenant_id: thrpyReq.tenant_id
              });
              
              // Add treatment target forms information to session
              if (!treatmentTargetForms.error && treatmentTargetForms.rec && treatmentTargetForms.rec.length > 0) {
                session.treatment_target_forms = treatmentTargetForms.rec.map(form => ({
                  form_id: form.form_id,
                  form_name: form.form_name,
                  treatment_target: form.treatment_target,
                  purpose: form.purpose,
                  session_number: form.session_number,
                  is_sent: form.is_sent,
                  sent_at: form.sent_at
                }));
              } else {
                session.treatment_target_forms = [];
              }
            }
          }
        }
      }

      return rec;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error getting therapy request with treatment target forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  async loadSessionForms(req_id) {
    try {
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_thrpy_req')
        .where('req_id', req_id);

      const [rec] = await query;

      if (!rec) {
        logger.error('Error getting session forms');
        return { message: 'Error getting session forms', error: -1 };
      }

      const recForm = await this.form.getFormForSessionById({
        service_id: rec.service_id,
      });

      if (!recForm || recForm.length === 0) {
        logger.error('Error getting session forms');
        return { message: 'Error getting session forms', error: -1 };
      }

      const tmpSession = [];
      const tmpForm = [];

      //remove sessions where is_report = 1 in session_obj
      rec.session_obj = rec.session_obj.filter((session) => {
        return session.is_report !== 1;
      });

      //Sort session_obj by session_id
      rec.session_obj = rec.session_obj.sort(
        (a, b) => a.session_id - b.session_id,
      );

      recForm.forEach((form) => {
        // Static forms placeholder logic
        if (form.frequency_typ === 'static') {
          for (let i = 1; i <= rec.session_obj.length; i++) {
            if (form.session_position.includes(i)) {
              const tmpFormSession = {
                session_id: rec.session_obj[i - 1].session_id,
                form_array: [form.form_id],
              };

              const tmpUserForm = {
                client_id: rec.client_id,
                counselor_id: rec.counselor_id,
                form_id: form.form_id,
                session_id: rec.session_obj[i - 1].session_id,
              };

              tmpSession.push(tmpFormSession);
              tmpForm.push(tmpUserForm);
            }
          }
        }

        // Dynamic forms placeholder logic
        if (form.frequency_typ === 'dynamic') {
          // Sequence logic
          if (form.sequence_obj.length === 2) {
            const sequence = form.sequence_obj[0];
            if (Number.isInteger(sequence) && sequence > 0) {
              for (
                let i = sequence - 1;
                i < rec.session_obj.length;
                i += sequence
              ) {
                if (rec.session_obj[i] && rec.session_obj[i].session_id) {
                  const tmpFormSession = {
                    session_id: rec.session_obj[i].session_id,
                    form_array: [form.form_id],
                  };
                  const tmpUserForm = {
                    client_id: rec.client_id,
                    counselor_id: rec.counselor_id,
                    form_id: form.form_id,
                    session_id: rec.session_obj[i].session_id,
                  };
                  tmpSession.push(tmpFormSession);
                  tmpForm.push(tmpUserForm);
                }
              }
            }
          }

          // Position logic
          if (form.sequence_obj.length === 1) {
            const position = form.sequence_obj[0];
            if (typeof position === 'string') {
              //All logic
              if (position === '...') {
                for (let i = 0; i < rec.session_obj.length; i++) {
                  const tmpFormSession = {
                    session_id: rec.session_obj[i].session_id,
                    form_array: [form.form_id],
                  };
                  const tmpUserForm = {
                    client_id: rec.client_id,
                    counselor_id: rec.counselor_id,
                    form_id: form.form_id,
                    session_id: rec.session_obj[i].session_id,
                  };
                  tmpSession.push(tmpFormSession);
                  tmpForm.push(tmpUserForm);
                }
              }

              //First logic
              if (position === '1') {
                const tmpFormSession = {
                  session_id: rec.session_obj[0].session_id,
                  form_array: [form.form_id],
                };
                const tmpUserForm = {
                  client_id: rec.client_id,
                  counselor_id: rec.counselor_id,
                  form_id: form.form_id,
                  session_id: rec.session_obj[0].session_id,
                };
                tmpSession.push(tmpFormSession);
                tmpForm.push(tmpUserForm);
              }

              //Last logic
              if (position === '-1') {
                const tmpFormSession = {
                  session_id:
                    rec.session_obj[rec.session_obj.length - 1].session_id,
                  form_array: [form.form_id],
                };
                const tmpUserForm = {
                  client_id: rec.client_id,
                  counselor_id: rec.counselor_id,
                  form_id: form.form_id,
                  session_id:
                    rec.session_obj[rec.session_obj.length - 1].session_id,
                };
                tmpSession.push(tmpFormSession);
                tmpForm.push(tmpUserForm);
              }

              //Second to last logic
              if (position === '-2') {
                const tmpFormSession = {
                  session_id:
                    rec.session_obj[rec.session_obj.length - 2].session_id,
                  form_array: [form.form_id],
                };
                const tmpUserForm = {
                  client_id: rec.client_id,
                  counselor_id: rec.counselor_id,
                  form_id: form.form_id,
                  session_id:
                    rec.session_obj[rec.session_obj.length - 2].session_id,
                };
                tmpSession.push(tmpFormSession);
                tmpForm.push(tmpUserForm);
              }
            }
          }
        }
      });

      const updteFormSession = await this.updateSessionForms(tmpSession);

      if (!updteFormSession) {
        logger.error('Error updating session forms');
        return { message: 'Error updating session forms', error: -1 };
      }

      const postUserForm = await this.userForm.postUserForm(tmpForm);

      if (!postUserForm) {
        logger.error('Error creating user forms');
        return { message: 'Error creating user forms', error: -1 };
      }

      return { message: 'Session forms loaded successfully' };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error getting session forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  async updateSessionForms(data) {
    try {
      for (const post of data) {
        // Fetch current forms_array
        const [getSession] = await this.session.getSessionById({
          session_id: Number(post.session_id),
        });

        if (!getSession) {
          logger.error('Error getting session');
          return { message: 'Error getting session', error: -1 };
        }

        // Parse existing forms_array
        const currentForms = Array.isArray(getSession.forms_array)
          ? getSession.forms_array
          : JSON.parse(getSession.forms_array || '[]');

        // Add new forms and remove duplicates
        const updatedForms = Array.from(
          new Set([...currentForms, ...post.form_array]),
        );

        const tmpSession = {
          forms_array: JSON.stringify(updatedForms),
        };

        await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .update(tmpSession)
          .where('session_id', Number(post.session_id));
      }

      return { message: 'Sessions updated successfully' };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error updating session forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  async checkThrpyReqActive(data) {
    try {
      //Logic to check if the client has an active therapy request with the same service and same counselor
      //RAsham said we need to change this to client id alone
      const checkThrpyReq = await this.getThrpyReqById({
        // counselor_id: data.counselor_id,
        client_id: data.client_id,
        // service_id: data.service_id,
      });

      if (checkThrpyReq.error) {
        logger.error('Error checking client for active therapy request');
        return {
          message: 'Error checking client for active therapy request',
          error: -1,
        };
      }

      if (checkThrpyReq && checkThrpyReq.length > 0) {
        // check if the therapy request is active and not discharged
        const activeThrpyReq = checkThrpyReq.filter(
          (thrpyReq) =>
            thrpyReq.thrpy_status === 'ONGOING' && thrpyReq.status_yn === 'y',
        );

        if (activeThrpyReq.length > 0) {
          // Check for active sessions for the active therapy request
          const activeSessions = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('v_session')
            .where('thrpy_req_id', activeThrpyReq[0].req_id)
            .whereNotIn('session_status', [2, 3, 4]);

          if (activeSessions.error) {
            logger.error('Error getting active sessions');
            return {
              message: 'Error getting active sessions',
              error: -1,
            };
          }

          // Check if the client has an active session for the same therapy request
          if (activeThrpyReq[0]?.session_obj && activeSessions && Array.isArray(activeSessions)) {
            if (
              activeThrpyReq[0].session_obj.length !== activeSessions.length
            ) {
              logger.warn(
                'Client already has an active therapy request with some sessions updated',
              );
              return {
                message:
                  'Client already has an active therapy request with some sessions updated',
                error: -1,
              };
            }
          }

          // Check if the client doesn't have an active session for the same therapy request
          if (activeThrpyReq[0]?.session_obj && activeSessions && Array.isArray(activeSessions) && activeThrpyReq[0].session_obj.length === activeSessions.length) {
            const hardDelThrpyReq = await db
              .withSchema(`${process.env.MYSQL_DATABASE}`)
              .from('thrpy_req')
              .where('req_id', activeThrpyReq[0].req_id)
              .del();

            if (!hardDelThrpyReq) {
              logger.error('Error deleting therapy request');
              return {
                message: 'Error deleting therapy request',
                error: -1,
              };
            }

            logger.warn(
              'Client already has an active session for the same therapy request',
            );
          }
        }
      }

      return {
        message: 'Client does not have an active therapy request',
      };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return {
        message: 'Error checking client for active therapy request',
        error: -1,
      };
    }
  }

  //////////////////////////////////////////

  async getThrpyReqByHash(cancel_hash) {
    try {
      // Get thryp request by hash using Prisma
      const thrpyReq = await prisma.thrpy_req.findFirst({
        where: {
          cancel_hash: cancel_hash,
          status_yn: 'y',
        },
        include: {
          service: true,
          user_profile_thrpy_req_counselor_idTouser_profile: {
            select: {
              user_profile_id: true,
              user_first_name: true,
              user_last_name: true,
              user_phone_nbr: true,
              country_code: true,
            },
          },
          user_profile_thrpy_req_client_idTouser_profile: {
            select: {
              user_profile_id: true,
              user_first_name: true,
              user_last_name: true,
              user_phone_nbr: true,
              country_code: true,
            },
          },
        },
      });

      if (!thrpyReq) {
        return { message: 'Therapy request not found or invalid hash', error: -1 };
      }

      // Get sessions for this thryp request
      const sessionsResult = await prisma.session.findMany({
        where: {
          thrpy_req_id: thrpyReq.req_id,
          status_yn: 'y',
        },
      });

      console.log('thrpyReq', thrpyReq.req_id);
      console.log('sessionsResult', sessionsResult);

      // Format the response similar to getThrpyReqById
      // Convert BigInt values to strings to avoid serialization errors
      const formattedThrpyReq = {
        req_id: thrpyReq.req_id,
        counselor_id: thrpyReq.counselor_id,
        client_id: thrpyReq.client_id,
        service_id: thrpyReq.service_id,
        session_format_id: thrpyReq.session_format_id,
        req_dte: thrpyReq.req_dte,
        req_time: thrpyReq.req_time,
        session_desc: thrpyReq.session_desc,
        status_yn: thrpyReq.status_yn,
        thrpy_status: thrpyReq.thrpy_status,
        created_at: thrpyReq.created_at,
        updated_at: thrpyReq.updated_at,
        tenant_id: thrpyReq.tenant_id,
        treatment_target: thrpyReq.treatment_target,
        cancel_hash: thrpyReq.cancel_hash,
        counselor_first_name: thrpyReq.user_profile_thrpy_req_counselor_idTouser_profile?.user_first_name,
        counselor_last_name: thrpyReq.user_profile_thrpy_req_counselor_idTouser_profile?.user_last_name,
        counselor_phone_nbr: thrpyReq.user_profile_thrpy_req_counselor_idTouser_profile?.user_phone_nbr 
          ? String(thrpyReq.user_profile_thrpy_req_counselor_idTouser_profile.user_phone_nbr) 
          : null,
        counselor_country_code: thrpyReq.user_profile_thrpy_req_counselor_idTouser_profile?.country_code,
        client_first_name: thrpyReq.user_profile_thrpy_req_client_idTouser_profile?.user_first_name,
        client_last_name: thrpyReq.user_profile_thrpy_req_client_idTouser_profile?.user_last_name,
        client_phone_nbr: thrpyReq.user_profile_thrpy_req_client_idTouser_profile?.user_phone_nbr 
          ? String(thrpyReq.user_profile_thrpy_req_client_idTouser_profile.user_phone_nbr) 
          : null,
        client_country_code: thrpyReq.user_profile_thrpy_req_client_idTouser_profile?.country_code,
        service_name: thrpyReq.service?.service_name,
        service_code: thrpyReq.service?.service_code,
        session_obj: sessionsResult && !sessionsResult.error ? sessionsResult : [],
      };

      return { message: 'Therapy request found', rec: [formattedThrpyReq] };
    } catch (error) {
      console.error('Error getting therapy request by hash:', error);
      logger.error(error);
      return { message: 'Error getting therapy request by hash', error: -1 };
    }
  }

  //////////////////////////////////////////

  async cancelSessionByHash(session_id, cancel_hash, cancellation_reason) {
    try {
      // Verify hash matches the thryp request
      const thrpyReq = await prisma.thrpy_req.findFirst({
        where: {
          cancel_hash: cancel_hash,
          status_yn: 'y',
        },
        include: {
          session: {
            where: {
              session_id: session_id,
              status_yn: 'y',
            },
          },
          service: true,
          user_profile_thrpy_req_counselor_idTouser_profile: {
            select: {
              user_profile_id: true,
              user_first_name: true,
              user_last_name: true,
              user_id: true,
              country_code: true,
            },
          },
          user_profile_thrpy_req_client_idTouser_profile: {
            select: {
              user_first_name: true,
              user_last_name: true,
            },
          },
        },
      });

      if (!thrpyReq) {
        return { message: 'Invalid hash or therapy request not found', error: -1 };
      }

      if (!thrpyReq.session || thrpyReq.session.length === 0) {
        return { message: 'Session not found', error: -1 };
      }

      const session = thrpyReq.session[0];

      // Check if session can be cancelled (must be SCHEDULED)
      if (session.session_status !== 'SCHEDULED') {
        return { 
          message: `Session cannot be cancelled. Current status: ${session.session_status}`, 
          error: -1 
        };
      }

      // Update session status to CANCELLED and set prices to 0 (same behavior as NO-SHOW)
      const updatedSession = await prisma.session.update({
        where: {
          session_id: session_id,
        },
        data: {
          session_status: 'CANCELLED',
          session_price: 0,
          session_taxes: 0,
          session_counselor_amt: 0,
          session_system_amt: 0,
        },
      });

      // Store cancellation reason as a note (similar to NO-SHOW notes)
      if (cancellation_reason) {
        try {
          // Get tenant_id from counselor
          const counselorProfile = thrpyReq.user_profile_thrpy_req_counselor_idTouser_profile;
          let tenantId = null;
          
          if (counselorProfile && counselorProfile.user_profile_id) {
            const tenantIdResult = await this.common.getUserTenantId({
              user_profile_id: counselorProfile.user_profile_id,
            });
            tenantId = tenantIdResult?.[0]?.tenant_id;
          }
          
          // Fallback to tenant_id from therapy request if available
          if (!tenantId && thrpyReq.tenant_id) {
            tenantId = thrpyReq.tenant_id;
          }

          if (tenantId) {
            const sessionNotes = await this.common.postNotes({
              session_id: session_id,
              message: cancellation_reason,
              tenant_id: tenantId,
            });

            if (sessionNotes.error) {
              logger.warn('Error adding cancellation note:', sessionNotes.message);
              // Don't fail the cancellation if note creation fails
            }
          } else {
            logger.warn('Could not determine tenant_id for cancellation note');
          }
        } catch (noteError) {
          logger.error('Error storing cancellation note:', noteError);
          // Don't fail the cancellation if note creation fails
        }
      }

      // Send email notification to counselor
      try {
        const counselorProfile = thrpyReq.user_profile_thrpy_req_counselor_idTouser_profile;
        const clientProfile = thrpyReq.user_profile_thrpy_req_client_idTouser_profile;
        
        if (counselorProfile && counselorProfile.user_profile_id) {
          // Get counselor email and timezone
          const counselorUserProfile = await this.common.getUserProfileByUserProfileId(
            counselorProfile.user_profile_id
          );
          
          let counselorEmail = null;
          let counselorTimezone = null;
          
          if (counselorUserProfile && !counselorUserProfile.error && counselorUserProfile.length > 0) {
            const profile = counselorUserProfile[0];
            counselorTimezone = profile.timezone || null;
            
            // Get tenant timezone if user profile doesn't have timezone
            if (!counselorTimezone && thrpyReq.tenant_id) {
              try {
                const tenant = await this.common.getTenantByTenantId(thrpyReq.tenant_id);
                if (!tenant.error && Array.isArray(tenant) && tenant[0]?.timezone) {
                  counselorTimezone = tenant[0].timezone;
                }
              } catch (e) {
                console.warn('Failed to get tenant timezone:', e?.message || e);
              }
            }
            
            // Get counselor email from user_id
            if (profile.user_id) {
              const counselorUser = await this.common.getUserById(profile.user_id);
              counselorEmail = counselorUser && counselorUser.length > 0 ? counselorUser[0].email : null;
            }
          }
          
          // Fallback: try to get timezone from country code if not found in profile
          if (!counselorTimezone && counselorProfile.country_code) {
            counselorTimezone = getTimezoneByCountryCode(counselorProfile.country_code);
          }
          
          // Final fallback to default timezone
          if (!counselorTimezone) {
            counselorTimezone = getDefaultTimezone();
          }

          if (counselorEmail) {
            const counselorName = `${counselorProfile.user_first_name} ${counselorProfile.user_last_name}`;
            const clientName = `${clientProfile?.user_first_name || ''} ${clientProfile?.user_last_name || ''}`.trim();
            
            // Format session date and time in counselor's timezone
            let sessionDate = 'N/A';
            let sessionTime = 'N/A';
            
            if (session.intake_date && session.scheduled_time) {
              const { localDate, localTime } = formatDateTimeInTimezone(
                session.intake_date,
                session.scheduled_time,
                counselorTimezone
              );
              sessionDate = localDate;
              sessionTime = localTime;
            } else if (session.intake_date) {
              // If only date is available, format it
              sessionDate = new Date(session.intake_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: counselorTimezone
              });
            }

            const emailTemplate = sessionCancellationNotificationEmail(
              counselorEmail,
              counselorName,
              clientName,
              sessionDate,
              sessionTime,
              thrpyReq.service?.service_name || 'N/A',
              thrpyReq.session_format_id || 'N/A'
            );

            const emailResult = await this.sendEmail.sendMail(emailTemplate);
            if (emailResult?.error) {
              logger.error('Error sending cancellation email to counselor:', emailResult.message);
              // Don't fail the cancellation if email fails
            } else {
              logger.info('Cancellation notification email sent to counselor:', counselorEmail);
            }
          }
        }
      } catch (emailError) {
        logger.error('Error sending cancellation email to counselor:', emailError);
        // Don't fail the cancellation if email fails
      }

      return { 
        message: 'Session cancelled successfully', 
        rec: updatedSession 
      };
    } catch (error) {
      console.error('Error cancelling session:', error);
      logger.error(error);
      return { message: 'Error cancelling session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async rescheduleSessionByHash(session_id, cancel_hash, new_date, new_time) {
    try {
      // Verify hash matches the thryp request
      const thrpyReq = await prisma.thrpy_req.findFirst({
        where: {
          cancel_hash: cancel_hash,
          status_yn: 'y',
        },
        include: {
          session: {
            where: {
              session_id: session_id,
              status_yn: 'y',
            },
          },
          service: true,
          user_profile_thrpy_req_counselor_idTouser_profile: {
            select: {
              user_profile_id: true,
              user_first_name: true,
              user_last_name: true,
              user_id: true,
              country_code: true,
            },
          },
          user_profile_thrpy_req_client_idTouser_profile: {
            select: {
              user_first_name: true,
              user_last_name: true,
            },
          },
        },
      });

      if (!thrpyReq) {
        return { message: 'Invalid hash or therapy request not found', error: -1 };
      }

      if (!thrpyReq.session || thrpyReq.session.length === 0) {
        return { message: 'Session not found', error: -1 };
      }

      const session = thrpyReq.session[0];

      // Check if session can be rescheduled (must be SCHEDULED)
      if (session.session_status !== 'SCHEDULED') {
        return { 
          message: `Session cannot be rescheduled. Current status: ${session.session_status}`, 
          error: -1 
        };
      }

      // Validate new date is not in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const newDateObj = new Date(new_date);
      newDateObj.setHours(0, 0, 0, 0);

      if (newDateObj < today) {
        return { message: 'Cannot reschedule to a past date', error: -1 };
      }

      // Check for session time collision (exclude current session being rescheduled)
      const counselor_id = thrpyReq.counselor_id;
      const collisionCheck = await this.common.checkSessionTimeCollision(
        counselor_id,
        new_date,
        new_time,
        session_id, // Exclude the current session from collision check
      );

      if (collisionCheck.error) {
        logger.warn('Session time collision detected, preventing double booking', {
          counselor_id: counselor_id,
          intake_date: new_date,
          scheduled_time: new_time,
        });
        return collisionCheck;
      }

      // Store old date and time for email notification
      const oldDate = session.intake_date;
      const oldTime = session.scheduled_time;

      // Update session date and time
      const updatedSession = await prisma.session.update({
        where: {
          session_id: session_id,
        },
        data: {
          intake_date: new_date,
          scheduled_time: new_time,
        },
      });

      // Send email notification to counselor
      try {
        const counselorProfile = thrpyReq.user_profile_thrpy_req_counselor_idTouser_profile;
        const clientProfile = thrpyReq.user_profile_thrpy_req_client_idTouser_profile;
        
        if (counselorProfile && counselorProfile.user_profile_id) {
          // Get counselor email and timezone
          const counselorUserProfile = await this.common.getUserProfileByUserProfileId(
            counselorProfile.user_profile_id
          );
          
          let counselorEmail = null;
          let counselorTimezone = null;
          
          if (counselorUserProfile && !counselorUserProfile.error && counselorUserProfile.length > 0) {
            const profile = counselorUserProfile[0];
            counselorTimezone = profile.timezone || null;
            
            // Get tenant timezone if user profile doesn't have timezone
            if (!counselorTimezone && thrpyReq.tenant_id) {
              try {
                const tenant = await this.common.getTenantByTenantId(thrpyReq.tenant_id);
                if (!tenant.error && Array.isArray(tenant) && tenant[0]?.timezone) {
                  counselorTimezone = tenant[0].timezone;
                }
              } catch (e) {
                console.warn('Failed to get tenant timezone:', e?.message || e);
              }
            }
            
            // Get counselor email from user_id
            if (profile.user_id) {
              const counselorUser = await this.common.getUserById(profile.user_id);
              counselorEmail = counselorUser && counselorUser.length > 0 ? counselorUser[0].email : null;
            }
          }
          
          // Fallback: try to get timezone from country code if not found in profile
          if (!counselorTimezone && counselorProfile.country_code) {
            counselorTimezone = getTimezoneByCountryCode(counselorProfile.country_code);
          }
          
          // Final fallback to default timezone
          if (!counselorTimezone) {
            counselorTimezone = getDefaultTimezone();
          }

          if (counselorEmail) {
            const counselorName = `${counselorProfile.user_first_name} ${counselorProfile.user_last_name}`;
            const clientName = `${clientProfile?.user_first_name || ''} ${clientProfile?.user_last_name || ''}`.trim();
            
            // Format old session date and time in counselor's timezone
            let oldSessionDate = 'N/A';
            let oldSessionTime = 'N/A';
            
            if (oldDate && oldTime) {
              const { localDate, localTime } = formatDateTimeInTimezone(
                oldDate,
                oldTime,
                counselorTimezone
              );
              oldSessionDate = localDate;
              oldSessionTime = localTime;
            } else if (oldDate) {
              oldSessionDate = new Date(oldDate).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: counselorTimezone
              });
            }

            // Format new session date and time in counselor's timezone
            let newSessionDate = 'N/A';
            let newSessionTime = 'N/A';
            
            if (new_date && new_time) {
              const { localDate, localTime } = formatDateTimeInTimezone(
                new_date,
                new_time,
                counselorTimezone
              );
              newSessionDate = localDate;
              newSessionTime = localTime;
            } else if (new_date) {
              newSessionDate = new Date(new_date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                timeZone: counselorTimezone
              });
            }

            const emailTemplate = sessionRescheduleNotificationEmail(
              counselorEmail,
              counselorName,
              clientName,
              oldSessionDate,
              oldSessionTime,
              newSessionDate,
              newSessionTime,
              thrpyReq.service?.service_name || 'N/A',
              thrpyReq.session_format_id || 'N/A'
            );

            const emailResult = await this.sendEmail.sendMail(emailTemplate);
            if (emailResult?.error) {
              logger.error('Error sending reschedule email to counselor:', emailResult.message);
              // Don't fail the reschedule if email fails
            } else {
              logger.info('Reschedule notification email sent to counselor:', counselorEmail);
            }
          }
        }
      } catch (emailError) {
        logger.error('Error sending reschedule email to counselor:', emailError);
        // Don't fail the reschedule if email fails
      }

      return { 
        message: 'Session rescheduled successfully', 
        rec: updatedSession 
      };
    } catch (error) {
      console.error('Error rescheduling session:', error);
      logger.error(error);
      return { message: 'Error rescheduling session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async checkThrpyReqIsONGOING(req_id) {
    try {
      const checkSessions = await this.session.getSessionByThrpyReqId({
        thrpy_req_id: req_id,
      });

      if (!Array.isArray(checkSessions)) {
        logger.error('Error checking therapy request status');
        return {
          message: 'Error checking therapy request status',
          error: -1,
        };
      }

      for (const session of checkSessions) {
        if (session.session_status !== 'SCHEDULED') {
          console.log('Therapy request has ongoing sessions');
          return {
            message: 'Therapy request has ongoing sessions',
            rec: checkSessions,
          };
        }
      }

      return { message: 'Therapy request is not ONGOING' };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return {
        message: 'Error checking therapy request status',
        error: -1,
      };
    }
  }

  //////////////////////////////////////////

  /**
   * Load session forms with mode selection (service-based or treatment target-based)
   * @param {Object} data - Request data
   * @param {number} data.req_id - Therapy request ID
   * @param {string} data.mode - Form attachment mode ('service' or 'treatment_target')
   * @param {string} data.treatment_target - Treatment target (required when mode is 'treatment_target')
   * @param {number} data.tenant_id - Tenant ID
   * @param {number} data.number_of_sessions - Number of sessions (optional, for Priority 1 matching)
   */
  async loadSessionFormsWithMode(data) {
    try {
      const { req_id, mode, treatment_target, tenant_id, number_of_sessions } = data;

      if (!req_id) {
        logger.error('Missing required field: req_id');
        return { message: 'Missing required field: req_id', error: -1 };
      }

      // Always use environment variable for form mode (no frontend control)
      const envFormMode = process.env.FORM_MODE || 'auto';
      const effectiveMode = mode || envFormMode;

      // Validate mode
      if (!['service', 'treatment_target', 'auto'].includes(effectiveMode)) {
        logger.error('Invalid mode specified');
        return { message: 'Invalid mode specified. Must be "service", "treatment_target", or "auto"', error: -1 };
      }

      // For treatment_target mode, we need to get the treatment target from the therapy request
      let effectiveTreatmentTarget = treatment_target;
      if (effectiveMode === 'treatment_target' && !effectiveTreatmentTarget) {
        // Get therapy request to find the treatment target
        const query = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('thrpy_req')
          .where('req_id', req_id);

        const [rec] = await query;
        
        if (rec && rec.treatment_target) {
          effectiveTreatmentTarget = rec.treatment_target;
          logger.info(`Found treatment target: ${effectiveTreatmentTarget} for req_id: ${req_id}`);
        } else {
          logger.error('Treatment target not found for therapy request');
          return { message: 'Treatment target not found for therapy request', error: -1 };
        }
      }

      if (effectiveMode === 'service') {
        // Use existing service-based form loading
        return await this.loadSessionForms(req_id);
      } else if (effectiveMode === 'treatment_target') {
        // Use treatment target-based form loading
        const TreatmentTargetFeedbackConfig = (await import('./treatmentTargetFeedbackConfig.js')).default;
        const treatmentTargetConfig = new TreatmentTargetFeedbackConfig();
        
        logger.info(`Loading forms using treatment_target mode for req_id: ${req_id}, treatment_target: ${effectiveTreatmentTarget}`);
        return await treatmentTargetConfig.loadSessionFormsByTreatmentTarget({
          req_id,
          treatment_target: effectiveTreatmentTarget,
          tenant_id,
          number_of_sessions // Pass number_of_sessions for Priority 1 matching
        });
      } else if (effectiveMode === 'auto') {
        // Auto mode: check if treatment target forms exist, otherwise use service-based
        const TreatmentTargetSessionForms = (await import('./treatmentTargetSessionForms.js')).default;
        const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
        
        // Get therapy request to check sessions
        const query = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('v_thrpy_req')
          .where('req_id', req_id);

        const [rec] = await query;
        
        if (!rec) {
          logger.error('Therapy request not found');
          return { message: 'Therapy request not found', error: -1 };
        }

        // Check if any session has treatment target forms
        let hasTreatmentTargetForms = false;
        for (const session of rec.session_obj) {
          const treatmentTargetForms = await treatmentTargetSessionForms.getTreatmentTargetSessionFormsBySessionId({
            session_id: session.session_id,
            tenant_id: tenant_id
          });
          
          if (!treatmentTargetForms.error && treatmentTargetForms.rec && treatmentTargetForms.rec.length > 0) {
            hasTreatmentTargetForms = true;
            break;
          }
        }

        if (hasTreatmentTargetForms) {
          // Use treatment target-based form loading
          // Get the actual treatment target from the therapy request
          const TreatmentTargetFeedbackConfig = (await import('./treatmentTargetFeedbackConfig.js')).default;
          const treatmentTargetConfig = new TreatmentTargetFeedbackConfig();
          
          // Get the treatment target from the therapy request
          const actualTreatmentTarget = rec.treatment_target || 'Anxiety'; // Default fallback
          
          return await treatmentTargetConfig.loadSessionFormsByTreatmentTarget({
            req_id,
            treatment_target: actualTreatmentTarget,
            tenant_id,
            number_of_sessions // Pass number_of_sessions for Priority 1 matching
          });
        } else {
          // Use service-based form loading
          return await this.loadSessionForms(req_id);
        }
      }
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error loading session forms with mode', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get original service-based forms for a session
   * @param {number} session_id - Session ID
   * @param {number} service_id - Service ID
   */
  async getOriginalServiceForms(session_id, service_id) {
    try {
      // Get service-based forms for this service
      const recForm = await this.form.getFormForSessionById({
        service_id: service_id,
      });

      if (!recForm || recForm.length === 0) {
        return [];
      }

      // Get session to determine session position
      const session = await this.session.getSessionById({
        session_id: session_id,
      });

      if (!session || !Array.isArray(session) || session.length === 0) {
        return [];
      }

      // Find session position in therapy request
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_thrpy_req')
        .where('req_id', session[0].thrpy_req_id);

      const [rec] = await query;
      
      if (!rec || !rec.session_obj) {
        return [];
      }

      // Find session position (1-based index)
      const sessionIndex = rec.session_obj.findIndex(s => s.session_id === session_id);
      const sessionPosition = sessionIndex + 1;

      // Get forms for this session position
      const sessionForms = [];
      recForm.forEach((form) => {
        if (form.frequency_typ === 'static' && form.session_position.includes(sessionPosition)) {
          sessionForms.push(form.form_id);
        }
      });

      return sessionForms;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return [];
    }
  }

  //////////////////////////////////////////
}
