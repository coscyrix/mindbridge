//routes/counselorActivation.js

import { Router } from 'express';
import CounselorActivationController from '../controllers/counselorActivationController.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';

const router = Router();
const counselorActivationController = new CounselorActivationController();

// Activate a counselor
router.post(
  '/activate',
  authenticate,
  AsyncWrapper(counselorActivationController.activateCounselor.bind(counselorActivationController))
);

// Deactivate a counselor
router.post(
  '/deactivate',
  authenticate,
  AsyncWrapper(counselorActivationController.deactivateCounselor.bind(counselorActivationController))
);

// Get activation status of a specific counselor
router.get(
  '/status',
  authenticate,
  AsyncWrapper(counselorActivationController.getCounselorActivationStatus.bind(counselorActivationController))
);

// Get all counselors for a tenant with their activation status
router.get(
  '/counselors',
  authenticate,
  AsyncWrapper(counselorActivationController.getCounselorsByTenant.bind(counselorActivationController))
);

export const counselorActivationRouter = { baseUrl: '/api/counselor-activation', router };

