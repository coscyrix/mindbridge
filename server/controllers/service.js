//controllers/service.js

import ServiceService from '../services/service.js';
import dotenv from 'dotenv';

dotenv.config();

export default class ServiceController {
  //////////////////////////////////////////
  async postService(req, res) {
    const data = req.body;
    data.tenant_id = process.env.TENANT_ID;

    const missingFields = [];
    if (!data.service_name) missingFields.push('service_name');
    if (!data.service_code) missingFields.push('service_code');
    if (!data.total_invoice) missingFields.push('total_invoice');
    if (!data.nbr_of_sessions) missingFields.push('nbr_of_sessions');
    if (!data.gst) missingFields.push('gst');
    // if (!data.role_id) missingFields.push('role_id');

    if (missingFields.length > 0) {
      res.status(400).json({ message: 'Missing mandatory fields', missingFields });
      return;
    }
    const service = new ServiceService();
    const rec = await service.postService(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async putServiceById(req, res) {
    const service_id = req.query.service_id;
    const data = req.body;
    data.service_id = service_id;
    if (
      !data.service_id
      // ||!data.role_id
    ) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const service = new ServiceService();
    const rec = await service.putServiceById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async delServiceById(req, res) {
    const service_id = req.query.service_id;

    if (
      !service_id
      // ||!data.role_id
    ) {
      res.status(400).json({ message: 'Missing mandatory params' });
      return;
    }

    const data = {
      service_id: service_id,
      // role_id: data.role_id
    };

    const service = new ServiceService();
    const rec = await service.delServiceById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async getServiceById(req, res) {
    const service_id = req.query.service_id;

    // if (!service_id) {
    //   res.status(400).json({ message: "Missing mandatory params" });
    //   return;
    // }

    const data = {
      service_id: service_id,
      // role_id: data.role_id
    };

    const service = new ServiceService();
    const rec = await service.getServiceById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }
}
