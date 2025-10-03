//routes/service.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
const ServiceController = require('../controllers/service.js').default;
const { AsyncWrapper } = require('../utils/AsyncWrapper.js');
const { authenticate } = require('../middlewares/token.js');

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
