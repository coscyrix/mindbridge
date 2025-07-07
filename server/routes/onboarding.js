import { Router } from 'express';
import OnboardingController from '../controllers/onboardingController.js';

const router = Router();
const onboardingController = new OnboardingController();

router.post('/', onboardingController.createOnboardingRequest.bind(onboardingController));

export const onboardingRouter = { baseUrl: '/api/onboarding', router }; 