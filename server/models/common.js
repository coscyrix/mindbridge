//models/common.js

import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import AuthCommon from './auth/authCommon.js';
import UserForm from './userForm.js';
import dotenv from 'dotenv';

dotenv.config();

const db = knex(DBconn.dbConn.development);

export default class Common {
  //////////////////////////////////////////

  constructor() {
    this.authCommon = new AuthCommon();
    this.userForm = new UserForm();
  }

  //////////////////////////////////////////

  async getUserByEmail(email) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select()
        .where('email', email)
        .from('v_user');

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

  /////////////////////////////////////////

  async putUserById(data) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users')
        .where('user_id', data.user_id)
        .update(data);

      return rec;
    } catch (error) {
      return error;
    }
  }

  //////////////////////////////////////////

  async putUserProfileById(data) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_profile')
        .where('user_id', data.user_id)
        .update(data);

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
        tenant_id: data.tenant_id,
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
      console.error('Error creating user:', error);
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

  async getRefFeesByTenantId(tenant_id) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('ref_fees')
        // limit the query to only one record
        // change this for the next release
        .limit(1);

      if (tenant_id) {
        query = query.where('tenant_id', tenant_id);
      }

      const rec = await query;
      if (!rec || rec.length === 0) {
        return { message: 'Ref fees not found', error: -1 };
      }
      return rec;
    } catch (error) {
      console.error('Error getting ref fees:', error);
      return { message: 'Error getting ref fees', error: -1 };
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
      console.log(error);
      return { message: 'Error getting therapy request', error: -1 };
    }
  }

  //////////////////////////////////////////

  async generateClamNum() {
    return Math.floor(1000000 + Math.random() * 9000000).toString();
  }

  //////////////////////////////////////////

  async generateTenantId() {
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
        tenant_id: data.tenant_id,
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

  //////////////////////////////////////////

  async checkUserRole(data) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select()
        .where('user_profile_id', data.user_profile_id)
        .from('v_user_profile');

      if (!rec) {
        return { message: 'User not found', error: -1 };
      }

      if (
        (data.role_id == 4 && rec[0].role_id != 4) ||
        (data.role_id == 3 && rec[0].role_id != 3)
      ) {
        return {
          message:
            'User does not have the necessary permissions to perform this task',
          error: -1,
        };
      }

      return rec;
    } catch (error) {
      return { message: 'Error getting user role', error: -1 };
    }
  }

  //////////////////////////////////////////

  async checkThrpyReqDischarge(data) {
    try {
      const checkThrpyReq = await this.getThrpyReqById(data.req_id);

      if (checkThrpyReq.error) {
        logger.error('Error getting therapy request');
        return { message: 'Error getting therapy request', error: -1 };
      }

      if (checkThrpyReq[0].thrpy_status == 'DISCHARGED') {
        logger.warn(
          'The therapy request you are trying to modify has already been discharged',
        );
        return {
          message:
            'The therapy request you are trying to modify has already been discharged',
          error: -1,
        };
      }

      logger.info('The therapy request is not discharged and can be modified');
      return {
        message: 'The therapy request is not discharged and can be modified',
      };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error checking therapy request status', error: -1 };
    }
  }

  //////////////////////////////////////////

  async checkTreatmentToolsSentStatus(data) {
    try {
      const checkSession = await this.getSessionById({
        session_id: data.session_id,
      });
      if (checkSession.error) {
        logger.error('Error getting session');
        return { message: 'Error getting session', error: -1 };
      }

      // Check if session has forms associated with it
      const hasAssociatedForms =
        checkSession[0].forms_array && checkSession[0].forms_array.length > 0;

      if (!hasAssociatedForms) {
        logger.warn('No treatment tools associated with this session');
        return {
          message: 'No treatment tools associated with this session',
          warn: -1,
        };
      }

      const getAllSessionUserForm = await this.userForm.getUserFormById({
        session_id: data.session_id,
      });

      if (getAllSessionUserForm.error) {
        logger.error('Error getting user form');
        return { message: 'Error getting user form', error: -1 };
      }

      const checkTreatmentToolsSentStatus = getAllSessionUserForm.filter(
        (item) => item.is_sent == 1,
      );

      if (checkTreatmentToolsSentStatus.length > 0) {
        logger.warn('The treatment tools have already been sent');
        return {
          message: 'The treatment tools have already been sent',
          error: -1,
        };
      }

      return {
        message: 'The treatment tools have not been sent',
      };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return {
        message: 'Error checking treatment tools sent status',
        error: -1,
      };
    }
  }

  ///////////////////////////////////////////

  async getUserTenantId(data) {
    try {
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select()
        .from('v_user_profile');

      if (data.user_profile_id) {
        query.where('user_profile_id', data.user_profile_id);
      }

      if (data.email) {
        query.where('email', data.email);
      }

      const rec = await query;

      if (!rec || rec.length === 0) {
        return { message: 'User not found', error: -1 };
      }

      return rec;
    } catch (error) {
      console.error(error);
      return { message: 'Error getting user tenant id', error: -1 };
    }
  }

  ///////////////////////////////////////////

  async postTenant(data) {
    try {
      const generated_id = await this.generateTenantId();

      const tmpTenant = {
        tenant_name: data.tenant_name,
        tenant_generated_id: generated_id,
        ...(data.admin_fee !== undefined && { admin_fee: data.admin_fee }),
        ...(data.tax_percent !== undefined && { tax_percent: data.tax_percent })
      };

      const postTenant = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('tenant')
        .insert(tmpTenant);

      if (!postTenant) {
        return { message: 'Error creating tenant', error: -1 };
      }

      return generated_id;
    } catch (error) {
      console.error(error);
      return { message: 'Error creating tenant', error: -1 };
    }
  }

  ///////////////////////////////////////////

  async getTenantByTenantId(tenant_id) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select()
        .where('tenant_id', tenant_id)
        .from('tenant');

      if (!rec || rec.length === 0) {
        return { message: 'Tenant not found', error: -1 };
      }

      return rec;
    } catch (error) {
      console.error(error);
      return { message: 'Error getting tenant', error: -1 };
    }
  }

  async getTenantByTenantGeneratedId(tenant_generated_id) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select()
        .where('tenant_generated_id', tenant_generated_id)
        .from('tenant');

      if (!rec || rec.length === 0) {
        return { message: 'Tenant not found', error: -1 };
      }

      return rec;
    } catch (error) {
      console.error(error);
      return { message: 'Error getting tenant', error: -1 };
    }
  }
}
