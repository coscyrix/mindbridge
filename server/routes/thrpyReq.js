//routes/thrpyReq.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
const ThrpyReqController = require('../controllers/thrpyReq.js').default;
const { AsyncWrapper } = require('../utils/AsyncWrapper.js');
const { authenticate } = require('../middlewares/token.js');

const router = Router();
const thrpyReqController = new ThrpyReqController();

router.post('/', authenticate, AsyncWrapper(thrpyReqController.postThrpyReq));

router.put('/', authenticate, AsyncWrapper(thrpyReqController.putThrpyReqById));

router.put(
  '/bigObj/',
  authenticate,
  AsyncWrapper(thrpyReqController.putThrpyBigObjReqById),
);

router.put(
  '/discharge/',
  authenticate,
  AsyncWrapper(thrpyReqController.putThrpyDischarge),
);

router.put(
  '/del/',
  authenticate,
  AsyncWrapper(thrpyReqController.delThrpyReqById),
);

router.get('/', authenticate, AsyncWrapper(thrpyReqController.getThrpyReqById));

// Load session forms with mode selection (service-based or treatment target-based)
router.post('/load-session-forms', authenticate, AsyncWrapper(thrpyReqController.loadSessionFormsWithMode));

// Get therapy request with treatment target forms information
router.get('/with-treatment-target-forms', authenticate, AsyncWrapper(thrpyReqController.getThrpyReqByIdWithTreatmentTargetForms));

export const thrpyReqRouter = { baseUrl: '/api/thrpyReq', router };
