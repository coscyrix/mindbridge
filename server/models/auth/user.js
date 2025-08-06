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
  accountVerificationEmail,
  changePasswordEmail,
  accountRestoredEmail,
} from '../../utils/emailTmplt.js';
import UserProfile from '../userProfile.js';
import dotenv from 'dotenv';
import CounselorProfile from '../counselorProfile.js';
import Service from '../service.js';

dotenv.config();

const db = knex(DBconn.dbConn.development);

export default class User {
  //////////////////////////////////////////

  constructor() {
    this.common = new Common();
    this.authCommon = new AuthCommon();
    this.sendEmail = new SendEmail();
    this.userProfile = new UserProfile();
    this.counselorProfile = new CounselorProfile();
  }
  //////////////////////////////////////////

  async signUp(data) {
    try {
      const checkEmail = await this.common.getUserByEmail(data.email);
      // console.log('checkEmail', checkEmail);
      if (checkEmail.length > 0) {
        logger.warn('Email already exists');

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

          const sendOTP = this.sendOTPforVerification({ email: data.email });
          if (sendOTP.error) {
            return sendOTP.message;
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

      const tmpUsr = {
        email: data.email.toLowerCase(),
        password: await this.authCommon.hashPassword(data.password),
        role_id: 2,
        tenant_id: process.env.TENANT_ID,
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

      const sendOTP = this.sendOTPforVerification({ email: data.email });
      if (sendOTP.error) {
        return sendOTP.message;
      }

      const rec = { message: 'User created successfully' };

      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Something went wrong', error: -1 };
    }
  }

  //////////////////////////////////////////

  async signIn(data) {
    try {
      const checkEmail = await this.common.getUserByEmail(data.email);
      if (checkEmail.length === 0) {
        logger.warn('Email does not exist');
        return { message: 'Email does not exist', error: -1 };
      }

      // Check if account is deactivated
      if (checkEmail[0].status_yn == 'n') {
        logger.warn('Account is deactivated');

        // Send an Account Deactivated email
        const emlMsg = accountDeactivatedEmail(data.email);
        const emlDeact = this.sendEmail.sendMail(emlMsg);
        if (emlDeact.error) {
          logger.warn('Error sending email. Account is deactivated.');
          return {
            message: 'Error sending email. Account is deactivated.',
            error: -1,
          };
        }

        return { message: 'Account is deactivated', error: -1 };
      }

      // Check if account is verified
      // if (checkEmail[0].is_verified === 0) {
      //   logger.warn('Account is inactive');

      //   // Send an OTP for verification if account is not deactivated
      //   if (checkEmail[0].status_yn == 'y') {
      //     // Send an Inactive Account email
      //     const emlInactiveMsg = accountVerificationEmail(data.email);
      //     const sendInactiveEml = this.sendEmail.sendMail(emlInactiveMsg);
      //     if (sendInactiveEml.error) {
      //       logger.warn('Error sending email. Account is deactivated.');
      //       return {
      //         message: 'Error sending email. Account is deactivated.',
      //         error: -1,
      //       };
      //     }

      //     const sendOTP = this.sendOTPforVerification({ email: data.email });
      //   }

      //   return {
      //     message: 'Account is inactive. Please contact the adminstrator.',
      //     error: -1,
      //   };
      // }

      const checkPassword = await this.authCommon.comparePassword(
        data.password,
        checkEmail[0].password,
      );

      if (!checkPassword) {
        logger.warn('Password is incorrect');
        return { message: 'Password is incorrect', error: -1 };
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
          tenant_id: usrPro[0].tenant_id,
          tenant_name: usrPro[0].tenant_name,
        };
        // If user is a counselor, add complete counselor profile data and tenant object
        if (usr.role_id === 2) {
          console.log('User is a counselor, user_profile_id:', usr.user_profile_id);
          
          const counselorProfile = await this.counselorProfile.getCounselorProfile({ user_profile_id: usr.user_profile_id });
          console.log('Counselor profile result:', counselorProfile);
          
          if (counselorProfile.rec && counselorProfile.rec.length > 0) {
            usr.counselor_profile = counselorProfile.rec[0];
            usr.counselor_profile_id = counselorProfile.rec[0].counselor_profile_id;
            console.log('Counselor profile added to user:', usr.counselor_profile);
          } else {
            console.log('No counselor profile found for user_profile_id:', usr.user_profile_id);
          }
          
          // Get complete tenant information for counselor
          console.log('Getting tenant info for counselor, tenant_id:', usr.tenant_id);
          
          let tenantResult = await this.common.getTenantByTenantGeneratedId(usr.tenant_id);
          if(tenantResult.error){
            tenantResult = await this.common.getTenantByTenantId(usr.tenant_id);
          }
          console.log('Tenant result for counselor:', tenantResult);
          
          if (!tenantResult.error && tenantResult.length > 0) {
            usr.tenant = tenantResult[0];
            console.log('Tenant object added to counselor user:', usr.tenant);
          } else {
            console.log('Failed to get tenant info for counselor:', tenantResult);
          }
        }
        
        // If user is a tenant (role_id === 3), get tenant details and check services
        if (usr.role_id === 3) {
          console.log('User is a tenant, tenant_id:', usr.tenant_id);
          
          // Get complete tenant information
          let tenantResult = await this.common.getTenantByTenantGeneratedId(usr.tenant_id);
          if(tenantResult.error){
            tenantResult = await this.common.getTenantByTenantId(usr.tenant_id);
          }
          console.log('Tenant result:', tenantResult);
          
          if (!tenantResult.error && tenantResult.length > 0) {
            usr.tenant = tenantResult[0];
            console.log('Tenant object added to user:', usr.tenant);
          } else {
            console.log('Failed to get tenant info:', tenantResult);
          }
          
          // Check if tenant has any services
          const service = new Service();
          const servicesResult = await service.getServiceById({ tenant_id: usr.tenant_id });
          usr.has_services = !servicesResult.error && servicesResult.rec && servicesResult.rec.length > 0;
          usr.services_count = servicesResult.rec ? servicesResult.rec.length : 0;
        }
      }

      const sendOTP = this.sendOTPforVerification({ email: data.email });
      if (sendOTP.error) {
        return sendOTP.message;
      }

      const token = await this.authCommon.generateAccessToken(usr);

      const rec = { usr, token, message: 'Signed in successful' };

      return rec;
    } catch (error) {
      console.log('error', error);
      logger.error(error);
      return { message: 'Something went wrong', error: -1 };
    }
  }

  //////////////////////////////////////////

  async passwordReset(data) {
    try {
      const checkEmail = await this.common.getUserByEmail(data.email);
      if (checkEmail.length === 0) {
        logger.error('Email does not exist');
        return { message: 'Email does not exist', error: -1 };
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
      return { message: 'Something went wrong', error: -1 };
    }
  }

  //////////////////////////////////////////

  async sendOTPforVerification(data) {
    try {
      const checkEmail = await this.common.getUserByEmail(data.email);
      if (checkEmail.length === 0) {
        logger.error('Email does not exist');
        return { message: 'Email does not exist', error: -1 };
      }

      const otp = await this.authCommon.generateOTP({ email: data.email });

      if (otp.error) {
        return otp.message;
      }

      return { message: 'OTP generated successfully. Please check your email' };
    } catch (error) {
      logger.error(error);
      return { message: 'Something went wrong', error: -1 };
    }
  }

  //////////////////////////////////////////

  async verifyAccount(data) {
    try {
      const checkEmail = await this.common.getUserByEmail(data.email);
      if (checkEmail.length === 0) {
        logger.error('Email does not exist');
        return { message: 'Email does not exist', error: -1 };
      }

      if (checkEmail[0].is_verified === 1) {
        logger.error('Account already verified');
        return { message: 'Account already verified', error: -1 };
      }

      const verifyOTP = await this.authCommon.verifyAccount(data);
      if (verifyOTP.error) {
        return { message: verifyOTP.message, error: -1 };
      }

      // const updateAccount = await db
      //   .withSchema(`${process.env.MYSQL_DATABASE}`)
      //   .from('users')
      //   .where('email', data.email)
      //   .update({ is_verified: 1 });

      // if (updateAccount === 0) {
      //   logger.error('Error verifying account');
      //   return { message: 'Error verifying account', error: -1 };
      // }

      const rec = { message: 'Account verified successfully' };

      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Something went wrong', error: -1 };
    }
  }

  //////////////////////////////////////////

  async changePassword(data) {
    try {
      const checkEmail = await this.common.getUserByEmail(data.email);
      if (checkEmail.length === 0) {
        logger.error('Email does not exist');
        return { message: 'Email does not exist', error: -1 };
      }

      const checkPassword = await this.authCommon.comparePassword(
        data.old_password,
        checkEmail[0].password,
      );

      if (!checkPassword) {
        logger.error('Old password is incorrect');
        return { message: 'Old password is incorrect', error: -1 };
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
      return { message: 'Something went wrong', error: -1 };
    }
  }

  //////////////////////////////////////////

  async checkManagerServices(tenant_id) {
    try {
      const service = new Service();
      const servicesResult = await service.getServiceById({ tenant_id });
      
      const has_services = !servicesResult.error && servicesResult.rec && servicesResult.rec.length > 0;
      const services_count = servicesResult.rec ? servicesResult.rec.length : 0;
      
      // Get complete tenant information
      const tenantResult = await this.common.getTenantByTenantId(tenant_id);
      const tenant = !tenantResult.error && tenantResult.length > 0 ? tenantResult[0] : null;
      
      return {
        message: 'Manager services check completed',
        has_services,
        services_count,
        services: servicesResult.rec || [],
        tenant: tenant
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error checking manager services', error: -1 };
    }
  }
}
