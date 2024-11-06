// services/user.js

import User from '../models/auth/user.js';
import joi from 'joi';

export default class UserService {
  //////////////////////////////////////////

  async signUp(data) {
    const schema = joi.object({
      user_first_name: joi.string().min(2).required(),
      user_last_name: joi.string().min(2).required(),
      email: joi.string().email().required(),
      password: joi.string().min(8).required(),
      user_typ_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const user = new User();
    return user.signUp(data);
  }

  //////////////////////////////////////////

  async signIn(data) {
    const schema = joi.object({
      email: joi.string().email().required(),
      password: joi.string().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const user = new User();
    return user.signIn(data);
  }

  //////////////////////////////////////////

  async passwordReset(data) {
    const schema = joi.object({
      email: joi.string().email().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const user = new User();
    return user.passwordReset(data);
  }

  //////////////////////////////////////////

  async sendOTPforVerification(data) {
    const schema = joi.object({
      email: joi.string().email().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const user = new User();
    return user.sendOTPforVerification(data);
  }

  //////////////////////////////////////////

  async verifyAccount(data) {
    const schema = joi.object({
      email: joi.string().email().required(),
      otp: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const user = new User();
    return user.verifyAccount(data);
  }

  async changePassword(data) {
    const schema = joi.object({
      email: joi.string().email().required(),
      old_password: joi.string().required(),
      new_password: joi.string().min(8).required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const user = new User();
    return user.changePassword(data);
  }
}
