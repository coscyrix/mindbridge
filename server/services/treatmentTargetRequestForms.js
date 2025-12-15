import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const joi = require('joi');
import Common from '../models/common.js';
import TreatmentTargetRequestForms from '../models/treatmentTargetRequestForms.js';
import EmailTmplt from '../models/emailTmplt.js';
import prisma from '../utils/prisma.js';

export default class TreatmentTargetRequestFormsService {
  //////////////////////////////////////////
  constructor() {
    this.common = new Common();
    this.emailTmplt = new EmailTmplt();
    this.treatmentTargetRequestForms = new TreatmentTargetRequestForms();
  }
  //////////////////////////////////////////

  /**
   * Manually attach treatment target request forms for a specific therapy request
   * @param {Object} data - Payload data
   * @param {number} data.req_id - Therapy request ID
   * @param {number} [data.session_id] - Optional session ID (ignored for storage, kept for backward compatibility)
   * @param {number} data.client_id - Client ID
   * @param {number} data.counselor_id - Counselor ID
   * @param {string} data.treatment_target - Treatment target name
   * @param {Array<string>} data.form_names - Array of form codes (form_cde) to attach
   * @param {number} [data.tenant_id] - Tenant ID (optional, taken from token or thrpy_req if not provided)
   */
  async createManualTreatmentTargetRequestForms(data) {
    try {
      const schema = joi.object({
        req_id: joi.number().required(),
        session_id: joi.number().optional(), // Allowed but not used (request-level, not session-level)
        client_id: joi.number().required(),
        counselor_id: joi.number().required(),
        treatment_target: joi.string().required(),
        form_names: joi.array().items(joi.string().required()).min(1).required(),
        tenant_id: joi.number().optional(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      const {
        req_id,
        client_id,
        counselor_id,
        treatment_target,
        form_names,
        tenant_id,
      } = data;

      // Resolve therapy request (for tenant + validation)
      const thrpyReq = await prisma.thrpy_req.findUnique({
        where: { req_id },
      });

      if (!thrpyReq) {
        return { message: 'Therapy request not found', error: -1 };
      }

      const effectiveTenantId = tenant_id ?? thrpyReq.tenant_id ?? null;

      const records = [];

      for (const formName of form_names) {
        // Resolve form_id from forms table using form_cde (e.g. "IPF", "PCL-5")
        const form = await prisma.forms.findFirst({
          where: {
            form_cde: formName,
            OR: [
              { tenant_id: effectiveTenantId },
              { tenant_id: null },
            ],
          },
          orderBy: {
            tenant_id: 'desc',
          },
        });

        if (!form) {
          return {
            message: `Form with code "${formName}" not found`,
            error: -1,
          };
        }

        records.push({
          req_id,
          client_id,
          counselor_id,
          treatment_target,
          form_name: formName,
          form_id: form.form_id,
          purpose: null,
          is_sent: true,
          sent_at: new Date(),
          tenant_id: effectiveTenantId,
        });
      }

      if (!records.length) {
        return { message: 'No forms to create', error: -1 };
      }

      // Persist via dedicated model (keeps knex-based reporting consistent)
      const createResult =
        await this.treatmentTargetRequestForms.createTreatmentTargetRequestForms(
          records,
        );

      if (createResult?.error) {
        return createResult;
      }

      // Also send treatment tool emails for these assessments, similar to SHOW / NO-SHOW flow
      const emailResult =
        await this.emailTmplt.sendManualTreatmentToolEmailForRequest({
          req_id,
          client_id,
          counselor_id,
          form_codes: form_names,
        });

      if (emailResult?.error) {
        // Log but don't fail the main API if email sending fails
        console.error(
          'Error sending manual treatment tools email:',
          emailResult?.message || emailResult?.error,
        );
      }

      return {
        message: 'Treatment target request forms created successfully',
      };
    } catch (error) {
      console.error(error);
      return {
        message: 'Error creating manual treatment target request forms',
        error: -1,
      };
    }
  }

  //////////////////////////////////////////
}


