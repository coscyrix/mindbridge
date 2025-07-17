import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';

const db = knex(DBconn.dbConn.development);

export default class CounselorTargetOutcome {
  async addCounselorTargetOutcome(data) {
    try {
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_target_outcome')
        .insert({
          counselor_profile_id: data.counselor_profile_id,
          target_outcome_id: data.target_outcome_id
        });
      return { message: 'Counselor target outcome added successfully', id: result[0] };
    } catch (error) {
      logger.error('Error adding counselor target outcome:', error);
      return { message: 'Error adding counselor target outcome', error: -1 };
    }
  }

  async updateCounselorTargetOutcome(id, data) {
    try {
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_target_outcome')
        .where('id', id)
        .update({
          counselor_profile_id: data.counselor_profile_id,
          target_outcome_id: data.target_outcome_id
        });
      return { message: 'Counselor target outcome updated successfully' };
    } catch (error) {
      logger.error('Error updating counselor target outcome:', error);
      return { message: 'Error updating counselor target outcome', error: -1 };
    }
  }

  async getCounselorTargetOutcome(filters) {
    try {
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('cto.*', 'rto.target_name', 'rto.target_cde', 'rto.target_desc')
        .from('counselor_target_outcome as cto')
        .join('ref_target_outcomes as rto', 'cto.target_outcome_id', 'rto.target_id');
      if (filters.counselor_profile_id) {
        query.where('cto.counselor_profile_id', filters.counselor_profile_id);
      }
      if (filters.target_outcome_id) {
        query.where('cto.target_outcome_id', filters.target_outcome_id);
      }
      const results = await query;
      return { message: 'Counselor target outcomes retrieved successfully', rec: results };
    } catch (error) {
      logger.error('Error retrieving counselor target outcomes:', error);
      return { message: 'Error retrieving counselor target outcomes', error: -1, rec: [] };
    }
  }

  async deleteCounselorTargetOutcome(id) {
    try {
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_target_outcome')
        .where('id', id)
        .delete();
      return { message: 'Counselor target outcome deleted successfully' };
    } catch (error) {
      logger.error('Error deleting counselor target outcome:', error);
      return { message: 'Error deleting counselor target outcome', error: -1 };
    }
  }
} 