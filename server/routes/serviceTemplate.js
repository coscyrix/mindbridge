import express from 'express';
import {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  copyTemplateToTenantService
} from '../controllers/serviceTemplate.js';

const router = express.Router();

router.post('/', createTemplate);
router.get('/', getTemplates);
router.get('/:id', getTemplateById);
router.put('/:id', updateTemplate);
router.delete('/:id', deleteTemplate);
router.post('/copy-to-tenant', copyTemplateToTenantService);

export const serviceTemplateRouter = { baseUrl: '/api/service-templates', router }; 