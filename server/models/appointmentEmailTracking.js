import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import db from '../utils/db.js';
import logger from '../config/winston.js';

export default class AppointmentEmailTracking {
  constructor() {
    this.db = db;
    this.tableName = 'appointment_email_tracking';
  }

  async checkEmailAlreadySent(counselor_profile_id, client_email) {
    try {
      const result = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('id')
        .from(this.tableName)
        .where({
          counselor_profile_id: counselor_profile_id,
          customer_email: client_email // Database column is still customer_email
        })
        .first();
      
      return !!result;
    } catch (error) {
      logger.error('Error checking if email already sent:', error);
      throw error;
    }
  }

  async recordEmailSent(data) {
    try {
      const result = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from(this.tableName)
        .insert({
          counselor_profile_id: data.counselor_profile_id,
          customer_email: data.client_email || '',
          customer_name: data.client_name,
          service: data.service,
          appointment_date: data.appointment_date,
          contact_number: data.contact_number || null,
          country_code: data.country_code || null,
        });
      
      return result[0];
    } catch (error) {
      logger.error('Error recording email sent:', error);
      throw error;
    }
  }

  async getEmailHistory(counselor_profile_id, limit = 10) {
    try {
      let query = this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('*')
        .from(this.tableName)
        .where('counselor_profile_id', counselor_profile_id)
        .orderBy('sent_at', 'desc');
      
      if (limit && limit > 0) {
        query = query.limit(limit);
      }
      
      const result = await query;
      
      return result;
    } catch (error) {
      logger.error('Error getting email history:', error);
      throw error;
    }
  }

  async getAppointmentsByCounselor(counselor_profile_id) {
    try {
      const result = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('*')
        .from(this.tableName)
        .where('counselor_profile_id', counselor_profile_id)
        .orderBy('sent_at', 'desc');
      
      return result;
    } catch (error) {
      logger.error('Error getting appointments by counselor:', error);
      throw error;
    }
  }
}
