import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import ReportDataController from '../controllers/reportData.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';

const router = Router();
const reportDataController = new ReportDataController();

// Main report endpoints
router.post('/', authenticate, AsyncWrapper(reportDataController.postReport));
router.put('/', authenticate, AsyncWrapper(reportDataController.putReportById));
router.get('/', authenticate, AsyncWrapper(reportDataController.getReportById));
router.get('/complete', authenticate, AsyncWrapper(reportDataController.getCompleteReport));

// Report type-specific endpoints
router.post('/intake', authenticate, AsyncWrapper(reportDataController.postIntakeReport));
router.post('/treatment-plan', authenticate, AsyncWrapper(reportDataController.postTreatmentPlanReport));
router.post('/progress', authenticate, AsyncWrapper(reportDataController.postProgressReport));
router.post('/discharge', authenticate, AsyncWrapper(reportDataController.postDischargeReport));

// Get report data endpoints
router.get('/treatment-plan-report', authenticate, AsyncWrapper(reportDataController.getTreatmentPlanReportByReportId));
router.put('/treatment-plan-report', authenticate, AsyncWrapper(reportDataController.putTreatmentPlanReportByReportId));
router.get('/intake-report', authenticate, AsyncWrapper(reportDataController.getIntakeReportData));
router.get('/progress-report', authenticate, AsyncWrapper(reportDataController.getProgressReportData));
router.get('/discharge-report', authenticate, AsyncWrapper(reportDataController.getDischargeReportData));

export const reportDataRouter = { baseUrl: '/api/report-data', router };

