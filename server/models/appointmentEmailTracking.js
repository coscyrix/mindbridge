import Common from './common.js';

export default class AppointmentEmailTracking extends Common {
  constructor() {
    super();
    this.tableName = 'appointment_email_tracking';
  }

  async checkEmailAlreadySent(counselor_profile_id, customer_email) {
    try {
      const query = `
        SELECT id FROM ${this.tableName} 
        WHERE counselor_profile_id = ? AND customer_email = ?
        LIMIT 1
      `;
      const [rows] = await this.pool.execute(query, [counselor_profile_id, customer_email]);
      return rows.length > 0;
    } catch (error) {
      console.error('Error checking if email already sent:', error);
      throw error;
    }
  }

  async recordEmailSent(data) {
    try {
      const query = `
        INSERT INTO ${this.tableName} 
        (counselor_profile_id, customer_email, customer_name, service, appointment_date)
        VALUES (?, ?, ?, ?, ?)
      `;
      const [result] = await this.pool.execute(query, [
        data.counselor_profile_id,
        data.customer_email,
        data.customer_name,
        data.service,
        data.appointment_date
      ]);
      return result.insertId;
    } catch (error) {
      console.error('Error recording email sent:', error);
      throw error;
    }
  }

  async getEmailHistory(counselor_profile_id, limit = 10) {
    try {
      const query = `
        SELECT * FROM ${this.tableName} 
        WHERE counselor_profile_id = ?
        ORDER BY sent_at DESC
        LIMIT ?
      `;
      const [rows] = await this.pool.execute(query, [counselor_profile_id, limit]);
      return rows;
    } catch (error) {
      console.error('Error getting email history:', error);
      throw error;
    }
  }
}
