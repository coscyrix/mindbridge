//controllers/thrpyReq.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import ThrpyReqService from '../services/thrpyReq.js';
const dotenv = require('dotenv');;

dotenv.config();

export default class ThrpyReqController {
  //////////////////////////////////////////
  async postThrpyReq(req, res) {
    const data = req.body;
    // Inject tenant_id from token if available
    if (req.decoded && req.decoded.tenant_id) {
      data.tenant_id = req.decoded.tenant_id;
    }

    if (
      !data.counselor_id ||
      !data.client_id ||
      !data.service_id ||
      !data.session_format_id ||
      !data.intake_dte
    ) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }
    const thrpyReq = new ThrpyReqService();
    const rec = await thrpyReq.postThrpyReq(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async putThrpyReqById(req, res) {
    const req_id = req.query.req_id;
    const role_id = req.query.role_id;
    const data = req.body;
    if (!data.tenant_id) {
      data.tenant_id = req.decoded.tenant_id;
    }
    data.req_id = req_id;
    data.role_id = role_id;
    if (!data.req_id) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    if (data.target_outcome_id) {
      if (!data.counselor_id) {
        res
          .status(400)
          .json({ message: "Target outcome requires Counselor's id" });
        return;
      }
    }

    const thrpyReq = new ThrpyReqService();
    const rec = await thrpyReq.putThrpyReqById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async putThrpyBigObjReqById(req, res) {
    const req_id = req.query.req_id;
    const data = req.body;
    data.req_id = req_id;

    if (!data.req_id) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const thrpyReq = new ThrpyReqService();
    const rec = await thrpyReq.putThrpyBigObjReqById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  // async putThrpyDischarge(req, res) {
  //   const req_id = req.query.req_id;
  //   const data = req.body;
  //   data.req_id = req_id;

  //   if (!data.req_id || !data.thrpy_status) {
  //     res.status(400).json({ message: 'Missing mandatory fields' });
  //     return;
  //   }

  //   const thrpyReq = new ThrpyReqService();
  //   const rec = await thrpyReq.putThrpyDischarge(data);

  //   if (rec.error) {
  //     res.status(400).json(rec);
  //     return;
  //   }

  //   res.status(200).json(rec);
  // }

  //////////////////////////////////////////

  // async delThrpyReqById(req, res) {
  //   const thrpy_id = req.query.thrpy_id;

  //   if (!thrpy_id) {
  //     res.status(400).json({ message: 'Missing mandatory params' });
  //     return;
  //   }

  //   const data = {
  //     thrpy_id: thrpy_id,
  //   };

  //   const thrpyReq = new ThrpyReqService();
  //   const rec = await thrpyReq.delThrpyReqById(data);

  //   if (rec.error) {
  //     res.status(400).json(rec);
  //     return;
  //   }

  //   res.status(200).json(rec);
  // }

  //////////////////////////////////////////

  async getThrpyReqByHash(req, res) {
    const cancel_hash = req.query.hash || req.params.hash;
    
    if (!cancel_hash) {
      res.status(400).json({ message: 'Hash parameter is required' });
      return;
    }

    const thrpyReq = new ThrpyReqService();
    const rec = await thrpyReq.getThrpyReqByHash(cancel_hash);

    if (rec.error) {
      res.status(404).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async cancelSessionByHash(req, res) {
    const { session_id, hash, cancellation_reason } = req.body;
    
    if (!session_id || !hash) {
      res.status(400).json({ message: 'Session ID and hash are required' });
      return;
    }

    const thrpyReq = new ThrpyReqService();
    const rec = await thrpyReq.cancelSessionByHash(session_id, hash, cancellation_reason);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async rescheduleSessionByHash(req, res) {
    const { session_id, hash, new_date, new_time } = req.body;
    
    if (!session_id || !hash || !new_date || !new_time) {
      res.status(400).json({ message: 'Session ID, hash, new date, and new time are required' });
      return;
    }

    const thrpyReq = new ThrpyReqService();
    const rec = await thrpyReq.rescheduleSessionByHash(session_id, hash, new_date, new_time);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async getThrpyReqById(req, res) {
    const data = req.query;

    if (data.role_id) {
      data.role_id = Number(data.role_id);
    }
    if(data.role_id === 3){
      data.tenant_id = Number(req.decoded.tenant_id);
    }
    // else {
    //   res.status(400).json({ message: 'Missing mandatory fields' });
    //   return;
    // }

    const thrpyReq = new ThrpyReqService();
    const rec = await thrpyReq.getThrpyReqById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async loadSessionFormsWithMode(req, res) {
    try {
      const data = req.body;
      
      // Get tenant ID from token if available
      if (req.decoded && req.decoded.tenant_id) {
        data.tenant_id = req.decoded.tenant_id;
      }

      // Get counselor_id from token if not provided
      if (!data.counselor_id && req.decoded && req.decoded.user_profile_id) {
        data.counselor_id = req.decoded.user_profile_id;
      }

      const thrpyReqService = new ThrpyReqService();
      const result = await thrpyReqService.loadSessionFormsWithMode(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  async getThrpyReqByIdWithTreatmentTargetForms(req, res) {
    try {
      const data = req.query;
      
      // Get tenant ID from token if available
      if (req.decoded && req.decoded.tenant_id) {
        data.tenant_id = req.decoded.tenant_id;
      }

      // Get user_profile_id from token if not provided
      if (!data.user_profile_id && req.decoded && req.decoded.user_profile_id) {
        data.user_profile_id = req.decoded.user_profile_id;
      }

      const thrpyReqService = new ThrpyReqService();
      const result = await thrpyReqService.getThrpyReqByIdWithTreatmentTargetForms(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////
}
