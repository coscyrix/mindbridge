//routes/intakeForm.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import IntakeFormController from '../controllers/intakeForm.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';

const router = Router();
const intakeFormController = new IntakeFormController();

router.post('/submit', AsyncWrapper(intakeFormController.submitIntakeForm.bind(intakeFormController)));
router.get('/details', AsyncWrapper(intakeFormController.getIntakeFormDetails.bind(intakeFormController)));

export const intakeFormRouter = { baseUrl: '/api/intake-form', router };

