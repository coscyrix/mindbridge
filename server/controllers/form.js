//controllers/form.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import FormService from '../services/form.js';
const dotenv = require('dotenv');;

dotenv.config();

export default class FormController {
  //////////////////////////////////////////
  async postForm(req, res) {
    const data = req.body;

    if (!data.form_cde) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const form = new FormService();
    const rec = await form.postForm(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async putFormById(req, res) {
    const form_id = req.query.form_id;
    const data = req.body;
    data.form_id = form_id;
    if (!data.form_id) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const form = new FormService();
    const rec = await form.putFormById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }
    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async getFormById(req, res) {
    const form_id = req.query.form_id;

    const data = {
      form_id: form_id,
    };

    const form = new FormService();
    const rec = await form.getFormById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }
}
