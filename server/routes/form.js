//routes/form.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
const FormController = require('../controllers/form.js').default;
const { AsyncWrapper } = require('../utils/AsyncWrapper.js');
const { authenticate } = require('../middlewares/token.js');

const router = Router();
const formController = new FormController();

router.post('/', authenticate, AsyncWrapper(formController.postForm));

router.put('/', authenticate, AsyncWrapper(formController.putFormById));

router.get('/', authenticate, AsyncWrapper(formController.getFormById));

export const formRouter = { baseUrl: '/api/form', router };
