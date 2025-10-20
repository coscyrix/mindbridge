import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import FeedbackController from '../controllers/feedback.js';
import { AsyncWrapper  } from '../utils/AsyncWrapper.js';
import { authenticate  } from '../middlewares/token.js';

const router = Router();
const feedbackController = new FeedbackController();

router.post('/', AsyncWrapper(feedbackController.postFeedback));

router.put('/', AsyncWrapper(feedbackController.putFeedbackById));

router.get('/', AsyncWrapper(feedbackController.getFeedbackById));

router.post(
  '/gad7',

  AsyncWrapper(feedbackController.postGAD7Feedback),
);

router.post(
  '/phq9',

  AsyncWrapper(feedbackController.postPHQ9Feedback),
);

router.post(
  '/pcl5',

  AsyncWrapper(feedbackController.postPCL5Feedback),
);

router.post(
  '/whodas',

  AsyncWrapper(feedbackController.postWHODASFeedback),
);

router.post(
  '/ipf',

  AsyncWrapper(feedbackController.postIPFSFeedback),
);

router.post(
  '/smart-goal',

  AsyncWrapper(feedbackController.postSMARTGOALFeedback),
);

router.post(
  '/consent',

  AsyncWrapper(feedbackController.postCONSENTFeedback),
);

router.post(
  '/gas',

  AsyncWrapper(feedbackController.postGASFeedback),
);

export const feedbackRouter = { baseUrl: '/api/feedback', router };
