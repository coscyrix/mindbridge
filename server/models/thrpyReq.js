//models/thrpyReq

import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import Session from './session.js';
import Service from './service.js';
import UserProfile from './userProfile.js';
import Form from './form.js';
import EmailTmplt from './emailTmplt.js';
import Common from './common.js';
import dotenv from 'dotenv';
import { capitalizeFirstLetter } from '../utils/common.js';
import { splitIsoDatetime } from '../utils/common.js';
import {
  therapyRequestDetailsEmail,
  dischargeEmail,
} from '../utils/emailTmplt.js';
import SendEmail from '../middlewares/sendEmail.js';

const db = knex(DBconn.dbConn.development);

export default class ThrpyReq {
  //////////////////////////////////////////
  constructor() {
    this.session = new Session();
    this.service = new Service();
    this.form = new Form();
    this.userProfile = new UserProfile();
    this.sendEmail = new SendEmail();
    this.emailTmplt = new EmailTmplt();
    this.common = new Common();
  }
  //////////////////////////////////////////

  async postThrpyReq(data) {
    try {
      // Parse the intake date and time from the ISO string
      const req_dte = data.intake_dte.split('T')[0]; // 'YYYY-MM-DD'
      const req_time = data.intake_dte.split('T')[1]; // 'HH:mm:ss.sssZ'
      const currentDte = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'

      // Check if counselor in data role is for a counselor
      const recCounselor = await this.userProfile.getUserProfileById({
        user_profile_id: data.counselor_id,
      });

      if (!recCounselor) {
        logger.error('Error getting counselor profile');
        return { message: 'Error getting counselor profile', error: -1 };
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

      if (!recClient) {
        logger.error('Error getting client profile');
        return { message: 'Error getting client profile', error: -1 };
      }

      if (recClient.rec[0].role_id !== 1) {
        logger.error('The specified client does not have the client role');
        return {
          message: 'The specified client does not have the client role',
          error: -1,
        };
      }

      // Retrieve the service details from the database
      const servc = await this.service.getServiceById({
        service_id: data.service_id,
      });

      const svc = servc.rec[0];

      const drService = await this.service.getServiceById({
        service_code: process.env.DISCHARGE_SERVICE_CODE,
      });

      if (svc.is_additional === 1) {
        logger.error('Additional services cannot be requested');
        return {
          message: 'Additional services cannot be requested',
          error: -1,
        };
      }

      if (svc.is_report === 1) {
        logger.error('Report services cannot be requested');
        return { message: 'Report services cannot be requested', error: -1 };
      }

      const drSvc = drService.rec[0];

      if (!svc) {
        logger.error(`Error getting service with ID: ${data.service_id}`);
        return { message: 'Error getting service', error: -1 };
      }

      if (!drSvc) {
        logger.error(
          `Error getting discharge report service with service_code: DR`,
        );
        return { message: 'Error getting discharge report service', error: -1 };
      }

      // Check if the intake date is in the past
      if (req_dte < currentDte) {
        logger.warn('Intake date is in the past');
        return { message: 'Intake date is in the past', error: -1 };
      }

      // Check if the client has an active therapy request with the same service and same counselor
      const checkThrpyReqActiveData = {
        counselor_id: data.counselor_id,
        client_id: data.client_id,
        service_id: data.service_id,
      };

      const checkThrpyReq = await this.checkThrpyReqActive(
        checkThrpyReqActiveData,
      );

      if (checkThrpyReq.error) {
        return checkThrpyReq;
      }

      // Parse svc_report_formula if needed
      if (svc.svc_report_formula_typ === 'standard') {
        if (typeof svc.svc_report_formula === 'string') {
          try {
            svc.svc_report_formula = JSON.parse(svc.svc_report_formula);
          } catch (e) {
            logger.error('Failed to parse svc_report_formula');
            return { message: 'Unexpected report formula format', error: -1 };
          }
        }
      }

      // Prepare the therapy request object
      const tmpThrpyReq = {
        counselor_id: data.counselor_id,
        client_id: data.client_id,
        service_id: data.service_id,
        session_format_id: data.session_format_id,
        req_dte: req_dte,
        req_time: req_time,
        session_desc: svc.service_code,
      };

      // Insert the therapy request into the database
      const postThrpyReq = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('thrpy_req')
        .insert(tmpThrpyReq);

      if (!postThrpyReq) {
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
          const tmpSession = {
            thrpy_req_id: postThrpyReq[0],
            service_id: data.service_id,
            intake_date: intakeDate,
            scheduled_time: req_time,
            session_format: data.session_format_id,
            session_code: svc.service_code,
            session_description: svc.service_code,
          };

          // Handle reports based on svc_report_formula
          if (
            svc.svc_report_formula &&
            Array.isArray(svc.svc_report_formula.position) &&
            svc.svc_report_formula.position.includes(i + 1)
          ) {
            const reportIndex = svc.svc_report_formula.position.indexOf(i + 1);
            const reportServiceId =
              svc.svc_report_formula.service_id[reportIndex];
            const reportName = await this.service.getServiceById({
              service_id: reportServiceId,
              is_report: 1,
            });

            if (reportName && reportName.rec && reportName.rec[0]) {
              tmpSession.session_code = `${svc.service_code}_${reportName.rec[0].service_code}`;
              tmpSession.session_description = `${svc.service_code} ${reportName.rec[0].service_name}`;
              tmpSession.service_id = reportServiceId;
              tmpSession.is_report = reportName.rec[0].is_report === 1 ? 1 : 0;
              tmpSession.is_additional =
                reportName.rec[0].is_additional &&
                reportName.rec[0].is_additional[0] === 1
                  ? 1
                  : 0;
            }
          }

          // Insert the session into the database
          const postSession = await this.session.postSession(tmpSession);
          if (!postSession) {
            logger.error('Error creating session');
            return { message: 'Error creating session', error: -1 };
          }
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
        const dischargeSession = {
          thrpy_req_id: postThrpyReq[0],
          service_id: drSvc.service_id,
          intake_date: dischargeDate,
          scheduled_time: req_time,
          session_format: data.session_format_id,
          session_code: `${svc.service_code}_${drSvc.service_code}`,
          session_description: `${svc.service_code} ${drSvc.service_name}`,
          is_report: 1,
        };

        // Insert the discharge session into the database
        const postDischargeSession =
          await this.session.postSession(dischargeSession);
        if (!postDischargeSession) {
          logger.error('Error creating discharge session');
          return { message: 'Error creating discharge session', error: -1 };
        }
      } else if (svc.svc_formula_typ === 'd') {
        // Handle days apart formula
        let svcFormula;

        // Check if svc_formula is a string before parsing
        if (typeof svc.svc_formula === 'string') {
          try {
            svcFormula = JSON.parse(svc.svc_formula);
          } catch (e) {
            logger.error('Failed to parse svc_formula');
            return { message: 'Unexpected formula format', error: -1 };
          }
        } else if (Array.isArray(svc.svc_formula)) {
          svcFormula = svc.svc_formula; // Already an array
        } else {
          logger.error('svc_formula is neither a string nor an array');
          return { message: 'Unexpected formula format', error: -1 };
        }

        // Validate the formula length
        if (parseInt(svc.nbr_of_sessions) - 1 !== svcFormula.length) {
          logger.error('Unexpected formula format for service');
          return { message: 'Unexpected formula format', error: -2 };
        }

        // Initialize currentDate using UTC to avoid timezone issues
        let currentDate = new Date(`${req_dte}T00:00:00Z`);

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
          const tmpSession = {
            thrpy_req_id: postThrpyReq[0],
            service_id: data.service_id,
            intake_date: intakeDate,
            scheduled_time: req_time,
            session_format: data.session_format_id,
            session_code: svc.service_code,
            session_description: svc.service_code,
          };

          // Handle reports based on svc_report_formula
          if (
            svc.svc_report_formula &&
            Array.isArray(svc.svc_report_formula.position) &&
            svc.svc_report_formula.position.includes(i + 1)
          ) {
            const reportIndex = svc.svc_report_formula.position.indexOf(i + 1);
            const reportServiceId =
              svc.svc_report_formula.service_id[reportIndex];
            const reportName = await this.service.getServiceById({
              service_id: reportServiceId,
              is_report: 1,
            });

            if (reportName && reportName.rec && reportName.rec[0]) {
              tmpSession.session_code = `${svc.service_code}_${reportName.rec[0].service_code}`;
              tmpSession.session_description = `${svc.service_code} ${reportName.rec[0].service_name}`;
              tmpSession.service_id = reportServiceId;
              tmpSession.is_report = reportName.rec[0].is_report === 1 ? 1 : 0;
              tmpSession.is_additional =
                reportName.rec[0].is_additional[0] === 1 ? 1 : 0;
            }
          }

          // Insert the session into the database
          const postSession = await this.session.postSession(tmpSession);
          if (!postSession) {
            logger.error('Error creating session');
            return { message: 'Error creating session', error: -1 };
          }
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
        const dischargeSession = {
          thrpy_req_id: postThrpyReq[0],
          service_id: drSvc.service_id,
          intake_date: dischargeDate,
          scheduled_time: req_time,
          session_format: data.session_format_id,
          session_code: `${svc.service_code}_${drSvc.service_code}`,
          session_description: `${svc.service_code} ${drSvc.service_name}`,
          is_report: 1, // Use if appropriate
        };

        // Insert the discharge session into the database
        const postDischargeSession =
          await this.session.postSession(dischargeSession);
        if (!postDischargeSession) {
          logger.error('Error creating discharge session');
          return { message: 'Error creating discharge session', error: -1 };
        }
      } else {
        // Handle unexpected svc_formula_typ values
        logger.error(`Unsupported svc_formula_typ: ${svc.svc_formula_typ}`);
        return { message: 'Unsupported formula type', error: -1 };
      }

      const loadForms = this.loadSessionForms(postThrpyReq[0]);

      if (!loadForms) {
        logger.error('Error loading session forms');
        return { message: 'Error loading session forms', error: -1 };
      }

      const ThrpyReq = await this.getThrpyReqById({
        req_id: postThrpyReq[0],
      });

      if (!ThrpyReq) {
        logger.error('Error getting therapy request');
        return { message: 'Error getting therapy request', error: -1 };
      }

      // Send an email to the client with the therapy request details
      const thrpyReqEmlTmplt = this.emailTmplt.sendThrpyReqDetailsEmail({
        email: recClient.rec[0].email,
        big_thrpy_req_obj: ThrpyReq[0],
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
        message: 'Error creating therapy request, sessions, and reports',
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
      const checkIfThrpyReqIsDischarged =
        await this.common.checkThrpyReqDischarge({
          req_id: data.req_id,
        });

      if (checkIfThrpyReqIsDischarged.error) {
        logger.warn(checkIfThrpyReqIsDischarged.message);
        return { message: checkIfThrpyReqIsDischarged.message, error: -1 };
      }

      if (!data.thrpy_status) {
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
        if (
          checkIfThrpyReqIsOngoing_LastSession.session_status == 'SCHEDULED'
        ) {
          var thrpySessions = await this.session.getSessionByThrpyReqId({
            thrpy_req_id: data.req_id,
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
            return { message: 'Error deleting therapy sessions', error: -1 };
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
          return { message: 'Error getting discharge report', error: -1 };
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
          return { message: 'Error deleting therapy sessions', error: -1 };
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
        return { message: 'Error deleting therapy sessions', error: -1 };
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

      return { message: 'Therapy request and sessions deleted successfully' };
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

              tmpSession.push(tmpFormSession);
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
                  tmpSession.push(tmpFormSession);
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
                  tmpSession.push(tmpFormSession);
                }
              }

              //First logic
              if (position === '1') {
                const tmpFormSession = {
                  session_id: rec.session_obj[0].session_id,
                  form_array: [form.form_id],
                };
                tmpSession.push(tmpFormSession);
              }

              //Last logic
              if (position === '-1') {
                const tmpFormSession = {
                  session_id:
                    rec.session_obj[rec.session_obj.length - 1].session_id,
                  form_array: [form.form_id],
                };
                tmpSession.push(tmpFormSession);
              }

              //Second to last logic
              if (position === '-2') {
                const tmpFormSession = {
                  session_id:
                    rec.session_obj[rec.session_obj.length - 2].session_id,
                  form_array: [form.form_id],
                };
                tmpSession.push(tmpFormSession);
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
      const checkThrpyReq = await this.getThrpyReqById({
        counselor_id: data.counselor_id,
        client_id: data.client_id,
        service_id: data.service_id,
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
            return { message: 'Error getting active sessions', error: -1 };
          }

          // Check if the client has an active session for the same therapy request
          if (activeThrpyReq[0].session_obj.length !== activeSessions.length) {
            logger.warn(
              'Client already has an active therapy request with some sessions updated',
            );
            return {
              message:
                'Client already has an active therapy request with some sessions updated',
              error: -1,
            };
          }

          // Check if the client doesn't have an active session for the same therapy request
          if (activeThrpyReq[0].session_obj.length === activeSessions.length) {
            const hardDelThrpyReq = await db
              .withSchema(`${process.env.MYSQL_DATABASE}`)
              .from('thrpy_req')
              .where('req_id', activeThrpyReq[0].req_id)
              .del();

            if (!hardDelThrpyReq) {
              logger.error('Error deleting therapy request');
              return { message: 'Error deleting therapy request', error: -1 };
            }

            logger.warn(
              'Client already has an active session for the same therapy request',
            );
          }
        }
      }

      return { message: 'Client does not have an active therapy request' };
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

  async checkThrpyReqIsONGOING(req_id) {
    try {
      const checkSessions = await this.session.getSessionByThrpyReqId({
        thrpy_req_id: req_id,
      });

      if (!Array.isArray(checkSessions)) {
        logger.error('Error checking therapy request status');
        return { message: 'Error checking therapy request status', error: -1 };
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
      return { message: 'Error checking therapy request status', error: -1 };
    }
  }
}
