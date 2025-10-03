import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import DBconn from '../config/db.config.js';
const knex = require('knex');;
import logger from '../config/winston.js';
import Common from './common.js';

const db = knex(DBconn.dbConn.development);

export default class ConsentDescription {
  constructor() {
    this.common = new Common();
  }

  
  //////////////////////////////////////////
  async createConsentDescription(data) {
    
    try {
      const tenant = await this.common.getTenantByTenantGeneratedId(data.tenant_id);
      
      if (tenant.error) {
        return tenant; // Return the error if tenant not found
      }

      console.log(tenant, 'tenant');

      const insertData = {
        tenant_id: tenant[0].tenant_id,
        description: data.description,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      };
      
      // Only add counselor_id if it's provided and not null/undefined
      if (data.counselor_id) {
        insertData.counselor_id = data.counselor_id;
      }

      
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('consent_descriptions')
        .insert(insertData);
      return { message: 'Consent description created successfully', id: result[0] };
    } catch (error) {
      console.log(error, 'error');
      
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
        query = query.where('counselor_id', counselor_id);
      } else {
        query = query.whereNull('counselor_id');
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