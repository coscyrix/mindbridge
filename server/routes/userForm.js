import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
const UserFormController = require('../controllers/userForm.js').default;
const { AsyncWrapper } = require('../utils/AsyncWrapper.js');
const { authenticate } = require('../middlewares/token.js');

const router = Router();
const userFormController = new UserFormController();

// router.post('/', authenticate, AsyncWrapper(userFormController.postUserForm));

router.put('/', authenticate, AsyncWrapper(userFormController.putUserFormById));

router.get('/', AsyncWrapper(userFormController.getUserFormById));

export const userFormRouter = { baseUrl: '/api/userForm', router };
