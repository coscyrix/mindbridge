import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { authenticate  } from '../middlewares/token.js';
import { AsyncWrapper  } from '../utils/AsyncWrapper.js';
import ReportController from '../controllers/report.js';
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
router.get(
  '/homework-stats',
  authenticate,
  AsyncWrapper(reportController.getSessionsWithHomeworkStats),
);
router.get(
  '/progress-report',
  authenticate,
  AsyncWrapper(reportController.getProgressReportData),
);
router.get(
  '/discharge-report',
  authenticate,
  AsyncWrapper(reportController.getDischargeReportData),
);
export const reportRouter = { baseUrl: '/api/reports', router };
