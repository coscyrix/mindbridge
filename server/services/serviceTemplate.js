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
    // Prepare service data
    const serviceData = {
      service_name: template.name,
      service_code: template.name.replace(/\s+/g, '_').toUpperCase() + '_' + Date.now(),
      is_report: 0,
      is_additional: 0,
      total_invoice: finalPrice,
      nbr_of_sessions: 1,
      svc_formula_typ: 's',
      svc_formula: JSON.stringify([7]),
      svc_report_formula: JSON.stringify({}),
      gst: taxPercent,
      tenant_id: tenant_id,
      template_service_id: template_service_id
    };
    return this.service.postService(serviceData);
  }
} 