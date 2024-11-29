//controllers/service.js

import ServiceService from '../services/service.js';

export default class ServiceController {
  //////////////////////////////////////////
  async postService(req, res) {
    const data = req.body;

    if (
      !data.service_name ||
      !data.service_code ||
      !data.total_invoice ||
      !data.nbr_of_sessions ||
      !data.gst
      // ||!data.role_id
    ) {
      res.status(400).json({ message: 'Missing mandatory fields' });
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
