//controllers/userProfile.js

import UserProfileService from '../services/userProfile.js';

//////////////////////////////////////////

export default class UserProfileController {
  //////////////////////////////////////////

  async postUserProfile(req, res) {
    const data = req.body;

    const userProfile = new UserProfileService();
    const rec = await userProfile.postUserProfile(data);
    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async userPostClientProfile(req, res) {
    const data = req.body;

    const userProfile = new UserProfileService();
    const rec = await userProfile.userPostClientProfile(data);
    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async putUserProfile(req, res) {
    const data = req.body;
    const user_profile_id = req.query.user_profile_id;

    if (!user_profile_id) {
      res.status(400).json({ message: 'Mandatory fields are missing' });
    }

    const userProfile = new UserProfileService();
    const rec = await userProfile.putUserProfile(data, user_profile_id);
    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async delUserProfile(req, res) {
    const user_profile_id = req.query.user_profile_id;

    if (!user_profile_id) {
      res.status(400).json({ message: 'Mandatory fields are missing' });
    }

    const userProfile = new UserProfileService();
    const rec = await userProfile.delUserProfile(user_profile_id);
    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async getUserProfileById(req, res) {
    const user_profile_id = req.query.user_profile_id;
    const email = req.query.email;
    const user_id = req.query.user_id;

    const data = {
      user_profile_id: user_profile_id,
      email: email,
      user_id: user_id,
    };

    if (!user_profile_id && !email && !user_id) {
      res
        .status(400)
        .json({ message: 'At least one query parameter is required' });
    }

    const userProfile = new UserProfileService();
    const rec = await userProfile.getUserProfileById(data);
    res.status(200).json(rec);
  }
}
