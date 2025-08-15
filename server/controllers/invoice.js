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
    console.log('decoded----->',req.decoded);

    const data = req.query;

    if (!data.role_id) {
      return res.status(400).send({ message: 'Mandatory fields are required' });
    }

    if (data.role_id == 2 && !data.counselor_id) {
      return res
        .status(400)
        .send({ message: 'Counselor ID is required for that specific role' });
    }

    if (data.role_id == 3 && !data.counselor_id) {
      // If tenant_id is provided, show data for all counselors in that tenant
      // If no tenant_id, use the decoded tenant_id
      if (!data.tenant_id) {
        data.tenant_id = req.decoded.tenant_id;
      }
      // When role_id=3 and tenant_id is provided, we want to show all counselors' data
      // So we don't filter by specific counselor_id
    }

    if (data.role_id === 4 && !data.counselor_id) {
      return res
        .status(400)
        .send({ message: 'Counselor ID is required for that specific role' });
    }

    // Handle role_id=4 with tenant selection
    if (data.role_id === 4 && data.tenant_id) {
      // If tenant is selected for role_id=4, we'll include system_pcnt in the response
      // The model will handle fetching system_pcnt from ref_fees table
    }


    console.log('data----->',data);
  
  
    const invoice = new InvoiceService();
    const response = await invoice.getInvoiceByMulti(data);

    if (response.error) {
      return res.status(400).send(response);
    }

    return res.status(200).send(response);
  }
}
