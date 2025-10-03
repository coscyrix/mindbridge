import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const DBconn = require('../config/db.config.js').default;
const knex = require('knex');;
const logger = require('../config/winston.js').default;

const db = knex(DBconn.dbConn.development);

export default class TenantConfiguration {
  //////////////////////////////////////////

  async getTenantConfiguration(tenant_id, feature_name = null) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('tenant_configuration')
        .where('tenant_id', tenant_id)
        .andWhere('status_yn', 1);

      if (feature_name) {
        query = query.andWhere('feature_name', feature_name);
      }

      const rec = await query;
      if (!rec) {
        logger.error('Error getting tenant configuration');
        return { message: 'Error getting tenant configuration', error: -1 };
      }
      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting tenant configuration', error: -1 };
    }
  }

  //////////////////////////////////////////

  async updateTenantConfiguration(data) {
    try {
      const { tenant_id, feature_name, feature_value, is_enabled } = data;

      const updateData = {
        ...(feature_value !== undefined && { feature_value }),
        ...(is_enabled !== undefined && { is_enabled }),
        updated_at: new Date()
      };

      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('tenant_configuration')
        .where('tenant_id', tenant_id)
        .andWhere('feature_name', feature_name)
        .andWhere('status_yn', 1)
        .update(updateData);

      if (result === 0) {
        // If no record exists, create one
        const insertData = {
          tenant_id,
          feature_name,
          feature_value,
          is_enabled: is_enabled !== undefined ? is_enabled : 1
        };

        const insertResult = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('tenant_configuration')
          .insert(insertData);

        if (!insertResult) {
          logger.error('Error creating tenant configuration');
          return { message: 'Error creating tenant configuration', error: -1 };
        }
      }

      return { message: 'Tenant configuration updated successfully' };
    } catch (error) {
      logger.error(error);
      return { message: 'Error updating tenant configuration', error: -1 };
    }
  }

  //////////////////////////////////////////

  async isFeatureEnabled(tenant_id, feature_name) {
    try {
      const config = await this.getTenantConfiguration(tenant_id, feature_name);
      
      if (config.error || !config.length) {
        // Default to enabled if no configuration exists
        return true;
      }

      return config[0].is_enabled === 1;
    } catch (error) {
      logger.error(error);
      // Default to enabled on error
      return true;
    }
  }

  //////////////////////////////////////////

  async getFeatureValue(tenant_id, feature_name) {
    try {
      const config = await this.getTenantConfiguration(tenant_id, feature_name);
      
      if (config.error || !config.length) {
        return null;
      }

      return config[0].feature_value;
    } catch (error) {
      logger.error(error);
      return null;
    }
  }
} 