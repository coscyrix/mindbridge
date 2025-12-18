import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const joi = require('joi');
import TreatmentTargetSessionFormsTemplate from '../models/treatmentTargetSessionFormsTemplate.js';
import TreatmentTargetServiceFrequencies from '../models/treatmentTargetServiceFrequencies.js';

export default class TreatmentTargetSessionFormsTemplateService {
  //////////////////////////////////////////

  constructor() {
    this.templateModel = new TreatmentTargetSessionFormsTemplate();
    this.frequencyModel = new TreatmentTargetServiceFrequencies();
  }


  /**
   * Create a new template
   * @param {Object} data - Template data
   * @returns {Promise<Object>} Created template
   */
  async createTemplate(data) {
    try {
      const schema = joi.object({
        treatment_target: joi.string().required(),
        form_name: joi.string().required(),
        purpose: joi.string().allow(null, '').optional(),
        is_active: joi.boolean().optional(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      return await this.templateModel.createTemplate(data);
    } catch (error) {
      return { message: 'Error creating template', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Create a template with service frequencies
   * @param {Object} data - Template data with service_frequencies array
   * @returns {Promise<Object>} Created template with frequencies
   */
  async createTemplateWithFrequencies(data) {
    try {
      const schema = joi.object({
        treatment_target: joi.string().required(),
        form_name: joi.string().required(),
        purpose: joi.string().allow(null, '').optional(),
        is_active: joi.boolean().optional(),
        service_frequencies: joi.array().items(
          joi.object({
            service_ref_id: joi.number().allow(null).optional(),
            nbr_of_sessions: joi.number().required(),
            sessions: joi.array().items(joi.number()).required(),
          })
        ).min(1).required(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      return await this.templateModel.createTemplateWithFrequencies(data);
    } catch (error) {
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
      return await this.templateModel.getAllTemplates();
    } catch (error) {
      return { message: 'Error retrieving templates', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get a template by ID
   * @param {number} id - Template ID
   * @returns {Promise<Object>} Template
   */
  async getTemplateById(id) {
    try {
      if (!id) {
        return { message: 'Template ID is required', error: -1 };
      }
      return await this.templateModel.getTemplateById(parseInt(id));
    } catch (error) {
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
      if (!treatmentTarget) {
        return { message: 'Treatment target is required', error: -1 };
      }
      return await this.templateModel.getTemplatesByTreatmentTarget(treatmentTarget);
    } catch (error) {
      return { message: 'Error retrieving templates', error: -1 };
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
      if (!treatmentTarget || !formName) {
        return { message: 'Treatment target and form name are required', error: -1 };
      }
      return await this.templateModel.getTemplateByTreatmentTargetAndFormName(treatmentTarget, formName);
    } catch (error) {
      return { message: 'Error retrieving template', error: -1 };
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
      const schema = joi.object({
        treatment_target: joi.string().optional(),
        form_name: joi.string().optional(),
        purpose: joi.string().allow(null, '').optional(),
        is_active: joi.boolean().optional(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      return await this.templateModel.updateTemplate(parseInt(id), data);
    } catch (error) {
      return { message: 'Error updating template', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Delete a template
   * @param {number} id - Template ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteTemplate(id) {
    try {
      if (!id) {
        return { message: 'Template ID is required', error: -1 };
      }
      return await this.templateModel.deleteTemplate(parseInt(id));
    } catch (error) {
      return { message: 'Error deleting template', error: -1 };
    }
  }

  //////////////////////////////////////////
  // SERVICE FREQUENCY CRUD OPERATIONS
  //////////////////////////////////////////

  /**
   * Add a service frequency to a template
   * @param {Object} data - Service frequency data
   * @returns {Promise<Object>} Created frequency
   */
  async addServiceFrequency(data) {
    try {
      const schema = joi.object({
        template_id: joi.number().required(),
        service_ref_id: joi.number().allow(null).optional(),
        nbr_of_sessions: joi.number().required(),
        sessions: joi.array().items(joi.number()).required(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      return await this.frequencyModel.createServiceFrequency(data);
    } catch (error) {
      return { message: 'Error adding service frequency', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Add multiple service frequencies to a template
   * @param {number} templateId - Template ID
   * @param {Array} frequencies - Array of frequency data
   * @returns {Promise<Object>} Creation result
   */
  async addMultipleServiceFrequencies(templateId, frequencies) {
    try {
      const schema = joi.array().items(
        joi.object({
          service_ref_id: joi.number().allow(null).optional(),
          nbr_of_sessions: joi.number().required(),
          sessions: joi.array().items(joi.number()).required(),
        })
      ).min(1).required();

      const { error } = schema.validate(frequencies);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      const records = frequencies.map(freq => ({
        template_id: templateId,
        ...freq,
      }));

      return await this.frequencyModel.createManyServiceFrequencies(records);
    } catch (error) {
      return { message: 'Error adding service frequencies', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get service frequencies for a template
   * @param {number} templateId - Template ID
   * @returns {Promise<Object>} Service frequencies
   */
  async getServiceFrequencies(templateId) {
    try {
      if (!templateId) {
        return { message: 'Template ID is required', error: -1 };
      }
      return await this.frequencyModel.getServiceFrequenciesByTemplateId(parseInt(templateId));
    } catch (error) {
      return { message: 'Error retrieving service frequencies', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Update a service frequency
   * @param {number} id - Frequency ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated frequency
   */
  async updateServiceFrequency(id, data) {
    try {
      const schema = joi.object({
        service_ref_id: joi.number().allow(null).optional(),
        nbr_of_sessions: joi.number().optional(),
        sessions: joi.array().items(joi.number()).optional(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      return await this.frequencyModel.updateServiceFrequency(parseInt(id), data);
    } catch (error) {
      return { message: 'Error updating service frequency', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Delete a service frequency
   * @param {number} id - Frequency ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteServiceFrequency(id) {
    try {
      if (!id) {
        return { message: 'Frequency ID is required', error: -1 };
      }
      return await this.frequencyModel.deleteServiceFrequency(parseInt(id));
    } catch (error) {
      return { message: 'Error deleting service frequency', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get session frequency for a specific combination
   * @param {Object} data - Query parameters
   * @returns {Promise<Object>} Session frequency
   */
  async getSessionFrequency(data) {
    try {
      const schema = joi.object({
        treatment_target: joi.string().required(),
        form_name: joi.string().required(),
        service_template_id: joi.number().required(),
        nbr_of_sessions: joi.number().required(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      return await this.frequencyModel.getSessionFrequency(
        data.treatment_target,
        data.form_name,
        data.service_template_id,
        data.nbr_of_sessions
      );
    } catch (error) {
      return { message: 'Error retrieving session frequency', error: -1 };
    }
  }

  //////////////////////////////////////////
  // LEGACY METHODS (for backward compatibility)
  //////////////////////////////////////////

  /**
   * Get all template configurations (legacy)
   * @returns {Promise<Object>} Template configurations
   */
  async getTemplateConfigurations() {
    try {
      return await this.templateModel.getTemplateConfigurations();
    } catch (error) {
      return { message: 'Error retrieving template configurations', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Copy template configurations to a new tenant
   * @param {Object} data - Data object containing tenant_id
   * @returns {Promise<Object>} Copy result
   */
  async copyTemplateConfigurationsToTenant(data) {
    try {
      const schema = joi.object({
        tenant_id: joi.number().required(),
      });

      const { error } = schema.validate(data);

      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      return await this.templateModel.copyTemplateConfigurationsToTenant(data);
    } catch (error) {
      return { message: 'Error copying template configurations', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Update existing tenant configurations with latest template configurations
   * @param {Object} data - Data object containing tenant_id and optional overwrite_existing
   * @returns {Promise<Object>} Update result
   */
  async updateTemplateConfigurationsForTenant(data) {
    try {
      const schema = joi.object({
        tenant_id: joi.number().required(),
        overwrite_existing: joi.boolean().optional(),
      });

      const { error } = schema.validate(data);

      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      return await this.templateModel.updateTemplateConfigurationsForTenant(data);
    } catch (error) {
      return { message: 'Error updating template configurations', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get tenant configurations
   * @param {Object} data - Data object containing tenant_id
   * @returns {Promise<Object>} Tenant configurations
   */
  async getTenantConfigurations(data) {
    try {
      const schema = joi.object({
        tenant_id: joi.number().required(),
      });

      const { error } = schema.validate(data);

      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      return await this.templateModel.getTenantConfigurations(data);
    } catch (error) {
      return { message: 'Error retrieving tenant configurations', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Compare tenant configurations with template configurations
   * @param {Object} data - Data object containing tenant_id
   * @returns {Promise<Object>} Comparison result
   */
  async compareTenantWithTemplate(data) {
    try {
      const schema = joi.object({
        tenant_id: joi.number().required(),
      });

      const { error } = schema.validate(data);

      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      return await this.templateModel.compareTenantWithTemplate(data);
    } catch (error) {
      return { message: 'Error comparing configurations', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Reset tenant configurations to match template exactly
   * @param {Object} data - Data object containing tenant_id
   * @returns {Promise<Object>} Reset result
   */
  async resetTenantConfigurationsToTemplate(data) {
    try {
      const schema = joi.object({
        tenant_id: joi.number().required(),
      });

      const { error } = schema.validate(data);

      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      return await this.templateModel.resetTenantConfigurationsToTemplate(data);
    } catch (error) {
      return { message: 'Error resetting tenant configurations', error: -1 };
    }
  }
}
