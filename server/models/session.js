//models/session.js

import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import Common from './common.js';
import Form from './form.js';
import UserProfile from './userProfile.js';
import SendEmail from '../middlewares/sendEmail.js';
import { splitIsoDatetime } from '../utils/common.js';
import { treatmentToolsEmail, dischargeEmail } from '../utils/emailTmplt.js';

const db = knex(DBconn.dbConn.development);

export default class Session {
  constructor() {
    this.common = new Common();
    this.form = new Form();
    this.sendEmail = new SendEmail();
    this.userProfile = new UserProfile();
  }
  //////////////////////////////////////////

  async postSession(data) {
    try {
      const tmpSession = {
        thrpy_req_id: data.thrpy_req_id,
        service_id: data.service_id,
        session_format: data.session_format,
        intake_date: data.intake_date,
        scheduled_time: data.scheduled_time,
        session_description: data.session_description,
        is_additional: data.is_additional,
        is_report: data.is_report,
      };

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
      logger.error(error);

      return { message: 'Error creating session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async postAdditionalSession(data) {
    try {
      let tmpSession;

      const { date: req_dte, time: req_time } = splitIsoDatetime(
        data.intake_date,
      );

      const [svc] = await this.common.getServiceById(data.service_id);

      console.log(svc);

      if (!svc) {
        return { message: 'Service not found', error: -1 };
      }

      if (svc.is_additional[0] === 0) {
        return { message: 'Service is not additional', error: -1 };
      }

      tmpSession = {
        thrpy_req_id: data.thrpy_req_id,
        service_id: data.service_id,
        session_format: data.session_format,
        intake_date: req_dte,
        scheduled_time: req_time,
        session_description: svc.service_code,
        is_additional: svc.is_additional && svc.is_additional === 1 ? 1 : 0,
        is_report: svc.is_report && svc.is_report === 1 ? 1 : 0,
      };

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
      logger.error(error);

      return { message: 'Error creating session', error: -1 };
    }
  }

  //////////////////////////////////////////

  async putSessionById(data) {
    try {
      const checkSessionIfOngoing = await this.checkSessionONGOING(
        data.session_id,
      );

      if (checkSessionIfOngoing.rec.length > 0) {
        logger.error('Session is ongoing');
        return { message: 'Session is ongoing', error: -1 };
      }

      // Check if session is a discharge session
      const checkDischarge = await this.getSessionById({
        session_id: data.session_id,
        service_code: process.env.DISCHARGE_SERVICE_CODE,
      });

      if (checkDischarge && checkDischarge.length > 0) {
        const putSessions = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('thrpy_req_id', checkDischarge[0].thrpy_req_id)
          .andWhere('session_status', 1)
          .update({ session_status: 3 });

        if (putSessions === 0) {
          logger.warn('No sessions were updated as their status was not 1.');
        } else if (!putSessions) {
          logger.error('Error updating sessions');
          return { message: 'Error updating sessions', error: -1 };
        }

        const tmpThrpyReq = {
          thrpy_status: 2,
        };

        const putThrpyReq = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('thrpy_req')
          .where('req_id', checkDischarge[0].thrpy_req_id)
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
          .andWhere('req_id', checkDischarge[0].thrpy_req_id);

        console.log(checkThrpyReq);

        const recUser = await this.userProfile.getUserProfileById({
          user_profile_id: checkThrpyReq[0].client_id,
        });
        const dischargeEmlTmplt = dischargeEmail(
          recUser.rec[0].email,
          `${recUser.rec[0].user_first_name} ${recUser.rec[0].user_last_name}`,
        );
        const sendDischargeEmlTmpltEmail =
          this.sendEmail.sendMail(dischargeEmlTmplt);

        if (!sendDischargeEmlTmpltEmail) {
          logger.error('Error sending discharge email');
          return { message: 'Error sending discharge email', error: -1 };
        }
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

        this.SendTreatmentToolsEmail({
          session_id: data.session_id,
        });
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

      if (Object.keys(tmpSession).length > 0) {
        const putSession = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('session')
          .where('session_id', data.session_id)
          .update(tmpSession);

        if (!putSession) {
          logger.error('Error updating session');
          return { message: 'Error updating session', error: -1 };
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

  async SendTreatmentToolsEmail(data) {
    try {
      const recSession = await this.getSessionById({
        session_id: data.session_id,
      });
      if (!recSession || !Array.isArray(recSession)) {
        logger.error('Session not found');
        return { message: 'Session not found', error: -1 };
      }

      const recThrpy = await this.common.getThrpyReqById(
        recSession[0].thrpy_req_id,
      );

      if (!recThrpy || !Array.isArray(recThrpy)) {
        logger.error('Therapy request not found');
        return { message: 'Therapy request not found', error: -1 };
      }

      const recUser = await this.common.getUserProfileByUserProfileId(
        recThrpy[0].client_id,
      );

      if (!recUser || !Array.isArray(recUser)) {
        logger.error('User profile not found');
        return { message: 'User profile not found', error: -1 };
      }

      recSession.forEach(async (session) => {
        for (const arry of session.forms_array) {
          const [form] = await this.form.getFormByFormId({ form_id: arry });
          const form_name = form.form_cde;
          const client_full_name =
            recUser[0].user_first_name + ' ' + recUser[0].user_last_name;
          const toolsEmail = treatmentToolsEmail(
            recUser[0].email,
            client_full_name,
            form_name,
          );

          const email = this.sendEmail.sendMail(toolsEmail);

          if (email.error) {
            logger.error('Error sending email');
            return { message: 'Error sending email', error: -1 };
          }
        }
      });
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Something went wrong' };
    }
  }

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
      console.log('data', data);
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
      const currentDate = new Date();
      const tomorrowDate = new Date();
      tomorrowDate.setDate(currentDate.getDate() + 1);

      const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      };

      const formattedCurrentDate = formatDate(currentDate);
      const formattedTomorrowDate = formatDate(tomorrowDate);

      const recToday = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_session')
        .where('intake_date', formattedCurrentDate)
        .andWhere('counselor_id', data.counselor_id);

      if (!recToday) {
        logger.error('Error getting session');
        return { message: 'Error getting session', error: -1 };
      }

      const recTomorrow = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_session')
        .where('intake_date', formattedTomorrowDate)
        .andWhere('counselor_id', data.counselor_id);

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
      const currentDate = new Date()
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .where('created_at', '<=', currentDate)
        .andWhere('session_status', 1)
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
}
