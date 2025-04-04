//service/service.js

import Service from '../models/service.js';
import joi from 'joi';

export default class ServiceService {
  //////////////////////////////////////////

  async postService(data) {
    const schema = joi.object({
      service_name: joi.string().min(2).required(),
      service_code: joi.string().min(2).required(),
      is_report: joi.number().integer().valid(0, 1).optional(),
      is_additional: joi.number().integer().valid(0, 1).optional(),
      total_invoice: joi.number().precision(4).required(),
      nbr_of_sessions: joi.number().integer().required(),
      svc_formula_typ: joi.string().valid('s', 'd').optional(),
      svc_formula: joi.array().items(joi.number()).optional(),
      position: joi.array().items(joi.any()).optional(),
      service_id: joi.array().items(joi.any()).optional(),
      gst: joi.number().precision(4).required(),
      tenant_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const service = new Service();
    return service.postService(data);
  }

  //////////////////////////////////////////

  async putServiceById(data) {
    const schema = joi.object({
      service_id: joi.number().required(),
      service_name: joi.string().min(2).optional(),
      service_code: joi.string().min(2).optional(),
      total_invoice: joi.number().precision(4).optional(),
      // nbr_of_sessions: joi.number().integer().optional(),
      gst: joi.number().precision(4).optional(),
      discount_pcnt: joi.number().precision(4).optional(),
      //   role_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const service = new Service();
    return service.putServiceById(data);
  }

  //////////////////////////////////////////

  async delServiceById(data) {
    const schema = joi.object({
      service_id: joi.number().required(),
      //   role_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const service = new Service();
    return service.delServiceById(data);
  }

  //////////////////////////////////////////

  async getServiceById(data) {
    const schema = joi.object({
      service_id: joi.number().optional(),
      //   role_id: joi.number().required(),
      tenant_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const service = new Service();
    return service.getServiceById(data);
  }
}
