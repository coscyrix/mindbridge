//services/invoice.js

import Invoice from '../models/invoice.js';
import joi from 'joi';
import Common from '../models/common.js';

export default class InvoiceService {
  //////////////////////////////////////////

  constructor() {
    this.common = new Common();
  }

  //////////////////////////////////////////

  async postInvoice(data) {
    const sessionId = await this.common.getSessionById({
      session_id: data.session_id,
    });
    const tenantId = await this.common.getUserTenantId({
      user_profile_id: sessionId[0].counselor_id,
    });
    data.tenant_id = Number(tenantId[0].tenant_id);
    const schema = joi.object({
      session_id: joi.number().required(),
      invoice_nbr: joi.string().required(),
      tenant_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const invoice = new Invoice();
    return invoice.postInvoice(data);
  }

  //////////////////////////////////////////

  async getInvoiceById(data) {
    const schema = joi.object({
      session_id: joi.number().optional(),
      invoice_nbr: joi.string().optional(),
      tenant_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const invoice = new Invoice();
    return invoice.getInvoiceById(data);
  }

  //////////////////////////////////////////

  async putInvoiceById(data) {
    const schema = joi.object({
      session_id: joi.number().required(),
      invoice_nbr: joi.string().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const invoice = new Invoice();
    return invoice.putInvoiceById(data);
  }

  //////////////////////////////////////////

  async getInvoiceByMulti(data) {
    data.role_id = Number(data.role_id);

    if (data.role_id === 4) {
      // For role_id=4, if tenant_id is provided, we'll include system_pcnt in response
      // If no tenant_id is provided, no additional processing is needed
    }

    if (data.role_id === 3) {
      if (data.counselor_id && data.counselor_id !== 'allCounselors') {
        // If specific counselor is provided, get their tenant_id
        const tenantId = await this.common.getUserTenantId({
          user_profile_id: data.counselor_id,
        });
        data.tenant_id = Number(tenantId[0].tenant_id);
      }
      // If no counselor_id is provided but tenant_id is provided, 
      // we want to show all counselors for that tenant
      // The model will handle filtering by tenant_id only
    }

    console.log(
      '////////////////////////////////////////////////////////////////////////////////',
    );
    console.log('getInvoiceByMulti data', data);

    const schema = joi.object({
      counselor_id: joi.number().optional(),
      client_id: joi.number().optional(),
      req_id: joi.number().optional(),
      start_dte: joi.date().optional(),
      end_dte: joi.date().optional(),
      thrpy_status: joi.string().optional(),
      role_id: joi.number().optional(),
      tenant_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const invoice = new Invoice();
    return invoice.getInvoiceByMulti(data);
  }
}
