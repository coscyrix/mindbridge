import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import DBconn from '../config/db.config.js';
const knex = require('knex');;
import logger from '../config/winston.js';

const db = knex(DBconn.dbConn.development);

export default class Notes {
  //////////////////////////////////////////

  async postNote(data) {
    try {
      const tmpNote = {
        message: data.message,
        session_id: data.session_id,
        tenant_id: data.tenant_id,
      };

      const postNote = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('notes')
        .insert(tmpNote);

      if (!postNote) {
        logger.error('Error creating note');
        return { message: 'Error creating note', error: -1 };
      }

      return { message: 'Note created successfully', rec: postNote };
    } catch (error) {
      logger.error(error);
      return { message: 'Error creating note', error: -1 };
    }
  }

  //////////////////////////////////////////

  async putNoteById(data) {
    try {
      const tmpNote = {
        ...(data.message && { message: data.message }),
        ...(data.session_id && { session_id: data.session_id }),
        ...(data.status_yn && { status_yn: data.status_yn }),
      };

      const putNote = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('notes')
        .where('id', data.note_id)
        .update(tmpNote);

      if (!putNote) {
        logger.error('Error updating note');
        return { message: 'Error updating note', error: -1 };
      }

      return { message: 'Note updated successfully' };
    } catch (error) {
      logger.error(error);
      return { message: 'Error updating note', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getNoteById(data) {
    try {
      let query = db.withSchema(`${process.env.MYSQL_DATABASE}`).from('notes');

      if (data.note_id) {
        query = query.andWhere('id', data.note_id);
      }

      if (data.session_id) {
        query = query.andWhere('session_id', data.session_id);
      }

      if (data.tenant_id) {
        query = query.andWhere('tenant_id', data.tenant_id);
      }

      const rec = await query;
      if (!rec) {
        logger.error('Error getting note');
        return { message: 'Error getting note', error: -1 };
      }
      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting note', error: -1 };
    }
  }
}
