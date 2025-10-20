import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import TreatmentTargetFeedbackConfigController from '../controllers/treatmentTargetFeedbackConfig.js';
import { AsyncWrapper  } from '../utils/AsyncWrapper.js';

const router = Router();
const treatmentTargetFeedbackConfigController = new TreatmentTargetFeedbackConfigController();

// Create a new treatment target feedback configuration
router.post('/', AsyncWrapper(treatmentTargetFeedbackConfigController.postTreatmentTargetFeedbackConfig.bind(treatmentTargetFeedbackConfigController)));

// Get all treatment target feedback configurations with optional filters
router.get('/', AsyncWrapper(treatmentTargetFeedbackConfigController.getTreatmentTargetFeedbackConfigs.bind(treatmentTargetFeedbackConfigController)));

// Update treatment target feedback configuration by ID
router.put('/:id', AsyncWrapper(treatmentTargetFeedbackConfigController.putTreatmentTargetFeedbackConfigById.bind(treatmentTargetFeedbackConfigController)));

// Get treatment target feedback configuration by ID
router.get('/:id', AsyncWrapper(treatmentTargetFeedbackConfigController.getTreatmentTargetFeedbackConfigById.bind(treatmentTargetFeedbackConfigController)));

// Check if a session should trigger feedback forms for a treatment target
router.post('/check-session', AsyncWrapper(treatmentTargetFeedbackConfigController.checkSessionFeedbackForms.bind(treatmentTargetFeedbackConfigController)));

// Delete treatment target feedback configuration by ID
router.delete('/:id', AsyncWrapper(treatmentTargetFeedbackConfigController.deleteTreatmentTargetFeedbackConfigById.bind(treatmentTargetFeedbackConfigController)));

// Get all unique treatment targets
router.get('/treatment-targets/list', AsyncWrapper(treatmentTargetFeedbackConfigController.getTreatmentTargets.bind(treatmentTargetFeedbackConfigController)));

// Get all unique form names
router.get('/form-names/list', AsyncWrapper(treatmentTargetFeedbackConfigController.getFormNames.bind(treatmentTargetFeedbackConfigController)));

// Get all unique service names
router.get('/service-names/list', AsyncWrapper(treatmentTargetFeedbackConfigController.getServiceNames.bind(treatmentTargetFeedbackConfigController)));

// Bulk create treatment target feedback configurations
router.post('/bulk', AsyncWrapper(treatmentTargetFeedbackConfigController.bulkCreateTreatmentTargetFeedbackConfigs.bind(treatmentTargetFeedbackConfigController)));

// Load session forms based on treatment target
router.post('/load-session-forms', AsyncWrapper(treatmentTargetFeedbackConfigController.loadSessionFormsByTreatmentTarget.bind(treatmentTargetFeedbackConfigController)));

export const treatmentTargetFeedbackConfigRouter = { baseUrl: '/api/treatment-target-feedback-config', router }; 