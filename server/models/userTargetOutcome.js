import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';

const db = knex(DBconn.dbConn.development);

export default class UserTargetOutcome {
  //////////////////////////////////////////
  async postUserTargetOutcome(data) {
    try {
      const tmpUserTargetOutcome = {
        user_profile_id: data.user_profile_id,
        target_outcome_id: data.target_outcome_id,
        counselor_id: data.counselor_id,
      };

      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_target_outcome')
        .insert(tmpUserTargetOutcome);

      if (!result) {
        logger.error('Error creating user target outcome');
        return { message: 'Error creating user target outcome', error: -1 };
      }

      return { message: 'User target outcome created successfully' };
    } catch (error) {
      logger.error(error ? error?.sqlMessage : error);
      return { message: 'Error creating user target outcome', error: -1 };
    }
  }

  //////////////////////////////////////////
  async putUserTargetOutcome(data) {
    try {
      const tmpUserTargetOutcome = {
        user_profile_id: data.user_profile_id,
        target_outcome_id: data.target_outcome_id,
        counselor_id: data.counselor_id,
        status_enum: data.status_enum,
      };

      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_target_outcome')
        .where('user_target_id', data.user_target_id)
        .update(tmpUserTargetOutcome);

      if (!result) {
        logger.error('Error updating user target outcome');
        return { message: 'Error updating user target outcome', error: -1 };
      }

      return { message: 'User target outcome updated successfully' };
    } catch (error) {
      logger.error(error ? error?.sqlMessage : error);
      return { message: 'Error updating user target outcome', error: -1 };
    }
  }

  //////////////////////////////////////////
  async getUserTargetOutcome(data) {
    try {
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('user_target_outcome')
        .where('status_enum', 'y');

      if (data.user_target_id) {
        query.where('user_target_id', data.user_target_id);
      }

      if (data.user_profile_id) {
        query.where('user_profile_id', data.user_profile_id);
      }

      if (data.target_outcome_id) {
        query.where('target_outcome_id', data.target_outcome_id);
      }

      if (data.counselor_id) {
        query.where('counselor_id', data.counselor_id);
      }

      const rec = await query;

      if (!rec.length) {
        logger.error('Error fetching user target outcome');
        return { message: 'Error fetching user target outcome', error: -1 };
      }

      return rec;
    } catch (error) {
      console.log(error);
      logger.error(error ? error?.sqlMessage : error);
      return { message: 'Error fetching user target outcome', error: -1 };
    }
  }
}