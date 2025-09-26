import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
const ReferencesController = require('../controllers/references.js').default;
const { AsyncWrapper } = require('../utils/AsyncWrapper.js');
const { authenticate } = require('../middlewares/token.js');

const router = Router();
const referencesController = new ReferencesController();

router.get('/', authenticate, AsyncWrapper(referencesController.getReferences));

export const referencesRouter = { baseUrl: '/api/references', router };
