import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import TreatmentTargetRequestFormsController from '../controllers/treatmentTargetRequestForms.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';

const router = Router();
const treatmentTargetRequestFormsController =
  new TreatmentTargetRequestFormsController();

// Manually attach treatment target request forms for a specific therapy request
router.post(
  '/manual',
  authenticate,
  AsyncWrapper(
    treatmentTargetRequestFormsController.createManualTreatmentTargetRequestForms.bind(
      treatmentTargetRequestFormsController,
    ),
  ),
);

export const treatmentTargetRequestFormsRouter = {
  baseUrl: '/api/treatment-target-request-forms',
  router,
};


