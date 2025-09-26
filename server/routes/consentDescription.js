import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
const ConsentDescriptionController = require('../controllers/consentDescriptionController.js').default;
const { AsyncWrapper } = require('../utils/AsyncWrapper.js');
const { authenticate } = require('../middlewares/token.js');

const router = Router();
const consentDescriptionController = new ConsentDescriptionController();

router.post('/', authenticate, AsyncWrapper(consentDescriptionController.createConsentDescription.bind(consentDescriptionController)));
router.get('/', AsyncWrapper(consentDescriptionController.getConsentDescription.bind(consentDescriptionController)));
router.put('/:id', authenticate, AsyncWrapper(consentDescriptionController.updateConsentDescription.bind(consentDescriptionController)));
router.delete('/:id', authenticate, AsyncWrapper(consentDescriptionController.deleteConsentDescription.bind(consentDescriptionController)));

export const consentDescriptionRouter = { baseUrl: '/api/consent-description', router }; 