//services/userProfile.js

import UserProfile from '../models/userProfile.js';
import joi from 'joi';
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
      data.tenant_id = Number(tenantId[0].tenant_id);
    }

    if (data.role_id === 3) {
      // if the user is manager create tenant
      const postTenantName = await this.common.postTenant({
        tenant_name: data.tenant_name,
        admin_fee: data.admin_fee,
        tax_percent: data.tax_percent
      });
      if (postTenantName.error) {
        return { message: postTenantName.message, error: -1 };
      }
      data.tenant_id = Number(postTenantName);
    }

    delete data.tenant_name;

    const userProfileSchema = joi.object({
      user_profile_id: joi.number().required(),
      user_first_name: joi.string().min(2).required(),
      user_last_name: joi.string().min(2).required(),
      email: joi.string().email().required(),
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
      service_templates: joi.array().optional(),
    });

    console.log('//////////////////////////////////////////');
    console.log(data);

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

    // If service_templates are provided, copy them for the new tenant (after user profile creation)
    if (data.role_id === 3 && Array.isArray(data.service_templates) && data.service_templates.length > 0) {
      const ServiceTemplateService = (await import('./serviceTemplate.js')).default;
      const serviceTemplateService = new ServiceTemplateService();
      for (const svc of data.service_templates) {
        // svc should have template_service_id and price
        if (!svc.template_service_id || typeof svc.price !== 'number') {
          return { message: 'Each service_template must have template_service_id and price', error: -1 };
        }
        console.log(userProfileResult.tenant_id, 'userProfileResult.tenant_id');
        
        // Copy template to tenant's service table with provided price
        const result = await serviceTemplateService.copyTemplateToTenantService(svc.template_service_id, userProfileResult.tenant_id, svc.price);
        console.log(result, 'result');
        
        if (result.error) {
          return { message: `Failed to copy service template: ${svc.template_service_id}`, error: -1, details: result };
        }
      }
    }

    return userProfileResult;
  }

  //////////////////////////////////////////

  async putUserProfile(data, user_profile_id) {
    if (data.tenant_name) {
      delete data.tenant_name;
    }

    const userProfileSchema = joi.object({
      user_first_name: joi.string().min(2).optional(),
      user_last_name: joi.string().min(2).optional(),
      email: joi.string().email().optional(),
      role_id: joi.number().optional(),
      user_phone_nbr: joi.number().optional(),
      user_typ_id: joi.number().optional(),
      clam_num: joi.number().optional(),
      status_yn: joi.number().optional(),
      //fields below are for target outcome
      target_outcome_id: joi.number().optional(),
      counselor_id: joi.number().optional(),
    });

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
