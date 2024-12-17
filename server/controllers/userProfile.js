//controllers/userProfile.js

import UserProfileService from '../services/userProfile.js';

//////////////////////////////////////////

export default class UserProfileController {
  //////////////////////////////////////////

  async postUserProfile(req, res) {
    const data = req.body;

    const userProfile = new UserProfileService();
    const rec = await userProfile.postUserProfile(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async userPostClientProfile(req, res) {
    const data = req.body;

    const userProfile = new UserProfileService();
    const rec = await userProfile.userPostClientProfile(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

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

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

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

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async getUserProfileById(req, res) {
    const data = req.query;

    // if (!data.user_profile_id && !data.email && !data.role_id) {
    //   res
    //     .status(400)
    //     .json({ message: 'At least one query parameter is required' });
    // }

    const userProfile = new UserProfileService();
    const rec = await userProfile.getUserProfileById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }
}
