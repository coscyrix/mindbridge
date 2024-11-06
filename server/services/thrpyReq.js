//services/thrpyReq.js

import ThrpyReq from '../models/thrpyReq.js';
import joi from 'joi';

export default class ThrpyReqService {
  //////////////////////////////////////////

  async postThrpyReq(data) {
    const schema = joi.object({
      counselor_id: joi.number().required(),
      client_id: joi.number().required(),
      service_id: joi.number().required(),
      session_format_id: joi.number().required(),
      intake_dte: joi.date().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const thrpyReq = new ThrpyReq();
    return thrpyReq.postThrpyReq(data);
  }

  //////////////////////////////////////////

  async putThrpyReqById(data) {
    const schema = joi.object({
      req_id: joi.number().required(),
      counselor_id: joi.number().optional(),
      client_id: joi.number().optional(),
      service_id: joi.number().optional(),
      session_format_id: joi.number().optional(),
      req_dte: joi.date().optional(),
      req_time: joi.date().optional(),
      session_desc: joi.string().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const thrpyReq = new ThrpyReq();
    return thrpyReq.putThrpyReqById(data);
  }

  //////////////////////////////////////////

  async putThrpyDischarge(data) {
    const schema = joi.object({
      req_id: joi.number().required(),
      thrpy_status: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const thrpyReq = new ThrpyReq();
    return thrpyReq.putThrpyDischarge(data);
  }

  //////////////////////////////////////////

  async delThrpyReqById(data) {
    const schema = joi.object({
      thrpy_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const thrpyReq = new ThrpyReq();
    return thrpyReq.delThrpyReqById(data);
  }

  //////////////////////////////////////////

  async getThrpyReqById(data) {
    const schema = joi.object({
      req_id: joi.number().optional(),
      counselor_id: joi.number().optional(),
      client_id: joi.number().optional(),
      thrpy_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const thrpyReq = new ThrpyReq();
    return thrpyReq.getThrpyReqById(data);
  }
}
