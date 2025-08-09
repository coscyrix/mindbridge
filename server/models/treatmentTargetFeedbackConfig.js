import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';

const db = knex(DBconn.dbConn.development);

export default class TreatmentTargetFeedbackConfig {
  //////////////////////////////////////////
  constructor() {
    // Initialize the model
  }
  //////////////////////////////////////////

  /**
   * Check if a combination of treatment_target, form_name, and service_name already exists
   * @param {Object} data - Check data
   * @param {string} data.treatment_target - Treatment target
   * @param {string} data.form_name - Form name
   * @param {string|null} data.service_name - Service name (optional)
   * @param {number|null} data.tenant_id - Tenant ID
   * @param {number|null} data.exclude_id - ID to exclude from check (for updates)
   */
  async checkExistingCombination(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('treatment_target', data.treatment_target)
        .where('form_name', data.form_name);

      // Add service_name condition
      if (data.service_name !== null && data.service_name !== undefined) {
        query = query.where('service_name', data.service_name);
      } else {
        query = query.whereNull('service_name');
      }

      // If tenant_id is provided, check for tenant-specific combination
      if (data.tenant_id !== null && data.tenant_id !== undefined) {
        query = query.where('tenant_id', data.tenant_id);
      } else {
        // If tenant_id is null, check for global combination (tenant_id is null)
        query = query.whereNull('tenant_id');
      }

      // Exclude current record if updating
      if (data.exclude_id) {
        query = query.whereNot('id', data.exclude_id);
      }

      const existingConfig = await query.first();

      return existingConfig ? true : false;
    } catch (error) {
      logger.error(error);
      return false;
    }
  }

  //////////////////////////////////////////

  /**
   * Create a new treatment target feedback configuration
   * @param {Object} data - Configuration data
   * @param {string} data.treatment_target - Treatment target (e.g., "Anxiety", "Depression")
   * @param {string} data.form_name - Form name (e.g., "GAD-7", "PHQ-9")
   * @param {string|null} data.service_name - Service name (optional)
   * @param {string} data.purpose - Purpose description
   * @param {Array} data.sessions - Array of session numbers or special values
   * @param {number|null} data.tenant_id - Tenant ID (nullable)
   */
  async postTreatmentTargetFeedbackConfig(data) {
    try {
      // Check for existing combination
      const existingCombination = await this.checkExistingCombination({
        treatment_target: data.treatment_target,
        form_name: data.form_name,
        service_name: data.service_name || null,
        tenant_id: data.tenant_id || null
      });

      if (existingCombination) {
        const tenantInfo = data.tenant_id ? ` for tenant ${data.tenant_id}` : ' globally';
        const serviceInfo = data.service_name ? ` and service "${data.service_name}"` : '';
        return { 
          message: `Configuration with treatment_target "${data.treatment_target}", form_name "${data.form_name}"${serviceInfo} already exists${tenantInfo}`, 
          error: -1 
        };
      }

      const tmpConfig = {
        treatment_target: data.treatment_target,
        form_name: data.form_name,
        service_name: data.service_name || null,
        purpose: data.purpose,
        sessions: db.raw('?', [JSON.stringify(data.sessions)]), // Use raw SQL for JSON column
        tenant_id: data.tenant_id || null,
      };

      const postConfig = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .insert(tmpConfig);

      if (!postConfig) {
        logger.error('Error creating treatment target feedback config');
        return { message: 'Error creating treatment target feedback config', error: -1 };
      }

      return { message: 'Treatment target feedback config created successfully', rec: postConfig };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error creating treatment target feedback config', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Update treatment target feedback configuration by ID
   * @param {Object} data - Update data
   * @param {number} data.id - Configuration ID
   * @param {string} data.treatment_target - Treatment target
   * @param {string} data.form_name - Form name
   * @param {string|null} data.service_name - Service name (optional)
   * @param {string} data.purpose - Purpose description
   * @param {Array} data.sessions - Array of session numbers
   * @param {number|null} data.tenant_id - Tenant ID
   */
  async putTreatmentTargetFeedbackConfigById(data) {
    try {
      // Check for existing combination (excluding current record)
      const existingCombination = await this.checkExistingCombination({
        treatment_target: data.treatment_target,
        form_name: data.form_name,
        service_name: data.service_name || null,
        tenant_id: data.tenant_id || null,
        exclude_id: data.id
      });

      if (existingCombination) {
        const tenantInfo = data.tenant_id ? ` for tenant ${data.tenant_id}` : ' globally';
        const serviceInfo = data.service_name ? ` and service "${data.service_name}"` : '';
        return { 
          message: `Configuration with treatment_target "${data.treatment_target}", form_name "${data.form_name}"${serviceInfo} already exists${tenantInfo}`, 
          error: -1 
        };
      }

      const tmpConfig = {
        treatment_target: data.treatment_target,
        form_name: data.form_name,
        service_name: data.service_name || null,
        purpose: data.purpose,
        sessions: db.raw('?', [JSON.stringify(data.sessions)]), // Use raw SQL for JSON column
        tenant_id: data.tenant_id || null,
      };

      const putConfig = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('id', data.id)
        .update(tmpConfig);

      if (!putConfig) {
        logger.error('Error updating treatment target feedback config');
        return { message: 'Error updating treatment target feedback config', error: -1 };
      }

      return { message: 'Treatment target feedback config updated successfully' };
    } catch (error) {
      logger.error(error);
      return { message: 'Error updating treatment target feedback config', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment target feedback configuration by ID
   * @param {Object} data - Query data
   * @param {number} data.id - Configuration ID
   */
  async getTreatmentTargetFeedbackConfigById(data) {
    try {
      const config = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('id', data.id)
        .first();

      if (!config) {
        return { message: 'Treatment target feedback config not found', error: -1 };
      }

      // sessions is already a JSON object from the database, no parsing needed

      return { message: 'Treatment target feedback config retrieved successfully', rec: config };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving treatment target feedback config', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get all treatment target feedback configurations
   * @param {Object} data - Query data
   * @param {string} data.treatment_target - Filter by treatment target
   * @param {string} data.form_name - Filter by form name
   * @param {string} data.service_name - Filter by service name
   * @param {number} data.tenant_id - Filter by tenant ID
   */
  async getTreatmentTargetFeedbackConfigs(data = {}) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config');

      if (data.treatment_target) {
        query = query.where('treatment_target', data.treatment_target);
      }

      if (data.form_name) {
        query = query.where('form_name', data.form_name);
      }

      if (data.service_name !== undefined) {
        if (data.service_name === null) {
          query = query.whereNull('service_name');
        } else {
          query = query.where('service_name', data.service_name);
        }
      }

      if (data.tenant_id !== undefined) {
        query = query.where('tenant_id', data.tenant_id);
      }

      const configs = await query.orderBy('treatment_target', 'asc').orderBy('form_name', 'asc').orderBy('service_name', 'asc');

      // sessions is already a JSON object from the database, no parsing needed

      return { message: 'Treatment target feedback configs retrieved successfully', rec: configs };
    } catch (error) {
      console.log('error-------->', error);
      
      logger.error(error);
      return { message: 'Error retrieving treatment target feedback configs', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Check if a session should trigger a feedback form for a specific treatment target
   * @param {Object} data - Check data
   * @param {string} data.treatment_target - Treatment target
   * @param {number} data.session_number - Current session number
   * @param {number} data.tenant_id - Tenant ID
   * @returns {Array} Array of forms that should be sent for this session
   */
  async checkSessionFeedbackForms(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('treatment_target', data.treatment_target);

      if (data.tenant_id !== undefined) {
        query = query.where('tenant_id', data.tenant_id);
      }

      const configs = await query;

      const formsToSend = [];

      for (const config of configs) {
        // sessions is already a JSON object from the database, no parsing needed
        const sessions = config.sessions;
        
        // Check if current session number is in the sessions array
        if (sessions.includes(data.session_number)) {
          formsToSend.push({
            form_name: config.form_name,
            purpose: config.purpose,
            config_id: config.id
          });
        }
      }

      return { 
        message: 'Session feedback forms check completed', 
        rec: formsToSend,
        session_number: data.session_number,
        treatment_target: data.treatment_target
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error checking session feedback forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Delete treatment target feedback configuration by ID
   * @param {Object} data - Delete data
   * @param {number} data.id - Configuration ID
   */
  async deleteTreatmentTargetFeedbackConfigById(data) {
    try {
      const deleteConfig = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('id', data.id)
        .del();

      if (!deleteConfig) {
        logger.error('Error deleting treatment target feedback config');
        return { message: 'Error deleting treatment target feedback config', error: -1 };
      }

      return { message: 'Treatment target feedback config deleted successfully' };
    } catch (error) {
      logger.error(error);
      return { message: 'Error deleting treatment target feedback config', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get all unique treatment targets
   */
  async getTreatmentTargets() {
    try {
      const targets = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .distinct('treatment_target')
        .orderBy('treatment_target', 'asc');

      return { 
        message: 'Treatment targets retrieved successfully', 
        rec: targets.map(t => t.treatment_target)
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving treatment targets', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get all unique form names
   */
  async getFormNames() {
    try {
      const forms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .distinct('form_name')
        .orderBy('form_name', 'asc');

      return { 
        message: 'Form names retrieved successfully', 
        rec: forms.map(f => f.form_name)
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving form names', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get all unique service names
   */
  async getServiceNames() {
    try {
      const services = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .distinct('service_name')
        .whereNotNull('service_name')
        .orderBy('service_name', 'asc');

      return { 
        message: 'Service names retrieved successfully', 
        rec: services.map(s => s.service_name)
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving service names', error: -1 };
    }
  }
} 