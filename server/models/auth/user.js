//models/user.js

import DBconn from '../../config/db.config.js';
import knex from 'knex';
import Common from '../common.js';
import logger from '../../config/winston.js';
import AuthCommon from './authCommon.js';
import SendEmail from '../../middlewares/sendEmail.js';
import {
  forgetPasswordEmail,
  accountDeactivatedEmail,
  changePasswordEmail,
} from '../../utils/emailTmplt.js';
import UserProfile from '../userProfile.js';

const db = knex(DBconn.dbConn.development);

export default class User {
  //////////////////////////////////////////

  constructor() {
    this.common = new Common();
    this.authCommon = new AuthCommon();
    this.sendEmail = new SendEmail();
    this.userProfile = new UserProfile();
  }
  //////////////////////////////////////////

  async signUp(data) {
    try {
      const checkEmail = await this.common.getUserByEmail(data.email);
      if (checkEmail.length > 0) {
        logger.warn('Email already exists');
        return { message: 'Email already exists' };
      }

      const tmpUsr = {
        email: data.email.toLowerCase(),
        password: await this.authCommon.hashPassword(data.password),
        role_id: 2,
      };

      const postUsr = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users')
        .insert(tmpUsr);

      if (isNaN(postUsr)) {
        logger.error('Error creating user');
        return { message: 'Error creating user', error: -1 };
      }

      const tmpUsrProfile = {
        user_id: postUsr[0],
        user_first_name: data.user_first_name,
        user_last_name: data.user_last_name,
        user_typ_id: data.user_typ_id || 1,
      };

      const postUsrProfile =
        await this.userProfile.postUserProfile(tmpUsrProfile);

      if (postUsrProfile.error) {
        return postUsrProfile;
      }

      const rec = { message: 'User created successfully' };

      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Something went wrong' };
    }
  }

  //////////////////////////////////////////

  async signIn(data) {
    try {
      const checkEmail = await this.common.getUserByEmail(data.email);
      if (checkEmail.length === 0) {
        logger.warn('Email does not exist');
        return { message: 'Email does not exist' };
      }

      if (checkEmail[0].status_yn === 2) {
        logger.warn('Account is inactive');
        const emlMsg = accountDeactivatedEmail(data.email);
        const emlDeact = await this.sendEmail.sendMail(emlMsg);
        if (emlDeact.error) {
          logger.warn('Error sending email. Account is inactive.');
          return {
            message: 'Error sending email. Account is inactive.',
            error: -1,
          };
        }
        return {
          message: 'Account is inactive. Please contact the adminstrator.',
        };
      }

      const checkPassword = await this.authCommon.comparePassword(
        data.password,
        checkEmail[0].password,
      );

      if (!checkPassword) {
        logger.warn('Password is incorrect');
        return { message: 'Password is incorrect' };
      }

      if (checkPassword) {
        const usrPro = await this.common.getUserProfileByUserId(
          checkEmail[0].user_id,
        );
        var usr = {
          user_profile_id: usrPro[0].user_profile_id,
          user_first_name: usrPro[0].user_first_name,
          user_last_name: usrPro[0].user_last_name,
          user_typ_id: usrPro[0].user_typ_id,
          user_typ_cde: usrPro[0].user_typ_cde,
          role_id: usrPro[0].role_id,
          role_cde: usrPro[0].role_cde,
        };
      }

      const token = await this.authCommon.generateAccessToken(usr);

      const rec = { usr, token, message: 'Signed in successful' };

      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Something went wrong' };
    }
  }

  //////////////////////////////////////////

  async passwordReset(data) {
    try {
      const checkEmail = await this.common.getUserByEmail(data.email);
      if (checkEmail.length === 0) {
        logger.error('Email does not exist');
        return { message: 'Email does not exist' };
      }

      const newPassword = await this.authCommon.generatePassword();
      const hashPassword = await this.authCommon.hashPassword(newPassword);

      const updatePassword = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users')
        .where('email', data.email)
        .update({ password: hashPassword });

      if (updatePassword === 0) {
        logger.error('Error updating password');
        return { message: 'Error updating password', error: -1 };
      }

      const emlMsg = forgetPasswordEmail(data.email, newPassword);
      const emlReset = await this.sendEmail.sendMail(emlMsg);

      if (emlReset.error) {
        logger.error('Error sending email');
        return { message: 'Error sending email', error: -1 };
      }

      const rec = {
        message: 'Password reset successful. Please check your email.',
      };

      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Something went wrong' };
    }
  }

  //////////////////////////////////////////

  async sendOTPforVerification(data) {
    try {
      const checkEmail = await this.common.getUserByEmail(data.email);
      if (checkEmail.length === 0) {
        logger.error('Email does not exist');
        return { message: 'Email does not exist' };
      }

      const otp = await this.authCommon.generateOTP({ email: data.email });

      if (otp.error) {
        return otp.message;
      }

      return { message: 'OTP generated successfully. Please check your email' };
    } catch (error) {
      logger.error(error);
      return { message: 'Something went wrong' };
    }
  }

  //////////////////////////////////////////

  async verifyAccount(data) {
    try {
      const checkEmail = await this.common.getUserByEmail(data.email);
      if (checkEmail.length === 0) {
        logger.error('Email does not exist');
        return { message: 'Email does not exist' };
      }

      if (checkEmail[0].is_verified === 1) {
        logger.error('Account already verified');
        return { message: 'Account already verified' };
      }

      const verifyOTP = await this.authCommon.verifyAccount(data);
      if (verifyOTP.error) {
        return verifyOTP.message;
      }

      const updateAccount = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users')
        .where('email', data.email)
        .update({ is_verified: 1 });

      if (updateAccount === 0) {
        logger.error('Error verifying account');
        return { message: 'Error verifying account', error: -1 };
      }

      const rec = { message: 'Account verified successfully' };

      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Something went wrong' };
    }
  }

  //////////////////////////////////////////

  async changePassword(data) {
    try {
      const checkEmail = await this.common.getUserByEmail(data.email);
      if (checkEmail.length === 0) {
        logger.error('Email does not exist');
        return { message: 'Email does not exist' };
      }

      const checkPassword = await this.authCommon.comparePassword(
        data.old_password,
        checkEmail[0].password,
      );

      if (!checkPassword) {
        logger.error('Old password is incorrect');
        return { message: 'Old password is incorrect' };
      }

      const hashPassword = await this.authCommon.hashPassword(
        data.new_password,
      );

      const updatePassword = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users')
        .where('email', data.email)
        .update({ password: hashPassword });

      if (updatePassword === 0) {
        logger.error('Error updating password');
        return { message: 'Error updating password', error: -1 };
      }

      const emlMsg = changePasswordEmail(data.email);
      const emlChange = await this.sendEmail.sendMail(emlMsg);

      if (emlChange.error) {
        logger.error('Error sending email');
        return { message: 'Error sending email', error: -1 };
      }

      const rec = { message: 'Password changed successfully' };

      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Something went wrong' };
    }
  }
}
