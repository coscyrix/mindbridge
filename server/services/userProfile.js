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
    data.tenant_id = tenantId[0].tenant_id;
    const userProfileSchema = joi.object({
      user_id: joi.number().required(),
      user_first_name: joi.string().min(2).required(),
      user_last_name: joi.string().min(2).required(),
      user_phone_nbr: joi.number().optional(),
      user_typ_id: joi.number().optional(),
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
    const tenantId = await this.common.getUserTenantId({
      user_profile_id: data.user_profile_id,
    });
    data.tenant_id = tenantId[0].tenant_id;
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
    });

    // Validate the entire data object against the schema
    const { error } = userProfileSchema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const userProfile = new UserProfile();
    return userProfile.userPostClientProfile(data);
  }

  //////////////////////////////////////////

  async putUserProfile(data, user_profile_id) {
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
