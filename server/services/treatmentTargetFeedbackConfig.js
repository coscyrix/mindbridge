import TreatmentTargetFeedbackConfig from '../models/treatmentTargetFeedbackConfig.js';
import logger from '../config/winston.js';

export default class TreatmentTargetFeedbackConfigService {
  //////////////////////////////////////////
  constructor() {
    this.treatmentTargetFeedbackConfig = new TreatmentTargetFeedbackConfig();
  }
  //////////////////////////////////////////

  /**
   * Check if a session should trigger feedback forms and return the forms to send
   * @param {Object} data - Session data
   * @param {string} data.treatment_target - Treatment target
   * @param {number} data.session_number - Current session number
   * @param {number} data.tenant_id - Tenant ID
   * @param {number} data.client_id - Client ID
   * @param {number} data.session_id - Session ID
   * @returns {Object} Forms to send for this session
   */
  async checkAndGetSessionFeedbackForms(data) {
    try {
      const { treatment_target, session_number, tenant_id, client_id, session_id } = data;

      // Validate required fields
      if (!treatment_target || !session_number || !client_id || !session_id) {
        return {
          message: 'Missing required fields: treatment_target, session_number, client_id, session_id',
          error: -1
        };
      }

      // Check if session should trigger any feedback forms
      const sessionCheck = await this.treatmentTargetFeedbackConfig.checkSessionFeedbackForms({
        treatment_target,
        session_number,
        tenant_id
      });

      if (sessionCheck.error) {
        return sessionCheck;
      }

      const formsToSend = sessionCheck.rec;

      // If no forms to send, return early
      if (formsToSend.length === 0) {
        return {
          message: 'No feedback forms scheduled for this session',
          session_number,
          treatment_target,
          forms_to_send: []
        };
      }

      // Prepare the forms data with additional context
      const formsWithContext = formsToSend.map(form => ({
        ...form,
        client_id,
        session_id,
        session_number,
        treatment_target,
        tenant_id
      }));

      return {
        message: 'Feedback forms found for this session',
        session_number,
        treatment_target,
        forms_to_send: formsWithContext
      };
    } catch (error) {
      logger.error(error);
      return {
        message: 'Error checking session feedback forms',
        error: -1
      };
    }
  }

  //////////////////////////////////////////

  /**
   * Get all treatment target feedback configurations grouped by treatment target
   * @param {Object} data - Query data
   * @param {number} data.tenant_id - Tenant ID filter
   * @returns {Object} Grouped configurations
   */
  async getGroupedTreatmentTargetConfigs(data = {}) {
    try {
      const result = await this.treatmentTargetFeedbackConfig.getTreatmentTargetFeedbackConfigs(data);

      if (result.error) {
        return result;
      }

      // Group configurations by treatment target
      const groupedConfigs = {};
      
      result.rec.forEach(config => {
        if (!groupedConfigs[config.treatment_target]) {
          groupedConfigs[config.treatment_target] = {
            treatment_target: config.treatment_target,
            tools: []
          };
        }

        groupedConfigs[config.treatment_target].tools.push({
          form_name: config.form_name,
          purpose: config.purpose,
          sessions: config.sessions,
          tenant_id: config.tenant_id
        });
      });

      return {
        message: 'Treatment target configurations retrieved and grouped successfully',
        rec: Object.values(groupedConfigs)
      };
    } catch (error) {
      logger.error(error);
      return {
        message: 'Error retrieving grouped treatment target configurations',
        error: -1
      };
    }
  }

  //////////////////////////////////////////

  /**
   * Bulk create treatment target feedback configurations from JSON data
   * @param {Array} configs - Array of configuration objects
   * @returns {Object} Bulk create result
   */
  async bulkCreateFromJSON(configs) {
    try {
      if (!Array.isArray(configs)) {
        return {
          message: 'Configs must be an array',
          error: -1
        };
      }

      const results = [];
      const errors = [];

      for (const config of configs) {
        const { treatment_target, tools } = config;

        if (!treatment_target || !tools || !Array.isArray(tools)) {
          errors.push({
            config,
            error: 'Missing required fields: treatment_target, tools (must be array)'
          });
          continue;
        }

        // Process each tool for this treatment target
        for (const tool of tools) {
          const { form_name, purpose, sessions, tenant_id } = tool;

          if (!form_name || !sessions || !Array.isArray(sessions)) {
            errors.push({
              config: { treatment_target, tool },
              error: 'Missing required fields: form_name, sessions (must be array)'
            });
            continue;
          }

          const result = await this.treatmentTargetFeedbackConfig.postTreatmentTargetFeedbackConfig({
            treatment_target,
            form_name,
            purpose,
            sessions,
            tenant_id
          });

          if (result.error) {
            errors.push({
              config: { treatment_target, tool },
              error: result.message
            });
          } else {
            results.push({
              treatment_target,
              tool,
              result
            });
          }
        }
      }

      return {
        message: 'Bulk create from JSON completed',
        successful: results.length,
        failed: errors.length,
        results,
        errors
      };
    } catch (error) {
      logger.error(error);
      return {
        message: 'Error in bulk create from JSON',
        error: -1
      };
    }
  }

  //////////////////////////////////////////

  /**
   * Normalize session values according to the specified rules
   * @param {string} frequency - Frequency string from the table
   * @returns {Array} Normalized session values
   */
  normalizeSessionValues(frequency) {
    try {
      if (!frequency) return [];

      const normalized = [];

      // Handle "Sessions 1 & 5" format
      if (frequency.includes('Sessions') && frequency.includes('&')) {
        const matches = frequency.match(/\d+/g);
        if (matches) {
          return matches.map(match => parseInt(match));
        }
      }

      // Handle "Trans 1 & last" format
      if (frequency.includes('Trans') && frequency.includes('&')) {
        if (frequency.includes('1') && frequency.includes('last')) {
          return ['Trans 1', 'Trans last'];
        }
      }

      // Handle OTR and -OTR
      if (frequency.includes('OTR')) {
        if (frequency.includes('-OTR') && frequency.includes('OTR')) {
          return ['OTR', '-OTR'];
        } else if (frequency.includes('-OTR')) {
          return ['-OTR'];
        } else if (frequency.includes('OTR')) {
          return ['OTR'];
        }
      }

      // Handle simple session numbers
      const numbers = frequency.match(/\d+/g);
      if (numbers) {
        return numbers.map(num => parseInt(num));
      }

      // If no patterns match, return as string array
      return [frequency];
    } catch (error) {
      logger.error('Error normalizing session values:', error);
      return [frequency];
    }
  }

  //////////////////////////////////////////

  /**
   * Convert table data to JSON format
   * @param {Array} tableData - Array of table rows
   * @returns {Array} JSON formatted data
   */
  convertTableToJSON(tableData) {
    try {
      if (!Array.isArray(tableData)) {
        return {
          message: 'Table data must be an array',
          error: -1
        };
      }

      const groupedData = {};

      for (const row of tableData) {
        const { treatment_target, tool, purpose, frequency } = row;

        if (!treatment_target || !tool) {
          continue;
        }

        if (!groupedData[treatment_target]) {
          groupedData[treatment_target] = {
            treatment_target,
            tools: []
          };
        }

        const normalizedSessions = this.normalizeSessionValues(frequency);

        groupedData[treatment_target].tools.push({
          form_name: tool,
          purpose: purpose || '',
          sessions: normalizedSessions,
          tenant_id: null
        });
      }

      return Object.values(groupedData);
    } catch (error) {
      logger.error('Error converting table to JSON:', error);
      return {
        message: 'Error converting table to JSON',
        error: -1
      };
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment target feedback configuration statistics
   * @param {Object} data - Query data
   * @param {number} data.tenant_id - Tenant ID filter
   * @returns {Object} Statistics
   */
  async getTreatmentTargetStats(data = {}) {
    try {
      const result = await this.treatmentTargetFeedbackConfig.getTreatmentTargetFeedbackConfigs(data);

      if (result.error) {
        return result;
      }

      const stats = {
        total_configs: result.rec.length,
        treatment_targets: {},
        form_names: {},
        total_forms: 0
      };

      result.rec.forEach(config => {
        // Count by treatment target
        if (!stats.treatment_targets[config.treatment_target]) {
          stats.treatment_targets[config.treatment_target] = 0;
        }
        stats.treatment_targets[config.treatment_target]++;

        // Count by form name
        if (!stats.form_names[config.form_name]) {
          stats.form_names[config.form_name] = 0;
        }
        stats.form_names[config.form_name]++;

        stats.total_forms++;
      });

      return {
        message: 'Treatment target feedback configuration statistics retrieved',
        rec: stats
      };
    } catch (error) {
      logger.error(error);
      return {
        message: 'Error retrieving treatment target statistics',
        error: -1
      };
    }
  }

  //////////////////////////////////////////

  /**
   * Load session forms based on treatment target for a therapy request
   * @param {Object} data - Request data
   * @param {number} data.req_id - Therapy request ID
   * @param {string} data.treatment_target - Treatment target
   * @param {number} data.tenant_id - Tenant ID
   * @returns {Object} Result of form loading operation
   */
  async loadSessionFormsByTreatmentTarget(data) {
    try {
      const { req_id, treatment_target, tenant_id } = data;

      // Validate required fields
      if (!req_id || !treatment_target) {
        return {
          message: 'Missing required fields: req_id, treatment_target',
          error: -1
        };
      }

      // Load session forms based on treatment target
      const result = await this.treatmentTargetFeedbackConfig.loadSessionFormsByTreatmentTarget({
        req_id,
        treatment_target,
        tenant_id
      });

      return result;
    } catch (error) {
      logger.error(error);
      return {
        message: 'Error loading session forms by treatment target',
        error: -1
      };
    }
  }

  //////////////////////////////////////////
} 