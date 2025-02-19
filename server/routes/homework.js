import { Router } from 'express';
import HomeworkController from '../controllers/homeworkController.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();
const homeworkController = new HomeworkController();

router.post(
  '/',
  authenticate,
  upload.any(), // change: allow any file fields instead of a fixed single field
  AsyncWrapper(homeworkController.createHomework),
);

export const homeWorkRouter = { baseUrl: '/api/homework', router };
