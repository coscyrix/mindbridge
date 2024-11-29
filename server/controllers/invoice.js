//controllers/invoice.js

import InvoiceService from '../services/invoice.js';

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
}
