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
   */
  async recalculateSessionDates(req_id, absenceStartDate, absenceEndDate) {
    try {
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

      // Find the last completed session date (before absence period)
      const lastCompletedSession = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .where('thrpy_req_id', req_id)
        .whereIn('session_status', ['SHOW', 'NO-SHOW'])
        .where('status_yn', 'y')
        .whereRaw('DATE(intake_date) < ?', [absenceStartDate.toISOString().split('T')[0]])
        .orderBy('session_number', 'desc')
        .first();

      // Determine the base date for rescheduling
      // All sessions will be rescheduled starting from after the absence period ends
      let baseDate = new Date(absenceEndDate);
      baseDate.setDate(baseDate.getDate() + 1); // Start the day after absence ends

      // Skip weekends for base date
      while (baseDate.getDay() === 0 || baseDate.getDay() === 6) {
        baseDate.setDate(baseDate.getDate() + 1);
      }

      // Find sessions that need rescheduling (those within or after the absence period)
      const absenceStartStr = absenceStartDate.toISOString().split('T')[0];
      const sessionsToReschedule = allSessions.filter(session => {
        if (!session.intake_date) return true; // Reschedule sessions without dates
        const sessionDate = new Date(session.intake_date).toISOString().split('T')[0];
        return sessionDate >= absenceStartStr; // Reschedule sessions from absence start onwards
      });

      if (sessionsToReschedule.length === 0) {
        logger.info(`No sessions need rescheduling for req_id ${req_id}`);
        return 0;
      }

      // If we have a last completed session, use it to determine spacing
      // Otherwise, start from the first session number
      const startingSessionNumber = sessionsToReschedule[0].session_number || 1;

      // Recalculate dates for sessions to reschedule based on service formula
      let currentDate = new Date(baseDate);
      const updates = [];
      let rescheduledCount = 0;

      // If we have a last completed session, calculate the spacing from it
      // Otherwise, start fresh from after the absence period
      if (lastCompletedSession && lastCompletedSession.intake_date) {
        const lastDate = new Date(lastCompletedSession.intake_date);
        const lastSessionNumber = lastCompletedSession.session_number || 0;
        
        // Calculate spacing from last completed session to first rescheduled session
        const firstRescheduledNumber = startingSessionNumber;
        if (firstRescheduledNumber > lastSessionNumber) {
          // Calculate days between last completed and first rescheduled
          let daysFromLast = 0;
          for (let i = lastSessionNumber; i < firstRescheduledNumber - 1; i++) {
            const formulaIndex = Math.min(i, svcFormula.length - 1);
            daysFromLast += formulaIndex >= 0 ? svcFormula[formulaIndex] : 7;
          }
          
          // Start from last completed date + calculated spacing
          currentDate = new Date(lastDate);
          currentDate.setDate(currentDate.getDate() + daysFromLast);
          
          // Ensure it's after absence end date
          const absenceEnd = new Date(absenceEndDate);
          if (currentDate <= absenceEnd) {
            currentDate = new Date(absenceEnd);
            currentDate.setDate(currentDate.getDate() + 1);
          }
          
          // Skip weekends
          while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      }

      for (let i = 0; i < sessionsToReschedule.length; i++) {
        const session = sessionsToReschedule[i];
        const sessionNumber = session.session_number || (startingSessionNumber + i);

        if (i > 0) {
          // Calculate days to add based on formula
          // Formula index is (previous session number - 1) for spacing
          const prevSessionNumber = sessionsToReschedule[i - 1].session_number || (startingSessionNumber + i - 1);
          const formulaIndex = Math.min(prevSessionNumber - 1, svcFormula.length - 1);
          const daysToAdd = formulaIndex >= 0 ? svcFormula[formulaIndex] : 7; // Default to 7 days if formula doesn't have enough entries

          currentDate.setDate(currentDate.getDate() + daysToAdd);

          // Skip weekends
          while (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }

        // Format date for update
        const newIntakeDate = currentDate.toISOString().split('T')[0];
        const scheduledTime = session.scheduled_time || req.req_time || '09:00:00.000Z';
        
        // Parse scheduled time and combine with new date
        let newScheduledTime;
        if (scheduledTime.includes('T')) {
          const timePart = scheduledTime.split('T')[1];
          newScheduledTime = `${newIntakeDate}T${timePart}`;
        } else {
          newScheduledTime = `${newIntakeDate} ${scheduledTime}`;
        }

        updates.push({
          session_id: session.session_id,
          intake_date: newIntakeDate,
          scheduled_time: newScheduledTime,
        });
        rescheduledCount++;
      }

      // Batch update all sessions
      for (const update of updates) {
        await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('session_id', update.session_id)
          .update({
            intake_date: update.intake_date,
            scheduled_time: update.scheduled_time,
            updated_at: new Date(),
          });
      }

      logger.info(`Rescheduled ${rescheduledCount} session dates for req_id ${req_id}`);
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
            rescheduledSessionsCount,
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
