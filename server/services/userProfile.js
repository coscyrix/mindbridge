//services/userProfile.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import UserProfile from '../models/userProfile.js';
const joi = require('joi');;
import Common from '../models/common.js';

//////////////////////////////////////////

export default class UserProfileService {
  constructor() {
    this.common = new Common();
  }

  //////////////////////////////////////////

  async postUserProfile(data) {
    const tenantId = await this.common.getUserTenantId({
      user_profile_id: data.counselor_id,
    });
    data.tenant_id = Number(tenantId[0].tenant_id);
    const userProfileSchema = joi.object({
      user_id: joi.number().required(),
      user_first_name: joi.string().min(2).required(),
      user_last_name: joi.string().min(2).required(),
      user_phone_nbr: joi.number().optional(),
      user_typ_id: joi.number().optional(),
      admin_fee: joi.number().precision(2).optional(),
      tax_percent: joi.number().precision(2).optional(),
      clam_num: joi.number().optional(),
      tenant_id: joi.number().required(),
      timezone: joi.string().optional(),
      intake_form_id: joi.number().optional(),
    });

    // Validate the entire data object against the schema
    const { error } = userProfileSchema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const userProfile = new UserProfile();
    return userProfile.postUserProfile(data);
  }

  //////////////////////////////////////////

  async userPostClientProfile(data) {
    if (data.role_id === 2 || data.role_id === 1) {
      // if the user is a client or counselor
      const tenantId = await this.common.getUserTenantId({
        user_profile_id: data.user_profile_id,
      });
      
      console.log('Service layer - tenantId result:', tenantId);
      
      // Check if getUserTenantId returned an error
      if (tenantId.error) {
        return { message: tenantId.message, error: -1 };
      }
      
      // Check if tenantId is empty or undefined
      if (!tenantId || tenantId.length === 0) {
        return { message: 'No tenant found for the specified user profile', error: -1 };
      }
      
      data.tenant_id = Number(tenantId[0].tenant_id);
      console.log('Service layer - assigned tenant_id:', data.tenant_id);
    }

    if (data.role_id === 3) {
      // if the user is manager create tenant
      const postTenantResult = await this.common.postTenant({
        tenant_name: data.tenant_name,
        admin_fee: data.admin_fee,
        tax_percent: data.tax_percent,
        timezone: data.timezone,
      });
      if (postTenantResult.error) {
        return { message: postTenantResult.message, error: -1 };
      }
      data.tenant_id = Number(postTenantResult);
    }

    delete data.tenant_name;

    const userProfileSchema = joi.object({
      user_profile_id: joi.number().required(),
      user_first_name: joi.string().min(2).required(),
      user_last_name: joi.string().min(2).required(),
      email: joi.string().email().required(),
      country_code: joi
        .string()
        .trim()
        .pattern(/^\+\d{1,5}$/)
        .optional(),
      user_phone_nbr: joi
        .number()
        .integer()
        .min(1000000000)
        .max(999999999999999)
        .optional(),
      target_outcome_id: joi.number().optional(),
      clam_num: joi.number().optional(),
      role_id: joi.number().optional(),
      tenant_id: joi.number().required(),
      admin_fee: joi.number().precision(2).optional(),
      tax_percent: joi.number().precision(2).optional(),
      timezone: joi.string().optional(),
      intake_form_id: joi.number().optional(),
    });

    console.log('//////////////////////////////////////////');

    // Validate the entire data object against the schema
    const { error } = userProfileSchema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const userProfile = new UserProfile();
    const userProfileResult = await userProfile.userPostClientProfile(data);
    console.log(userProfileResult, 'userProfileResult');

    if (userProfileResult.error) {
      return userProfileResult;
    }



    return userProfileResult;
  }

  //////////////////////////////////////////

  async putUserProfile(data, user_profile_id) {
    if (data.tenant_name) {
      delete data.tenant_name;
    }

    // Role-based validation
    if (data.role_id === 1) {
      // For clients (role_id = 1), require target_outcome_id
      if (!data.target_outcome_id) {
        return { message: 'target_outcome_id is required for client updates', error: -1 };
      }
    }

    if (data.role_id === 2) {
      // For counselors (role_id = 2), target_outcome_id should not be provided
      if (data.target_outcome_id) {
        return { message: 'target_outcome_id is not required for counselor updates', error: -1 };
      }
      
      // For counselors, require basic profile fields
      if (!data.user_first_name || !data.user_last_name || !data.email) {
        return { message: 'user_first_name, user_last_name, and email are required for counselor updates', error: -1 };
      }
    }

    if (data.role_id === 3) {
      // For tenants/managers (role_id = 3), target_outcome_id should not be provided
      if (data.target_outcome_id) {
        return { message: 'target_outcome_id is not required for tenant updates', error: -1 };
      }
      
      // For tenants, require admin_fee and tax_percent
      if (data.admin_fee !== undefined && (!data.admin_fee || data.admin_fee <= 0)) {
        return { message: 'admin_fee is required and must be greater than 0 for tenant updates', error: -1 };
      }
      
      if (data.tax_percent !== undefined && (data.tax_percent < 0)) {
        return { message: 'tax_percent must be 0 or greater for tenant updates', error: -1 };
      }
    }

    const userProfileSchema = joi.object({
      user_first_name: joi.string().min(2).optional(),
      user_last_name: joi.string().min(2).optional(),
      email: joi.string().email().optional(),
      role_id: joi.number().optional(),
      country_code: joi
        .string()
        .trim()
        .pattern(/^\+\d{1,5}$/)
        .optional(),
      user_phone_nbr: joi.number().optional(),
      user_typ_id: joi.number().optional(),
      clam_num: joi.number().optional(),
      status_yn: joi.number().optional(),
      //fields below are for target outcome
      target_outcome_id: joi.number().optional(),
      counselor_id: joi.number().optional(),
      admin_fee: joi.number().precision(2).optional(),
      tax_percent: joi.number().precision(2).optional(),
      timezone: joi.string().optional(),
    });

    console.log(data.admin_fee, 'data.admin_fee');
    console.log(data.tax_percent, 'data.tax_percent');
    // Validate the entire data object against the schema
    const { error } = userProfileSchema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const userProfile = new UserProfile();
    return userProfile.putUserProfile(data, user_profile_id);
  }

  //////////////////////////////////////////

  async delUserProfile(user_profile_id) {
    const userProfileSchema = joi.object({
      user_profile_id: joi.number().required(),
    });

    // Validate the entire data object against the schema
    const { error } = userProfileSchema.validate({ user_profile_id });

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const userProfile = new UserProfile();
    return userProfile.delUserProfile(user_profile_id);
  }

  //////////////////////////////////////////

  async getUserProfileById(data) {
    if (data.role_id === 3) {
      if (data.counselor_id) {
        const tenantId = await this.common.getUserTenantId({
          user_profile_id: data.counselor_id,
        });
        data.tenant_id = Number(tenantId[0].tenant_id);
      } else {
        data.tenant_id = Number(data.tenant_id);
      }
    }

    const userProfileSchema = joi.object({
      user_profile_id: joi.number().optional(),
      user_id: joi.number().optional(),
      email: joi.string().email().optional(),
      role_id: joi.number().optional(),
      counselor_id: joi.number().optional(),
      tenant_id: joi.number().optional(),
    });

    // Validate the entire data object against the schema
    const { error } = userProfileSchema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const userProfile = new UserProfile();
    return userProfile.getUserProfileById(data);
  }
}
