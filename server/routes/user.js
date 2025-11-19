//routes/user.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import UserController from '../controllers/user.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';

const router = Router();
const userController = new UserController();

router.post('/sign-up', AsyncWrapper(userController.signUp));

router.post('/sign-in', AsyncWrapper(userController.signIn));

router.post('/forgot-password', AsyncWrapper(userController.passwordReset));

router.post('/send-otp', AsyncWrapper(userController.sendOTPforVerification));

router.post('/verify', AsyncWrapper(userController.verifyAccount));

router.post(
  '/change-password',
  authenticate,
  AsyncWrapper(userController.changePassword),
);

router.get(
  '/check-manager-services',
  authenticate,
  AsyncWrapper(userController.checkManagerServices),
);

export const userRouter = { baseUrl: '/api/auth', router };
