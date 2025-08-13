//services/session.js

import Session from '../models/session.js';
import Common from '../models/common.js';
import joi from 'joi';

export default class SessionService {
  constructor() {
    this.common = new Common();
  }
  //////////////////////////////////////////

  async postSession(data) {
    const schema = joi.object({
      thrpy_req_id: joi.number().required(),
      service_id: joi.number().required(),
      session_format: joi.number().required(),
      intake_date: joi.date().required(),
      session_description: joi.string().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const session = new Session();
    return session.postAdditionalSession(data);
  }

  //////////////////////////////////////////

  async putSessionById(data) {
    const schema = joi.object({
      session_id: joi.number().required(),
      thrpy_req_id: joi.number().optional(),
      service_id: joi.number().optional(),
      session_format: joi.string().optional(),
      intake_date: joi.date().optional(),
      scheduled_time: joi.date().optional(),
      session_description: joi.string().optional(),
      is_additional: joi.boolean().optional(),
      is_report: joi.boolean().optional(),
      session_status: joi.number().optional(),
      notes: joi.string().optional(),
      invoice_nbr: joi.string().optional(),
      role_id: joi.number().optional(),
      user_profile_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const session = new Session();
    return session.putSessionById(data);
  }

  //////////////////////////////////////////

  async delSessionById(data) {
    const schema = joi.object({
      session_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const session = new Session();
    return session.delSessionById(data);
  }

  //////////////////////////////////////////

  async getSessionById(data) {
    const schema = joi.object({
      session_id: joi.number().optional(),
      is_report: joi.boolean().optional(),
      service_code: joi.string().optional(),
      session_status: joi
        .alternatives()
        .try(joi.string(), joi.number())
        .optional(),
      tenant_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const session = new Session();
    return session.getSessionById(data);
  }

  //////////////////////////////////////////

  async getSessionTodayAndTomorrow(data) {
    if (Number(data.role_id) === 3 && data.counselor_id) {
      const tenantId = await this.common.getUserTenantId({
        user_profile_id: data.counselor_id,
      });
      data.tenant_id = Number(tenantId[0].tenant_id);
    }

    const schema = joi.object({
      counselor_id: joi.number().optional(),
      user_timezone: joi.string().optional(),
      tenant_id: joi.number().optional(),
      role_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const session = new Session();
    return session.getSessionTodayAndTomorrow(data);
  }
}
