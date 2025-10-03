import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { authenticate } = require('../middlewares/token.js');
const { AsyncWrapper } = require('../utils/AsyncWrapper.js');
const ReportController = require('../controllers/report.js').default;
const { Router } = require('express');

const reportController = new ReportController();
const router = Router();

router.get(
  '/session-stats',
  authenticate,
  AsyncWrapper(reportController.getUserSessionStatReport),
);
router.get(
  '/session',
  authenticate,
  AsyncWrapper(reportController.getSessionReport),
);
router.get(
  '/user-form',
  authenticate,
  AsyncWrapper(reportController.getUserForm),
);
export const reportRouter = { baseUrl: '/api/reports', router };
