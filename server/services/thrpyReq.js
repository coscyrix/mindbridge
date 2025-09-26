//services/thrpyReq.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ThrpyReq = require('../models/thrpyReq.js').default;
const joi = require('joi');;
const Common = require('../models/common.js').default;
const Session = require('../models/session.js').default;

export default class ThrpyReqService {
  //////////////////////////////////////////
  constructor() {
    this.common = new Common();
    this.session = new Session();
  }
  //////////////////////////////////////////

  async postThrpyReq(data) {
    // Use tenant_id from data if present (from token)
    if (!data.tenant_id) {
      const tenantId = await this.common.getUserTenantId({
        user_profile_id: data.counselor_id,
      });
      if (!Array.isArray(tenantId) || !tenantId[0] || !tenantId[0].tenant_id) {
        return { message: 'Counselor not found or missing tenant_id', error: -1 };
      }
      data.tenant_id = Number(tenantId[0].tenant_id);
    }

    const schema = joi.object({
      counselor_id: joi.number().required(),
      client_id: joi.number().required(),
      service_id: joi.number().required(),
      session_format_id: joi
        .alternatives()
        .try(joi.string(), joi.number())
        .required(),
      intake_dte: joi.date().required(),
      tenant_id: joi.number().required(),
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
    const checkThrpyReq = await this.common.getThrpyReqById(data.req_id);
    if (checkThrpyReq.error) {
      return checkThrpyReq;
    }

    if (checkThrpyReq) {
      if (
        checkThrpyReq[0].session_format_id === data.session_format_id &&
        checkThrpyReq[0].req_dte === data.req_dte
      ) {
        const tmpRegenThrpyRequest = {
          counselor_id: data.counselor_id,
          client_id: data.client_id,
          service_id: data.service_id,
          session_format_id: data.session_format_id,
          intake_dte: `${data.req_dte_not_formatted}T${data.req_time}`,
        };

        const deleteThrpyReq = await this.deleteThrpyReqByClientId({
          req_id: data.req_id,
        });

        if (deleteThrpyReq.error) {
          return deleteThrpyReq;
        }

        const regenThrpyRequest = await this.postThrpyReq(tmpRegenThrpyRequest);

        return {
          message: 'No changes detected, This is the regenerated record',
          rec: regenThrpyRequest,
        };
      }
    }

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
    delete data.req_dte_not_formatted;
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
        delete post.session_gst;
        delete post.session_price;
        delete post.session_system_amt;
        delete post.session_counselor_amt;
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
      role_id: joi.number().optional(),
      tenant_id: joi.number().optional(),
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
    }).unknown(true); // Allow additional fields

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
    console.log('/////////////////////////////////////////');
    data.role_id = Number(data.role_id);
    
    // Handle role_id=4 (system admin)
    if (data.role_id === 4) {
      delete data.counselor_id;
      delete data.user_profile_id;
    }
    
    // Handle role_id=3 (tenant manager)
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
    
    // Handle role_id=2 (counselor) - derive tenant_id from counselor_id if not provided
    if (data.role_id === 2 && data.user_profile_id && !data.tenant_id) {
      const tenantId = await this.common.getUserTenantId({
        user_profile_id: data.user_profile_id,
      });
      if (tenantId && tenantId.length > 0) {
        data.tenant_id = Number(tenantId[0].tenant_id);
      }
    }

    const schema = joi.object({
      req_id: joi.number().optional(),
      counselor_id: joi.number().optional(),
      user_profile_id: joi.number().optional(),
      client_id: joi.number().optional(),
      thrpy_id: joi.number().optional(),
      thrpy_status: joi.string().optional(),
      tenant_id: joi.number().optional(),
      role_id: joi.number().optional(),
    }).unknown(true); // Allow additional fields that might be sent

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    console.log('data----->',data);

    const thrpyReq = new ThrpyReq();
    return thrpyReq.getThrpyReqById(data);
  }

  //////////////////////////////////////////

  async deleteThrpyReqByClientId(data) {
    try {
      const checkThrpyReq = await this.getThrpyReqById({
        req_id: data.req_id,
      });

      if (checkThrpyReq.error) {
        logger.error('Error getting therapy request');
        return { message: 'Error getting therapy request', error: -1 };
      }

      if (!checkThrpyReq || checkThrpyReq.length === 0) {
        logger.error('Therapy request not found');
        return { message: 'Therapy request not found', error: -1 };
      }

      const thrpySessions = await this.session.getSessionByThrpyReqId({
        thrpy_req_id: data.req_id,
      });

      console.log('thrpySessions', thrpySessions);

      if (thrpySessions.error) {
        logger.error('Error getting therapy sessions');
        return { message: 'Error getting therapy sessions', error: -1 };
      }

      if (thrpySessions && thrpySessions.length > 0) {
        return {
          message:
            'Cannot delete therapy request with sessions that were updated',
          error: -1,
        };
      }

      const thrpyReq = new ThrpyReq();
      return thrpyReq.deleteThrpyReqById(data.req_id);
    } catch (error) {
      console.error(error);
      return { message: 'Error deleting therapy request', error: -1 };
    }
  }

  //////////////////////////////////////////

  async loadSessionFormsWithMode(data) {
    try {
      const { req_id, mode, treatment_target, tenant_id } = data;

      // Validate required fields
      if (!req_id) {
        return {
          message: 'Missing required field: req_id',
          error: -1
        };
      }

      // Always use environment variable for form mode (no frontend control needed)
      const envFormMode = process.env.FORM_MODE || 'auto';
      const effectiveMode = mode || envFormMode;

      // Validate mode
      if (!['service', 'treatment_target', 'auto'].includes(effectiveMode)) {
        return {
          message: 'Invalid mode specified. Must be "service", "treatment_target", or "auto"',
          error: -1
        };
      }

      // For treatment_target mode, the backend will automatically get the treatment target
      // No need for frontend to provide it

      // Get tenant ID if not provided
      if (!tenant_id) {
        const tenantId = await this.common.getUserTenantId({
          user_profile_id: data.counselor_id,
        });
        if (Array.isArray(tenantId) && tenantId[0] && tenantId[0].tenant_id) {
          data.tenant_id = Number(tenantId[0].tenant_id);
        }
      }

      const thrpyReq = new ThrpyReq();
      const result = await thrpyReq.loadSessionFormsWithMode({
        req_id,
        mode: effectiveMode,
        treatment_target,
        tenant_id: data.tenant_id
      });

      return result;
    } catch (error) {
      console.error(error);
      return {
        message: 'Error loading session forms with mode',
        error: -1
      };
    }
  }

  //////////////////////////////////////////

  async getThrpyReqByIdWithTreatmentTargetForms(data) {
    try {
      const thrpyReq = new ThrpyReq();
      const result = await thrpyReq.getThrpyReqByIdWithTreatmentTargetForms(data);

      return result;
    } catch (error) {
      console.error(error);
      return {
        message: 'Error getting therapy request with treatment target forms',
        error: -1
      };
    }
  }

  //////////////////////////////////////////
}
