//services/session.js

import Session from '../models/session.js';
import joi from 'joi';

export default class SessionService {
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
      return { message: error.details[0].message };
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
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message };
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
      return { message: error.details[0].message };
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
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const session = new Session();
    return session.getSessionById(data);
  }
}
