//models/auth/authCommon.js

import bcrypt from 'bcrypt';
import dotenv, { parse } from 'dotenv';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import DBconn from '../../config/db.config.js';
import knex from 'knex';
import logger from '../../config/winston.js';
import SendEmail from '../../middlewares/sendEmail.js';
import { otpEmail } from '../../utils/emailTmplt.js';

const db = knex(DBconn.dbConn.development);
dotenv.config();

export default class AuthCommon {
  ///////////////////////////////////////////

  constructor() {
    this.sendEmail = new SendEmail();
  }
  //////////////////////////////////////////

  async hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  ////////////////////////////////////////////

  async comparePassword(plainTextPassword, hashedPassword) {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }

  ////////////////////////////////////////////

  async generateAccessToken(data) {
    'use strict';

    if (!data) throw new Error('Please enter valid user');

    const payload = {
      username: data.email,
      tenant_id: data.tenant_id,
      isAdmin: true,
    };
    //const secret = 's3cr3t';
    const secret = process.env.JWT_TOKEN_SECRET;

    const expiresIn = 3600 * 1;
    const token = jwt.sign(payload, secret, { expiresIn });
    return token;
  }

  ////////////////////////////////////////////

  async generatePassword() {
    const length = 12;

    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let retVal = '';
    for (let i = 0, n = charset.length; i < length; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
  }

  ////////////////////////////////////////////

  async generateOTP(data) {
    // Generate OTP using speakeasy
    const otp = speakeasy.totp({
      secret: process.env.OTP_SECRET,
      encoding: 'base32',
    });

    // Invalidate previous OTPs for this email
    await this.invalidatePreviousOTPs(data.email);

    const saveOTP = await this.postOTP({
      email: data.email,
      otp: otp,
      expires_at: new Date(Date.now() + 300000).toISOString(), // OTP expires in 5 minutes
    });

    if (saveOTP.error) {
      logger.error('Error saving OTP');
      return { message: 'Error saving OTP', error: -1 };
    }

    // Send OTP to user's email
    const otpMsg = otpEmail(data.email, otp);
    const sendOTP = await this.sendEmail.sendMail(otpMsg);

    if (sendOTP.error) {
      logger.error('Error sending OTP');
      return { message: 'Error sending OTP', error: -1 };
    }

    return { message: 'OTP generated successfully. Please check your email' };
  }

  ////////////////////////////////////////////

  async postOTP(data) {
    const tmpOTP = {
      email: data.email,
      otp: data.otp,
      expires_at: data.expires_at,
      should_del_at: new Date(Date.now() + 600000).toISOString(), // Delete OTP after 10 minutes
    };

    try {
      await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('otp_codes')
        .insert(tmpOTP);
      return { message: 'OTP inserted successfully' };
    } catch (error) {
      logger.error('Error inserting OTP:', error);
      return { message: 'Error inserting OTP', error: -1 };
    }
  }

  ////////////////////////////////////////////

  async getUserByEmail(email) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select()
        .where('email', email)
        .from('users');

      return rec;
    } catch (error) {
      return error;
    }
  }

  ////////////////////////////////////////////

  async invalidatePreviousOTPs(email) {
    try {
      await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('otp_codes')
        .where('email', email)
        .del();
    } catch (error) {
      logger.warn('Failed to invalidate previous OTPs:', error);
    }
  }

  ////////////////////////////////////////////

  async verifyAccount(data) {
    const checkEmail = await this.getUserByEmail(data.email);
    if (!checkEmail) {
      logger.warn('Email does not exist');
      return { message: 'Email does not exist' };
    }

    const checkOTPArray = await db
      .withSchema(`${process.env.MYSQL_DATABASE}`)
      .from('otp_codes')
      .where('email', data.email); // Get all OTPs for this email

    if (!checkOTPArray.length) {
      logger.warn('No OTP found for this account');
      return { message: 'No OTP found for this account', error: -1 };
    }

    let validOTP = null;
    for (const otpRecord of checkOTPArray) {
      if (otpRecord.otp === parseInt(data.otp)) {
        validOTP = otpRecord;
        break;
      }
    }

    if (!validOTP) {
      logger.warn('Invalid OTP');
      return { message: 'Invalid OTP', error: -1 };
    }

    // Ensure consistent timezone comparison by converting to UTC
    const currentTime = new Date().toISOString();
    const expiresAt = new Date(validOTP.expires_at).toISOString();

    if (expiresAt < currentTime) {
      logger.warn('OTP has expired');
      return { message: 'OTP has expired', error: -1 };
    }

    // Use transaction to make the verification and OTP update atomic
    try {
      await db.transaction(async (trx) => {
        // Update the user's verification status
        // await trx
        //   .withSchema(`${process.env.MYSQL_DATABASE}`)
        //   .from('users')
        //   .where('email', data.email)
        //   .update({ is_verified: 1 });

        // Delete the OTP as used
        await trx
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('otp_codes')
          .where('email', data.email)
          .andWhere('otp', data.otp)
          .del();

        // Delete all expired OTPs
        await trx
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('otp_codes')
          .where('should_del_at', '<', currentTime)
          .del();
      });

      return { message: 'OTP verified successfully' };
    } catch (error) {
      logger.error('Error during OTP verification process:', error);
      return { message: 'Error during verification', error: -1 };
    }
  }
}
