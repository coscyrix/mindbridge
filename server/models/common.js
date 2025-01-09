//models/common.js

import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import AuthCommon from './auth/authCommon.js';

const db = knex(DBconn.dbConn.development);

export default class Common {
  //////////////////////////////////////////

  constructor() {
    this.authCommon = new AuthCommon();
  }

  //////////////////////////////////////////

  async getUserByEmail(email) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select()
        .where('email', email)
        .from('users');

      return rec;
    } catch (error) {
      return error;
    }
  }

  //////////////////////////////////////////

  async getUserById(id) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select()
        .where('user_id', id)
        .from('users');

      return rec;
    } catch (error) {
      return error;
    }
  }
  //////////////////////////////////////////

  async getUserProfileByUserId(id) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select()
        .where('user_id', id)
        .from('v_user_profile');

      return rec;
    } catch (error) {
      return error;
    }
  }

  //////////////////////////////////////////

  async getUserProfileByUserProfileId(id) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select()
        .where('user_profile_id', id)
        .from('v_user_profile');

      return rec;
    } catch (error) {
      return error;
    }
  }

  //////////////////////////////////////////

  async postClientEnrollment(data) {
    try {
      const postClient = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('client_enrollments')
        .insert(data);

      if (!postClient) {
        return { message: 'Error creating client enrollment', error: -1 };
      }

      return { message: 'Client enrollment created successfully' };
    } catch (error) {
      return { message: 'Error creating client enrollment', error: -1 };
    }
  }

  //////////////////////////////////////////

  //////////////////////////////////////////

  async postUserCOMMON(data) {
    try {
      const checkEmail = await this.getUserByEmail(data.email);
      if (checkEmail.length > 0) {
        logger.error('Email already exists');
        return { message: 'Email already exists', error: -1 };
      }

      const tmpUsr = {
        email: data.email.toLowerCase(),
        password: await this.authCommon.hashPassword(data.password),
        role_id: data.role_id || 1,
      };

      const postUsr = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users')
        .insert(tmpUsr);

      if (!postUsr) {
        logger.error('Error creating user');
        return { message: 'Error creating user', error: -1 };
      }

      return postUsr;
    } catch (error) {
      logger.error(error);

      return { message: 'Error creating user', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getServiceById(id) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('service')
        .where('status_yn', 1);

      if (id) {
        query = query.andWhere('service_id', id);
      }

      const rec = query;

      if (!rec || rec.length === 0) {
        return { message: 'Service not found', error: -1 };
      }

      return rec;
    } catch (error) {
      return { message: 'Error getting service', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getServiceNotReportAdditionById(svcArray) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('service')
        .where('status_yn', 1)
        .whereIn('service_id', svcArray)
        .andWhere('is_report', 0)
        .andWhere('is_additional', 0);

      const rec = await query;

      if (!rec || rec.length === 0) {
        return { message: 'Service not found', error: -1 };
      }

      return rec;
    } catch (error) {
      return { message: 'Error getting service', error: -1 };
    }
  }

  //////////////////////////////////////////
  async getServiceByNotReportAdditionBySvcId(svcArray) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('service')
        .where('status_yn', 1)
        .andWhere('is_report', 0)
        .andWhere('is_additional', 0)
        .whereNotIn('service_id', svcArray);
      const rec = await query;

      if (!rec || rec.length === 0) {
        return { message: 'Service not found', error: -1 };
      }

      return rec;
    } catch (error) {
      console.error('Error getting service:', error);
      return { message: 'Error getting service', error: -1 };
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

  async getThrpyReqById(id) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_thrpy_req')
        .where('status_yn', 1)
        .andWhere('req_id', id);

      const rec = await query;

      if (!rec || rec.length === 0) {
        return { message: 'Therapy request not found', error: -1 };
      }

      return rec;
    } catch (error) {
      return { message: 'Error getting therapy request', error: -1 };
    }
  }

  //////////////////////////////////////////

  async generateClamNum() {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
  }

  //////////////////////////////////////////

  async getTargetOutcomeById(target_id) {
    try {
      console.log('target_id:', target_id);
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('ref_target_outcomes')
        .where('target_id', target_id);

      const rec = await query;

      if (!rec || rec.length === 0) {
        return { message: 'Target outcome not found', error: -1 };
      }

      return rec;
    } catch (error) {
      console.error(error);
      return { message: 'Error getting target outcome', error: -1 };
    }
  }

  //////////////////////////////////////////

  async postNotes(data) {
    try {
      const tmpNotes = {
        session_id: data.session_id,
        message: data.message,
      };

      const postNote = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('notes')
        .insert(tmpNotes);

      if (!postNote) {
        return { message: 'Error creating note', error: -1 };
      }

      return { message: 'Note created successfully' };
    } catch (error) {
      return { message: 'Error creating note', error: -1 };
    }
  }
}
