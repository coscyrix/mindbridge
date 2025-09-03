import UserFormService from '../services/userForm.js';
import dotenv from 'dotenv';

export default class UserFormController {
  //////////////////////////////////////////
  async postUserForm(req, res) {
    const data = req.body;

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
    const data = req.query;

    const userForm = new UserFormService();
    const rec = await userForm.getUserFormById(data);

    // For "No data found" or similar informational messages, return 200 status
    if (rec.error && rec.message && (
      rec.message.includes('No data found') || 
      rec.message.includes('No records found') ||
      rec.message.includes('No forms found')
    )) {
      res.status(200).json(rec);
      return;
    }

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }
}
