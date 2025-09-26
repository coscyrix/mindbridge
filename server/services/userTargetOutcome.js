import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const UserTargetOutcome = require('../models/userTargetOutcome.js').default;
const joi = require('joi');;

export default class UserTargetOutcomeService {
  //////////////////////////////////////////
  async postUserTargetOutcome(data) {
    const schema = joi.object({
      user_profile_id: joi.number().required(),
      target_outcome_id: joi.number().required(),
      counselor_id: joi.number().required(),
      tenant_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const userTargetOutcome = new UserTargetOutcome();
    return userTargetOutcome.postUserTargetOutcome(data);
  }

  //////////////////////////////////////////
  async putUserTargetOutcome(data) {
    const schema = joi.object({
      user_target_id: joi.number().required(),
      user_profile_id: joi.number().optional(),
      target_outcome_id: joi.number().optional(),
      counselor_id: joi.number().optional(),
      status_enum: joi.string().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const userTargetOutcome = new UserTargetOutcome();
    return userTargetOutcome.putUserTargetOutcome(data);
  }

  //////////////////////////////////////////
  async getUserTargetOutcome(data) {
    const schema = joi.object({
      user_target_id: joi.number().optional(),
      user_profile_id: joi.number().optional(),
      target_outcome_id: joi.number().optional(),
      counselor_id: joi.number().optional(),
      tenant_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const userTargetOutcome = new UserTargetOutcome();
    return userTargetOutcome.getUserTargetOutcome(data);
  }
}
