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
import { absenceNotificationEmail } from '../utils/emailTmplt.js';

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

      // Step 4: Send notifications if requested
      if (notify_admin) {
        await this.sendAbsenceNotifications(counselor_id, start_date, end_date, tenant_id, totalRescheduledSessions);
      }

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
      // Normalize dates to start of day for accurate comparison
      const absenceStart = new Date(absenceStartDate);
      absenceStart.setHours(0, 0, 0, 0);
      const absenceEnd = new Date(absenceEndDate);
      absenceEnd.setHours(23, 59, 59, 999);

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

      // Identify sessions that fall within the absence period
      const sessionsInAbsencePeriod = allSessions.filter(session => {
        const sessionDate = new Date(session.intake_date);
        sessionDate.setHours(0, 0, 0, 0);
        return sessionDate >= absenceStart && sessionDate <= absenceEnd;
      });

      // Count missed sessions
      const missedSessionsCount = sessionsInAbsencePeriod.length;
      
      if (missedSessionsCount === 0) {
        logger.info(`No sessions in absence period for req_id ${req_id}`);
        return 0;
      }

      logger.info(`Found ${missedSessionsCount} sessions in absence period for req_id ${req_id}`);

      // Calculate extension period in days (missed sessions * session frequency)
      const extensionDays = missedSessionsCount * sessionFrequency;

      // Find sessions that occur after the absence period (that weren't in the absence period)
      const sessionsAfterAbsence = allSessions.filter(session => {
        const sessionDate = new Date(session.intake_date);
        sessionDate.setHours(0, 0, 0, 0);
        const sessionIdsInAbsence = sessionsInAbsencePeriod.map(s => s.session_id);
        return sessionDate > absenceEnd && !sessionIdsInAbsence.includes(session.session_id);
      });

      // Combine all sessions that need rescheduling (both in absence and after)
      // Sort them by their original session_number to maintain order
      const sessionsToReschedule = [
        ...sessionsInAbsencePeriod,
        ...sessionsAfterAbsence
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
      const firstRescheduleDate = new Date(absenceEnd);
      firstRescheduleDate.setDate(firstRescheduleDate.getDate() + 1); // Day after absence ends
      firstRescheduleDate.setHours(0, 0, 0, 0);

      // Skip weekends for the first rescheduled date
      while (firstRescheduleDate.getDay() === 0 || firstRescheduleDate.getDay() === 6) {
        firstRescheduleDate.setDate(firstRescheduleDate.getDate() + 1);
      }

      // Track which sessions were originally in the absence period
      const sessionIdsInAbsence = sessionsInAbsencePeriod.map(s => s.session_id);

      // Reschedule all sessions sequentially, maintaining proper order
      let rescheduledCount = 0;
      let lastScheduledDate = null; // Track the last scheduled date to ensure order

      for (const session of sessionsToReschedule) {
        let calculatedDate;

        if (sessionIdsInAbsence.includes(session.session_id)) {
          // Session was in absence period - schedule it starting from firstRescheduleDate
          // Find the position of this session in the absence period list (sorted by original date)
          const sortedAbsenceSessions = [...sessionsInAbsencePeriod].sort((a, b) => {
            const dateA = new Date(a.intake_date);
            const dateB = new Date(b.intake_date);
            return dateA - dateB;
          });
          const indexInAbsence = sortedAbsenceSessions.findIndex(s => s.session_id === session.session_id);
          calculatedDate = new Date(firstRescheduleDate);
          
          // Space out sessions by session frequency (e.g., weekly = 7 days)
          if (indexInAbsence > 0) {
            calculatedDate.setDate(calculatedDate.getDate() + (indexInAbsence * sessionFrequency));
          }
        } else {
          // Session was after absence period - move it forward by extension period
          const originalDate = new Date(session.intake_date);
          calculatedDate = new Date(originalDate);
          calculatedDate.setDate(calculatedDate.getDate() + extensionDays);
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
          minDate.setDate(minDate.getDate() + sessionFrequency);
          
          newDate = calculatedDate > minDate ? new Date(calculatedDate) : new Date(minDate);
        }

        // Skip weekends if needed
        while (newDate.getDay() === 0 || newDate.getDay() === 6) {
          newDate.setDate(newDate.getDate() + 1);
        }

        const newIntakeDate = newDate.toISOString().split('T')[0];

        await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('session_id', session.session_id)
          .update({
            intake_date: newIntakeDate,
            updated_at: new Date(),
          });

        // Update lastScheduledDate to the date we just scheduled
        lastScheduledDate = new Date(newDate);
        rescheduledCount++;
      }

      logger.info(`Rescheduled ${rescheduledCount} total session dates for req_id ${req_id}. Extended by ${extensionDays} days (${missedSessionsCount} missed sessions × ${sessionFrequency} days)`);
      
      return rescheduledCount;
    } catch (error) {
      logger.error(`Error recalculating session dates for req_id ${req_id}:`, error);
      throw error;
    }
  }

  /**
   * Send absence notifications to admin/supplier
   */
  async sendAbsenceNotifications(counselor_id, start_date, end_date, tenant_id, cancelledSessionsCount) {
    try {
      // Get counselor profile information
      const counselorProfile = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_profile as up')
        .join('counselor_profile as cp', 'up.user_profile_id', 'cp.user_profile_id')
        .where('up.user_profile_id', counselor_id)
        .select('up.user_first_name', 'up.user_last_name', 'up.user_phone_nbr')
        .first();

      if (!counselorProfile) {
        logger.warn(`Counselor profile not found for counselor_id ${counselor_id}`);
        return;
      }

      // Get admin/tenant manager emails
      const adminUsers = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users as u')
        .join('user_profile as up', 'u.user_id', 'up.user_id')
        .where('u.role_id', 3) // Tenant manager role
        .where('up.tenant_id', tenant_id)
        .where('u.status_yn', 'y')
        .select('u.email', 'up.user_first_name', 'up.user_last_name');

      // Prepare notification data
      const counselorName = `${counselorProfile.user_first_name} ${counselorProfile.user_last_name}`;
      const absencePeriod = `${new Date(start_date).toLocaleDateString()} - ${new Date(end_date).toLocaleDateString()}`;

      // Send emails to all tenant managers
      for (const admin of adminUsers) {
        try {
          const emailTemplate = absenceNotificationEmail(
            admin.email,
            counselorName,
            absencePeriod,
            cancelledSessionsCount,
            admin.user_first_name
          );

          await this.emailTmplt.sendEmail.sendMail(emailTemplate);
          logger.info(`Absence notification email sent to ${admin.email}`);
        } catch (emailError) {
          logger.error(`Error sending absence notification email to ${admin.email}:`, emailError);
        }
      }

      // Log audit trail (you can extend this to write to an audit log table)
      logger.info(`Absence notification sent for counselor ${counselor_id} (${counselorName}) from ${start_date} to ${end_date}`);
    } catch (error) {
      logger.error('Error sending absence notifications:', error);
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
