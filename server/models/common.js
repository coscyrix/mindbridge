//models/common.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import db from '../utils/db.js';
import logger from '../config/winston.js';
import AuthCommon from './auth/authCommon.js';
import UserForm from './userForm.js';
import prisma from '../utils/prisma.js';
const dotenv = require('dotenv');;

dotenv.config();

export default class Common {
  //////////////////////////////////////////

  constructor() {
    this.authCommon = new AuthCommon();
    this.userForm = new UserForm();
  }

  //////////////////////////////////////////

  async getUserByEmail(email) {
    try {
      const rec = await prisma.users.findMany({
        where: {
          email: email.toLowerCase(),
        },
        select: {
          user_id: true,
          email: true,
          password: true,
          status_yn: true,
          is_active: true,
          is_verified: true,
          role_id: true,
          tenant_id: true,
          created_at: true,
          updated_at: true,
        },
      });

      // Return as array to maintain backward compatibility
      return rec;
    } catch (error) {
      logger.error('Error in getUserByEmail:', error);
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
        .select('v_user_profile.*', 't.tenant_generated_id', 't.timezone as tenant_timezone')
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
        .where('v_user_profile.user_profile_id', id);


        // TODO: Maybe we dont need this extra check anymore
      if (rec && rec.length > 0) {
        const profile = rec[0];
        
        // Check if country_code exists in the result (either from view or as undefined)
        if (!('country_code' in profile) || profile.country_code === null || profile.country_code === undefined) {
          // Fetch country_code directly from user_profile table
          const countryCodeResult = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .select('country_code')
            .from('user_profile')
            .where('user_profile_id', id)
            .first();

          if (countryCodeResult) {
            profile.country_code = countryCodeResult.country_code;
          }
        }
      }

      return rec;
    } catch (error) {
      console.error('Error in getUserProfileByUserProfileId:', error);
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
      console.log('data---------->:', data);
      console.log('query---------->:', query.toQuery());

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
        ...(data.tax_percent !== undefined && { tax_percent: data.tax_percent }),
        ...(data.timezone && { timezone: data.timezone })
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

      // Note: New tenants start with empty consent_description
      // They will need to create their own consent form via the consent management page
      // The system default consent form (created by admin with roleId == 4) is only used as a reference
      // and is NOT automatically copied to new tenants

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

  //////////////////////////////////////////

  // Helper function to check for session time collisions
  async checkSessionTimeCollision(counselor_id, intake_date, scheduled_time, exclude_session_id = null) {
    try {
      // Get environment variables with defaults
      const SESSION_TIME_PERIOD = parseInt(process.env.SESSION_TIME_PERIOD || '60', 10);
      const SESSION_BREAK_TIME = parseInt(process.env.SESSION_BREAK_TIME || '15', 10);

      // Parse the scheduled_time to get hours and minutes
      let scheduledHours, scheduledMinutes;
      if (scheduled_time.includes('T')) {
        // Format: "HH:mm:ss.sssZ" or "HH:mm:ssZ"
        const timePart = scheduled_time.split('T')[1].split('.')[0]; // Get "HH:mm:ss"
        const [hours, minutes] = timePart.split(':');
        scheduledHours = parseInt(hours, 10);
        scheduledMinutes = parseInt(minutes, 10);
      } else if (scheduled_time.includes(':')) {
        // Format: "HH:mm:ss" or "HH:mm"
        const [hours, minutes] = scheduled_time.split(':');
        scheduledHours = parseInt(hours, 10);
        scheduledMinutes = parseInt(minutes, 10);
      } else {
        logger.error('Invalid scheduled_time format:', scheduled_time);
        return { message: 'Invalid scheduled_time format', error: -1 };
      }

      // Calculate new session time range
      // Start: scheduled_time - SESSION_TIME_PERIOD minutes
      // End: scheduled_time + SESSION_BREAK_TIME minutes
      const newSessionStart = new Date(`${intake_date}T${String(scheduledHours).padStart(2, '0')}:${String(scheduledMinutes).padStart(2, '0')}:00Z`);
      newSessionStart.setMinutes(newSessionStart.getMinutes() - SESSION_TIME_PERIOD);
      
      const newSessionEnd = new Date(`${intake_date}T${String(scheduledHours).padStart(2, '0')}:${String(scheduledMinutes).padStart(2, '0')}:00Z`);
      newSessionEnd.setMinutes(newSessionEnd.getMinutes() + SESSION_BREAK_TIME);

      // Query existing sessions for the counselor on the same date
      // Join session with thrpy_req to get counselor_id
      // Only check sessions from therapy requests with status ONGOING
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session as s')
        .innerJoin('thrpy_req as tr', 's.thrpy_req_id', 'tr.req_id')
        .select('s.session_id', 's.intake_date', 's.scheduled_time', 's.thrpy_req_id')
        .where('tr.counselor_id', counselor_id)
        .where('tr.thrpy_status', 'ONGOING') // Only check therapy requests with ONGOING status
        .where('s.intake_date', intake_date)
        .where('s.status_yn', 'y')
        .whereNotIn('s.session_status', ['DISCHARGED', 'INACTIVE'])
        .where('s.is_report', 0); // Only check regular sessions, not reports

      // Exclude the current session if provided (useful for rescheduling)
      if (exclude_session_id) {
        query = query.whereNot('s.session_id', exclude_session_id);
      }

      const existingSessions = await query;

      // Check for collisions with existing sessions
      for (const existingSession of existingSessions) {
        if (!existingSession.scheduled_time) {
          continue; // Skip sessions without scheduled_time
        }

        // Parse existing session's scheduled_time
        let existingHours, existingMinutes;
        const existingScheduledTime = existingSession.scheduled_time;
        
        if (existingScheduledTime.includes('T')) {
          const timePart = existingScheduledTime.split('T')[1].split('.')[0];
          const [hours, minutes] = timePart.split(':');
          existingHours = parseInt(hours, 10);
          existingMinutes = parseInt(minutes, 10);
        } else if (existingScheduledTime.includes(':')) {
          const [hours, minutes] = existingScheduledTime.split(':');
          existingHours = parseInt(hours, 10);
          existingMinutes = parseInt(minutes, 10);
        } else {
          continue; // Skip if format is invalid
        }

        // Calculate existing session time range using the same logic
        const existingSessionStart = new Date(`${intake_date}T${String(existingHours).padStart(2, '0')}:${String(existingMinutes).padStart(2, '0')}:00Z`);
        existingSessionStart.setMinutes(existingSessionStart.getMinutes() - SESSION_TIME_PERIOD);
        
        const existingSessionEnd = new Date(`${intake_date}T${String(existingHours).padStart(2, '0')}:${String(existingMinutes).padStart(2, '0')}:00Z`);
        existingSessionEnd.setMinutes(existingSessionEnd.getMinutes() + SESSION_BREAK_TIME);

        // Check if time ranges overlap
        // Two time ranges overlap if: newStart < existingEnd && newEnd > existingStart
        if (newSessionStart < existingSessionEnd && newSessionEnd > existingSessionStart) {
          logger.warn('Session time collision detected', {
            counselor_id,
            intake_date,
            new_session_time: scheduled_time,
            existing_session_id: existingSession.session_id,
            existing_session_time: existingScheduledTime,
          });
          return {
            message: `Session time conflicts with an existing session. Please choose a different time slot.`,
            error: -1,
            colliding_session: {
              session_id: existingSession.session_id,
              thrpy_req_id: existingSession.thrpy_req_id,
              intake_date: existingSession.intake_date,
              scheduled_time: existingScheduledTime,
            },
          };
        }
      }

      return { message: 'No collision detected', error: 0 };
    } catch (error) {
      logger.error('Error checking session time collision:', error);
      return { message: 'Error checking session time collision', error: -1 };
    }
  }
}
