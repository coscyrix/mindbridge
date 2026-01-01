// server.js

import ServerConfig from './config/server.config.js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const cron = require('node-cron');
import Session from './models/session.js';
import TherapistAbsence from './models/therapistAbsence.js';
import logger from './config/winston.js';

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
  reportDataRouter,
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
  therapistAbsenceRouter,
  counselorActivationRouter,
  intakeFormRouter,
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
        reportDataRouter,
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
        therapistAbsenceRouter,
        counselorActivationRouter,
        intakeFormRouter,
      ],
    });

    // Schedule the cron job to run daily at midnight (Pacific Time)
    const session = new Session();
    cron.schedule('0 0 * * *', async () => {
      await session.dailyUpdateSessionStatus();
    }, { timezone: 'America/Los_Angeles' });

    // Schedule cron job to resume treatment blocks for expired absences (daily at 1 AM)
    const therapistAbsence = new TherapistAbsence();
    cron.schedule('0 1 * * *', async () => {
      logger.info('Running expired absence resume cronjob...');
      await therapistAbsence.resumeExpiredAbsences();
    }, { timezone: 'America/Los_Angeles' });

    // Schedule cron job to send 24-hour session reminders (runs every hour)
    cron.schedule('0 * * * *', async () => {
      logger.info('Running 24-hour session reminder cronjob...');
      await session.send24HourSessionReminders();
    });

    await server.listen();
  } catch (error) {
    console.error(`Failed to start the server: ${error.message}`);
    console.error(error);
  }
}

main();
