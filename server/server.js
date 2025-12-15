// server.js

import ServerConfig from './config/server.config.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cron = require('node-cron');
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
  treatmentTargetRequestFormsRouter,
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
        treatmentTargetRequestFormsRouter,
        treatmentTargetSessionFormsRouter,
        treatmentTargetSessionFormsTemplateRouter,
      ],
    });

    // Schedule the cron job to run daily at midnight (Pacific Time)
    const session = new Session();
    cron.schedule('0 0 * * *', async () => {
      await session.dailyUpdateSessionStatus();
    }, { timezone: 'America/Los_Angeles' });

    await server.listen();
  } catch (error) {
    console.error(`Failed to start the server: ${error.message}`);
    console.error(error);
  }
}

main();
