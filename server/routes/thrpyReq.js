//routes/thrpyReq.js

import { Router } from 'express';
import ThrpyReqController from '../controllers/thrpyReq.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';

const router = Router();
const thrpyReqController = new ThrpyReqController();

router.post('/', authenticate, AsyncWrapper(thrpyReqController.postThrpyReq));

router.put('/', authenticate, AsyncWrapper(thrpyReqController.putThrpyReqById));

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

router.post(
  '/listSessions',
  authenticate,
  AsyncWrapper(thrpyReqController.listSessions),
);

router.post(
  '/saveSessions',
  authenticate,
  AsyncWrapper(thrpyReqController.saveSessions),
);

export const thrpyReqRouter = { baseUrl: '/api/thrpyReq', router };
