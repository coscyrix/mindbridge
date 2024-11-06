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
      return { message: error.details[0].message };
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
      return { message: error.details[0].message };
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
      return { message: error.details[0].message };
    }

    const invoice = new Invoice();
    return invoice.putInvoiceById(data);
  }
}
