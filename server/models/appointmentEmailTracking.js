import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import DBconn from '../config/db.config.js';
const knex = require('knex');;
import logger from '../config/winston.js';

const db = knex(DBconn.dbConn.development);

export default class AppointmentEmailTracking {
  constructor() {
    this.db = db;
    this.tableName = 'appointment_email_tracking';
  }

  async checkEmailAlreadySent(counselor_profile_id, customer_email) {
    try {
      const result = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('id')
        .from(this.tableName)
        .where({
          counselor_profile_id: counselor_profile_id,
          customer_email: customer_email
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
          customer_email: data.customer_email,
          customer_name: data.customer_name,
          service: data.service,
          appointment_date: data.appointment_date
        });
      
      return result[0];
    } catch (error) {
      logger.error('Error recording email sent:', error);
      throw error;
    }
  }

  async getEmailHistory(counselor_profile_id, limit = 10) {
    try {
      const result = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('*')
        .from(this.tableName)
        .where('counselor_profile_id', counselor_profile_id)
        .orderBy('sent_at', 'desc')
        .limit(limit);
      
      return result;
    } catch (error) {
      logger.error('Error getting email history:', error);
      throw error;
    }
  }
}
