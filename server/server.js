// server.js

import ServerConfig from './config/server.config.js';
// Import node-cron dynamically to avoid module resolution issues
let cron;
import Session from './models/session.js';

import {
  userRouter,
  userProfileRouter,
  serviceRouter,
  thrpyReqRouter,
  sessionRouter,
  invoiceRouter,
  formRouter,
  referencesRouter,
  feedbackRouter,
  userTargetOutcomeRouter,
  notesRouter,
  userFormRouter,
  homeWorkRouter,
  reportRouter,
  counselorProfileRouter,
  counselorDocumentsRouter,
  onboardingRouter,
  serviceTemplateRouter,
  consentDescriptionRouter,
  tenantConfigurationRouter,
  feeSplitManagementRouter,
  treatmentTargetFeedbackConfigRouter,
  treatmentTargetSessionFormsRouter,
  treatmentTargetSessionFormsTemplateRouter,
} from './routes/index.js';

async function main() {
  try {
    const PORT = process.env.PORT || 5000;
    console.log('🔧 Server configuration:');
    console.log('  - PORT:', PORT);
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('  - Process ID:', process.pid);
    
    // Dynamically import node-cron
    try {
      const cronModule = await import('node-cron');
      cron = cronModule.default;
      console.log('✅ node-cron module loaded successfully');
    } catch (cronError) {
      console.warn('⚠️ Failed to load node-cron module:', cronError.message);
      console.warn('⚠️ Cron jobs will be disabled');
    }
    
    const server = new ServerConfig({
      port: PORT,
      routers: [
        userRouter,
        userProfileRouter,
        serviceRouter,
        thrpyReqRouter,
        sessionRouter,
        invoiceRouter,
        formRouter,
        referencesRouter,
        feedbackRouter,
        userTargetOutcomeRouter,
        notesRouter,
        userFormRouter,
        homeWorkRouter,
        reportRouter,
        counselorProfileRouter,
        counselorDocumentsRouter,
        onboardingRouter,
        serviceTemplateRouter,
        consentDescriptionRouter,
        tenantConfigurationRouter,
        feeSplitManagementRouter,
        treatmentTargetFeedbackConfigRouter,
        treatmentTargetSessionFormsRouter,
        treatmentTargetSessionFormsTemplateRouter,
      ],
    });

    // Schedule the cron job to run daily at midnight (only if cron is available)
    if (cron) {
      const session = new Session();
      cron.schedule('0 0 * * *', async () => {
        await session.dailyUpdateSessionStatus();
      });
      console.log('✅ Cron job scheduled for daily session updates');
    }

    await server.listen();
  } catch (error) {
    console.error(`Failed to start the server: ${error.message}`);
    console.error(error);
  }
}

main();
