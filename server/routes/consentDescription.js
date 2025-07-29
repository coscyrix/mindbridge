import { Router } from 'express';
import ConsentDescriptionController from '../controllers/consentDescriptionController.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';

const router = Router();
const consentDescriptionController = new ConsentDescriptionController();

router.post('/', authenticate, AsyncWrapper(consentDescriptionController.createConsentDescription.bind(consentDescriptionController)));
router.get('/', authenticate, AsyncWrapper(consentDescriptionController.getConsentDescription.bind(consentDescriptionController)));
router.put('/:id', authenticate, AsyncWrapper(consentDescriptionController.updateConsentDescription.bind(consentDescriptionController)));
router.delete('/:id', authenticate, AsyncWrapper(consentDescriptionController.deleteConsentDescription.bind(consentDescriptionController)));

export const consentDescriptionRouter = { baseUrl: '/api/consent-description', router }; 