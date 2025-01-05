//routes/session.js

import { Router } from 'express';
import SessionController from '../controllers/session.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';

const router = Router();
const sessionController = new SessionController();

router.post('/', authenticate, AsyncWrapper(sessionController.postSession));

router.put('/', authenticate, AsyncWrapper(sessionController.putSessionById));

router.put(
  '/del/',
  authenticate,
  AsyncWrapper(sessionController.delSessionById),
);

router.get('/', authenticate, AsyncWrapper(sessionController.getSessionById));

router.get(
  '/today',
  authenticate,
  AsyncWrapper(sessionController.getSessionTodayAndTomorrow),
);

export const sessionRouter = { baseUrl: '/api/session', router };
