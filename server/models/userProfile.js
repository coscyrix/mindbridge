//models/userProfile.js

import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import User from './auth/user.js';
import Common from './common.js';
import AuthCommon from './auth/authCommon.js';
import SendEmail from '../middlewares/sendEmail.js';
import EmailTmplt from './emailTmplt.js';
import {
  clientWelcomeEmail,
  consentFormEmail,
  emailUpdateEmail,
  welcomeAccountDetailsEmail,
} from '../utils/emailTmplt.js';
import UserTargetOutcome from './userTargetOutcome.js';

const db = knex(DBconn.dbConn.development);

export default class UserProfile {
  //////////////////////////////////////////

  constructor() {
    this.common = new Common();
    this.authCommon = new AuthCommon();
    this.sendEmail = new SendEmail();
    this.userTargetOutcome = new UserTargetOutcome();
    this.emailTmplt = new EmailTmplt();
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

      if (!data.clam_num) {
        let isUnique = false;
        while (!isUnique) {
          const generateClamNum = await this.common.generateClamNum();
          const checkClamNum = await this.getUserProfileById({
            clam_num: generateClamNum,
          });

          if (!checkClamNum.rec || checkClamNum.rec.length === 0) {
            data.clam_num = generateClamNum;
            isUnique = true;
          } else {
            logger.warn(
              'Generated clam number is already in use, generating a new one',
            );
          }
        }
      }

      const checkClamNum = await this.getUserProfileById({
        clam_num: data.clam_num,
      });
      if (checkClamNum.rec && checkClamNum.rec.length > 0) {
        logger.error('Clam number is already in use');
        return { message: 'Clam number already exists', error: -1 };
      }

      const clientPassword = await this.authCommon.generatePassword(); // Generate a random password for the client
      const postUser = await this.common.postUserCOMMON({
        email: data.email,
        password: clientPassword,
        role_id: data.role_id,
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
        this.userTargetOutcome.postUserTargetOutcome({
          user_profile_id: postUsrProfile[0],
          target_outcome_id: data.target_outcome_id,
          counselor_id: data.user_profile_id,
        });

      if (postUserTargetOutcome.error) {
        logger.error('Error creating user target outcome');
        return { message: 'Error creating user target outcome', error: -1 };
      }

      const postClientEnrollment = this.common.postClientEnrollment({
        user_id: data.user_profile_id, // This is the ID of the Counselor who is enrolling the client
        client_id: postUsrProfile[0], // i dont want this to be passed as an array but as a single value
      });

      if (postClientEnrollment.error) {
        return postClientEnrollment;
      }

      ////////////////////////////////////////////////////////////////
      // Logic to send an email to the client with their login details
      const recTargetOutcome = await this.common.getTargetOutcomeById(
        data.target_outcome_id,
      );

      if (recTargetOutcome.error) {
        return recTargetOutcome;
      }

      const recConselor = await this.getUserProfileById({
        user_profile_id: data.user_profile_id,
      });

      if (recConselor.error) {
        return recConselor;
      }

      const welcomeClientEmail = this.emailTmplt.sendWelcomeClientEmail({
        email: data.email,
        client_name: `${data.user_first_name} ${data.user_last_name}`,
        user_phone_nbr: data.user_phone_nbr,
        target_name: recTargetOutcome[0].target_name,
        counselor_name: `${recConselor.rec[0].user_first_name} ${recConselor.rec[0].user_last_name}`,
      });

      const emailSentWithPassword =
        this.emailTmplt.sendClientWelcomeWithPasswordEmail({
          email: data.email,
          password: clientPassword,
        });

      const sendClientConsentForm = this.emailTmplt.sendClientConsentEmail({
        email: data.email,
        client_name: `${data.user_first_name} ${data.user_last_name}`,
        form_url: `https://mindbridge/consent-form/${data.clam_num}`,
      });

      return { message: 'User profile created successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);

      return { message: 'Error creating user profile', error: -1 };
    }
  }

  //////////////////////////////////////////

  async putUserProfile(data, user_profile_id) {
    try {
      const tmpUsrProfile = {
        ...(data.user_first_name && { user_first_name: data.user_first_name }),
        ...(data.user_last_name && { user_last_name: data.user_last_name }),
        ...(data.user_phone_nbr && { user_phone_nbr: data.user_phone_nbr }),
        ...(data.user_typ_id && { user_typ_id: data.user_typ_id }),
        ...(data.clam_num && { clam_num: data.clam_num }),
        ...(data.status_yn && { status_yn: data.status_yn }),
      };

      if (data.status_yn === 2) {
        const checkActiveSchedule =
          await this.checkClientHasActiveSchedule(user_profile_id);

        if (checkActiveSchedule.rec.length === 0) {
          logger.info('Client has no active schedule');
        }

        if (checkActiveSchedule.rec.length > 0) {
          logger.info('Client has an active schedule');
          return { message: 'Client has an active schedule', error: -1 };
        }
      }

      if (data.target_outcome_id) {
        const getLatestUserTargetOutcome =
          await this.userTargetOutcome.getUserTargetOutcomeLatest({
            user_profile_id: user_profile_id,
          });

        if (getLatestUserTargetOutcome.error) {
          return getLatestUserTargetOutcome;
        }

        const disableUserTargetOutcome =
          await this.userTargetOutcome.putUserTargetOutcome({
            user_target_id: getLatestUserTargetOutcome[0].user_target_id,
            user_profile_id: user_profile_id,
            status_enum: 'n',
          });

        if (disableUserTargetOutcome.error) {
          return disableUserTargetOutcome;
        }

        const postUserTargetOutcome =
          await this.userTargetOutcome.postUserTargetOutcome({
            user_profile_id: user_profile_id,
            target_outcome_id: data.target_outcome_id,
            counselor_id: data.counselor_id,
          });

        if (postUserTargetOutcome.error) {
          return postUserTargetOutcome;
        }
      }

      if (tmpUsrProfile && Object.keys(tmpUsrProfile).length > 0) {
        const putUsrProfile = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('user_profile')
          .where('user_profile_id', user_profile_id)
          .update(tmpUsrProfile);

        if (!putUsrProfile) {
          logger.error('Error updating user profile');
          return { message: 'Error updating user profile', error: -1 };
        }
      }

      if (data.email || data.role_id) {
        const tmpUsr = {
          ...(data.email && { email: data.email.toLowerCase() }),
          ...(data.role_id && { role_id: data.role_id }),
        };

        const getUsr = await this.getUserProfileById({
          user_profile_id: user_profile_id,
        });

        // console.log('getUsr', getUsr);

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

      // if (data.role_id) {
      //   query.where('role_id', data.role_id);
      // }

      if (data.clam_num) {
        query.where('clam_num', data.clam_num);
      }

      if (data.counselor_id && data.role_id == 2) {
        const clientList = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .distinct('client_id')
          .from('thrpy_req')
          .where('counselor_id', data.counselor_id);

        const clientIds = clientList.map((client) => client.client_id);

        query.whereIn('user_profile_id', clientIds);
      }

      const rec = await query;

      if (!rec.length) {
        logger.warn('User profile not found');
        return { message: 'User profile not found', rec: [] };
      }

      return { message: 'User profile found', rec };
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting user profile', error: -1, rec: [] };
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

  //////////////////////////////////////////

  async checkClientHasActiveSchedule(id) {
    try {
      const checkThrpyReq = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_thrpy_req')
        .where('status_yn', 1)
        .andWhere('client_id', id)
        .andWhere('thrpy_status', 1);

      if (!checkThrpyReq) {
        logger.error('Error checking user schedule');
        return { message: 'Error checking user schedule', error: -1, rec: [] };
      }

      if (checkThrpyReq.length > 0) {
        return { message: 'User has active schedule', rec: checkThrpyReq };
      }

      return { message: 'User has no active schedule', rec: [] };
    } catch (error) {
      logger.error(error);
      return { message: 'Error checking user schedule', error: -1, rec: [] };
    }
  }
}
