import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { Router } = require('express');
const OnboardingController = require('../controllers/onboardingController.js').default;

const router = Router();
const onboardingController = new OnboardingController();

router.post('/', onboardingController.createOnboardingRequest.bind(onboardingController));

export const onboardingRouter = { baseUrl: '/api/onboarding', router }; 