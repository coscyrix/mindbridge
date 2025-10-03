//routes/session.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
const SessionController = require('../controllers/session.js').default;
const { AsyncWrapper } = require('../utils/AsyncWrapper.js');
const { authenticate } = require('../middlewares/token.js');

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
