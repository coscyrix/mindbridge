//controllers/invoice.js

import InvoiceService from '../services/invoice.js';
import dotenv from 'dotenv';

dotenv.config();

export default class InvoiceController {
  //////////////////////////////////////////

  async postInvoice(req, res) {
    const data = req.body;

    if (!data.session_id || !data.invoice_nbr) {
      return res.status(400).send({ message: 'Missing required fields' });
    }

    const invoice = new InvoiceService();
    const response = await invoice.postInvoice(data);

    if (response.error) {
      return res.status(400).send(response);
    }

    return res.status(200).send(response);
  }

  //////////////////////////////////////////

  async getInvoiceById(req, res) {
    const data = req.query;

    const invoice = new InvoiceService();
    const response = await invoice.getInvoiceById(data);

    if (response.error) {
      return res.status(400).send(response);
    }

    return res.status(200).send(response);
  }

  //////////////////////////////////////////

  async putInvoiceById(req, res) {
    const data = req.body;

    const invoice = new InvoiceService();
    const response = await invoice.putInvoiceById(data);

    if (response.error) {
      return res.status(400).send(response);
    }

    return res.status(200).send(response);
  }

  //////////////////////////////////////////

  async getInvoiceByMulti(req, res) {
    const data = req.query;

    if (!data.role_id) {
      return res.status(400).send({ message: 'Mandatory fields are required' });
    }

    if (data.role_id == 2 && !data.counselor_id) {
      return res
        .status(400)
        .send({ message: 'Counselor ID is required for that specific role' });
    }

    // if (data.role_id == 3 && !data.counselor_id) {
    //   return res
    //     .status(400)
    //     .send({ message: 'Counselor ID is required for that specific role' });
    // }

    if (data.role_id === 4 && !data.counselor_id) {
      return res
        .status(400)
        .send({ message: 'Counselor ID is required for that specific role' });
    }

    const invoice = new InvoiceService();
    const response = await invoice.getInvoiceByMulti(data);

    if (response.error) {
      return res.status(400).send(response);
    }

    return res.status(200).send(response);
  }
}
