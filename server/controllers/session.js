//controller/session.js

import SessionService from '../services/session.js';

export default class SessionController {
  //////////////////////////////////////////
  async postSession(req, res) {
    const data = req.body;

    if (
      !data.thrpy_req_id ||
      !data.service_id ||
      !data.session_format ||
      !data.intake_date
    ) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }
    const session = new SessionService();
    const rec = await session.postSession(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async putSessionById(req, res) {
    const session_id = req.query.session_id;
    const data = req.body;
    data.session_id = session_id;
    if (!data.session_id) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    if (data.session_status === 3 && !data.notes) {
      res
        .status(400)
        .json({ message: 'Provide a note for why the client was a NO SHOW' });
      return;
    }

    const session = new SessionService();
    const rec = await session.putSessionById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async delSessionById(req, res) {
    const session_id = req.query.session_id;

    if (!session_id) {
      res.status(400).json({ message: 'Missing mandatory params' });
      return;
    }

    const data = {
      session_id: session_id,
    };

    const session = new SessionService();
    const rec = await session.delSessionById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async getSessionById(req, res) {
    const session_id = req.query.session_id;

    if (!session_id) {
      res.status(400).json({ message: 'Missing mandatory params' });
      return;
    }

    const data = {
      session_id: session_id,
    };

    const session = new SessionService();
    const rec = await session.getSessionById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async getSessionTodayAndTomorrow(req, res) {
    const data = req.query;

    const session = new SessionService();
    const rec = await session.getSessionTodayAndTomorrow(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }
}
