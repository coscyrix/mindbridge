//services/thrpyReq.js

import ThrpyReq from '../models/thrpyReq.js';
import joi from 'joi';
import Common from '../models/common.js';

export default class ThrpyReqService {
  //////////////////////////////////////////
  constructor() {
    this.common = new Common();
  }
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
      return { message: error.details[0].message, error: -1 };
    }

    const thrpyReq = new ThrpyReq();
    return thrpyReq.postThrpyReq(data);
  }

  //////////////////////////////////////////

  async putThrpyReqById(data) {
    // const checkThrpyReq = await this.common.getThrpyReqById(data.req_id);
    // if (checkThrpyReq.error) {
    //   return checkThrpyReq;
    // }

    // if (checkThrpyReq) {
    //   if (
    //     checkThrpyReq[0].session_format_id === data.session_format_id &&
    //     checkThrpyReq[0].req_dte === data.req_dte
    //   ) {
    //     return { message: 'No changes detected', error: -1 };
    //   }
    // }
    //delete unnecessary fields
    delete data.counselor_first_name;
    delete data.counselor_last_name;
    delete data.counselor_clam_num;
    delete data.client_first_name;
    delete data.client_last_name;
    delete data.client_clam_num;
    delete data.service_id;
    delete data.service_name;
    delete data.service_code;
    delete data.req_dte_formatted;
    delete data.created_at;
    delete data.updated_at;

    if (data.session_obj) {
      data.session_obj.forEach((post) => {
        delete post.created_at;
        delete post.updated_at;
        delete post.invoice_id;
        delete post.forms_array;
        delete post.invoice_nbr;
        delete post.service_code;
        delete post.service_name;
        delete post.status_yn;
      });
    }

    const schema = joi.object({
      req_id: joi.number().required(),
      counselor_id: joi.number().optional(),
      client_id: joi.number().optional(),
      session_format_id: joi
        .alternatives()
        .try(joi.string(), joi.number())
        .optional(),
      req_dte: joi.date().optional(),
      req_time: joi.string().optional(),
      session_desc: joi.string().optional(),
      status_yn: joi.string().valid('y', 'n').optional(),
      thrpy_status: joi.string().valid('ONGOING', 'DISCHARGED').optional(),
      session_obj: joi
        .array()
        .items(
          joi.object({
            session_id: joi.number().required(),
            thrpy_req_id: joi.number().optional(),
            service_id: joi.number().optional(),
            session_format: joi.string().optional(),
            intake_date: joi.date().optional(),
            scheduled_time: joi.string().optional(),
            session_description: joi.string().optional(),
            is_additional: joi
              .alternatives()
              .try(joi.number(), joi.boolean())
              .optional(),
            is_report: joi
              .alternatives()
              .try(joi.number(), joi.boolean())
              .optional(),
            session_status: joi
              .alternatives()
              .try(joi.number(), joi.string())
              .optional(),
          }),
        )
        .optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const thrpyReq = new ThrpyReq();
    return thrpyReq.putThrpyReqById(data);
  }

  //////////////////////////////////////////

  async putThrpyBigObjReqById(data) {
    const thrpyReq = new ThrpyReq();
    return thrpyReq.putThrpyBigObjReqById(data);
  }

  //////////////////////////////////////////

  async putThrpyDischarge(data) {
    const schema = joi.object({
      req_id: joi.number().required(),
      thrpy_status: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
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
      return { message: error.details[0].message, error: -1 };
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
      thrpy_status: joi.string().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const thrpyReq = new ThrpyReq();
    return thrpyReq.getThrpyReqById(data);
  }
}
