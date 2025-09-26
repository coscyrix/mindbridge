import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const TenantConfiguration = require('../models/tenantConfiguration.js').default;
const joi = require('joi');;

export default class TenantConfigurationService {
  constructor() {
    this.tenantConfiguration = new TenantConfiguration();
  }

  //////////////////////////////////////////

  async getTenantConfiguration(tenant_id, feature_name = null) {
    const schema = joi.object({
      tenant_id: joi.number().required(),
      feature_name: joi.string().optional()
    });

    const { error } = schema.validate({ tenant_id, feature_name });
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await this.tenantConfiguration.getTenantConfiguration(tenant_id, feature_name);
  }

  //////////////////////////////////////////

  async updateTenantConfiguration(data) {
    const schema = joi.object({
      tenant_id: joi.number().required(),
      feature_name: joi.string().required(),
      feature_value: joi.string().optional(),
      is_enabled: joi.boolean().optional()
    });

    const { error } = schema.validate(data);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await this.tenantConfiguration.updateTenantConfiguration(data);
  }

  //////////////////////////////////////////

  async isFeatureEnabled(tenant_id, feature_name) {
    const schema = joi.object({
      tenant_id: joi.number().required(),
      feature_name: joi.string().required()
    });

    const { error } = schema.validate({ tenant_id, feature_name });
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await this.tenantConfiguration.isFeatureEnabled(tenant_id, feature_name);
  }

  //////////////////////////////////////////

  async getFeatureValue(tenant_id, feature_name) {
    const schema = joi.object({
      tenant_id: joi.number().required(),
      feature_name: joi.string().required()
    });

    const { error } = schema.validate({ tenant_id, feature_name });
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await this.tenantConfiguration.getFeatureValue(tenant_id, feature_name);
  }
} 