//services/userProfile.js

import UserProfile from '../models/userProfile.js';
import joi from 'joi';

//////////////////////////////////////////

export default class UserProfileService {
  //////////////////////////////////////////

  async postUserProfile(data) {
    const userProfileSchema = joi.object({
      user_id: joi.number().required(),
      user_first_name: joi.string().min(2).required(),
      user_last_name: joi.string().min(2).required(),
      user_phone_nbr: joi.number().optional(),
      user_typ_id: joi.number().optional(),
      clam_num: joi.number().optional(),
    });

    // Validate the entire data object against the schema
    const { error } = userProfileSchema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const userProfile = new UserProfile();
    return userProfile.postUserProfile(data);
  }

  //////////////////////////////////////////

  async userPostClientProfile(data) {
    const userProfileSchema = joi.object({
      user_profile_id: joi.number().required(),
      user_first_name: joi.string().min(2).required(),
      user_last_name: joi.string().min(2).required(),
      email: joi.string().email().required(),
    });

    // Validate the entire data object against the schema
    const { error } = userProfileSchema.validate(data);

    if (error) {
      return { message: error.details[0].message };
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
      user_phone_nbr: joi.number().optional(),
      user_typ_id: joi.number().optional(),
      clam_num: joi.number().optional(),
    });

    // Validate the entire data object against the schema
    const { error } = userProfileSchema.validate(data);

    if (error) {
      return { message: error.details[0].message };
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
      return { message: error.details[0].message };
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
    });

    // Validate the entire data object against the schema
    const { error } = userProfileSchema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const userProfile = new UserProfile();
    return userProfile.getUserProfileById(data);
  }
}
