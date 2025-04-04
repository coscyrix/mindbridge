import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';

const db = knex(DBconn.dbConn.development);

export default class Homework {
  //////////////////////////////////////////

  async postHomework(data) {
    try {
      const tmpHomework = {
        homework_title: data.homework_title,
        homework_filename: data.homework_filename, // change: assign filename from data
        tenant_id: data.tenant_id,
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
}
