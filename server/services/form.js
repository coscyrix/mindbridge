//services/form.js

import Form from '../models/form.js';
import joi from 'joi';

export default class FormService {
  //////////////////////////////////////////

  async postForm(data) {
    const schema = joi.object({
      form_cde: joi.string().required(),
      frequency_desc: joi.string().required(),
      svc_json: joi.array().required(),
      frequency_typ: joi.string().required(),
      session_position: joi
        .array()
        .items(joi.number())
        .when('frequency_typ', {
          is: joi.valid(1, 'static'),
          then: joi.required(),
        }),
      json_selection_typ: joi.string().when('frequency_typ', {
        is: joi.valid(1, 'static'),
        then: joi.required(),
      }),
      form_sequence_id: joi.number().when('frequency_typ', {
        is: joi.valid(2, 'dynamic'),
        then: joi.required(),
      }),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const form = new Form();
    const result = await form.postForm(data);
    return result;
  }

  //////////////////////////////////////////

  async putFormById(data) {
    const schema = joi.object({
      form_id: joi.number().required(),
      form_cde: joi.string().optional(),
      json_selection_typ: joi.string().optional(),
      svc_json: joi.object().optional(),
      session_position: joi.array().items(joi.number()).optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const form = new Form();
    return form.putFormById(data);
  }

  //////////////////////////////////////////

  async getFormById(data) {
    const schema = joi.object({
      form_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message };
    }

    const form = new Form();
    return form.getFormById(data);
  }
}
