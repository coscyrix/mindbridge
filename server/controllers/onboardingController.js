import OnboardingService from '../services/onboarding.js';
import { onboardingAdminEmail } from '../utils/emailTmplt.js';
import SendEmail from '../middlewares/sendEmail.js';

export default class OnboardingController {
  async createOnboardingRequest(req, res) {
    console.log('createOnboardingRequest');
    
    const data = req.body;
    const onboardingService = new OnboardingService();
    const result = await onboardingService.createOnboardingRequest(data);
    if (result.error) {
      res.status(400).json(result);
      return;
    }
    // Send email to admin
    const emailTempl = onboardingAdminEmail(data);
    console.log('emailTempl', emailTempl);
    
    const sendEmail = new SendEmail();
    await sendEmail.sendMail(emailTempl);
    res.status(200).json(result);
  }
} 