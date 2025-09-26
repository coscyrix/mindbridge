import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import DBconn from '../config/db.config.js';
import logger from '../config/winston.js';
const knex = require('knex');;

export default class TreatmentTargetSessionFormsTemplate {
  //////////////////////////////////////////

  constructor() {
    this.db = knex(DBconn.dbConn.development);
  }

  //////////////////////////////////////////

  /**
   * Get all template configurations
   * @returns {Promise<Object>} Template configurations
   */
  async getTemplateConfigurations() {
    try {
      const configurations = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_session_forms_template')
        .where('is_active', 1)
        .orderBy(['treatment_target', 'form_name']);

      return {
        message: 'Template configurations retrieved successfully',
        rec: configurations,
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving template configurations', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Copy template configurations to a new tenant
   * @param {Object} data - Data object containing tenant_id
   * @param {number} data.tenant_id - The tenant ID to copy configurations to
   * @returns {Promise<Object>} Copy result
   */
  async copyTemplateConfigurationsToTenant(data) {
    try {
      // Validate input
      if (!data.tenant_id) {
        return { message: 'tenant_id is required', error: -1 };
      }

      // Check if tenant already has configurations
      const existingConfigs = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('tenant_id', data.tenant_id)
        .first();

      if (existingConfigs) {
        return { 
          message: 'Tenant already has treatment target configurations. Use updateTemplateConfigurationsForTenant to update existing configurations.', 
          error: -1 
        };
      }

      // Get all template configurations
      const templateConfigs = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_session_forms_template')
        .where('is_active', 1)
        .select('*');

      if (templateConfigs.length === 0) {
        return { message: 'No template configurations found', error: -1 };
      }

      // Prepare configurations for the new tenant
      const tenantConfigs = templateConfigs.map(config => ({
        treatment_target: config.treatment_target,
        form_name: config.form_name,
        service_name: config.service_name,
        purpose: config.purpose,
        sessions: config.sessions,
        tenant_id: data.tenant_id,
        created_at: new Date(),
        updated_at: new Date()
      }));

      // Insert configurations for the new tenant
      const insertedConfigs = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .insert(tenantConfigs);

      if (!insertedConfigs) {
        logger.error('Error copying template configurations');
        return { message: 'Error copying template configurations', error: -1 };
      }

      logger.info(`Copied ${tenantConfigs.length} template configurations to tenant ${data.tenant_id}`);

      return {
        message: `Successfully copied ${tenantConfigs.length} template configurations to tenant ${data.tenant_id}`,
        rec: {
          tenant_id: data.tenant_id,
          configurations_copied: tenantConfigs.length,
          configurations: tenantConfigs
        }
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error copying template configurations', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Update existing tenant configurations with latest template configurations
   * @param {Object} data - Data object containing tenant_id
   * @param {number} data.tenant_id - The tenant ID to update configurations for
   * @param {boolean} data.overwrite_existing - Whether to overwrite existing configurations (default: false)
   * @returns {Promise<Object>} Update result
   */
  async updateTemplateConfigurationsForTenant(data) {
    try {
      // Validate input
      if (!data.tenant_id) {
        return { message: 'tenant_id is required', error: -1 };
      }

      const overwriteExisting = data.overwrite_existing || false;

      // Get all template configurations
      const templateConfigs = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_session_forms_template')
        .where('is_active', 1)
        .select('*');

      if (templateConfigs.length === 0) {
        return { message: 'No template configurations found', error: -1 };
      }

      // Get existing tenant configurations
      const existingConfigs = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('tenant_id', data.tenant_id)
        .select('*');

      const existingConfigMap = {};
      existingConfigs.forEach(config => {
        const key = `${config.treatment_target}-${config.form_name}`;
        existingConfigMap[key] = config;
      });

      let updatedCount = 0;
      let insertedCount = 0;
      let skippedCount = 0;

      // Process each template configuration
      for (const templateConfig of templateConfigs) {
        const key = `${templateConfig.treatment_target}-${templateConfig.form_name}`;
        const existingConfig = existingConfigMap[key];

        if (existingConfig) {
          // Configuration exists - update if overwrite is enabled
          if (overwriteExisting) {
            await this.db
              .withSchema(`${process.env.MYSQL_DATABASE}`)
              .from('treatment_target_feedback_config')
              .where('id', existingConfig.id)
              .update({
                purpose: templateConfig.purpose,
                sessions: templateConfig.sessions,
                updated_at: new Date()
              });
            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          // Configuration doesn't exist - insert new one
          await this.db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('treatment_target_feedback_config')
            .insert({
              treatment_target: templateConfig.treatment_target,
              form_name: templateConfig.form_name,
              service_name: templateConfig.service_name,
              purpose: templateConfig.purpose,
              sessions: templateConfig.sessions,
              tenant_id: data.tenant_id,
              created_at: new Date(),
              updated_at: new Date()
            });
          insertedCount++;
        }
      }

      logger.info(`Updated tenant ${data.tenant_id}: ${updatedCount} updated, ${insertedCount} inserted, ${skippedCount} skipped`);

      return {
        message: `Successfully updated tenant ${data.tenant_id} configurations`,
        rec: {
          tenant_id: data.tenant_id,
          configurations_updated: updatedCount,
          configurations_inserted: insertedCount,
          configurations_skipped: skippedCount,
          total_template_configurations: templateConfigs.length
        }
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error updating template configurations', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get tenant configurations
   * @param {Object} data - Data object containing tenant_id
   * @param {number} data.tenant_id - The tenant ID
   * @returns {Promise<Object>} Tenant configurations
   */
  async getTenantConfigurations(data) {
    try {
      // Validate input
      if (!data.tenant_id) {
        return { message: 'tenant_id is required', error: -1 };
      }

      const configurations = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('tenant_id', data.tenant_id)
        .orderBy(['treatment_target', 'form_name']);

      return {
        message: 'Tenant configurations retrieved successfully',
        rec: configurations,
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving tenant configurations', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Compare tenant configurations with template configurations
   * @param {Object} data - Data object containing tenant_id
   * @param {number} data.tenant_id - The tenant ID
   * @returns {Promise<Object>} Comparison result
   */
  async compareTenantWithTemplate(data) {
    try {
      // Validate input
      if (!data.tenant_id) {
        return { message: 'tenant_id is required', error: -1 };
      }

      // Get template configurations
      const templateConfigs = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_session_forms_template')
        .where('is_active', 1)
        .select('*');

      // Get tenant configurations
      const tenantConfigs = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('tenant_id', data.tenant_id)
        .select('*');

      // Create maps for comparison
      const templateMap = {};
      templateConfigs.forEach(config => {
        const key = `${config.treatment_target}-${config.form_name}`;
        templateMap[key] = config;
      });

      const tenantMap = {};
      tenantConfigs.forEach(config => {
        const key = `${config.treatment_target}-${config.form_name}`;
        tenantMap[key] = config;
      });

      // Compare configurations
      const missing = [];
      const outdated = [];
      const upToDate = [];

      for (const [key, templateConfig] of Object.entries(templateMap)) {
        const tenantConfig = tenantMap[key];

        if (!tenantConfig) {
          missing.push({
            treatment_target: templateConfig.treatment_target,
            form_name: templateConfig.form_name,
            purpose: templateConfig.purpose,
            sessions: templateConfig.sessions
          });
        } else if (
          templateConfig.purpose !== tenantConfig.purpose ||
          templateConfig.sessions !== tenantConfig.sessions
        ) {
          outdated.push({
            treatment_target: templateConfig.treatment_target,
            form_name: templateConfig.form_name,
            template_purpose: templateConfig.purpose,
            tenant_purpose: tenantConfig.purpose,
            template_sessions: templateConfig.sessions,
            tenant_sessions: tenantConfig.sessions
          });
        } else {
          upToDate.push({
            treatment_target: templateConfig.treatment_target,
            form_name: templateConfig.form_name
          });
        }
      }

      return {
        message: 'Configuration comparison completed',
        rec: {
          tenant_id: data.tenant_id,
          total_template_configurations: templateConfigs.length,
          total_tenant_configurations: tenantConfigs.length,
          missing_configurations: missing,
          outdated_configurations: outdated,
          up_to_date_configurations: upToDate,
          summary: {
            missing_count: missing.length,
            outdated_count: outdated.length,
            up_to_date_count: upToDate.length
          }
        }
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error comparing configurations', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Reset tenant configurations to match template exactly
   * @param {Object} data - Data object containing tenant_id
   * @param {number} data.tenant_id - The tenant ID
   * @returns {Promise<Object>} Reset result
   */
  async resetTenantConfigurationsToTemplate(data) {
    try {
      // Validate input
      if (!data.tenant_id) {
        return { message: 'tenant_id is required', error: -1 };
      }

      // Delete existing tenant configurations
      const deletedCount = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('tenant_id', data.tenant_id)
        .del();

      // Copy template configurations to tenant
      const copyResult = await this.copyTemplateConfigurationsToTenant(data);

      if (copyResult.error) {
        return copyResult;
      }

      return {
        message: `Successfully reset tenant ${data.tenant_id} configurations to template`,
        rec: {
          tenant_id: data.tenant_id,
          configurations_deleted: deletedCount,
          configurations_copied: copyResult.rec.configurations_copied
        }
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error resetting tenant configurations', error: -1 };
    }
  }
}
