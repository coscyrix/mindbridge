import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import logger from '../config/winston.js';
const knex = require('knex');
import DBconn from '../config/db.config.js';
import prisma from '../utils/prisma.js';

const db = knex(DBconn.dbConn.development);

export default class TreatmentTargetSessionFormsTemplate {
  //////////////////////////////////////////

  constructor() {
    this.db = knex(DBconn.dbConn.development);
  }

  //////////////////////////////////////////

  /**
   * Create a new template (treatment_target + form_name)
   * @param {Object} data - Template data
   * @returns {Promise<Object>} Created template
   */
  async createTemplate(data) {
    try {
      const template = await prisma.treatment_target_session_forms_template.create({
        data: {
          treatment_target: data.treatment_target,
          form_name: data.form_name,
          purpose: data.purpose || null,
          is_active: data.is_active !== undefined ? data.is_active : true,
        },
        include: {
          service_frequencies: {
            include: {
              service_template: true,
            },
          },
        },
      });

      return {
        message: 'Template created successfully',
        rec: template,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        return {
          message: 'Template with this treatment_target and form_name already exists',
          error: -1,
        };
      }
      logger.error(error);
      return { message: 'Error creating template', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Create a template with service frequencies in one transaction
   * @param {Object} data - Template data with service_frequencies array
   * @returns {Promise<Object>} Created template with frequencies
   */
  async createTemplateWithFrequencies(data) {
    try {
      const template = await prisma.treatment_target_session_forms_template.create({
        data: {
          treatment_target: data.treatment_target,
          form_name: data.form_name,
          purpose: data.purpose || null,
          is_active: data.is_active !== undefined ? data.is_active : true,
          service_frequencies: {
            create: (data.service_frequencies || []).map((freq) => ({
              service_ref_id: freq.service_ref_id || null,
              nbr_of_sessions: freq.nbr_of_sessions,
              sessions: freq.sessions,
            })),
          },
        },
        include: {
          service_frequencies: {
            include: {
              service_template: true,
            },
          },
        },
      });

      return {
        message: 'Template with frequencies created successfully',
        rec: template,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        return {
          message: 'Template with this treatment_target and form_name already exists',
          error: -1,
        };
      }
      logger.error(error);
      return { message: 'Error creating template with frequencies', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get all templates with their service frequencies
   * @returns {Promise<Object>} All templates
   */
  async getAllTemplates() {
    try {
      const templates = await prisma.treatment_target_session_forms_template.findMany({
        where: { is_active: true },
        include: {
          service_frequencies: {
            include: {
              service_template: {
                select: {
                  template_service_id: true,
                  service_name: true,
                  service_code: true,
                  nbr_of_sessions: true,
                },
              },
            },
            orderBy: { nbr_of_sessions: 'asc' },
          },
        },
        orderBy: [{ treatment_target: 'asc' }, { form_name: 'asc' }],
      });

      return {
        message: 'Templates retrieved successfully',
        rec: templates,
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving templates', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get a template by ID with its service frequencies
   * @param {number} id - Template ID
   * @returns {Promise<Object>} Template
   */
  async getTemplateById(id) {
    try {
      const template = await prisma.treatment_target_session_forms_template.findUnique({
        where: { id },
        include: {
          service_frequencies: {
            include: {
              service_template: {
                select: {
                  template_service_id: true,
                  service_name: true,
                  service_code: true,
                  nbr_of_sessions: true,
                },
              },
            },
            orderBy: { nbr_of_sessions: 'asc' },
          },
        },
      });

      if (!template) {
        return { message: 'Template not found', error: -1 };
      }

      return {
        message: 'Template retrieved successfully',
        rec: template,
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving template', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get a template by treatment_target and form_name
   * @param {string} treatmentTarget - Treatment target
   * @param {string} formName - Form name
   * @returns {Promise<Object>} Template
   */
  async getTemplateByTreatmentTargetAndFormName(treatmentTarget, formName) {
    try {
      const template = await prisma.treatment_target_session_forms_template.findFirst({
        where: {
          treatment_target: treatmentTarget,
          form_name: formName,
          is_active: true,
        },
        include: {
          service_frequencies: {
            include: {
              service_template: {
                select: {
                  template_service_id: true,
                  service_name: true,
                  service_code: true,
                  nbr_of_sessions: true,
                },
              },
            },
            orderBy: { nbr_of_sessions: 'asc' },
          },
        },
      });

      if (!template) {
        return { message: 'Template not found', error: -1 };
      }

      return {
        message: 'Template retrieved successfully',
        rec: template,
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving template', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get templates by treatment_target
   * @param {string} treatmentTarget - Treatment target
   * @returns {Promise<Object>} Templates
   */
  async getTemplatesByTreatmentTarget(treatmentTarget) {
    try {
      const templates = await prisma.treatment_target_session_forms_template.findMany({
        where: {
          treatment_target: treatmentTarget,
          is_active: true,
        },
        include: {
          service_frequencies: {
            include: {
              service_template: {
                select: {
                  template_service_id: true,
                  service_name: true,
                  service_code: true,
                  nbr_of_sessions: true,
                },
              },
            },
            orderBy: { nbr_of_sessions: 'asc' },
          },
        },
        orderBy: { form_name: 'asc' },
      });

      return {
        message: 'Templates retrieved successfully',
        rec: templates,
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving templates', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Update a template
   * @param {number} id - Template ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated template
   */
  async updateTemplate(id, data) {
    try {
      const updateData = {};
      if (data.treatment_target !== undefined) updateData.treatment_target = data.treatment_target;
      if (data.form_name !== undefined) updateData.form_name = data.form_name;
      if (data.purpose !== undefined) updateData.purpose = data.purpose;
      if (data.is_active !== undefined) updateData.is_active = data.is_active;
      updateData.updated_at = new Date();

      const template = await prisma.treatment_target_session_forms_template.update({
        where: { id },
        data: updateData,
        include: {
          service_frequencies: {
            include: {
              service_template: true,
            },
          },
        },
      });

      return {
        message: 'Template updated successfully',
        rec: template,
      };
    } catch (error) {
      if (error.code === 'P2025') {
        return { message: 'Template not found', error: -1 };
      }
      if (error.code === 'P2002') {
        return {
          message: 'Template with this treatment_target and form_name already exists',
          error: -1,
        };
      }
      logger.error(error);
      return { message: 'Error updating template', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Delete a template (cascades to service_frequencies)
   * @param {number} id - Template ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteTemplate(id) {
    try {
      await prisma.treatment_target_session_forms_template.delete({
        where: { id },
      });

      return { message: 'Template deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        return { message: 'Template not found', error: -1 };
      }
      logger.error(error);
      return { message: 'Error deleting template', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get all template configurations (legacy support)
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

      // Get all template configurations with their service frequencies
      const templates = await prisma.treatment_target_session_forms_template.findMany({
        where: { is_active: true },
        include: {
          service_frequencies: {
            include: {
              service_template: true,
            },
          },
        },
      });

      if (templates.length === 0) {
        return { message: 'No template configurations found', error: -1 };
      }

      // Prepare configurations for the new tenant
      const tenantConfigs = [];
      for (const template of templates) {
        for (const freq of template.service_frequencies) {
          tenantConfigs.push({
            treatment_target: template.treatment_target,
            form_name: template.form_name,
            service_name: freq.service_template?.service_name || null,
            purpose: template.purpose,
            sessions: JSON.stringify(freq.sessions),
        tenant_id: data.tenant_id,
        created_at: new Date(),
        updated_at: new Date()
          });
        }
      }

      if (tenantConfigs.length === 0) {
        return { message: 'No service frequencies found in templates', error: -1 };
      }

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

      // Get all template configurations with service frequencies
      const templates = await prisma.treatment_target_session_forms_template.findMany({
        where: { is_active: true },
        include: {
          service_frequencies: {
            include: {
              service_template: true,
            },
          },
        },
      });

      if (templates.length === 0) {
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
        const key = `${config.treatment_target}-${config.form_name}-${config.service_name || 'default'}`;
        existingConfigMap[key] = config;
      });

      let updatedCount = 0;
      let insertedCount = 0;
      let skippedCount = 0;

      // Process each template and its service frequencies
      for (const template of templates) {
        for (const freq of template.service_frequencies) {
          const serviceName = freq.service_template?.service_name || null;
          const key = `${template.treatment_target}-${template.form_name}-${serviceName || 'default'}`;
        const existingConfig = existingConfigMap[key];

        if (existingConfig) {
          // Configuration exists - update if overwrite is enabled
          if (overwriteExisting) {
            await this.db
              .withSchema(`${process.env.MYSQL_DATABASE}`)
              .from('treatment_target_feedback_config')
              .where('id', existingConfig.id)
              .update({
                  purpose: template.purpose,
                  sessions: JSON.stringify(freq.sessions),
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
                treatment_target: template.treatment_target,
                form_name: template.form_name,
                service_name: serviceName,
                purpose: template.purpose,
                sessions: JSON.stringify(freq.sessions),
              tenant_id: data.tenant_id,
              created_at: new Date(),
              updated_at: new Date()
            });
          insertedCount++;
          }
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
          total_template_configurations: templates.length
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

      // Get template configurations with service frequencies
      const templates = await prisma.treatment_target_session_forms_template.findMany({
        where: { is_active: true },
        include: {
          service_frequencies: {
            include: {
              service_template: true,
            },
          },
        },
      });

      // Get tenant configurations
      const tenantConfigs = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('treatment_target_feedback_config')
        .where('tenant_id', data.tenant_id)
        .select('*');

      // Create maps for comparison
      const templateMap = {};
      for (const template of templates) {
        for (const freq of template.service_frequencies) {
          const key = `${template.treatment_target}-${template.form_name}-${freq.nbr_of_sessions}`;
          templateMap[key] = {
            ...template,
            sessions: freq.sessions,
            nbr_of_sessions: freq.nbr_of_sessions,
            service_name: freq.service_template?.service_name || null,
          };
        }
      }

      const tenantMap = {};
      tenantConfigs.forEach(config => {
        const key = `${config.treatment_target}-${config.form_name}-${config.service_name || 'default'}`;
        tenantMap[key] = config;
      });

      // Compare configurations
      const missing = [];
      const outdated = [];
      const upToDate = [];

      for (const [key, templateConfig] of Object.entries(templateMap)) {
        const tenantKey = `${templateConfig.treatment_target}-${templateConfig.form_name}-${templateConfig.service_name || 'default'}`;
        const tenantConfig = tenantMap[tenantKey];

        if (!tenantConfig) {
          missing.push({
            treatment_target: templateConfig.treatment_target,
            form_name: templateConfig.form_name,
            purpose: templateConfig.purpose,
            sessions: templateConfig.sessions,
            nbr_of_sessions: templateConfig.nbr_of_sessions,
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
          total_template_configurations: Object.keys(templateMap).length,
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
