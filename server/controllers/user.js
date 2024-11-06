//controllers/user.js

import UserService from '../services/user.js';

//////////////////////////////////////////

export default class UserController {
  //////////////////////////////////////////
  async signUp(req, res) {
    const data = req.body;

    if (
      !data.email ||
      !data.password ||
      !data.user_first_name ||
      !data.user_last_name
    ) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }
    const user = new UserService();
    const rec = await user.signUp(data);
    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async signIn(req, res) {
    const data = req.body;

    if (!data.email || !data.password) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const user = new UserService();
    const rec = await user.signIn(data);
    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async passwordReset(req, res) {
    const data = req.body;

    if (!data.email) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const user = new UserService();
    const rec = await user.passwordReset(data);
    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async sendOTPforVerification(req, res) {
    const data = req.body;

    if (!data.email) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const user = new UserService();
    const rec = await user.sendOTPforVerification(data);
    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async verifyAccount(req, res) {
    const data = req.body;

    if (!data.email || !data.otp) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const user = new UserService();
    const rec = await user.verifyAccount(data);
    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async changePassword(req, res) {
    const data = req.body;

    if (!data.email || !data.old_password || !data.new_password) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const user = new UserService();
    const rec = await user.changePassword(data);
    res.status(200).json(rec);
  }
}
