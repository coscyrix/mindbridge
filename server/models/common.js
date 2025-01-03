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
}
