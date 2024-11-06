//routes/index.js

import { Router } from 'express';
import UserProfileController from '../controllers/userProfile.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';

const router = Router();
const userProfileController = new UserProfileController();

router.post(
  '/user-profile',
  AsyncWrapper(userProfileController.postUserProfile),
);

router.post(
  '/user-client-profile',
  authenticate,
  AsyncWrapper(userProfileController.userPostClientProfile),
);

router.put(
  '/',
  authenticate,
  AsyncWrapper(userProfileController.putUserProfile),
);

router.put(
  '/del/',
  authenticate,
  AsyncWrapper(userProfileController.delUserProfile),
);

router.get(
  '/',
  authenticate,
  AsyncWrapper(userProfileController.getUserProfileById),
);

export const userProfileRouter = { baseUrl: '/api/user-profile', router };
