import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
const UserTargetOutcomeController = require('../controllers/userTargetOutcome.js').default;
const { AsyncWrapper } = require('../utils/AsyncWrapper.js');
const { authenticate } = require('../middlewares/token.js');

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
