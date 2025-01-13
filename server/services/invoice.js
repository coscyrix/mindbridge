//services/invoice.js

import Invoice from '../models/invoice.js';
import joi from 'joi';

export default class InvoiceService {
  //////////////////////////////////////////

  async postInvoice(data) {
    const schema = joi.object({
      session_id: joi.number().required(),
      invoice_nbr: joi.string().required(),
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
    const schema = joi.object({
      counselor_id: joi.number().optional(),
      client_id: joi.number().optional(),
      req_id: joi.number().optional(),
      req_dte: joi.date().optional(),
      thrpy_status: joi.string().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const invoice = new Invoice();
    return invoice.getInvoiceByMulti(data);
  }
}
