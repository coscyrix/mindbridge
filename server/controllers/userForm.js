import UserFormService from '../services/userForm.js';
import dotenv from 'dotenv';

export default class UserFormController {
  //////////////////////////////////////////
  async postUserForm(req, res) {
    const data = req.body;
    data.tenant_id = process.env.TENANT_ID;

    if (!data.client_id || !data.form_id || !data.session_id) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const userForm = new UserFormService();
    const rec = await userForm.postUserForm(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async putUserFormById(req, res) {
    const user_form_id = req.query.user_form_id;
    const data = req.body;
    data.user_form_id = user_form_id;
    if (!data.user_form_id) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const userForm = new UserFormService();
    const rec = await userForm.putUserFormById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }
    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async getUserFormById(req, res) {
    const user_form_id = req.query;

    const data = {
      user_form_id: req.query.user_form_id,
      session_id: req.query.session_id,
      form_id: req.query.form_id,
      form_submit: req.query.form_submit,
      client_id: req.query.client_id,
      counselor_id: req.query.counselor_id,
      start_date: req.query.start_date,
      end_date: req.query.end_date,
      is_sent: req.query.is_sent,
    };

    const userForm = new UserFormService();
    const rec = await userForm.getUserFormById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }
}
