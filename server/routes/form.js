//routes/form.js

import { Router } from 'express';
import FormController from '../controllers/form.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';

const router = Router();
const formController = new FormController();

router.post('/', authenticate, AsyncWrapper(formController.postForm));

router.put('/', authenticate, AsyncWrapper(formController.putFormById));

router.get('/', authenticate, AsyncWrapper(formController.getFormById));

export const formRouter = { baseUrl: '/api/form', router };
