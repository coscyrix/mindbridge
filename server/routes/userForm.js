import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import UserFormController from '../controllers/userForm.js';
import { AsyncWrapper  } from '../utils/AsyncWrapper.js';
import { authenticate  } from '../middlewares/token.js';

const router = Router();
const userFormController = new UserFormController();

// router.post('/', authenticate, AsyncWrapper(userFormController.postUserForm));

router.put('/', authenticate, AsyncWrapper(userFormController.putUserFormById));

router.get('/', AsyncWrapper(userFormController.getUserFormById));

export const userFormRouter = { baseUrl: '/api/userForm', router };
