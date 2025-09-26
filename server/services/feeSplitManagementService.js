import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import FeeSplitManagement from '../models/feeSplitManagement.js';
const joi = require('joi');;

export default class FeeSplitManagementService {
  constructor() {
    this.feeSplitManagement = new FeeSplitManagement();
  }

  //////////////////////////////////////////

  async getFeeSplitConfiguration(tenant_id, counselor_user_id = null) {
    const schema = joi.object({
      tenant_id: joi.number().required(),
      counselor_user_id: joi.number().optional().allow(null)
    });

    const { error } = schema.validate({ tenant_id, counselor_user_id });
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await this.feeSplitManagement.getFeeSplitConfiguration(tenant_id, counselor_user_id);
  }

  //////////////////////////////////////////

  async createFeeSplitConfiguration(data) {
    const schema = joi.object({
      tenant_id: joi.number().required(),
      counselor_user_id: joi.number().optional().allow(null),
      is_fee_split_enabled: joi.boolean().required(),
      tenant_share_percentage: joi.number().min(0).max(100).when('is_fee_split_enabled', {
        is: true,
        then: joi.required()
      }),
      counselor_share_percentage: joi.number().min(0).max(100).when('is_fee_split_enabled', {
        is: true,
        then: joi.required()
      })
    }).custom((value, helpers) => {
      // Custom validation to ensure percentages sum to 100 when fee split is enabled
      if (value.is_fee_split_enabled) {
        const total = value.tenant_share_percentage + value.counselor_share_percentage;
        if (total !== 100) {
          return helpers.error('any.invalid', { 
            message: 'Tenant and counselor share percentages must sum to 100% when fee split is enabled' 
          });
        }
      }
      return value;
    });

    const { error } = schema.validate(data);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await this.feeSplitManagement.createFeeSplitConfiguration(data);
  }

  //////////////////////////////////////////

  async updateFeeSplitConfiguration(data) {
    const schema = joi.object({
      tenant_id: joi.number().required(),
      counselor_user_id: joi.number().optional().allow(null),
      is_fee_split_enabled: joi.boolean().required(),
      tenant_share_percentage: joi.number().min(0).max(100).when('is_fee_split_enabled', {
        is: true,
        then: joi.required()
      }),
      counselor_share_percentage: joi.number().min(0).max(100).when('is_fee_split_enabled', {
        is: true,
        then: joi.required()
      })
    }).custom((value, helpers) => {
      // Custom validation to ensure percentages sum to 100 when fee split is enabled
      if (value.is_fee_split_enabled) {
        const total = value.tenant_share_percentage + value.counselor_share_percentage;
        if (total !== 100) {
          return helpers.error('any.invalid', { 
            message: 'Tenant and counselor share percentages must sum to 100% when fee split is enabled' 
          });
        }
      }
      return value;
    });

    const { error } = schema.validate(data);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await this.feeSplitManagement.updateFeeSplitConfiguration(data);
  }

  //////////////////////////////////////////

  async isFeeSplitEnabled(tenant_id, counselor_user_id = null) {
    const schema = joi.object({
      tenant_id: joi.number().required(),
      counselor_user_id: joi.number().optional().allow(null)
    });

    const { error } = schema.validate({ tenant_id, counselor_user_id });
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await this.feeSplitManagement.isFeeSplitEnabled(tenant_id, counselor_user_id);
  }

  //////////////////////////////////////////

  async getFeeSplitPercentages(tenant_id, counselor_user_id = null) {
    const schema = joi.object({
      tenant_id: joi.number().required(),
      counselor_user_id: joi.number().optional().allow(null)
    });

    const { error } = schema.validate({ tenant_id, counselor_user_id });
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await this.feeSplitManagement.getFeeSplitPercentages(tenant_id, counselor_user_id);
  }

  //////////////////////////////////////////

  async validateFeeSplitConfiguration(data) {
    const schema = joi.object({
      tenant_id: joi.number().required(),
      counselor_user_id: joi.number().optional().allow(null),
      is_fee_split_enabled: joi.boolean().required(),
      tenant_share_percentage: joi.number().min(0).max(100).when('is_fee_split_enabled', {
        is: true,
        then: joi.required()
      }),
      counselor_share_percentage: joi.number().min(0).max(100).when('is_fee_split_enabled', {
        is: true,
        then: joi.required()
      })
    }).custom((value, helpers) => {
      if (value.is_fee_split_enabled) {
        const total = value.tenant_share_percentage + value.counselor_share_percentage;
        if (total !== 100) {
          return helpers.error('any.invalid', { 
            message: 'Tenant and counselor share percentages must sum to 100% when fee split is enabled' 
          });
        }
      }
      return value;
    });

    const { error } = schema.validate(data);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return { valid: true };
  }

  //////////////////////////////////////////

  async getAllFeeSplitConfigurations(tenant_id = null) {
    const schema = joi.object({
      tenant_id: joi.number().optional().allow(null)
    });

    const { error } = schema.validate({ tenant_id });
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await this.feeSplitManagement.getAllFeeSplitConfigurations(tenant_id);
  }

  //////////////////////////////////////////

  async getCounselorSpecificConfigurations(tenant_id) {
    const schema = joi.object({
      tenant_id: joi.number().required()
    });

    const { error } = schema.validate({ tenant_id });
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await this.feeSplitManagement.getCounselorSpecificConfigurations(tenant_id);
  }

  //////////////////////////////////////////

  async deleteFeeSplitConfiguration(tenant_id, counselor_user_id = null) {
    const schema = joi.object({
      tenant_id: joi.number().required(),
      counselor_user_id: joi.number().optional().allow(null)
    });

    const { error } = schema.validate({ tenant_id, counselor_user_id });
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await this.feeSplitManagement.deleteFeeSplitConfiguration(tenant_id, counselor_user_id);
  }

  //////////////////////////////////////////

  async getCounselorsByTenant(tenant_id) {
    const schema = joi.object({
      tenant_id: joi.number().required()
    });

    const { error } = schema.validate({ tenant_id });
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await this.feeSplitManagement.getCounselorsByTenant(tenant_id);
  }
} 