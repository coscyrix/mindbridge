import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import TreatmentTargetSessionFormsController from '../controllers/treatmentTargetSessionForms.js';
import { AsyncWrapper  } from '../utils/AsyncWrapper.js';
import { authenticate  } from '../middlewares/token.js';

const router = Router();
const treatmentTargetSessionFormsController = new TreatmentTargetSessionFormsController();

// Get treatment target session forms by request ID
router.get('/by-request', authenticate, AsyncWrapper(treatmentTargetSessionFormsController.getTreatmentTargetSessionFormsByReqId.bind(treatmentTargetSessionFormsController)));

// Get treatment target session forms by session ID
router.get('/by-session', authenticate, AsyncWrapper(treatmentTargetSessionFormsController.getTreatmentTargetSessionFormsBySessionId.bind(treatmentTargetSessionFormsController)));

// Get treatment target session forms by client ID
router.get('/by-client', authenticate, AsyncWrapper(treatmentTargetSessionFormsController.getTreatmentTargetSessionFormsByClientId.bind(treatmentTargetSessionFormsController)));

// Update treatment target session form sent status
router.put('/sent-status', authenticate, AsyncWrapper(treatmentTargetSessionFormsController.updateTreatmentTargetSessionFormSentStatus.bind(treatmentTargetSessionFormsController)));

// Update treatment target session forms by session ID
router.put('/by-session', authenticate, AsyncWrapper(treatmentTargetSessionFormsController.updateTreatmentTargetSessionFormsBySessionId.bind(treatmentTargetSessionFormsController)));

// Delete treatment target session forms by request ID
router.delete('/by-request', authenticate, AsyncWrapper(treatmentTargetSessionFormsController.deleteTreatmentTargetSessionFormsByReqId.bind(treatmentTargetSessionFormsController)));

// Get forms to send for a specific session
router.get('/forms-to-send', authenticate, AsyncWrapper(treatmentTargetSessionFormsController.getFormsToSendForSession.bind(treatmentTargetSessionFormsController)));

// Get treatment target session forms statistics
router.get('/stats', authenticate, AsyncWrapper(treatmentTargetSessionFormsController.getTreatmentTargetSessionFormsStats.bind(treatmentTargetSessionFormsController)));

export const treatmentTargetSessionFormsRouter = { baseUrl: '/api/treatment-target-session-forms', router };
