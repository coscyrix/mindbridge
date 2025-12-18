import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import TreatmentTargetSessionFormsTemplateController from '../controllers/treatmentTargetSessionFormsTemplate.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';

const router = Router();
const controller = new TreatmentTargetSessionFormsTemplateController();

// ============================================
// TEMPLATE CRUD ROUTES
// ============================================

// Get all templates with service frequencies
// GET /api/treatment-target-templates
router.get(
  '/',
  authenticate,
  AsyncWrapper(controller.getAllTemplates.bind(controller))
);

// Get a template by ID
// GET /api/treatment-target-templates/:id
router.get(
  '/:id(\\d+)',
  authenticate,
  AsyncWrapper(controller.getTemplateById.bind(controller))
);

// Get templates by treatment_target
// GET /api/treatment-target-templates/by-treatment-target?treatment_target=Anxiety
router.get(
  '/by-treatment-target',
  authenticate,
  AsyncWrapper(controller.getTemplatesByTreatmentTarget.bind(controller))
);

// Get a template by treatment_target and form_name
// GET /api/treatment-target-templates/lookup?treatment_target=Anxiety&form_name=GAD-7
router.get(
  '/lookup',
  authenticate,
  AsyncWrapper(controller.getTemplateByLookup.bind(controller))
);

// Get session frequency for a specific combination
// GET /api/treatment-target-templates/session-frequency?treatment_target=...&form_name=...&service_template_id=...&nbr_of_sessions=...
router.get(
  '/session-frequency',
  authenticate,
  AsyncWrapper(controller.getSessionFrequency.bind(controller))
);

// Create a new template
// POST /api/treatment-target-templates
router.post(
  '/',
  authenticate,
  AsyncWrapper(controller.createTemplate.bind(controller))
);

// Create a template with service frequencies
// POST /api/treatment-target-templates/with-frequencies
router.post(
  '/with-frequencies',
  authenticate,
  AsyncWrapper(controller.createTemplateWithFrequencies.bind(controller))
);

// Update a template
// PUT /api/treatment-target-templates/:id
router.put(
  '/:id',
  authenticate,
  AsyncWrapper(controller.updateTemplate.bind(controller))
);

// Delete a template
// DELETE /api/treatment-target-templates/:id
router.delete(
  '/:id',
  authenticate,
  AsyncWrapper(controller.deleteTemplate.bind(controller))
);

// ============================================
// SERVICE FREQUENCY ROUTES
// ============================================

// Get service frequencies for a template
// GET /api/treatment-target-templates/:templateId/frequencies
router.get(
  '/:templateId/frequencies',
  authenticate,
  AsyncWrapper(controller.getServiceFrequencies.bind(controller))
);

// Add a service frequency to a template
// POST /api/treatment-target-templates/:templateId/frequencies
router.post(
  '/:templateId/frequencies',
  authenticate,
  AsyncWrapper(controller.addServiceFrequency.bind(controller))
);

// Add multiple service frequencies to a template
// POST /api/treatment-target-templates/:templateId/frequencies/bulk
router.post(
  '/:templateId/frequencies/bulk',
  authenticate,
  AsyncWrapper(controller.addMultipleServiceFrequencies.bind(controller))
);

// Update a service frequency
// PUT /api/treatment-target-templates/frequencies/:id
router.put(
  '/frequencies/:id',
  authenticate,
  AsyncWrapper(controller.updateServiceFrequency.bind(controller))
);

// Delete a service frequency
// DELETE /api/treatment-target-templates/frequencies/:id
router.delete(
  '/frequencies/:id',
  authenticate,
  AsyncWrapper(controller.deleteServiceFrequency.bind(controller))
);

// ============================================
// LEGACY ROUTES (for backward compatibility)
// ============================================

// Get all template configurations (legacy)
// GET /api/treatment-target-templates/templates
router.get(
  '/templates',
  AsyncWrapper(controller.getTemplateConfigurations.bind(controller))
);

// Copy template configurations to a new tenant
// POST /api/treatment-target-templates/copy-to-tenant
router.post(
  '/copy-to-tenant',
  AsyncWrapper(controller.copyTemplateConfigurationsToTenant.bind(controller))
);

// Update existing tenant configurations with latest template configurations
// POST /api/treatment-target-templates/update-tenant
router.post(
  '/update-tenant',
  AsyncWrapper(controller.updateTemplateConfigurationsForTenant.bind(controller))
);

// Get tenant configurations
// GET /api/treatment-target-templates/tenant-configurations
router.get(
  '/tenant-configurations',
  AsyncWrapper(controller.getTenantConfigurations.bind(controller))
);

// Compare tenant configurations with template configurations
// GET /api/treatment-target-templates/compare-tenant
router.get(
  '/compare-tenant',
  AsyncWrapper(controller.compareTenantWithTemplate.bind(controller))
);

// Reset tenant configurations to match template exactly
// POST /api/treatment-target-templates/reset-tenant
router.post(
  '/reset-tenant',
  AsyncWrapper(controller.resetTenantConfigurationsToTemplate.bind(controller))
);

export const treatmentTargetSessionFormsTemplateRouter = { 
  baseUrl: '/api/treatment-target-templates', 
  router 
};
