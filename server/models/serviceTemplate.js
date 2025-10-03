import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import DBconn from '../config/db.config.js';
const knex = require('knex');;
import logger from '../config/winston.js';

const db = knex(DBconn.dbConn.development);

export default class ServiceTemplate {
  async createTemplate(data) {
    try {
      const [id] = await db.withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('service_templates')
        .insert(data);
      return { message: 'Template created', id };
    } catch (error) {
      logger.error('Error creating template:', error);
      return { message: 'Error creating template', error: -1 };
    }
  }

  async getTemplates(filters = {}) {
    try {
      let query = db.withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('service_templates');
      if (filters.is_active !== undefined) {
        query = query.where('is_active', filters.is_active);
      }
      const rec = await query;
      return { message: 'Templates retrieved', rec };
    } catch (error) {
      logger.error('Error fetching templates:', error);
      return { message: 'Error fetching templates', error: -1 };
    }
  }

  async getTemplateById(template_service_id) {
    try {
      const rec = await db.withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('service_templates')
        .where('template_service_id', template_service_id);
      if (!rec || rec.length === 0) {
        return { message: 'Template not found', error: -1 };
      }
      return { message: 'Template retrieved', rec: rec[0] };
    } catch (error) {
      logger.error('Error fetching template:', error);
      return { message: 'Error fetching template', error: -1 };
    }
  }

  async updateTemplate(template_service_id, data) {
    try {
      await db.withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('service_templates')
        .where('template_service_id', template_service_id)
        .update(data);
      return { message: 'Template updated' };
    } catch (error) {
      logger.error('Error updating template:', error);
      return { message: 'Error updating template', error: -1 };
    }
  }

  async deleteTemplate(template_service_id) {
    try {
      await db.withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('service_templates')
        .where('template_service_id', template_service_id)
        .del();
      return { message: 'Template deleted' };
    } catch (error) {
      logger.error('Error deleting template:', error);
      return { message: 'Error deleting template', error: -1 };
    }
  }
} 