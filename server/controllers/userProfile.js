//controllers/userProfile.js

import UserProfileService from '../services/userProfile.js';
import dotenv from 'dotenv';

dotenv.config();

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

    if (!data.role_id) {
      res.status(400).json({ message: 'Mandatory fields missing', error: -1 });
      return;
    }

    if (data.role_id === 1) {
      if (!data.target_outcome_id) {
        res.status(400).json({
          message: 'target_outcome_id is required on client creation',
          error: -1,
        });
        return;
      }
    }

    if (data.role_id === 2) {
      if (data.target_outcome_id) {
        res.status(400).json({
          message: 'target_outcome_id is not required on counselor creation',
          error: -1,
        });
        return;
      }
    }

    if (data.role_id === 3) {
      if (!data.tenant_name) {
        res.status(400).json({ message: 'tenant_name is required', error: -1 });
        return;
      }
      if (data.target_outcome_id) {
        res.status(400).json({
          message: 'target_outcome_id is not required on tenant creation',
          error: -1,
        });
        return;
      }
      return;
    }

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

    if (data.role_id === 2) {
      if (!data.counselor_id) {
        res.status(400).json({ message: 'Mandatory fields are missing' });
        return;
      }
    }

    if (data.role_id === 3) {
      if (!data.counselor_id) {
        res.status(400).json({ message: 'Mandatory fields are missing' });
        return;
      }
    }

    if (data.role_id === 4) {
      if (!data.user_profile_id) {
        res.status(400).json({ message: 'Mandatory fields are missing' });
        return;
      }
    }

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
