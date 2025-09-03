import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';

const db = knex(DBconn.dbConn.development);

export default class FeeSplitManagement {
  //////////////////////////////////////////

  async getFeeSplitConfiguration(tenant_id, counselor_user_id = null) {
    try {
      // Get default configuration (for all counselors)
      const defaultConfig = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('fee_split_management')
        .where('tenant_id', tenant_id)
        .whereNull('counselor_user_id')
        .andWhere('status_yn', 1)
        .first();

      // Default values if no default configuration exists
      const defaultValues = {
        is_fee_split_enabled: false,
        tenant_share_percentage: 0,
        counselor_share_percentage: 100,
        counselor_user_id: null
      };

      const defaultConfiguration = defaultConfig ? {
        is_fee_split_enabled: defaultConfig.is_fee_split_enabled === 1,
        tenant_share_percentage: defaultConfig.tenant_share_percentage || 0,
        counselor_share_percentage: defaultConfig.counselor_share_percentage || 100,
        counselor_user_id: null
      } : defaultValues;

      // Get all counselors for this tenant (handle both tenant_id and tenant_generated_id)
      const counselors = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users as u')
        .join('tenant as t', function() {
          this.on('u.tenant_id', '=', 't.tenant_id')
              .orOn('u.tenant_id', '=', 't.tenant_generated_id');
        })
        .where('t.tenant_id', tenant_id)
        .andWhere('u.role_id', 2) // role_id = 2 is for counselors
        .andWhere('u.status_yn', 'y')
        .select('u.user_id', 'u.name', 'u.email', 'u.role_id');

      logger.info(`Found ${counselors.length} counselors for tenant ${tenant_id}`);
      if (counselors.length > 0) {
        logger.info('Counselors found:', counselors.map(c => ({ user_id: c.user_id, name: c.name })));
      }

      // Get all counselor-specific configurations for this tenant
      const counselorConfigs = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('fee_split_management')
        .where('tenant_id', tenant_id)
        .whereNotNull('counselor_user_id')
        .andWhere('status_yn', 1)
        .select('counselor_user_id', 'is_fee_split_enabled', 'tenant_share_percentage', 'counselor_share_percentage');

      // Create a map of counselor configurations for quick lookup
      const counselorConfigMap = {};
      counselorConfigs.forEach(config => {
        counselorConfigMap[config.counselor_user_id] = {
          is_fee_split_enabled: config.is_fee_split_enabled === 1,
          tenant_share_percentage: config.tenant_share_percentage || 0,
          counselor_share_percentage: config.counselor_share_percentage || 100,
          counselor_user_id: config.counselor_user_id
        };
      });

      // Build counselor-specific configurations array
      const counselorSpecificConfigurations = counselors.map(counselor => {
        // Double-check that this user is actually a counselor
        if (counselor.role_id !== 2) {
          logger.warn(`User ${counselor.user_id} is not a counselor (role_id: ${counselor.role_id}), skipping`);
          return null;
        }

        const counselorConfig = counselorConfigMap[counselor.user_id];
        
        if (counselorConfig) {
          // Counselor has specific configuration
          return {
            ...counselorConfig,
            counselor_info: {
              user_id: counselor.user_id,
              name: counselor.name,
              email: counselor.email
            }
          };
        } else {
          // Counselor uses default configuration
          return {
            ...defaultConfiguration,
            counselor_user_id: counselor.user_id,
            counselor_info: {
              user_id: counselor.user_id,
              name: counselor.name,
              email: counselor.email
            }
          };
        }
      }).filter(config => config !== null); // Remove any null entries

      return {
        default_configuration: defaultConfiguration,
        counselor_specific_configurations: counselorSpecificConfigurations
      };
    } catch (error) {
      logger.error('Error getting fee split configuration:', error);
      return { message: 'Error getting fee split configuration', error: -1 };
    }
  }

  //////////////////////////////////////////

  async createFeeSplitConfiguration(data) {
    try {
      const { tenant_id, counselor_user_id = null, is_fee_split_enabled, tenant_share_percentage, counselor_share_percentage } = data;

      // Validate that percentages sum to 100 when fee split is enabled
      if (is_fee_split_enabled && (tenant_share_percentage + counselor_share_percentage !== 100)) {
        return { 
          message: 'Tenant and counselor share percentages must sum to 100% when fee split is enabled', 
          error: -1 
        };
      }

      // Check if configuration already exists
      let existingQuery = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('fee_split_management')
        .where('tenant_id', tenant_id)
        .andWhere('status_yn', 1);

      if (counselor_user_id) {
        existingQuery = existingQuery.andWhere('counselor_user_id', counselor_user_id);
      } else {
        existingQuery = existingQuery.whereNull('counselor_user_id');
      }

      const existingConfig = await existingQuery.first();

      if (existingConfig) {
        return { 
          message: 'Fee split configuration already exists for this tenant and counselor combination', 
          error: -1 
        };
      }

      // Create new configuration
      const insertData = {
        tenant_id,
        counselor_user_id,
        is_fee_split_enabled: is_fee_split_enabled ? 1 : 0,
        tenant_share_percentage: tenant_share_percentage || 0,
        counselor_share_percentage: counselor_share_percentage || 100
      };

      const insertResult = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('fee_split_management')
        .insert(insertData);

      if (!insertResult) {
        logger.error('Error creating fee split configuration');
        return { message: 'Error creating fee split configuration', error: -1 };
      }

      return { 
        message: 'Fee split configuration created successfully',
        data: {
          id: insertResult[0],
          is_fee_split_enabled,
          tenant_share_percentage: tenant_share_percentage || 0,
          counselor_share_percentage: counselor_share_percentage || 100,
          counselor_user_id
        }
      };
    } catch (error) {
      logger.error('Error creating fee split configuration:', error);
      return { message: 'Error creating fee split configuration', error: -1 };
    }
  }

  //////////////////////////////////////////

  async updateFeeSplitConfiguration(data) {
    try {
      const { tenant_id, counselor_user_id = null, is_fee_split_enabled, tenant_share_percentage, counselor_share_percentage } = data;

      // Validate that percentages sum to 100 when fee split is enabled
      if (is_fee_split_enabled && (tenant_share_percentage + counselor_share_percentage !== 100)) {
        return { 
          message: 'Tenant and counselor share percentages must sum to 100% when fee split is enabled', 
          error: -1 
        };
      }

      const updateData = {
        is_fee_split_enabled: is_fee_split_enabled ? 1 : 0,
        tenant_share_percentage: tenant_share_percentage || 0,
        counselor_share_percentage: counselor_share_percentage || 100,
        updated_at: new Date()
      };

      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('fee_split_management')
        .where('tenant_id', tenant_id)
        .andWhere('status_yn', 1);

      if (counselor_user_id) {
        query = query.andWhere('counselor_user_id', counselor_user_id);
      } else {
        query = query.whereNull('counselor_user_id');
      }

      const result = await query.update(updateData);

      if (result === 0) {
        // If no record exists, create one
        const insertData = {
          tenant_id,
          counselor_user_id,
          is_fee_split_enabled: is_fee_split_enabled ? 1 : 0,
          tenant_share_percentage: tenant_share_percentage || 0,
          counselor_share_percentage: counselor_share_percentage || 100
        };

        const insertResult = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('fee_split_management')
          .insert(insertData);

        if (!insertResult) {
          logger.error('Error creating fee split configuration');
          return { message: 'Error creating fee split configuration', error: -1 };
        }
      }

      return { 
        message: 'Fee split configuration updated successfully',
        data: {
          is_fee_split_enabled,
          tenant_share_percentage: tenant_share_percentage || 0,
          counselor_share_percentage: counselor_share_percentage || 100,
          counselor_user_id
        }
      };
    } catch (error) {
      logger.error('Error updating fee split configuration:', error);
      return { message: 'Error updating fee split configuration', error: -1 };
    }
  }

  //////////////////////////////////////////

  async isFeeSplitEnabled(tenant_id, counselor_user_id = null) {
    try {
      const config = await this.getFeeSplitConfiguration(tenant_id, counselor_user_id);
      
      if (config.error) {
        return false;
      }

      // If counselor_user_id is provided, return counselor-specific configuration
      if (counselor_user_id) {
        return config.counselor_specific_configurations.find(c => c.counselor_user_id === counselor_user_id).is_fee_split_enabled;
      }

      // Otherwise return default configuration
      return config.default_configuration.is_fee_split_enabled;
    } catch (error) {
      logger.error('Error checking fee split enabled status:', error);
      return false;
    }
  }

  //////////////////////////////////////////

  async getFeeSplitPercentages(tenant_id, counselor_user_id = null) {
    try {
      const config = await this.getFeeSplitConfiguration(tenant_id, counselor_user_id);
      
      if (config.error) {
        return {
          is_fee_split_enabled: false,
          tenant_share_percentage: 0,
          counselor_share_percentage: 100
        };
      }

      // If counselor_user_id is provided, return counselor-specific configuration
      if (counselor_user_id) {
        const counselorConfig = config.counselor_specific_configurations.find(c => c.counselor_user_id === counselor_user_id);
        if (counselorConfig) {
          return {
            is_fee_split_enabled: counselorConfig.is_fee_split_enabled,
            tenant_share_percentage: counselorConfig.tenant_share_percentage,
            counselor_share_percentage: counselorConfig.counselor_share_percentage
          };
        } else {
          // Fall back to default configuration if no counselor-specific config exists
          return {
            is_fee_split_enabled: config.default_configuration.is_fee_split_enabled,
            tenant_share_percentage: config.default_configuration.tenant_share_percentage,
            counselor_share_percentage: config.default_configuration.counselor_share_percentage
          };
        }
      }

      // Otherwise return default configuration
      return {
        is_fee_split_enabled: config.default_configuration.is_fee_split_enabled,
        tenant_share_percentage: config.default_configuration.tenant_share_percentage,
        counselor_share_percentage: config.default_configuration.counselor_share_percentage
      };
    } catch (error) {
      logger.error('Error getting fee split percentages:', error);
      return {
        is_fee_split_enabled: false,
        tenant_share_percentage: 0,
        counselor_share_percentage: 100
      };
    }
  }

  //////////////////////////////////////////

  async getAllFeeSplitConfigurations(tenant_id = null) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('fee_split_management')
        .where('status_yn', 1);

      if (tenant_id) {
        query = query.andWhere('tenant_id', tenant_id);
      }

      const configs = await query.select('*');

      return configs.map(config => ({
        tenant_id: config.tenant_id,
        counselor_user_id: config.counselor_user_id,
        is_fee_split_enabled: config.is_fee_split_enabled === 1,
        tenant_share_percentage: config.tenant_share_percentage,
        counselor_share_percentage: config.counselor_share_percentage,
        created_at: config.created_at,
        updated_at: config.updated_at
      }));
    } catch (error) {
      logger.error('Error getting all fee split configurations:', error);
      return { message: 'Error getting all fee split configurations', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getCounselorSpecificConfigurations(tenant_id) {
    try {
      const configs = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('fee_split_management')
        .where('tenant_id', tenant_id)
        .andWhere('status_yn', 1)
        .andWhereNotNull('counselor_user_id')
        .select('*');

      return configs.map(config => ({
        counselor_user_id: config.counselor_user_id,
        is_fee_split_enabled: config.is_fee_split_enabled === 1,
        tenant_share_percentage: config.tenant_share_percentage,
        counselor_share_percentage: config.counselor_share_percentage,
        created_at: config.created_at,
        updated_at: config.updated_at
      }));
    } catch (error) {
      logger.error('Error getting counselor-specific configurations:', error);
      return { message: 'Error getting counselor-specific configurations', error: -1 };
    }
  }

  //////////////////////////////////////////

  async deleteFeeSplitConfiguration(tenant_id, counselor_user_id = null) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('fee_split_management')
        .where('tenant_id', tenant_id)
        .andWhere('status_yn', 1);

      if (counselor_user_id) {
        query = query.andWhere('counselor_user_id', counselor_user_id);
      } else {
        query = query.whereNull('counselor_user_id');
      }

      const result = await query.update({ status_yn: 0, updated_at: new Date() });

      if (result === 0) {
        return { message: 'Fee split configuration not found', error: -1 };
      }

      return { message: 'Fee split configuration deleted successfully' };
    } catch (error) {
      logger.error('Error deleting fee split configuration:', error);
      return { message: 'Error deleting fee split configuration', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getCounselorsByTenant(tenant_id) {
    try {
      const counselors = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users as u')
        .join('tenant as t', function() {
          this.on('u.tenant_id', '=', 't.tenant_id')
              .orOn('u.tenant_id', '=', 't.tenant_generated_id');
        })
        .where('t.tenant_id', tenant_id)
        .andWhere('u.role_id', 2) // role_id = 2 is for counselors
        .andWhere('u.status_yn', 'y')
        .select('u.user_id', 'u.name', 'u.email', 'u.role_id');

      logger.info(`getCounselorsByTenant: Found ${counselors.length} counselors for tenant ${tenant_id}`);
      
      return counselors;
    } catch (error) {
      logger.error('Error getting counselors by tenant:', error);
      return { message: 'Error getting counselors by tenant', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getFeeSplitConfigurationForCounselor(tenant_id, counselor_user_id) {
    try {
      // Get default configuration (for all counselors)
      const defaultConfig = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('fee_split_management')
        .where('tenant_id', tenant_id)
        .whereNull('counselor_user_id')
        .andWhere('status_yn', 1)
        .first();

      // Default values if no default configuration exists
      const defaultValues = {
        is_fee_split_enabled: false,
        tenant_share_percentage: 0,
        counselor_share_percentage: 100
      };

      const defaultConfiguration = defaultConfig ? {
        is_fee_split_enabled: defaultConfig.is_fee_split_enabled === 1,
        tenant_share_percentage: defaultConfig.tenant_share_percentage || 0,
        counselor_share_percentage: defaultConfig.counselor_share_percentage || 100
      } : defaultValues;

      // Get counselor-specific configuration if it exists
      let finalConfig = { ...defaultConfiguration };
      if (counselor_user_id) {
        const counselorConfig = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('fee_split_management')
          .where('tenant_id', tenant_id)
          .where('counselor_user_id', counselor_user_id)
          .andWhere('status_yn', 1)
          .first();

        if (counselorConfig) {
          finalConfig = {
            is_fee_split_enabled: counselorConfig.is_fee_split_enabled === 1,
            tenant_share_percentage: counselorConfig.tenant_share_percentage || 0,
            counselor_share_percentage: counselorConfig.counselor_share_percentage || 100
          };
        }
      }

      // Get counselor info
      const counselorInfo = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('users')
        .where('user_id', counselor_user_id)
        .andWhere('status_yn', 'y')
        .select('user_id', 'name', 'email', 'role_id')
        .first();

      // Return single, simplified structure
      return {
        ...finalConfig,
        counselor_user_id: counselor_user_id,
        counselor_info: counselorInfo ? {
          user_id: counselorInfo.user_id,
          name: counselorInfo.name,
          email: counselorInfo.email
        } : null
      };
    } catch (error) {
      logger.error('Error getting fee split configuration for counselor:', error);
      return { message: 'Error getting fee split configuration for counselor', error: -1 };
    }
  }

  //////////////////////////////////////////
} 