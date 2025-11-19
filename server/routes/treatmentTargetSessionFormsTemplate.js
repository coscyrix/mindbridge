import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import TreatmentTargetSessionFormsTemplateController from '../controllers/treatmentTargetSessionFormsTemplate.js';
import { AsyncWrapper  } from '../utils/AsyncWrapper.js';
import { authenticate  } from '../middlewares/token.js';

const router = Router();
const treatmentTargetSessionFormsTemplateController = new TreatmentTargetSessionFormsTemplateController();

// Get all template configurations (tenant_id = null)
router.get('/templates', AsyncWrapper(treatmentTargetSessionFormsTemplateController.getTemplateConfigurations));

// Copy template configurations to a new tenant
router.post('/copy-to-tenant', AsyncWrapper(treatmentTargetSessionFormsTemplateController.copyTemplateConfigurationsToTenant));

// Update existing tenant configurations with latest template configurations
router.post('/update-tenant', AsyncWrapper(treatmentTargetSessionFormsTemplateController.updateTemplateConfigurationsForTenant));

// Get tenant configurations
router.get('/tenant-configurations', AsyncWrapper(treatmentTargetSessionFormsTemplateController.getTenantConfigurations));

// Compare tenant configurations with template configurations
router.get('/compare-tenant', AsyncWrapper(treatmentTargetSessionFormsTemplateController.compareTenantWithTemplate));

// Reset tenant configurations to match template exactly
router.post('/reset-tenant', AsyncWrapper(treatmentTargetSessionFormsTemplateController.resetTenantConfigurationsToTemplate));

export const treatmentTargetSessionFormsTemplateRouter = { 
  baseUrl: '/api/treatment-target-templates', 
  router 
};
