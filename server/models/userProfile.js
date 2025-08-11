//models/userProfile.js

import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import User from './auth/user.js';
import Common from './common.js';
import AuthCommon from './auth/authCommon.js';
import SendEmail from '../middlewares/sendEmail.js';
import EmailTmplt from './emailTmplt.js';
import UserForm from './userForm.js';
import {
  clientWelcomeEmail,
  consentFormEmail,
  emailUpdateEmail,
  accountRestoredEmail,
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
    this.userForm = new UserForm();
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
        tenant_id: data.tenant_id,
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
      if (data.role_id === 2 || data.role_id === 1) {
        var tenantId = await this.common.getUserTenantId({
          user_profile_id: data.user_profile_id,
        });
        
        // Add debugging to see what tenantId contains
        console.log('tenantId result:', tenantId);
        
        // Check if getUserTenantId returned an error
        if (tenantId.error) {
          logger.error('Error getting tenant ID:', tenantId.message);
          return { message: tenantId.message, error: -1 };
        }
        
        // Check if tenantId is empty or undefined
        if (!tenantId || tenantId.length === 0) {
          logger.error('No tenant found for user_profile_id:', data.user_profile_id);
          return { message: 'No tenant found for the specified user profile', error: -1 };
        }
      }
      if (checkEmail.length > 0) {
        logger.error('Email already exists');

        console.log('checkEmail', checkEmail);
        // Check if account is deactivated and restore account
        if (checkEmail[0].status_yn == 'n') {
          logger.warn('Account is deactivated, restoring account');

          const newPassword = await this.authCommon.generatePassword();
          const hashPassword = await this.authCommon.hashPassword(newPassword);

          const updateUserProfile = await this.common.putUserProfileById({
            user_id: checkEmail[0].user_id,
            status_yn: 'y',
          });
          if (updateUserProfile === 0) {
            logger.error('Error restoring account');
            return { message: 'Error restoring account', error: -1 };
          }

          const updateUser = await this.common.putUserById({
            user_id: checkEmail[0].user_id,
            is_verified: 0,
            password: hashPassword,
          });
          if (updateUser === 0) {
            logger.error('Error restoring account');
            return { message: 'Error restoring account', error: -1 };
          }

          const emlMsg = accountRestoredEmail(data.email, newPassword);
          const emlRestore = this.sendEmail.sendMail(emlMsg);
          if (emlRestore.error) {
            logger.warn('Error sending email. Account is restored.');
            return {
              message: 'Error sending email. Account is restored.',
              error: -1,
            };
          }

          return { message: 'Account restored successfully' };
        }

        return { message: 'Email already exists', error: -1 };
      }

      // Generate a clam number if one is not provided
      if (!data.clam_num) {
        let isUnique = false;
        while (!isUnique) {
          const generateClamNum = await this.common.generateClamNum();
          const checkClamNum = await this.getUserProfileById({
            clam_num: generateClamNum,
          });

          if (!checkClamNum.rec || checkClamNum.rec.length === 0) {
            data.clam_num = generateClamNum;
            data.user_typ_id = 2; // Set the user type to external client because no clam number was provided
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
        // if tenantId is not provided, use the tenant_id from the user_profile_id
        tenant_id: tenantId ? tenantId[0].tenant_id : data.tenant_id,
      });

      if (postUser.error) {
        logger.error('Error creating user');
        return { message: 'Error creating user', error: -1 };
      }

      const tmpUsrProfile = {
        user_id: postUser,
        user_first_name: data.user_first_name.toLowerCase(),
        user_last_name: data.user_last_name.toLowerCase(),
        user_typ_id: data.user_typ_id || 1,
        user_phone_nbr: data.user_phone_nbr,
        clam_num: data.clam_num,
        tenant_id: tenantId ? tenantId[0].tenant_id : data.tenant_id,
      };

      const postUsrProfile = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_profile')
        .insert(tmpUsrProfile);

      if (isNaN(postUsrProfile)) {
        logger.error('Error creating user profile');
        return { message: 'Error creating user profile', error: -1 };
      }

      if (data.target_outcome_id) {
        const postUserTargetOutcome =
          this.userTargetOutcome.postUserTargetOutcome({
            user_profile_id: postUsrProfile[0],
            target_outcome_id: data.target_outcome_id,
            counselor_id: data.user_profile_id,
            tenant_id: tenantId ? tenantId[0].tenant_id : data.tenant_id,
          });

        if (postUserTargetOutcome.error) {
          logger.error('Error creating user target outcome');
          return { message: 'Error creating user target outcome', error: -1 };
        }
      }

      const postClientEnrollment = this.common.postClientEnrollment({
        user_id: data.user_profile_id, // This is the ID of the Counselor who is enrolling the client
        client_id: postUsrProfile[0], // i dont want this to be passed as an array but as a single value
        tenant_id: tenantId ? tenantId[0].tenant_id : data.tenant_id,
      });

      if (postClientEnrollment.error) {
        return postClientEnrollment;
      }

      const recConselor = await this.getUserProfileById({
        user_profile_id: data.user_profile_id,
      });

      if (recConselor.error) {
        return recConselor;
      }

      if (data.role_id === 1 && data.target_outcome_id) {
        ////////////////////////////////////////////////////////////////
        // Logic to send an email to the client with their login details
        const recTargetOutcome = await this.common.getTargetOutcomeById(
          data.target_outcome_id,
        );

        if (recTargetOutcome.error) {
          return recTargetOutcome;
        }

        const welcomeClientEmail = this.emailTmplt.sendWelcomeClientEmail({
          email: data.email,
          client_name: `${data.user_first_name} ${data.user_last_name}`,
          user_phone_nbr: data.user_phone_nbr,
          target_name: recTargetOutcome[0].target_name,
          counselor_name: `${recConselor.rec[0].user_first_name} ${recConselor.rec[0].user_last_name}`,
          counselor_email: recConselor.rec[0].email,
          counselor_phone_nbr: recConselor.rec[0].user_phone_nbr,
        });
      }

      if (data.role_id !== 1) {
        const emailSentWithPassword =
          this.emailTmplt.sendClientWelcomeWithPasswordEmail({
            email: data.email,
            password: clientPassword,
          });
      }

      if (data.role_id === 1) {
        const sendClientConsentForm = this.emailTmplt.sendClientConsentEmail({
          email: data.email,
          client_name: `${data.user_first_name} ${data.user_last_name}`,
          client_id: postUsrProfile[0],
          tenant_id: tenantId ? tenantId[0].tenant_id : data.tenant_id,
          counselor_id: data.user_profile_id,
        });
      }

      // Post consent form in user_form table
      const postConsentForm = await this.userForm.postUserForm([
        {
          client_id: postUsrProfile[0],
          counselor_id: data.user_profile_id,
          form_id: 23,
          is_sent: 1,
        },
      ]);

      if (postConsentForm.error) {
        return postConsentForm;
      }

      return { message: 'User profile created successfully', tenant_id: tenantId ? tenantId[0].tenant_id : data.tenant_id };
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

        const checkClientOrCounselorHasActiveSchedule =
          await this.checkClientOrCounselorHasActiveSchedule(user_profile_id);

        if (checkClientOrCounselorHasActiveSchedule.rec.length === 0) {
          logger.info('Client has no active schedule');
        }

        if (checkClientOrCounselorHasActiveSchedule.rec.length > 0) {
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
            counselor_id: getLatestUserTargetOutcome[0].counselor_id,
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

      if (!(data.role_id === 4) || !data.role_id) {
        if (data.user_profile_id) {
          query.where('user_profile_id', data.user_profile_id);
        }

        if (data.email) {
          query.where('email', data.email);
        }

        if (data.tenant_id) {
          query.where('tenant_id', data.tenant_id);
        }

        if (Object.keys(data).length === 1 && data.hasOwnProperty('role_id')) {
          if (data.role_id) {
            query.where('role_id', data.role_id);
          }
        }

        if (data.clam_num) {
          query.where('clam_num', data.clam_num);
        }

        if (data.counselor_id && data.role_id == 2) {
          const clientListFromEnrollment = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .distinct('client_id')
            .from('client_enrollments')
            .where('user_id', data.counselor_id);

          const clientListFromThrpyReq = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .distinct('client_id')
            .from('thrpy_req')
            .where('counselor_id', data.counselor_id);

          // Merge the two arrays and remove duplicate elements
          const clientList = [
            ...new Map(
              [...clientListFromEnrollment, ...clientListFromThrpyReq].map(
                (client) => [client.client_id, client],
              ),
            ).values(),
          ];

          const clientIds = clientList.map((client) => client.client_id);

          query.whereIn('user_profile_id', clientIds);
        }
      }
      console.log('query', query.toQuery());
      

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

  //////////////////////////////////////////

  async checkClientOrCounselorHasActiveSchedule(user_profile_id) {
    try {
      const checkUserHasActiveSchedule = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_user_profile')
        .where('user_profile_id', user_profile_id)
        .whereNotNull('counselor_ongoing_schedule')
        .whereNotNull('has_schedule');

      if (
        !checkUserHasActiveSchedule ||
        checkUserHasActiveSchedule.length === 0
      ) {
        return { message: 'User has no active schedule', rec: [] };
      }

      return {
        message: 'User has active schedule',
        rec: checkUserHasActiveSchedule,
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error checking user schedule', error: -1, rec: [] };
    }
  }
}
