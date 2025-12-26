import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import db from '../utils/db.js';
import logger from '../config/winston.js';

export default class Homework {
  //////////////////////////////////////////

  async postHomework(data) {
    try {
      const tmpHomework = {
        homework_title: data.homework_title,
        homework_filename: data.homework_filename,
        homework_file_path: data.homework_file_path,
        tenant_id: data.tenant_id,
        session_id: data.session_id,
        file_size: data.file_size,
        file_type: data.file_type,
      };

      const postHomework = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('homework')
        .insert(tmpHomework);

      if (!postHomework) {
        logger.error('Error creating homework');
        return { message: 'Error creating homework', error: -1 };
      }

      return { message: 'Homework created successfully', rec: postHomework };
    } catch (error) {
      logger.error(error);
      return { message: 'Error creating homework', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getHomeworkBySessionId(session_id) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('homework')
        .where('session_id', session_id)
        .orderBy('created_at', 'desc');

      if (!rec) {
        logger.error('Error getting homework by session id');
        return { message: 'Error getting homework by session id', error: -1 };
      }
      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting homework by session id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getHomeworkById(homework_id) {
    try {
      const rec = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('homework')
        .where('homework_id', homework_id)
        .andWhere('status_yn', 1)
        .first();

      if (!rec) {
        logger.error('Error getting homework by id');
        return { message: 'Error getting homework by id', error: -1 };
      }
      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting homework by id', error: -1 };
    }
  }

  //////////////////////////////////////////

  async deleteHomework(homework_id) {
    try {
      const tmpHomework = {
        status_yn: 2,
      };

      const deleteHomework = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('homework')
        .where('homework_id', homework_id)
        .update(tmpHomework);

      if (!deleteHomework) {
        logger.error('Error deleting homework');
        return { message: 'Error deleting homework', error: -1 };
      }

      return { message: 'Homework deleted successfully' };
    } catch (error) {
      logger.error(error);
      return { message: 'Error deleting homework', error: -1 };
    }
  }
}
