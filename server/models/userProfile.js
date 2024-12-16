//models/userProfile.js

import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import User from './auth/user.js';
import Common from './common.js';
import AuthCommon from './auth/authCommon.js';
import SendEmail from '../middlewares/sendEmail.js';
import { clientWelcomeEmail, emailUpdateEmail } from '../utils/emailTmplt.js';
import UserTargetOutcome from './userTargetOutcome.js';

const db = knex(DBconn.dbConn.development);

export default class UserProfile {
  //////////////////////////////////////////

  constructor() {
    this.common = new Common();
    this.authCommon = new AuthCommon();
    this.sendEmail = new SendEmail();
    this.userTargetOutcome = new UserTargetOutcome();
  }

  //////////////////////////////////////////

  async postUserProfile(data) {
    try {
      const tmpUsrProfile = {
        user_id: data.user_id,
        user_first_name: data.user_first_name.toLowerCase(),
        user_last_name: data.user_last_name.toLowerCase(),
        user_typ_id: data.user_typ_id || 2,
        user_phone_nbr: data.user_phone_nbr,
        clam_num: data.clam_num,
      };

      const postUsrProfile = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_profile')
        .insert(tmpUsrProfile);

      if (isNaN(postUsrProfile)) {
        logger.error('Error creating user profile');
        return { message: 'Error creating user profile', error: -1 };
      }

      return { message: 'User profile created successfully' };
    } catch (error) {
      logger.error(error);

      return { message: 'Error creating user profile', error: -1 };
    }
  }

  //////////////////////////////////////////

  async userPostClientProfile(data) {
    try {
      const checkEmail = await this.common.getUserByEmail(data.email);
      if (checkEmail.length > 0) {
        logger.error('Email already exists');
        return { message: 'Email already exists', error: -1 };
      }

      const clientPassword = await this.authCommon.generatePassword(); // Generate a random password for the client
      const postUser = await this.common.postUserCOMMON({
        email: data.email,
        password: clientPassword,
      });

      if (postUser.error) {
        logger.error('Error creating user');
        return { message: 'Error creating user', error: -1 };
      }

      const tmpUsrProfile = {
        user_id: postUser,
        user_first_name: data.user_first_name.toLowerCase(),
        user_last_name: data.user_last_name.toLowerCase(),
        user_typ_id: data.user_typ_id || 2,
        user_phone_nbr: data.user_phone_nbr,
        clam_num: data.clam_num,
      };

      const postUsrProfile = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_profile')
        .insert(tmpUsrProfile);

      if (isNaN(postUsrProfile)) {
        logger.error('Error creating user profile');
        return { message: 'Error creating user profile', error: -1 };
      }

      const postUserTargetOutcome =
        await this.userTargetOutcome.postUserTargetOutcome({
          user_profile_id: postUsrProfile[0],
          target_outcome_id: data.target_outcome_id,
          counselor_id: data.user_profile_id,
        });

      if (postUserTargetOutcome.error) {
        logger.error('Error creating user target outcome');
        return { message: 'Error creating user target outcome', error: -1 };
      }

      const postClientEnrollment = await this.common.postClientEnrollment({
        user_id: data.user_profile_id, // This is the ID of the Counselor who is enrolling the client
        client_id: postUsrProfile[0], // i dont want this to be passed as an array but as a single value
      });

      if (postClientEnrollment.error) {
        return postClientEnrollment;
      }

      const emailSent = clientWelcomeEmail(data.email, clientPassword);
      const sendEmail = await this.sendEmail.sendMail(emailSent);

      if (sendEmail.error) {
        logger.error('Error sending email');
        return { message: 'Error sending email', error: -1 };
      }

      return { message: 'User profile created successfully' };
    } catch (error) {
      logger.error(error);

      return { message: 'Error creating user profile', error: -1 };
    }
  }

  //////////////////////////////////////////

  async putUserProfile(data, user_profile_id) {
    try {
      const tmpUsrProfile = {
        user_first_name: data.user_first_name.toLowerCase(),
        user_last_name: data.user_last_name.toLowerCase(),
        user_phone_nbr: data.user_phone_nbr,
        user_typ_id: data.user_typ_id,
        clam_num: data.clam_num,
      };

      const putUsrProfile = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_profile')
        .where('user_profile_id', user_profile_id)
        .update(tmpUsrProfile);

      if (!putUsrProfile) {
        logger.error('Error updating user profile');
        return { message: 'Error updating user profile', error: -1 };
      }

      if (data.email) {
        const tmpUsr = {
          email: data.email.toLowerCase(),
        };

        const getUsr = await this.getUserProfileById(user_profile_id);

        const putUsr = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('users')
          .where('user_id', getUsr.rec[0].user_id)
          .update(tmpUsr);

        if (!putUsr) {
          logger.error('Error updating user email');
          return { message: 'Error updating user email', error: -1 };
        }

        const emailSent = emailUpdateEmail(data.email);
        const sendEmail = await this.sendEmail.sendMail(emailSent);

        if (sendEmail.error) {
          logger.error('Error sending email');
          return { message: 'Error sending email', error: -1 };
        }
      }

      return { message: 'User profile updated successfully' };
    } catch (error) {
      logger.error(error);
      console.log(error);

      return { message: 'Error updating user profile', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getUserProfileById(data) {
    try {
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select()
        .from('v_user_profile');

      if (data.user_profile_id) {
        query.where('user_profile_id', data.user_profile_id);
      }

      if (data.email) {
        query.where('email', data.email);
      }

      const rec = await query;

      if (!rec.length) {
        logger.warn('User profile not found');
        return { message: 'User profile not found' };
      }

      return { message: 'User profile found', rec };
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting user profile', error: -1 };
    }
  }

  //////////////////////////////////////////

  async delUserProfile(user_profile_id) {
    try {
      const statusTmp = {
        status_yn: 2,
      };

      const delUsrProfile = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_profile')
        .where('user_profile_id', user_profile_id)
        .update(statusTmp);

      if (!delUsrProfile) {
        logger.error('Error deleting user profile');
        return { message: 'Error deleting user profile', error: -1 };
      }

      return { message: 'User profile deleted successfully' };
    } catch (error) {
      logger.error(error);
      return { message: 'Error deleting user profile', error: -1 };
    }
  }
}
