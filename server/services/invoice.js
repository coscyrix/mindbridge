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

    if (data.role_id === 4 && data.counselor_id) {
      // For role_id=4, if counselor_id is provided, get their tenant_id to calculate tenant amount
      const tenantId = await this.common.getUserTenantId({
        user_profile_id: data.counselor_id,
      });
      data.tenant_id = Number(tenantId[0].tenant_id);
    }

    if (data.role_id === 2 && data.counselor_id) {
      // For role_id=2 (counselor), get their tenant_id to calculate tenant amount
      const tenantId = await this.common.getUserTenantId({
        user_profile_id: data.counselor_id,
      });
      data.tenant_id = Number(tenantId[0].tenant_id);
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

    // Set current month start and end dates if not provided
    if (!data.start_dte && !data.end_dte) {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      
      // First day of current month
      data.start_dte = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
      
      // Last day of current month
      data.end_dte = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
      
      console.log('Auto-setting dates - start_dte:', data.start_dte, 'end_dte:', data.end_dte);
    } else {
      // Convert Date objects back to string format for database queries
      if (data.start_dte instanceof Date) {
        data.start_dte = data.start_dte.toISOString().split('T')[0];
      }
      if (data.end_dte instanceof Date) {
        data.end_dte = data.end_dte.toISOString().split('T')[0];
      }
      console.log('Using provided dates - start_dte:', data.start_dte, 'end_dte:', data.end_dte);
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
