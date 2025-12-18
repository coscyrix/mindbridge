//routes/therapistAbsence.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
import TherapistAbsenceController from '../controllers/therapistAbsenceController.js';
import { AsyncWrapper } from '../utils/AsyncWrapper.js';
import { authenticate } from '../middlewares/token.js';

const router = Router();
const therapistAbsenceController = new TherapistAbsenceController();

router.post('/', authenticate, AsyncWrapper(therapistAbsenceController.handleAbsence.bind(therapistAbsenceController)));

export default { baseUrl: '/api/therapist-absence', router };
