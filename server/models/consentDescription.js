import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import db from '../utils/db.js';
import logger from '../config/winston.js';
import Common from './common.js';

export default class ConsentDescription {
  constructor() {
    this.common = new Common();
  }

  
  //////////////////////////////////////////
  async createConsentDescription(data) {
    
    try {
      let tenant_id;
      
      // Handle default template for new tenants (admin feature)
      if (data.is_default_template) {
        // Find or create system tenant for default templates
        // Look for a tenant with tenant_generated_id = 0 or tenant_name = 'System Default'
        let systemTenant = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('tenant')
          .where('tenant_generated_id', 0)
          .orWhere('tenant_name', 'System Default')
          .first();
        
        if (!systemTenant) {
          // Create system tenant if it doesn't exist
          const insertResult = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('tenant')
            .insert({
              tenant_name: 'System Default',
              tenant_generated_id: 0,
              created_at: db.fn.now(),
              updated_at: db.fn.now(),
            });
          
          // Get the created tenant_id
          systemTenant = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('tenant')
            .where('tenant_generated_id', 0)
            .first();
        }
        
        tenant_id = systemTenant.tenant_id;
      } else {
        const tenant = await this.common.getTenantByTenantGeneratedId(data.tenant_id);
        
        if (tenant.error) {
          return tenant; // Return the error if tenant not found
        }
        tenant_id = tenant[0].tenant_id;
      }

      // If creating a default template, delete any existing default template first
      if (data.is_default_template) {
        // Find system tenant to get its tenant_id
        const systemTenant = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('tenant')
          .where('tenant_generated_id', 0)
          .orWhere('tenant_name', 'System Default')
          .first();
        
        if (systemTenant) {
          await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('consent_descriptions')
            .where('tenant_id', systemTenant.tenant_id)
            .whereNull('counselor_id')
            .del();
        }
      }

      const insertData = {
        tenant_id: tenant_id,
        description: data.description,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      };
      
      // Only add counselor_id if it's provided and not null/undefined (for non-admin users)
      if (data.counselor_id) {
        insertData.counselor_id = data.counselor_id;
      }

      
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('consent_descriptions')
        .insert(insertData);
      return { message: 'Consent description created successfully', id: result[0] };
    } catch (error) {
      console.log(error, 'error');
      
      logger.error(error);
      return { message: 'Error creating consent description', error: -1 };
    }
  }

  async getConsentDescription({ tenant_id, counselor_id }) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('consent_descriptions')
        .where('tenant_id', tenant_id);
      if (counselor_id) {
        query = query.where('counselor_id', counselor_id);
      } else {
        query = query.whereNull('counselor_id');
      }
      const result = await query.orderBy('updated_at', 'desc').first();
      return result || null;
    } catch (error) {
      logger.error(error);
      return { message: 'Error fetching consent description', error: -1 };
    }
  }

  async updateConsentDescription(id, data) {
    try {
      const updateData = {
        description: data.description,
        updated_at: db.fn.now(),
      };
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('consent_descriptions')
        .where('id', id)
        .update(updateData);
      return { message: 'Consent description updated', updated: result };
    } catch (error) {
      logger.error(error);
      return { message: 'Error updating consent description', error: -1 };
    }
  }

  async deleteConsentDescription(id) {
    try {
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('consent_descriptions')
        .where('id', id)
        .del();
      return { message: 'Consent description deleted', deleted: result };
    } catch (error) {
      logger.error(error);
      return { message: 'Error deleting consent description', error: -1 };
    }
  }

  // Get default consent form template (from system tenant)
  async getDefaultConsentTemplate() {
    try {
      // Find system tenant
      const systemTenant = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('tenant')
        .where('tenant_generated_id', 0)
        .orWhere('tenant_name', 'System Default')
        .first();
      
      if (!systemTenant) {
        return null;
      }
      
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('consent_descriptions')
        .where('tenant_id', systemTenant.tenant_id)
        .whereNull('counselor_id')
        .orderBy('updated_at', 'desc')
        .first();
      return result || null;
    } catch (error) {
      logger.error(error);
      return { message: 'Error fetching default consent template', error: -1 };
    }
  }

  // Copy default consent template to a new tenant
  async copyDefaultTemplateToTenant(tenant_id) {
    try {
      const defaultTemplate = await this.getDefaultConsentTemplate();
      
      if (!defaultTemplate || defaultTemplate.error) {
        // No default template exists, skip copying
        logger.info(`No default consent template found, skipping copy to tenant ${tenant_id}`);
        return { message: 'No default template to copy', skipped: true };
      }

      const insertData = {
        tenant_id: tenant_id,
        description: defaultTemplate.description,
        created_at: db.fn.now(),
        updated_at: db.fn.now(),
      };

      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('consent_descriptions')
        .insert(insertData);
      
      logger.info(`Default consent template copied to tenant ${tenant_id}`);
      return { message: 'Default consent template copied successfully', id: result[0] };
    } catch (error) {
      logger.error(`Error copying default consent template to tenant ${tenant_id}:`, error);
      return { message: 'Error copying default consent template', error: -1 };
    }
  }
} 