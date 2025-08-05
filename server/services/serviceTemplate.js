import ServiceTemplate from '../models/serviceTemplate.js';
import Service from '../models/service.js';
import Common from '../models/common.js';

export default class ServiceTemplateService {
  constructor() {
    this.serviceTemplate = new ServiceTemplate();
    this.service = new Service();
    this.common = new Common();
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

  async copyTemplateToTenantService(template_service_id, tenant_id, price) {
    // Fetch template
    const templateRes = await this.serviceTemplate.getTemplateById(template_service_id);
    if (templateRes.error) return templateRes;
    const template = templateRes.rec;
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
      template_service_id: template_service_id,
    };
    // Remove/override fields that should not be copied or are not relevant for the service table
    delete serviceData.template_service_id; // avoid conflict if present
    delete serviceData.id; // generic id field if present
    delete serviceData.created_at;
    delete serviceData.updated_at;
    // You can add more fields to delete if needed

    // Ensure required fields for service
    if (!serviceData.nbr_of_sessions) serviceData.nbr_of_sessions = 1;
    if (!serviceData.svc_formula_typ) serviceData.svc_formula_typ = 's';
    if (!serviceData.svc_formula) serviceData.svc_formula = JSON.stringify([7]);
    if (!serviceData.svc_report_formula) serviceData.svc_report_formula = JSON.stringify({});
    if (serviceData.is_report === undefined) serviceData.is_report = 0;
    if (serviceData.is_additional === undefined) serviceData.is_additional = 0;
    

    return this.service.postService(serviceData);
  }

  async copyMultipleTemplatesToTenant(service_templates, tenant_id) {
    if (!Array.isArray(service_templates) || service_templates.length === 0) {
      return { message: 'service_templates must be a non-empty array', error: -1 };
    }

    const results = [];
    const errors = [];

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
            service_id: result.service_id 
          });
        }
      } catch (error) {
        errors.push({ 
          template_service_id: svc.template_service_id, 
          message: 'Unexpected error occurred',
          details: error.message 
        });
      }
    }

    if (errors.length > 0) {
      return { 
        message: 'Some service templates failed to copy', 
        error: -1, 
        results,
        errors 
      };
    }

    return { 
      message: 'All service templates copied successfully', 
      results 
    };
  }
} 