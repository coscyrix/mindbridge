//controllers/thrpyReq.js

import ThrpyReqService from '../services/thrpyReq.js';

export default class ThrpyReqController {
  //////////////////////////////////////////
  async postThrpyReq(req, res) {
    const data = req.body;

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
    const data = req.body;
    data.req_id = req_id;
    if (!data.req_id) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
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

  async getThrpyReqById(req, res) {
    const req_id = req.query.req_id;
    const counselor_id = req.query.counselor_id;
    const client_id = req.query.client_id;
    const thrpy_id = req.query.thrpy_id;

    const data = {
      req_id: req_id,
      counselor_id: counselor_id,
      client_id: client_id,
      thrpy_id: thrpy_id,
    };

    const thrpyReq = new ThrpyReqService();
    const rec = await thrpyReq.getThrpyReqById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }
}
