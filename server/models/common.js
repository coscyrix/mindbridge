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
        .select('v_user_profile.*', 't.tenant_generated_id')
        .from('v_user_profile')
        .leftJoin('tenant as t', 'v_user_profile.tenant_id', 't.tenant_id')
        .where('user_id', id);

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
        .select('v_user_profile.*', 't.tenant_generated_id')
        .from('v_user_profile')
        .leftJoin('tenant as t', 'v_user_profile.tenant_id', 't.tenant_id')
        .where('user_profile_id', id);

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
      console.log('postUserCOMMON called with data:', data);
      
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

      console.log('Creating user with data:', tmpUsr);

      const postUsr = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users')
        .insert(tmpUsr);

      console.log('User created with result:', postUsr);

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
        .select('v_user_profile.*', 't.tenant_generated_id')
        .from('v_user_profile')
        .leftJoin('tenant as t', 'v_user_profile.tenant_id', 't.tenant_id')
        .where('user_profile_id', data.user_profile_id);

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

      // Check forms based on environment variable
      const formMode = process.env.FORM_MODE || 'auto';
      
      if (formMode === 'auto') {
        // Auto mode: check treatment target forms first, then service forms
        const TreatmentTargetSessionForms = (await import('./treatmentTargetSessionForms.js')).default;
        const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
        
        const getTreatmentTargetSessionForms = await treatmentTargetSessionForms.getTreatmentTargetSessionFormsBySessionId({
          session_id: data.session_id,
        });

        // If treatment target forms exist, check their sent status
        if (!getTreatmentTargetSessionForms.error && getTreatmentTargetSessionForms.rec && getTreatmentTargetSessionForms.rec.length > 0) {
          const checkTreatmentTargetFormsSentStatus = getTreatmentTargetSessionForms.rec.filter(
            (item) => item.is_sent == 1,
          );

          if (checkTreatmentTargetFormsSentStatus.length > 0) {
            logger.warn('The treatment target forms have already been sent');
            return {
              message: 'The treatment target forms have already been sent',
              error: -1,
            };
          }
        } else {
          // If no treatment target forms, check regular user forms
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
        }
      } else if (formMode === 'treatment_target') {
        // Treatment target mode: only check treatment target forms
        const TreatmentTargetSessionForms = (await import('./treatmentTargetSessionForms.js')).default;
        const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
        
        const getTreatmentTargetSessionForms = await treatmentTargetSessionForms.getTreatmentTargetSessionFormsBySessionId({
          session_id: data.session_id,
        });

        if (!getTreatmentTargetSessionForms.error && getTreatmentTargetSessionForms.rec && getTreatmentTargetSessionForms.rec.length > 0) {
          const checkTreatmentTargetFormsSentStatus = getTreatmentTargetSessionForms.rec.filter(
            (item) => item.is_sent == 1,
          );

          if (checkTreatmentTargetFormsSentStatus.length > 0) {
            logger.warn('The treatment target forms have already been sent');
            return {
              message: 'The treatment target forms have already been sent',
              error: -1,
            };
          }
        }
      } else if (formMode === 'service') {
        // Service mode: only check service-based forms
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
      console.log('getUserTenantId called with data:', data);
      
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('v_user_profile.*', 't.tenant_generated_id')
        .from('v_user_profile')
        .leftJoin('tenant as t', 'v_user_profile.tenant_id', 't.tenant_id');

      if (data.user_profile_id) {
        query.where('user_profile_id', data.user_profile_id);
      }

      if (data.email) {
        query.where('email', data.email);
      }

      const rec = await query;
      console.log('getUserTenantId query result:', rec);

      if (!rec || rec.length === 0) {
        console.log('No user found for the given criteria');
        return { message: 'User not found', error: -1 };
      }

      console.log('Returning user data:', rec);
      return rec;
    } catch (error) {
      console.error('Error in getUserTenantId:', error);
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

      // Get the tenant_id from the inserted record
      const tenantRecord = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('tenant_id')
        .from('tenant')
        .where('tenant_generated_id', generated_id)
        .first();

      if (!tenantRecord) {
        return { message: 'Error retrieving tenant after creation', error: -1 };
      }

      // Create entry in ref_fees table
      const refFeesData = {
        tenant_id: tenantRecord.tenant_id,
        tax_pcnt: data.tax_percent || 0,
        counselor_pcnt: 0.600, // Default 60% for counselor
        system_pcnt: data.admin_fee || 0
      };

      const postRefFees = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('ref_fees')
        .insert(refFeesData);

      if (!postRefFees) {
        return { message: 'Error creating ref_fees entry', error: -1 };
      }

      // Create default tenant configuration entries
      const defaultConfigs = [
        {
          tenant_id: tenantRecord.tenant_id,
          feature_name: 'homework_upload_enabled',
          feature_value: 'true',
          is_enabled: 1
        }
        // Add more default configurations here as needed
      ];

      for (const config of defaultConfigs) {
        try {
          await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('tenant_configuration')
            .insert(config);
        } catch (configError) {
          // Log the error but don't fail the tenant creation
          console.warn(`Warning: Could not create tenant configuration for ${config.feature_name}:`, configError.message);
        }
      }

      // Create default fee split management entry
      try {
        const defaultFeeSplitData = {
          tenant_id: tenantRecord.tenant_id,
          counselor_user_id: null, // Default configuration for all counselors
          is_fee_split_enabled: 0, // Disabled by default
          tenant_share_percentage: 0, // 0% for tenant
          counselor_share_percentage: 100, // 100% for counselor
          status_yn: 1
        };

        await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('fee_split_management')
          .insert(defaultFeeSplitData);

        console.log(`Default fee split management created for tenant ${tenantRecord.tenant_id}`);
      } catch (feeSplitError) {
        // Log the error but don't fail the tenant creation
        console.warn(`Warning: Could not create default fee split management for tenant ${tenantRecord.tenant_id}:`, feeSplitError.message);
      }

      // Copy treatment target form templates to new tenant
      try {
        // Get all template configurations
        const templateConfigs = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('treatment_target_session_forms_template')
          .where('is_active', 1)
          .select('*');

        if (templateConfigs.length > 0) {
          // Prepare configurations for the new tenant
          const tenantConfigs = templateConfigs.map(config => ({
            treatment_target: config.treatment_target,
            form_name: config.form_name,
            service_name: config.service_name,
            purpose: config.purpose,
            sessions: JSON.stringify(config.sessions), // Ensure JSON serialization
            tenant_id: tenantRecord.tenant_id,
            created_at: new Date(),
            updated_at: new Date()
          }));

          // Insert configurations for the new tenant
          await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('treatment_target_feedback_config')
            .insert(tenantConfigs);

          console.log(`Treatment target templates copied for tenant ${tenantRecord.tenant_id}: ${tenantConfigs.length} configurations`);
        } else {
          console.warn(`Warning: No treatment target templates found to copy for tenant ${tenantRecord.tenant_id}`);
        }
      } catch (templateError) {
        // Log the error but don't fail the tenant creation
        console.warn(`Warning: Could not copy treatment target templates for tenant ${tenantRecord.tenant_id}:`, templateError.message);
      }

      return tenantRecord.tenant_id;
    } catch (error) {
      console.error(error);
      return { message: 'Error creating tenant', error: -1 };
    }
  }

  ///////////////////////////////////////////

  async getTenantByTenantId(tenant_id) {
    try {
      console.log('Looking for tenant with ID:', tenant_id);
      
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select()
        .where('tenant_id', tenant_id)
        .from('tenant');

      console.log('Tenant query result:', rec);

      if (!rec || rec.length === 0) {
        console.log('Tenant not found for ID:', tenant_id);
        return { message: 'Tenant not found', error: -1 };
      }

      console.log('Found tenant:', rec[0]);
      return rec;
    } catch (error) {
      console.error('Error in getTenantByTenantId:', error);
      return { message: 'Error getting tenant', error: -1 };
    }
  }

  async getTenantByTenantGeneratedId(tenant_generated_id) {
    try {
      console.log('tenant_generated_id', tenant_generated_id);
      
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

  ///////////////////////////////////////////

  async createDefaultTenantConfigurations(tenant_id) {
    try {
      const defaultConfigs = [
        {
          tenant_id: tenant_id,
          feature_name: 'homework_upload_enabled',
          feature_value: 'true',
          is_enabled: 1
        }
        // Add more default configurations here as needed
        // Example:
        // {
        //   tenant_id: tenant_id,
        //   feature_name: 'email_notifications_enabled',
        //   feature_value: 'true',
        //   is_enabled: 1
        // }
      ];

      for (const config of defaultConfigs) {
        try {
          await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('tenant_configuration')
            .insert(config);
        } catch (configError) {
          // Log the error but don't fail the operation
          console.warn(`Warning: Could not create tenant configuration for ${config.feature_name}:`, configError.message);
        }
      }

      // Create default fee split management entry if it doesn't exist
      try {
        const existingFeeSplit = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('fee_split_management')
          .where('tenant_id', tenant_id)
          .whereNull('counselor_user_id')
          .andWhere('status_yn', 1)
          .first();

        if (!existingFeeSplit) {
          const defaultFeeSplitData = {
            tenant_id: tenant_id,
            counselor_user_id: null, // Default configuration for all counselors
            is_fee_split_enabled: 0, // Disabled by default
            tenant_share_percentage: 0, // 0% for tenant
            counselor_share_percentage: 100, // 100% for counselor
            status_yn: 1
          };

          await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('fee_split_management')
            .insert(defaultFeeSplitData);

          console.log(`Default fee split management created for existing tenant ${tenant_id}`);
        } else {
          console.log(`Fee split management already exists for tenant ${tenant_id}`);
        }
      } catch (feeSplitError) {
        // Log the error but don't fail the operation
        console.warn(`Warning: Could not create default fee split management for tenant ${tenant_id}:`, feeSplitError.message);
      }

      return { message: 'Default tenant configurations created successfully' };
    } catch (error) {
      console.error('Error creating default tenant configurations:', error);
      return { message: 'Error creating default tenant configurations', error: -1 };
    }
  }
}
