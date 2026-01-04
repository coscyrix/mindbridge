//models/therapistAbsence.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import db from '../utils/db.js';
import dotenv from 'dotenv';
import logger from '../config/winston.js';
import prisma from '../utils/prisma.js';
import ThrpyReq from './thrpyReq.js';
import Session from './session.js';
import Service from './service.js';
import Common from './common.js';
import EmailTmplt from './emailTmplt.js';
import { absenceNotificationEmail, clientAbsenceRescheduleEmail } from '../utils/emailTmplt.js';

dotenv.config();

export default class TherapistAbsence {
  constructor() {
    this.thrpyReq = new ThrpyReq();
    this.session = new Session();
    this.service = new Service();
    this.common = new Common();
    this.emailTmplt = new EmailTmplt();
  }

  /**
   * Handle therapist absence: pause blocks, reschedule sessions
   */
  async handleTherapistAbsence(data) {
    try {
      const { counselor_id, start_date, end_date, notify_admin, tenant_id } = data;

      // Convert dates to Date objects for comparison
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      // Get all active treatment blocks (ONGOING status) for this therapist
      const activeBlocks = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('thrpy_req')
        .where('counselor_id', counselor_id)
        .where('thrpy_status', 'ONGOING')
        .where('status_yn', 'y');

      if (!activeBlocks || activeBlocks.length === 0) {
        logger.info(`No active treatment blocks found for counselor ${counselor_id}`);
      } else {
        // Step 1: Pause all active treatment blocks
        logger.info(`Pausing ${activeBlocks.length} treatment blocks for counselor ${counselor_id}`);
        const pauseResult = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('thrpy_req')
          .where('counselor_id', counselor_id)
          .where('thrpy_status', 'ONGOING')
          .where('status_yn', 'y')
          .update({ thrpy_status: 'PAUSED' });

        logger.info(`Paused ${pauseResult} treatment blocks`);
      }

      // Step 2: Recalculate and reschedule all sessions for all paused blocks
      // Note: Blocks remain PAUSED until the absence period ends (handled by cronjob)
      // Sessions within the absence period will be rescheduled to after the absence ends
      let totalRescheduledSessions = 0;
      for (const block of activeBlocks) {
        const rescheduledCount = await this.recalculateSessionDates(block.req_id, startDate, endDate);
        totalRescheduledSessions += rescheduledCount || 0;
      }

      // Step 3: Record the absence
      const absenceRecord = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('therapist_absences')
        .insert({
          counselor_id,
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0],
          notify_admin: notify_admin || false,
          tenant_id,
          created_at: new Date(),
          updated_at: new Date(),
        });

      // Step 4: Send notifications (function handles notify_admin logic internally)
      await this.sendAbsenceNotifications(counselor_id, start_date, end_date, tenant_id, totalRescheduledSessions, activeBlocks, notify_admin);

      return {
        message: 'Absence handled successfully',
        paused_blocks: activeBlocks.length,
        rescheduled_sessions: totalRescheduledSessions,
      };
    } catch (error) {
      logger.error('Error handling therapist absence:', error);
      return { message: 'Error handling therapist absence', error: -1 };
    }
  }

  /**
   * Recalculate and reschedule all session dates, moving sessions within absence period to after it ends
   * This maintains the same total number of sessions by extending the schedule end date
   */
  async recalculateSessionDates(req_id, absenceStartDate, absenceEndDate) {
    try {
      // Normalize dates to start of day for accurate comparison (use UTC for consistency)
      const absenceStart = new Date(absenceStartDate);
      absenceStart.setUTCHours(0, 0, 0, 0);
      const absenceEnd = new Date(absenceEndDate);
      absenceEnd.setUTCHours(23, 59, 59, 999);

      // Get the therapy request and its sessions
      const thrpyReq = await this.thrpyReq.getThrpyReqById({ req_id });
      
      if (thrpyReq.error || !thrpyReq || thrpyReq.length === 0) {
        logger.error(`Therapy request ${req_id} not found`);
        return 0;
      }

      const req = thrpyReq[0];
      
      // Get all sessions (not discharged, not completed) ordered by session_number
      // We'll reschedule all sessions, especially those within the absence period
      const allSessions = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .where('thrpy_req_id', req_id)
        .where('status_yn', 'y')
        .whereNotIn('session_status', ['DISCHARGED', 'SHOW', 'NO-SHOW'])
        .orderBy('session_number', 'asc');

      if (allSessions.length === 0) {
        logger.info(`No sessions to reschedule for req_id ${req_id}`);
        return 0;
      }

      // Get service details to understand frequency/spacing
      const serviceResult = await this.service.getServiceById({
        service_id: req.service_id,
      });

      if (!serviceResult || !serviceResult.rec || !serviceResult.rec[0]) {
        logger.error(`Service ${req.service_id} not found for req_id ${req_id}`);
        return 0;
      }

      const service = serviceResult.rec[0];
      const svcFormula = service.svc_formula || [];
      const svcFormulaTyp = service.svc_formula_typ || 's';

      // Determine session frequency (days between sessions)
      // For 's' (standard): single value in array [7] for weekly
      // For 'd' (dynamic): array of values, use first one or average
      let sessionFrequency = 7; // Default to weekly
      if (svcFormulaTyp === 's' && svcFormula.length > 0) {
        sessionFrequency = Array.isArray(svcFormula) ? svcFormula[0] : 7;
      } else if (svcFormulaTyp === 'd' && svcFormula.length > 0) {
        // For dynamic, use the first interval or average
        sessionFrequency = Array.isArray(svcFormula) ? svcFormula[0] : 7;
      }

      // Separate regular sessions from report sessions
      // Progress/Intake reports should share the same date as their regular session (like in postThrpyReq)
      // But discharge reports are scheduled one interval AFTER the last regular session
      const regularSessions = allSessions.filter(session => !session.is_report);
      
      // Identify discharge reports by their session_code
      const dischargeCodes = ['DISCHARGE', 'DR', 'OTR_SUM_REP', 'OTR_TRNS_REP', 'DISCHARGE_REPORT'];
      const dischargeReports = allSessions.filter(session => {
        if (!session.is_report) return false;
        const sessionCode = (session.session_code || '').toUpperCase();
        return dischargeCodes.some(code => sessionCode.includes(code));
      });
      
      // Other reports (progress/intake) that share dates with regular sessions
      const regularReports = allSessions.filter(session => {
        if (!session.is_report) return false;
        const sessionCode = (session.session_code || '').toUpperCase();
        return !dischargeCodes.some(code => sessionCode.includes(code));
      });

      // Identify REGULAR sessions that fall within the absence period
      const regularSessionsInAbsencePeriod = regularSessions.filter(session => {
        const sessionDate = new Date(`${session.intake_date}T00:00:00Z`);
        sessionDate.setUTCHours(0, 0, 0, 0);
        return sessionDate >= absenceStart && sessionDate <= absenceEnd;
      });

      // Count missed REGULAR sessions (reports don't count separately)
      const missedSessionsCount = regularSessionsInAbsencePeriod.length;
      
      if (missedSessionsCount === 0) {
        logger.info(`No regular sessions in absence period for req_id ${req_id}`);
        return 0;
      }

      logger.info(`Found ${missedSessionsCount} regular sessions in absence period for req_id ${req_id}`);

      // Calculate extension period in days (missed sessions * session frequency)
      const extensionDays = missedSessionsCount * sessionFrequency;

      // Find REGULAR sessions that occur after the absence period
      const regularSessionsAfterAbsence = regularSessions.filter(session => {
        const sessionDate = new Date(`${session.intake_date}T00:00:00Z`);
        sessionDate.setUTCHours(0, 0, 0, 0);
        const sessionIdsInAbsence = regularSessionsInAbsencePeriod.map(s => s.session_id);
        return sessionDate > absenceEnd && !sessionIdsInAbsence.includes(session.session_id);
      });

      // Combine all REGULAR sessions that need rescheduling (both in absence and after)
      // Sort them by their original session_number to maintain order
      const regularSessionsToReschedule = [
        ...regularSessionsInAbsencePeriod,
        ...regularSessionsAfterAbsence
      ].sort((a, b) => {
        // Sort by session_number first, then by intake_date as fallback
        if (a.session_number !== null && b.session_number !== null) {
          return a.session_number - b.session_number;
        }
        const dateA = new Date(a.intake_date);
        const dateB = new Date(b.intake_date);
        return dateA - dateB;
      });

      // Find the first session date after the absence period ends
      // Use UTC to avoid timezone issues (same logic as postThrpyReq)
      const firstRescheduleDate = new Date(absenceEnd);
      firstRescheduleDate.setUTCDate(firstRescheduleDate.getUTCDate() + 1); // Day after absence ends
      firstRescheduleDate.setUTCHours(0, 0, 0, 0);

      // Skip weekends for the first rescheduled date (use UTC methods)
      while (firstRescheduleDate.getUTCDay() === 0 || firstRescheduleDate.getUTCDay() === 6) {
        firstRescheduleDate.setUTCDate(firstRescheduleDate.getUTCDate() + 1);
      }

      // Track which REGULAR sessions were originally in the absence period
      const regularSessionIdsInAbsence = regularSessionsInAbsencePeriod.map(s => s.session_id);

      // Map to track old date -> new date for updating reports later
      const dateMapping = {}; // { 'old_date_time': 'new_date' }

      // Reschedule all REGULAR sessions sequentially, maintaining proper order
      let rescheduledCount = 0;
      let lastScheduledDate = null; // Track the last scheduled date to ensure order

      for (const session of regularSessionsToReschedule) {
        // Store old date for mapping (to update associated reports later)
        const oldDateTimeKey = `${session.intake_date}_${session.scheduled_time || ''}`;

        let calculatedDate;

        if (regularSessionIdsInAbsence.includes(session.session_id)) {
          // Session was in absence period - schedule it starting from firstRescheduleDate
          // Find the position of this session in the absence period list (sorted by original date)
          const sortedAbsenceSessions = [...regularSessionsInAbsencePeriod].sort((a, b) => {
            const dateA = new Date(a.intake_date);
            const dateB = new Date(b.intake_date);
            return dateA - dateB;
          });
          const indexInAbsence = sortedAbsenceSessions.findIndex(s => s.session_id === session.session_id);
          // Initialize using UTC format to avoid timezone issues (same logic as postThrpyReq)
          calculatedDate = new Date(`${firstRescheduleDate.toISOString().split('T')[0]}T00:00:00Z`);
          
          // Space out sessions by session frequency (e.g., weekly = 7 days)
          if (indexInAbsence > 0) {
            calculatedDate.setUTCDate(calculatedDate.getUTCDate() + (indexInAbsence * sessionFrequency));
          }
        } else {
          // Session was after absence period - move it forward by extension period
          // Initialize using UTC format to avoid timezone issues (same logic as postThrpyReq)
          const originalDate = new Date(`${session.intake_date}T00:00:00Z`);
          calculatedDate = new Date(originalDate);
          calculatedDate.setUTCDate(calculatedDate.getUTCDate() + extensionDays);
        }

        // Determine the actual new date - must be after the last scheduled session
        let newDate;
        if (lastScheduledDate === null) {
          // First session - use calculated date
          newDate = new Date(calculatedDate);
        } else {
          // Ensure this session comes after the previous rescheduled session
          // Use the later of: calculated date or last scheduled date + session frequency
          const minDate = new Date(lastScheduledDate);
          minDate.setUTCDate(minDate.getUTCDate() + sessionFrequency);
          
          newDate = calculatedDate > minDate ? new Date(calculatedDate) : new Date(minDate);
        }

        // Skip weekends if needed (use UTC methods for consistency with postThrpyReq)
        while (newDate.getUTCDay() === 0 || newDate.getUTCDay() === 6) {
          newDate.setUTCDate(newDate.getUTCDate() + 1);
        }

        const newIntakeDate = newDate.toISOString().split('T')[0];

        // Update the regular session
        await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('session_id', session.session_id)
          .update({
            intake_date: newIntakeDate,
            updated_at: new Date(),
          });

        // Track the date mapping for updating reports later
        dateMapping[oldDateTimeKey] = newIntakeDate;

        // Update lastScheduledDate to the date we just scheduled
        lastScheduledDate = new Date(newDate);
        rescheduledCount++;
      }

      // Now update regular reports (progress/intake) to match their corresponding regular session dates
      // These reports should have the same date as their regular session (like in postThrpyReq)
      for (const reportSession of regularReports) {
        const oldDateTimeKey = `${reportSession.intake_date}_${reportSession.scheduled_time || ''}`;
        const newReportDate = dateMapping[oldDateTimeKey];

        if (newReportDate) {
          // Update the report session to match its regular session's new date
          await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('session')
            .where('session_id', reportSession.session_id)
            .update({
              intake_date: newReportDate,
              updated_at: new Date(),
            });

          rescheduledCount++;
          logger.info(`Updated regular report session ${reportSession.session_id} to match regular session date: ${newReportDate}`);
        } else {
          // If no mapping found, this report wasn't affected by rescheduling
          logger.info(`Regular report session ${reportSession.session_id} not affected by absence rescheduling`);
        }
      }

      // Now handle discharge reports separately - they should be one interval AFTER the last regular session
      // (same logic as postThrpyReq)
      for (const dischargeReport of dischargeReports) {
        if (lastScheduledDate && regularSessionsToReschedule.length > 0) {
          // Calculate discharge date: last regular session date + session frequency
          const dischargeDate = new Date(lastScheduledDate);
          dischargeDate.setUTCDate(dischargeDate.getUTCDate() + sessionFrequency);
          
          // Skip weekends for the discharge report (use UTC methods)
          while (dischargeDate.getUTCDay() === 0 || dischargeDate.getUTCDay() === 6) {
            dischargeDate.setUTCDate(dischargeDate.getUTCDate() + 1);
          }
          
          const newDischargeDate = dischargeDate.toISOString().split('T')[0];
          
          // Update the discharge report session
          await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('session')
            .where('session_id', dischargeReport.session_id)
            .update({
              intake_date: newDischargeDate,
              updated_at: new Date(),
            });

          rescheduledCount++;
          logger.info(`Updated discharge report session ${dischargeReport.session_id} to be one interval after last regular session: ${newDischargeDate}`);
        } else {
          logger.info(`Discharge report session ${dischargeReport.session_id} not affected by absence rescheduling (no regular sessions rescheduled)`);
        }
      }

      logger.info(`Rescheduled ${rescheduledCount} total session dates for req_id ${req_id}. Extended by ${extensionDays} days (${missedSessionsCount} missed sessions × ${sessionFrequency} days)`);
      
      return rescheduledCount;
    } catch (error) {
      logger.error(`Error recalculating session dates for req_id ${req_id}:`, error);
      throw error;
    }
  }

  /**
   * Send absence notifications to admin and affected clients
   */
  async sendAbsenceNotifications(counselor_id, start_date, end_date, tenant_id, cancelledSessionsCount, activeBlocks, notify_admin = false) {
    try {
      logger.info(`Starting absence notification process for counselor ${counselor_id} (notify_admin: ${notify_admin})`);
      
      // Get counselor profile information
      const counselorProfile = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_profile as up')
        .join('counselor_profile as cp', 'up.user_profile_id', 'cp.user_profile_id')
        .where('up.user_profile_id', counselor_id)
        .select('up.user_first_name', 'up.user_last_name', 'up.user_phone_nbr', 'up.timezone')
        .first();

      if (!counselorProfile) {
        logger.warn(`Counselor profile not found for counselor_id ${counselor_id}`);
        return;
      }

      logger.info(`Counselor profile found: ${counselorProfile.user_first_name} ${counselorProfile.user_last_name}`);

      // Prepare shared notification data (used by both admin and client notifications)
      const counselorName = `${counselorProfile.user_first_name} ${counselorProfile.user_last_name}`;
      const absencePeriod = `${new Date(start_date).toLocaleDateString()} - ${new Date(end_date).toLocaleDateString()}`;

      // Only send admin notifications if notify_admin is true
      if (notify_admin) {
        // Get admin/tenant manager emails
        const adminUsers = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('users as u')
          .join('user_profile as up', 'u.user_id', 'up.user_id')
          .where('u.role_id', 3) // Tenant manager role
          .where('up.tenant_id', tenant_id)
          .where('u.status_yn', 'y')
          .select('u.email', 'up.user_first_name', 'up.user_last_name');

        if (!adminUsers || adminUsers.length === 0) {
          logger.warn(`No admin users found for tenant ${tenant_id}`);
        } else {
          logger.info(`Found ${adminUsers.length} admin user(s) to notify`);

          // Fetch rescheduled session details for this counselor
          let formattedSessions = [];
          
          try {
            const rescheduledSessions = await db
              .withSchema(`${process.env.MYSQL_DATABASE}`)
              .from('session as s')
              .join('thrpy_req as tr', 's.thrpy_req_id', 'tr.req_id')
              .join('service as srv', 'tr.service_id', 'srv.service_id')
              .join('user_profile as client_up', 'tr.client_id', 'client_up.user_profile_id')
              .where('tr.counselor_id', counselor_id)
              .where('tr.tenant_id', tenant_id)
              .where('s.status_yn', 'y')
              .whereRaw('DATE(s.intake_date) >= ?', [new Date(end_date).toISOString().split('T')[0]])
              .whereNotIn('s.session_status', ['DISCHARGED', 'SHOW', 'NO-SHOW'])
              .select(
                's.session_id',
                's.intake_date',
                's.scheduled_time',
                's.session_number',
                's.session_format as session_format',
                'srv.service_name',
                'client_up.user_first_name as client_first_name',
                'client_up.user_last_name as client_last_name',
                'client_up.timezone as client_timezone'
              )
              .orderBy('s.intake_date', 'asc')
              .limit(50); // Limit to first 50 sessions to avoid email overload

            logger.info(`Found ${rescheduledSessions.length} rescheduled session(s) to include in email`);

            // Format sessions for email with original dates (stored in session history or estimated)
            formattedSessions = rescheduledSessions.map((session) => {
              // Calculate estimated original date (before rescheduling)
              // This is an approximation - ideally you'd store original dates in a history table
              const newDate = new Date(session.intake_date);
              const estimatedOriginalDate = new Date(newDate);
              estimatedOriginalDate.setDate(estimatedOriginalDate.getDate() - 7); // Rough estimate

              return {
                client_name: `${session.client_first_name || ''} ${session.client_last_name || ''}`.trim(),
                service_name: session.service_name || 'N/A',
                original_date: estimatedOriginalDate.toLocaleDateString(),
                intake_date: session.intake_date,
                scheduled_time: session.scheduled_time || '09:00:00',
                session_format: session.session_format || 'N/A',
                timezone: session.client_timezone || counselorProfile.timezone || process.env.TIMEZONE || 'UTC',
              };
            });
          } catch (sessionQueryError) {
            logger.error('Error fetching rescheduled sessions:', sessionQueryError);
            // Continue with empty sessions array - email can still be sent without session details
            formattedSessions = [];
          }

          logger.info(`Preparing to send emails to ${adminUsers.length} admin(s)`);

          // Send emails to all tenant managers
          for (const admin of adminUsers) {
            try {
              logger.info(`Generating email template for ${admin.email}`);
              
              const emailTemplate = absenceNotificationEmail(
                admin.email,
                counselorName,
                absencePeriod,
                cancelledSessionsCount,
                admin.user_first_name,
                formattedSessions
              );

              logger.info(`Sending absence notification email to ${admin.email}`);
              await this.emailTmplt.sendEmail.sendMail(emailTemplate);
              logger.info(`✅ Absence notification email sent successfully to ${admin.email} with ${formattedSessions.length} rescheduled session details`);
            } catch (emailError) {
              logger.error(`❌ Error sending absence notification email to ${admin.email}:`, emailError);
              logger.error('Email error stack:', emailError.stack);
            }
          }
        }
      } else {
        logger.info('Admin notification skipped (notify_admin is false)');
      }

      // Step 5: Send notifications to affected clients
      logger.info('Starting client notification process...');
      
      try {

        // Fetch all affected sessions with client contact information
        const clientSessions = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session as s')
          .join('thrpy_req as tr', 's.thrpy_req_id', 'tr.req_id')
          .join('service as srv', 'tr.service_id', 'srv.service_id')
          .join('user_profile as client_up', 'tr.client_id', 'client_up.user_profile_id')
          .join('users as client_user', 'client_up.user_id', 'client_user.user_id')
          .where('tr.counselor_id', counselor_id)
          .where('tr.tenant_id', tenant_id)
          .where('s.status_yn', 'y')
          .where('s.is_report', false) // Only regular sessions, not reports
          .whereRaw('DATE(s.intake_date) >= ?', [new Date(end_date).toISOString().split('T')[0]])
          .whereNotIn('s.session_status', ['DISCHARGED', 'SHOW', 'NO-SHOW'])
          .select(
            's.session_id',
            's.intake_date',
            's.scheduled_time',
            's.session_number',
            's.session_format as session_format',
            'srv.service_name',
            'client_up.user_profile_id as client_id',
            'client_up.user_first_name as client_first_name',
            'client_up.user_last_name as client_last_name',
            'client_up.timezone as client_timezone',
            'client_user.email as client_email'
          )
          .orderBy('client_up.user_profile_id', 'asc')
          .orderBy('s.intake_date', 'asc');

        if (!clientSessions || clientSessions.length === 0) {
          logger.info('No client sessions found to notify');
        } else {
          logger.info(`Found ${clientSessions.length} client session(s) to notify about`);

          // Group sessions by client
          const sessionsByClient = {};
          
          for (const session of clientSessions) {
            const clientId = session.client_id;
            
            if (!sessionsByClient[clientId]) {
              sessionsByClient[clientId] = {
                client_email: session.client_email,
                client_name: `${session.client_first_name || ''} ${session.client_last_name || ''}`.trim(),
                sessions: [],
              };
            }

            // Calculate estimated original date (before rescheduling)
            const newDate = new Date(session.intake_date);
            const estimatedOriginalDate = new Date(newDate);
            estimatedOriginalDate.setDate(estimatedOriginalDate.getDate() - 7); // Rough estimate

            sessionsByClient[clientId].sessions.push({
              service_name: session.service_name || 'N/A',
              original_date: estimatedOriginalDate.toLocaleDateString(),
              intake_date: session.intake_date,
              scheduled_time: session.scheduled_time || '09:00:00',
              session_format: session.session_format || 'N/A',
              timezone: session.client_timezone || counselorProfile.timezone || process.env.TIMEZONE || 'UTC',
            });
          }

          // Send email to each affected client
          const clientCount = Object.keys(sessionsByClient).length;
          logger.info(`Sending reschedule notifications to ${clientCount} client(s)`);


          for (const [clientId, clientData] of Object.entries(sessionsByClient)) {
            try {
              if (!clientData.client_email) {
                logger.warn(`No email found for client ${clientId}, skipping notification`);
                continue;
              }

              logger.info(`Sending reschedule notification to client: ${clientData.client_email}`);
              
              const clientEmailTemplate = clientAbsenceRescheduleEmail(
                clientData.client_email,
                clientData.client_name,
                counselorName,
                clientData.sessions
              );

              await this.emailTmplt.sendEmail.sendMail(clientEmailTemplate);
              logger.info(`✅ Client notification email sent successfully to ${clientData.client_email} (${clientData.sessions.length} session(s))`);
            } catch (clientEmailError) {
              logger.error(`❌ Error sending client notification email to ${clientData.client_email}:`, clientEmailError);
            }
          }

          logger.info(`✅ Client notification process completed. Notified ${clientCount} client(s) about rescheduled sessions`);
        }
      } catch (clientNotificationError) {
        logger.error('❌ Error in client notification process:', clientNotificationError);
        logger.error('Error stack:', clientNotificationError.stack);
        // Continue - client notification failure shouldn't fail the overall process
      }

      // Log audit trail (you can extend this to write to an audit log table)
      logger.info(`✅ Absence notification process completed for counselor ${counselor_id} (${counselorName}) from ${start_date} to ${end_date}`);
    } catch (error) {
      logger.error('❌ Error in sendAbsenceNotifications:', error);
      logger.error('Error stack:', error.stack);
      // Don't throw - notification failure shouldn't fail the absence handling
    }
  }

  /**
   * Resume treatment blocks for counselors whose absence period has ended
   * This should be called by a cronjob periodically (e.g., daily)
   */
  async resumeExpiredAbsences() {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Start of today

      // Get all absences that have ended (end_date < today)
      const expiredAbsences = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('therapist_absences')
        .whereRaw('DATE(end_date) < ?', [today.toISOString().split('T')[0]])
        .select('counselor_id', 'end_date');

      if (expiredAbsences.length === 0) {
        logger.info('No expired absences found');
        return { message: 'No expired absences to resume', resumed_blocks: 0 };
      }

      logger.info(`Found ${expiredAbsences.length} expired absences to process`);

      let totalResumedBlocks = 0;
      const uniqueCounselorIds = [...new Set(expiredAbsences.map(a => a.counselor_id))];

      // Resume treatment blocks for each counselor
      for (const counselorId of uniqueCounselorIds) {
        try {
          // Resume all PAUSED treatment blocks for this counselor
          const resumedBlocks = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('thrpy_req')
            .where('counselor_id', counselorId)
            .where('thrpy_status', 'PAUSED')
            .where('status_yn', 'y')
            .update({
              thrpy_status: 'ONGOING',
              updated_at: new Date(),
            });

          if (resumedBlocks > 0) {
            logger.info(`Resumed ${resumedBlocks} treatment blocks for counselor ${counselorId}`);
            totalResumedBlocks += resumedBlocks;
          }
        } catch (error) {
          logger.error(`Error resuming blocks for counselor ${counselorId}:`, error);
          // Continue with other counselors even if one fails
        }
      }

      logger.info(`Successfully resumed ${totalResumedBlocks} treatment blocks across ${uniqueCounselorIds.length} counselors`);
      return { message: 'Expired absences processed', resumed_blocks: totalResumedBlocks };
    } catch (error) {
      logger.error('Error in resumeExpiredAbsences:', error);
      return { message: 'Error resuming expired absences', error: -1 };
    }
  }
}
