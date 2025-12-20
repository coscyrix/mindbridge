import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import UserForm from '../models/userForm.js';
const joi = require('joi');;
import Common from '../models/common.js';

export default class UserFormService {
  //////////////////////////////////////////

  async postUserForm(data) {
    const tenantId = await this.common.getUserTenantId({
      user_profile_id: data.counselor_id,
    });
    data.tenant_id = Number(tenantId[0].tenant_id);

    const schema = joi.object({
      client_id: joi.number().required(),
      counselor_id: joi.number().required(),
      form_id: joi.number().required(),
      session_id: joi.number().required(),
      tenant_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const userForm = new UserForm();
    const result = await userForm.postUserForm(data);
    return result;
  }

  //////////////////////////////////////////

  async putUserFormById(data) {
    const schema = joi.object({
      user_form_id: joi.number().required(),
      client_id: joi.number().optional(),
      counselor_id: joi.number().optional(),
      form_id: joi.number().optional(),
      session_id: joi.number().optional(),
      is_sent: joi.boolean().optional(),
      status_yn: joi.boolean().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const userForm = new UserForm();
    return userForm.putUserFormById(data);
  }

  //////////////////////////////////////////

  async getUserFormById(data) {
    const schema = joi.object({
      user_form_id: joi.number().optional(),
      session_id: joi.number().optional(),
      req_id: joi.number().optional(),
      form_id: joi.number().optional(),
      client_id: joi.number().optional(),
      counselor_id: joi.number().optional(),
      start_date: joi.date().optional(),
      end_date: joi.date().optional(),
      form_submit: joi
        .alternatives()
        .try(joi.boolean(), joi.number().valid(0, 1))
        .optional(),
      is_sent: joi
        .alternatives()
        .try(joi.boolean(), joi.number().valid(0, 1))
        .optional(),
      tenant_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const userForm = new UserForm();
    return userForm.getUserFormByFormIdAndClientId(data);
  }
}
