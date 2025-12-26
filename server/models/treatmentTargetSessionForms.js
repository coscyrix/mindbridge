import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import db from '../utils/db.js';
import logger from '../config/winston.js';

export default class TreatmentTargetSessionForms {
  //////////////////////////////////////////
  constructor() {
    // Initialize the model
  }
  //////////////////////////////////////////

  /**
   * Create treatment target session form records
   * @param {Array} data - Array of session form data
   */
  async createTreatmentTargetSessionForms(data) {
    try {
      for (const formData of data) {
        const tmpSessionForm = {
          req_id: formData.req_id,
          session_id: formData.session_id,
          client_id: formData.client_id,
          counselor_id: formData.counselor_id,
          treatment_target: formData.treatment_target,
          form_name: formData.form_name,
          form_id: formData.form_id,
          config_id: formData.config_id,
          purpose: formData.purpose,
          session_number: formData.session_number,
          is_sent: formData.is_sent !== undefined ? (formData.is_sent ? 1 : 0) : 0,
          sent_at: formData.sent_at || null,
          tenant_id: formData.tenant_id || null,
        };

        const result = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('treatment_target_session_forms')
          .insert(tmpSessionForm);

        // Check if result is undefined or null (indicating an error)
        if (result === undefined || result === null) {
          logger.error('Error creating treatment target session form');
          return { message: 'Error creating treatment target session form', error: -1 };
        }
      }

      return { message: 'Treatment target session forms created successfully' };
    } catch (error) {
      // Handle duplicate entry error gracefully
      if (error.code === 'ER_DUP_ENTRY') {
        logger.warn('Duplicate entry detected, skipping insert:', error.message);
        return { message: 'Treatment target session forms created successfully (some duplicates skipped)' };
      }
      console.error(error);
      logger.error(error);
      return { message: 'Error creating treatment target session forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment target session forms by request ID
   * @param {Object} data - Query data
   * @param {number} data.req_id - Therapy request ID
   * @param {number} data.tenant_id - Tenant ID (optional)
   */
  async getTreatmentTargetSessionFormsByReqId(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_session_forms')
        .where('req_id', data.req_id);

      if (data.tenant_id !== undefined) {
        query = query.where('tenant_id', data.tenant_id);
      }

      const sessionForms = await query.orderBy('session_number', 'asc').orderBy('form_name', 'asc');

      return { 
        message: 'Treatment target session forms retrieved successfully', 
        rec: sessionForms 
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving treatment target session forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment target session forms by session ID
   * @param {Object} data - Query data
   * @param {number} data.session_id - Session ID
   * @param {number} data.tenant_id - Tenant ID (optional)
   */
  async getTreatmentTargetSessionFormsBySessionId(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_session_forms')
        .where('session_id', data.session_id);

      if (data.tenant_id !== undefined) {
        query = query.where('tenant_id', data.tenant_id);
      }

      const sessionForms = await query.orderBy('form_name', 'asc');

      return { 
        message: 'Treatment target session forms retrieved successfully', 
        rec: sessionForms 
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving treatment target session forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment target session forms by client ID
   * @param {Object} data - Query data
   * @param {number} data.client_id - Client ID
   * @param {number} data.tenant_id - Tenant ID (optional)
   */
  async getTreatmentTargetSessionFormsByClientId(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_session_forms')
        .where('client_id', data.client_id);

      if (data.tenant_id !== undefined) {
        query = query.where('tenant_id', data.tenant_id);
      }

      const sessionForms = await query.orderBy('session_number', 'asc').orderBy('form_name', 'asc');

      return { 
        message: 'Treatment target session forms retrieved successfully', 
        rec: sessionForms 
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving treatment target session forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Update treatment target session form sent status
   * @param {Object} data - Update data
   * @param {number} data.id - Session form ID
   * @param {boolean} data.is_sent - Sent status
   */
  async updateTreatmentTargetSessionFormSentStatus(data) {
    try {
      const updateData = {
        is_sent: data.is_sent ? 1 : 0,
        sent_at: data.is_sent ? new Date() : null,
      };

      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_session_forms')
        .where('id', data.id)
        .update(updateData);

      // Check if result is undefined or null (indicating an error)
      if (result === undefined || result === null) {
        logger.error('Error updating treatment target session form sent status');
        return { message: 'Error updating treatment target session form sent status', error: -1 };
      }

      return { message: 'Treatment target session form sent status updated successfully' };
    } catch (error) {
      logger.error(error);
      return { message: 'Error updating treatment target session form sent status', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Delete treatment target session forms by request ID
   * @param {Object} data - Delete data
   * @param {number} data.req_id - Therapy request ID
   */
  async deleteTreatmentTargetSessionFormsByReqId(data) {
    try {
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_session_forms')
        .where('req_id', data.req_id)
        .del();

      return { message: 'Treatment target session forms deleted successfully' };
    } catch (error) {
      logger.error(error);
      return { message: 'Error deleting treatment target session forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get forms to send for a specific session
   * @param {Object} data - Query data
   * @param {number} data.session_id - Session ID
   * @param {number} data.tenant_id - Tenant ID (optional)
   */
  async getFormsToSendForSession(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_session_forms')
        .where('session_id', data.session_id)
        .where('is_sent', 0);

      if (data.tenant_id !== undefined) {
        query = query.where('tenant_id', data.tenant_id);
      }

      const formsToSend = await query.orderBy('form_name', 'asc');

      return { 
        message: 'Forms to send retrieved successfully', 
        rec: formsToSend 
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving forms to send', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Update treatment target session forms by session ID
   * @param {Object} data - Update data
   * @param {number} data.session_id - Session ID
   * @param {boolean} data.is_sent - Sent status
   */
  async updateTreatmentTargetSessionFormsBySessionId(data) {
    try {
      const updateData = {
        is_sent: data.is_sent ? 1 : 0,
        sent_at: data.is_sent ? new Date() : null,
      };

      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_session_forms')
        .where('session_id', data.session_id)
        .update(updateData);

      return { message: 'Treatment target session forms updated successfully' };
    } catch (error) {
      logger.error(error);
      return { message: 'Error updating treatment target session forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment target session forms statistics
   * @param {Object} data - Query data
   * @param {number} data.req_id - Therapy request ID (optional)
   * @param {number} data.client_id - Client ID (optional)
   * @param {number} data.tenant_id - Tenant ID (optional)
   */
  async getTreatmentTargetSessionFormsStats(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_session_forms');

      if (data.req_id) {
        query = query.where('req_id', data.req_id);
      }

      if (data.client_id) {
        query = query.where('client_id', data.client_id);
      }

      if (data.tenant_id !== undefined) {
        query = query.where('tenant_id', data.tenant_id);
      }

      const stats = await query
        .select(
          'treatment_target',
          'form_name',
          db.raw('COUNT(*) as total_forms'),
          db.raw('SUM(is_sent) as sent_forms'),
          db.raw('COUNT(*) - SUM(is_sent) as pending_forms')
        )
        .groupBy('treatment_target', 'form_name')
        .orderBy('treatment_target', 'asc')
        .orderBy('form_name', 'asc');

      return { 
        message: 'Treatment target session forms statistics retrieved successfully', 
        rec: stats 
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving treatment target session forms statistics', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Update treatment target session form by session ID and form ID
   * @param {Object} data - Update data
   * @param {number} data.session_id - Session ID
   * @param {number} data.form_id - Form ID
   * @param {boolean} data.form_submit - Form submission status
   */
  async updateTreatmentTargetSessionFormBySessionIdAndFormId(data) {
    try {
      console.log('updateTreatmentTargetSessionFormBySessionIdAndFormId called with:', data);
      
      const updateData = {
        form_submit: data.form_submit ? 1 : 0,
      };
      
      console.log('updateData:', updateData);

      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_session_forms')
        .where('session_id', data.session_id)
        .andWhere('form_id', data.form_id)
        .update(updateData);

      console.log('Database update result:', result);

      // Check if result is undefined or null (indicating an error)
      if (result === undefined || result === null) {
        logger.error('Error updating treatment target session form');
        return { message: 'Error updating treatment target session form', error: -1 };
      }

      // Log the number of rows affected for debugging
      logger.info(`Updated ${result} treatment target session form records`);
      console.log(`Updated ${result} treatment target session form records`);

      return { message: 'Treatment target session form updated successfully' };
    } catch (error) {
      logger.error(error);
      return { message: 'Error updating treatment target session form', error: -1 };
    }
  }

  //////////////////////////////////////////
}
