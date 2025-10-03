import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const ServiceTemplateService = require('../services/serviceTemplate.js').default;

const serviceTemplateService = new ServiceTemplateService();

export const createTemplate = async (req, res) => {
  const result = await serviceTemplateService.createTemplate(req.body);
  res.status(result.error ? 400 : 200).json(result);
};

export const getTemplates = async (req, res) => {
  const result = await serviceTemplateService.getTemplates(req.query);
  res.status(result.error ? 400 : 200).json(result);
};

export const getTemplateById = async (req, res) => {
  const result = await serviceTemplateService.getTemplateById(req.params.id);
  res.status(result.error ? 400 : 200).json(result);
};

export const updateTemplate = async (req, res) => {
  const result = await serviceTemplateService.updateTemplate(req.params.id, req.body);
  res.status(result.error ? 400 : 200).json(result);
};

export const deleteTemplate = async (req, res) => {
  const result = await serviceTemplateService.deleteTemplate(req.params.id);
  res.status(result.error ? 400 : 200).json(result);
};

export const copyTemplateToTenantService = async (req, res) => {
  const { template_service_id, tenant_id, price } = req.body;
  const result = await serviceTemplateService.copyTemplateToTenantService(template_service_id, tenant_id, price);
  res.status(result.error ? 400 : 200).json(result);
};

export const copyMultipleTemplatesToTenant = async (req, res) => {
  const { service_templates, tenant_id } = req.body;
  const result = await serviceTemplateService.copyMultipleTemplatesToTenant(service_templates, tenant_id);
  res.status(result.error ? 400 : 200).json(result);
};

export const checkFormsAffectedByTemplate = async (req, res) => {
  const { template_service_id, tenant_id } = req.query;
  const result = await serviceTemplateService.checkFormsAffectedByTemplate(template_service_id, tenant_id);
  res.status(result.error ? 400 : 200).json(result);
}; 