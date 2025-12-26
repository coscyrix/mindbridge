import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const knex = require('knex');
import logger from '../config/winston.js';
import DBconn from '../config/db.config.js';
import prisma from '../utils/prisma.js';

export default class TreatmentTargetRequestForms {
  //////////////////////////////////////////
  /**
   * Create treatment target request form records
   * @param {Array} records - Array of request form data
   */
  async createTreatmentTargetRequestForms(records) {
    try {
      if (!Array.isArray(records) || !records.length) {
        return { message: 'No request forms to create', error: -1 };
      }

      const insertRecords = records.map((rec) => ({
        req_id: rec.req_id,
        client_id: rec.client_id,
        counselor_id: rec.counselor_id,
        treatment_target: rec.treatment_target,
        form_name: rec.form_name,
        form_id: rec.form_id,
        purpose: rec.purpose ?? null,
        is_sent: !!rec.is_sent,
        sent_at: rec.sent_at ?? null,
        tenant_id: rec.tenant_id ?? null,
      }));

      // use prisma
      await prisma.treatment_target_request_forms.createMany({
        data: insertRecords,
      });

      return {
        message: 'Treatment target request forms created successfully',
      };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        logger.warn(
          'Duplicate entry detected while creating treatment target request forms, skipping insert:',
          error.message,
        );
        return {
          message:
            'Treatment target request forms created successfully (some duplicates skipped)',
        };
      }

      logger.error(error);
      return {
        message: 'Error creating treatment target request forms',
        error: -1,
      };
    }
  }

  //////////////////////////////////////////
}


