import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const express = require('express');;
import {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  copyTemplateToTenantService,
  copyMultipleTemplatesToTenant,
  checkFormsAffectedByTemplate
} from '../controllers/serviceTemplate.js';

const router = express.Router();

router.post('/', createTemplate);
router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);
router.post('/copy-to-tenant', copyTemplateToTenantService);
router.post('/copy-multiple-to-tenant', copyMultipleTemplatesToTenant);
router.get('/check-forms-affected', checkFormsAffectedByTemplate);

export const serviceTemplateRouter = { baseUrl: '/api/service-templates', router }; 