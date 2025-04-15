import Notes from '../models/notes.js';
import joi from 'joi';
import Common from '../models/common.js';

export default class NotesService {
  //////////////////////////////////////////

  constructor() {
    this.common = new Common();
  }

  //////////////////////////////////////////

  async postNote(data) {
    const sessionId = await this.common.getServiceById({
      session_id: data.session_id,
    });
    const tenantId = await this.common.getUserTenantId({
      user_profile_id: sessionId[0].counselor_id,
    });
    data.tenant_id = Number(tenantId[0].tenant_id);

    const schema = joi.object({
      message: joi.string().required(),
      session_id: joi.number().required(),
      tenant_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const notes = new Notes();
    const result = await notes.postNote(data);
    return result;
  }

  //////////////////////////////////////////

  async putNoteById(data) {
    const schema = joi.object({
      note_id: joi.number().required(),
      message: joi.string().optional(),
      session_id: joi.number().optional(),
      status_yn: joi.string().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const notes = new Notes();
    return notes.putNoteById(data);
  }

  //////////////////////////////////////////

  async getNoteById(data) {
    const schema = joi.object({
      note_id: joi.number().optional(),
      session_id: joi.number().optional(),
      tenant_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const notes = new Notes();
    return notes.getNoteById(data);
  }
}
