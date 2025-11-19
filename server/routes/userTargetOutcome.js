import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import UserTargetOutcomeController from '../controllers/userTargetOutcome.js';
import { AsyncWrapper  } from '../utils/AsyncWrapper.js';
import { authenticate  } from '../middlewares/token.js';

const router = Router();
const userTargetOutcomeController = new UserTargetOutcomeController();

router.post(
  '/',
  authenticate,
  AsyncWrapper(userTargetOutcomeController.postUserTargetOutcome),
);
router.put(
  '/',
  authenticate,
  AsyncWrapper(userTargetOutcomeController.putUserTargetOutcome),
);
router.get(
  '/',
  authenticate,
  AsyncWrapper(userTargetOutcomeController.getUserTargetOutcome),
);

export const userTargetOutcomeRouter = {
  baseUrl: '/api/userTargetOutcome',
  router,
};
