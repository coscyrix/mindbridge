//controllers/service.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import ServiceService from '../services/service.js';
const dotenv = require('dotenv');;

dotenv.config();

export default class ServiceController {
  //////////////////////////////////////////
  async postService(req, res) {
    const data = req.body;
    const { tenant_id: userTenantId, isAdmin } = req.decoded || {};

    // Only admin or tenant can create a service
    if (!isAdmin && !userTenantId) {
      return res.status(403).json({ message: 'Only tenant or admin can create a service' });
    }

    if (isAdmin) {
      // Admin must specify tenant_id in body
      if (!data.tenant_id) {
        return res.status(400).json({ message: 'Admin must specify tenant_id in request body' });
      }
    } else {
      // Tenant: force tenant_id from token
      data.tenant_id = userTenantId;
    }

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
    const { tenant_id: userTenantId, isAdmin } = req.decoded || {};
    let data = { service_id };

    // Admin can filter by tenant_id if provided, else see all
    if (isAdmin) {
      if (req.query.tenant_id) {
        data.tenant_id = req.query.tenant_id;
      }
    } else {
      // Non-admins only see their own tenant's services
      data.tenant_id = userTenantId;
    }

    const service = new ServiceService();
    const rec = await service.getServiceById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }
}
