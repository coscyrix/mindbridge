import { Router } from 'express';
import FeedbackController from '../controllers/feedback.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';

const router = Router();
const feedbackController = new FeedbackController();

router.post('/', authenticate, AsyncWrapper(feedbackController.postFeedback));

router.put('/', authenticate, AsyncWrapper(feedbackController.putFeedbackById));

router.get('/', authenticate, AsyncWrapper(feedbackController.getFeedbackById));

router.post(
  '/gad7',
  authenticate,
  AsyncWrapper(feedbackController.postGAD7Feedback),
);

router.post(
  '/phq9',
  authenticate,
  AsyncWrapper(feedbackController.postPHQ9Feedback),
);

router.post(
  '/whodas',
  authenticate,
  AsyncWrapper(feedbackController.postWHODASFeedback),
);

router.post(
  '/ipf',
  authenticate,
  AsyncWrapper(feedbackController.postIPFSFeedback),
);

export const feedbackRouter = { baseUrl: '/api/feedback', router };
