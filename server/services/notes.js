import Notes from '../models/notes.js';
import joi from 'joi';

export default class NotesService {
  //////////////////////////////////////////

  async postNote(data) {
    const schema = joi.object({
      message: joi.string().required(),
      session_id: joi.number().required(),
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
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const notes = new Notes();
    return notes.getNoteById(data);
  }
}
