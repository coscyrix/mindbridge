import ServiceTemplate from '../models/serviceTemplate.js';
import Service from '../models/service.js';
import Common from '../models/common.js';
import Form from '../models/form.js';
import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';

const db = knex(DBconn.dbConn.development);

export default class ServiceTemplateService {
  constructor() {
    this.serviceTemplate = new ServiceTemplate();
    this.service = new Service();
    this.common = new Common();
    this.form = new Form();
  }

  // Helper function to parse svc_ids safely
  parseSvcIds(svcIdsData, formId) {
    if (!svcIdsData) return [];
    
    console.log(`Form ${formId} svc_ids raw data:`, svcIdsData);
    
    // If it's already an array, return it
    if (Array.isArray(svcIdsData)) {
      console.log(`Form ${formId} svc_ids is already an array:`, svcIdsData);
      return svcIdsData;
    }
    
    // If it's a string, parse it as comma-separated
    if (typeof svcIdsData === 'string') {
      const svcIds = svcIdsData.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id));
      console.log(`Form ${formId} parsed string svc_ids:`, svcIds);
      return svcIds;
    }
    
    // If it's neither array nor string, return empty array
    console.log(`Form ${formId} svc_ids is neither array nor string, type: ${typeof svcIdsData}`);
    return [];
  }

  // Helper function to parse svc_report_formula safely
  parseSvcReportFormula(data) {
    console.log(`🔧 Parsing svc_report_formula: ${JSON.stringify(data)} (type: ${typeof data})`);
    
    // If data is null or undefined, return default
    if (data === null || data === undefined) {
      console.log('  → Data is null/undefined, returning default');
      return { position: [], service_id: [] };
    }
    
    // If data is already a proper object with position and service_id arrays
    if (typeof data === 'object' && !Array.isArray(data)) {
      console.log('  → Data is already an object');
      
      // Validate and ensure proper structure
      const result = {
        position: Array.isArray(data.position) ? data.position : [],
        service_id: Array.isArray(data.service_id) ? data.service_id : []
      };
      
      // Validate array contents are numbers
      result.position = result.position.filter(item => typeof item === 'number' && !isNaN(item));
      result.service_id = result.service_id.filter(item => typeof item === 'number' && !isNaN(item));
      
      console.log(`  → Parsed object: ${JSON.stringify(result)}`);
      return result;
    }
    
    // If data is a string, try to parse as JSON
    if (typeof data === 'string') {
      console.log('  → Data is a string, attempting JSON parse');
      
      // Handle empty string
      if (data.trim() === '') {
        console.log('  → Empty string, returning default');
        return { position: [], service_id: [] };
      }
      
      try {
        const parsed = JSON.parse(data);
        console.log(`  → JSON parsed successfully: ${JSON.stringify(parsed)}`);
        
        // Validate the parsed result
        if (typeof parsed === 'object' && !Array.isArray(parsed)) {
          const result = {
            position: Array.isArray(parsed.position) ? parsed.position : [],
            service_id: Array.isArray(parsed.service_id) ? parsed.service_id : []
          };
          
          // Validate array contents are numbers
          result.position = result.position.filter(item => typeof item === 'number' && !isNaN(item));
          result.service_id = result.service_id.filter(item => typeof item === 'number' && !isNaN(item));
          
          console.log(`  → Validated parsed object: ${JSON.stringify(result)}`);
          return result;
        } else {
          console.log('  → Parsed JSON is not a valid object, returning default');
          return { position: [], service_id: [] };
        }
      } catch (error) {
        console.log(`  → JSON parse error: ${error.message}, returning default`);
        return { position: [], service_id: [] };
      }
    }
    
    // If data is an array or any other type, return default
    console.log(`  → Data is ${typeof data} (not object or string), returning default`);
    return { position: [], service_id: [] };
  }

  async createTemplate(data) {
    return this.serviceTemplate.createTemplate(data);
  }

  async getTemplates(filters) {
    return this.serviceTemplate.getTemplates(filters);
  }

  async getTemplateById(template_service_id) {
    return this.serviceTemplate.getTemplateById(template_service_id);
  }

  async updateTemplate(template_service_id, data) {
    return this.serviceTemplate.updateTemplate(template_service_id, data);
  }

  async deleteTemplate(template_service_id) {
    return this.serviceTemplate.deleteTemplate(template_service_id);
  }

  async checkFormsAffectedByTemplate(template_service_id, tenant_id) {
    try {
      console.log(`Checking forms that would be affected by template_service_id: ${template_service_id}, tenant_id: ${tenant_id}`);
      
      // Get all forms and filter in JavaScript to find forms containing template_service_id
      const allForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('forms')
        .where('status_yn', 1);

      console.log(`Found ${allForms.length} total forms`);

      // Filter forms that contain the template_service_id in their svc_ids
      const forms = allForms.filter(form => {
        const svcIds = this.parseSvcIds(form.svc_ids, form.form_id);
        return svcIds.includes(template_service_id);
      });

      console.log(`Found ${forms.length} forms containing template_service_id: ${template_service_id}`);

      const formDetails = forms.map(form => {
        const svcIds = this.parseSvcIds(form.svc_ids, form.form_id);

        return {
          form_id: form.form_id,
          form_cde: form.form_cde,
          frequency_desc: form.frequency_desc,
          frequency_typ: form.frequency_typ,
          current_svc_ids: svcIds,
          current_svc_ids_count: svcIds.length,
          would_add_new_service: true // This form contains template_service_id, so it will be updated
        };
      });

      return {
        message: `Forms check completed for template_service_id: ${template_service_id}`,
        template_service_id: template_service_id,
        tenant_id: tenant_id,
        total_forms_found: forms.length,
        forms: formDetails,
        summary: {
          forms_that_would_be_updated: formDetails.length,
          forms_already_contain_template: formDetails.length
        }
      };
    } catch (error) {
      console.error('Error checking forms affected by template:', error);
      logger.error('Error checking forms affected by template:', error);
      return {
        message: 'Error checking forms affected by template',
        error: -1,
        details: error.message
      };
    }
  }

  async updateFormsForNewService(template_service_id, new_service_id, tenant_id) {
    try {
      console.log(`Updating forms for template_service_id: ${template_service_id}, new_service_id: ${new_service_id}, tenant_id: ${tenant_id}`);
      
      // Get all forms and filter in JavaScript to find forms containing template_service_id
      const allForms = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('forms')
        .where('status_yn', 1);

      console.log(`Found ${allForms.length} total forms`);

      // Filter forms that contain the template_service_id in their svc_ids
      const forms = allForms.filter(form => {
        console.log(`Form ${form.form_id} svc_ids raw data: "${form.svc_ids}"`);
        const svcIds = this.parseSvcIds(form.svc_ids, form.form_id);
        return svcIds.includes(template_service_id);
      });

      console.log(`Found ${forms.length} forms containing template_service_id: ${template_service_id}`);

      const updatedForms = [];
      const errors = [];

      for (const form of forms) {
        try {
          console.log(`Processing form ${form.form_id} (${form.form_cde}) with svc_ids: ${form.svc_ids}`);
          
          // Parse existing svc_ids
          const svcIds = this.parseSvcIds(form.svc_ids, form.form_id);
          console.log(`Parsed svc_ids for form ${form.form_id}:`, svcIds);

          // Ensure svcIds is an array
          if (!Array.isArray(svcIds)) {
            console.log(`svc_ids for form ${form.form_id} is not an array, converting to array`);
            svcIds = [];
          }

          // Add the new service ID if it's not already present
          if (!svcIds.includes(new_service_id)) {
            svcIds.push(new_service_id);
            console.log(`Added new service_id ${new_service_id} to form ${form.form_id}. New svc_ids:`, svcIds);
            
            // Update the form with the new svc_ids
            const updateResult = await db
              .withSchema(`${process.env.MYSQL_DATABASE}`)
              .from('forms')
              .where('form_id', form.form_id)
              .update({
                svc_ids: JSON.stringify(svcIds),
                updated_at: new Date()
              });

            if (updateResult > 0) {
              updatedForms.push({
                form_id: form.form_id,
                form_cde: form.form_cde,
                old_svc_ids: form.svc_ids,
                new_svc_ids: JSON.stringify(svcIds)
              });
              console.log(`Updated form ${form.form_id} (${form.form_cde}) with new service_id: ${new_service_id}`);
            } else {
              errors.push({
                form_id: form.form_id,
                form_cde: form.form_cde,
                error: 'Failed to update form'
              });
            }
          } else {
            console.log(`Form ${form.form_id} (${form.form_cde}) already contains service_id: ${new_service_id}`);
          }
        } catch (error) {
          console.error(`Error updating form ${form.form_id}:`, error);
          errors.push({
            form_id: form.form_id,
            form_cde: form.form_cde,
            error: error.message
          });
        }
      }

      return {
        message: `Forms updated successfully for new service ${new_service_id}`,
        updated_forms: updatedForms,
        errors: errors,
        total_forms_found: forms.length,
        total_forms_updated: updatedForms.length
      };
    } catch (error) {
      console.error('Error updating forms for new service:', error);
      logger.error('Error updating forms for new service:', error);
      return {
        message: 'Error updating forms for new service',
        error: -1,
        details: error.message
      };
    }
  }

  async copyTemplateToTenantService(template_service_id, tenant_id, price) {
    // Fetch template
    const templateRes = await this.serviceTemplate.getTemplateById(template_service_id);
    if (templateRes.error) return templateRes;
    const template = templateRes.rec;
    
    console.log('Template data:', template);
    
    // Fetch tenant for admin_fee and tax_percent
    const tenantRes = await this.common.getTenantByTenantId(tenant_id);
    if (tenantRes.error) return tenantRes;
    const tenant = tenantRes[0];
    
    // Use provided price as basePrice
    const basePrice = Number(price) || 0;
    const adminFee = Number(tenant.admin_fee) || 0;
    const taxPercent = Number(tenant.tax_percent) || 0;
    const finalPrice = basePrice + adminFee + (basePrice * taxPercent / 100);

    // Copy all fields from template, override only necessary ones
    const serviceData = {
      ...template,
      service_name: template.name || template.service_name,
      service_code: template.service_code || (template.name || template.service_name || 'SERVICE').replace(/\s+/g, '_').toUpperCase(),
      total_invoice: finalPrice,
      gst: taxPercent,
      tenant_id: tenant.tenant_generated_id,
    };
    
    // Remove/override fields that should not be copied or are not relevant for the service table
    delete serviceData.template_service_id; // avoid conflict if present
    delete serviceData.id; // generic id field if present
    delete serviceData.created_at;
    delete serviceData.updated_at;
    
    // Handle svc_formula properly - store as array directly (like svc_ids)
    if (template.svc_formula) {
      // If it's already an array, use it directly
      if (Array.isArray(template.svc_formula)) {
        serviceData.svc_formula = template.svc_formula;
      } else if (typeof template.svc_formula === 'string') {
        // If it's a JSON string, parse it to array
        try {
          serviceData.svc_formula = JSON.parse(template.svc_formula);
        } catch (error) {
          console.log('Error parsing svc_formula string:', error);
          serviceData.svc_formula = [];
        }
      } else {
        // If it's something else, default to empty array
        serviceData.svc_formula = [];
      }
    }
    
    // Handle svc_report_formula properly - store as object directly
    serviceData.svc_report_formula = this.parseSvcReportFormula(template.svc_report_formula);
    
    // Handle position and service_id fields if they exist in template
    if (template.position) {
      serviceData.position = template.position;
    }
    if (template.service_id) {
      serviceData.service_id = template.service_id;
    }

    // Ensure required fields for service
    if (!serviceData.nbr_of_sessions) serviceData.nbr_of_sessions = 1;
    if (!serviceData.svc_formula_typ) serviceData.svc_formula_typ = 's';
    if (!serviceData.svc_formula) serviceData.svc_formula = [7];
    if (!serviceData.svc_report_formula) serviceData.svc_report_formula = { position: [], service_id: [] };
    if (serviceData.is_report === undefined) serviceData.is_report = 0;
    if (serviceData.is_additional === undefined) serviceData.is_additional = 0;
    
    console.log('Service data to be created:', serviceData);

    const serviceResult = await this.service.postService(serviceData);
    
    console.log('Service result:', serviceResult);
    

    // If service creation was successful, update forms
    if (!serviceResult.error && serviceResult.service && serviceResult.service[0]) {
      const newServiceId = serviceResult.service[0];
      console.log(`Service created successfully with ID: ${newServiceId}`);
      
      // Update forms to include the new service
      const formsUpdateResult = await this.updateFormsForNewService(
        template_service_id, 
        newServiceId, 
        tenant.tenant_generated_id
      );
      
      // Add forms update result to the service result
      serviceResult.forms_update = formsUpdateResult;
      serviceResult.service_id = newServiceId; // Add service_id for consistency
    }

    return serviceResult;
  }

  async copyMultipleTemplatesToTenant(service_templates, tenant_id) {
    if (!Array.isArray(service_templates) || service_templates.length === 0) {
      return { message: 'service_templates must be a non-empty array', error: -1 };
    }

    const results = [];
    const errors = [];
    const formsUpdateResults = [];

    for (const svc of service_templates) {
      // Validate each service template
      if (!svc.template_service_id || typeof svc.price !== 'number') {
        errors.push({ 
          template_service_id: svc.template_service_id, 
          message: 'Each service_template must have template_service_id and price' 
        });
        continue;
      }

      try {
        const result = await this.copyTemplateToTenantService(svc.template_service_id, tenant_id, svc.price);
        if (result.error) {
          errors.push({ 
            template_service_id: svc.template_service_id, 
            message: result.message,
            details: result 
          });
        } else {
          results.push({ 
            template_service_id: svc.template_service_id, 
            success: true,
            service_id: result.service_id,
            forms_update: result.forms_update
          });
          
          // Collect forms update results
          if (result.forms_update) {
            formsUpdateResults.push({
              template_service_id: svc.template_service_id,
              new_service_id: result.service_id,
              forms_update: result.forms_update
            });
          }
        }
      } catch (error) {
        errors.push({ 
          template_service_id: svc.template_service_id, 
          message: 'Unexpected error occurred',
          details: error.message 
        });
      }
    }

    const response = {
      message: 'Service templates copy operation completed',
      results,
      errors,
      forms_update_summary: {
        total_forms_updated: formsUpdateResults.reduce((sum, item) => sum + (item.forms_update.total_forms_updated || 0), 0),
        total_forms_found: formsUpdateResults.reduce((sum, item) => sum + (item.forms_update.total_forms_found || 0), 0),
        forms_update_details: formsUpdateResults
      }
    };

    if (errors.length > 0) {
      response.error = -1;
      response.message = 'Some service templates failed to copy';
    } else {
      response.message = 'All service templates copied successfully';
    }

    return response;
  }
} 