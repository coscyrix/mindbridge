//routes/service.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import ServiceController from '../controllers/service.js';
import { AsyncWrapper  } from '../utils/AsyncWrapper.js';
import { authenticate  } from '../middlewares/token.js';

const router = Router();
const serviceController = new ServiceController();

router.post('/', authenticate, AsyncWrapper(serviceController.postService));

router.put('/', authenticate, AsyncWrapper(serviceController.putServiceById));

router.put(
  '/del/',
  authenticate,
  AsyncWrapper(serviceController.delServiceById),
);

router.get('/', authenticate, AsyncWrapper(serviceController.getServiceById));

export const serviceRouter = { baseUrl: '/api/service', router };
