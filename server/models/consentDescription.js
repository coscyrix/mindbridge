import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';

const db = knex(DBconn.dbConn.development);

export default class ConsentDescription {
  //////////////////////////////////////////
  async createConsentDescription(data) {
    try {
      const insertData = {
        tenant_id: data.tenant_id,
        counselor_id: data.counselor_id || null,
        description: data.description,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      };
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('consent_descriptions')
        .insert(insertData);
      return { message: 'Consent description created successfully', id: result[0] };
    } catch (error) {
      logger.error(error);
      return { message: 'Error creating consent description', error: -1 };
    }
  }

  async getConsentDescription({ tenant_id, counselor_id }) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('consent_descriptions')
        .where('tenant_id', tenant_id);
      if (counselor_id) {
        query = query.andWhere('counselor_id', counselor_id);
      } else {
        query = query.andWhereNull('counselor_id');
      }
      const result = await query.orderBy('updated_at', 'desc').first();
      return result || null;
    } catch (error) {
      logger.error(error);
      return { message: 'Error fetching consent description', error: -1 };
    }
  }

  async updateConsentDescription(id, data) {
    try {
      const updateData = {
        description: data.description,
        updated_at: db.fn.now(),
      };
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('consent_descriptions')
        .where('id', id)
        .update(updateData);
      return { message: 'Consent description updated', updated: result };
    } catch (error) {
      logger.error(error);
      return { message: 'Error updating consent description', error: -1 };
    }
  }

  async deleteConsentDescription(id) {
    try {
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('consent_descriptions')
        .where('id', id)
        .del();
      return { message: 'Consent description deleted', deleted: result };
    } catch (error) {
      logger.error(error);
      return { message: 'Error deleting consent description', error: -1 };
    }
  }
} 