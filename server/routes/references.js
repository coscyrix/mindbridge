import { Router } from 'express';
import ReferencesController from '../controllers/references.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';

const router = Router();
const referencesController = new ReferencesController();

router.get('/', authenticate, AsyncWrapper(referencesController.getReferences));

export const referencesRouter = { baseUrl: '/api/references', router };
