//models/session.js

import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import Common from './common.js';
import { splitIsoDatetime } from '../utils/common.js';

const db = knex(DBconn.dbConn.development);

export default class Session {
  constructor() {
    this.common = new Common();
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
      }

      const tmpSession = {
        // thrpy_req_id: data.thrpy_req_id,
        service_id: data.service_id,
        session_format: data.session_format,
        intake_date: data.intake_date,
        scheduled_time: data.scheduled_time,
        session_description: data.session_description,
        is_additional: data.is_additional,
        is_report: data.is_report,
        session_status: data.session_status,
      };

      const putSession = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .where('session_id', data.session_id)
        .update(tmpSession);

      if (!putSession) {
        logger.error('Error updating session');
        return { message: 'Error updating session', error: -1 };
      }

      return { message: 'Session updated successfully' };
    } catch (error) {
      logger.error(error);

      return { message: 'Error updating session', error: -1 };
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
}
