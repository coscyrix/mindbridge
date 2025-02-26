import { authenticate } from '../middlewares/token.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import ReportController from '../controllers/report.js';
import { Router } from 'express';

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
