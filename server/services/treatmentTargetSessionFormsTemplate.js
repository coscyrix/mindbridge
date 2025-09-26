import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const joi = require('joi');;
import TreatmentTargetSessionFormsTemplate from '../models/treatmentTargetSessionFormsTemplate.js';

export default class TreatmentTargetSessionFormsTemplateService {
  //////////////////////////////////////////

  constructor() {
    this.treatmentTargetSessionFormsTemplate = new TreatmentTargetSessionFormsTemplate();
  }

  //////////////////////////////////////////

  /**
   * Get all template configurations
   * @returns {Promise<Object>} Template configurations
   */
  async getTemplateConfigurations() {
    try {
      return await this.treatmentTargetSessionFormsTemplate.getTemplateConfigurations();
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

      return await this.treatmentTargetSessionFormsTemplate.copyTemplateConfigurationsToTenant(data);
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

      return await this.treatmentTargetSessionFormsTemplate.updateTemplateConfigurationsForTenant(data);
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

      return await this.treatmentTargetSessionFormsTemplate.getTenantConfigurations(data);
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

      return await this.treatmentTargetSessionFormsTemplate.compareTenantWithTemplate(data);
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

      return await this.treatmentTargetSessionFormsTemplate.resetTenantConfigurationsToTemplate(data);
    } catch (error) {
      return { message: 'Error resetting tenant configurations', error: -1 };
    }
  }
}
