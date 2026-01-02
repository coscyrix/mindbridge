import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const joi = require('joi');
import Common from '../models/common.js';
import TreatmentTargetSessionForms from '../models/treatmentTargetSessionForms.js';
import EmailTmplt from '../models/emailTmplt.js';
import prisma from '../utils/prisma.js';

export default class TreatmentTargetRequestFormsService {
  //////////////////////////////////////////
  constructor() {
    this.common = new Common();
    this.emailTmplt = new EmailTmplt();
    this.treatmentTargetSessionForms = new TreatmentTargetSessionForms();
  }
  //////////////////////////////////////////

  /**
   * Manually attach treatment target request forms for a specific therapy request
   * Attaches forms to the top session with status SCHEDULED and is_additional = false
   * 
   * This function:
   * - Creates records in treatment_target_session_forms table
   * - Updates the session's forms_array field with the new form IDs
   * - No emails are sent - forms are created with is_sent: false
   * 
   * @param {Object} data - Payload data
   * @param {number} data.req_id - Therapy request ID
   * @param {number} [data.session_id] - Optional session ID (ignored - uses top SCHEDULED session)
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
        session_id: joi.number().optional(), // Optional, but ignored - uses top SCHEDULED session
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

      // Get therapy request with sessions (to get first session)
      const recThrpy = await this.common.getThrpyReqById(req_id);
      if (!recThrpy || !Array.isArray(recThrpy) || !recThrpy[0]) {
        return { message: 'Therapy request not found', error: -1 };
      }

      const thrpy = recThrpy[0];
      const effectiveTenantId = tenant_id ?? thrpy.tenant_id ?? null;

      // Find the top session with status SCHEDULED and is_additional = false
      const topSession = await prisma.session.findFirst({
        where: {
          thrpy_req_id: req_id,
          session_status: 'SCHEDULED',
          is_additional: false,
          is_report: false,
        },
        orderBy: [
          { session_number: 'asc' },
          { session_id: 'asc' },
        ],
      });

      if (!topSession) {
        return {
          message: 'No scheduled session found for therapy request. Please create a scheduled session first.',
          error: -1,
        };
      }

      // Ensure is_additional is false (update if needed)
      if (topSession.is_additional) {
        await prisma.session.update({
          where: { session_id: topSession.session_id },
          data: { is_additional: false },
        });
      }

      const sessionId = topSession.session_id;
      const sessionNumber = topSession.session_number || 1;

      const records = [];
      const replacedForms = [];
      const formCodesToAdd = []; // Collect form codes (e.g., "IPF", "WHODAS") to add to forms_array

      // Process all forms - delete existing ones and prepare new records
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

        // Check if this form already exists for this session
        const existingForm = await prisma.treatment_target_session_forms.findFirst({
          where: {
            session_id: sessionId,
            form_id: form.form_id,
            treatment_target: treatment_target,
          },
        });

        // If form exists, delete it first (replace behavior)
        if (existingForm) {
          await prisma.treatment_target_session_forms.delete({
            where: {
              id: existingForm.id,
            },
          });
          replacedForms.push(formName);
        }
        // Find or create a config for this treatment target and form
        // For manual forms, we need a config_id (required by FK constraint)
        let config = await prisma.treatment_target_feedback_config.findFirst({
          where: {
            treatment_target: treatment_target,
            form_name: formName,
            OR: [
              { tenant_id: effectiveTenantId },
              { tenant_id: null },
            ],
          },
          orderBy: {
            tenant_id: 'desc',
          },
        });

        // If no config exists, create a minimal one for manual forms
        if (!config) {
          config = await prisma.treatment_target_feedback_config.create({
            data: {
              treatment_target: treatment_target,
              form_name: formName,
              purpose: `Manual assessment - ${formName}`,
              sessions: [sessionNumber], // Required JSON field - array of session numbers (Prisma handles JSON automatically)
              tenant_id: effectiveTenantId,
            },
          });
        }

        // Create session form record (same path as usual way)
        // Include all available fields from schema: is_sent, sent_at, purpose, etc.
        records.push({
          req_id,
          session_id: sessionId,
          client_id,
          counselor_id,
          treatment_target,
          form_name: formName,
          form_id: form.form_id,
          config_id: config.id,
          purpose: `Manual assessment - ${formName}`, // Set purpose for manual forms
          session_number: sessionNumber,
          is_sent: false, // Not sent - no email will be sent
          tenant_id: effectiveTenantId,
          // form_submit defaults to false (for when client submits the form)
        });

        // Collect form code to add to forms_array
        formCodesToAdd.push(formName);
      }

      if (!records.length) {
        return { message: 'No forms to create', error: -1 };
      }

      // Persist via session forms model (same path as usual way)
      const createResult =
        await this.treatmentTargetSessionForms.createTreatmentTargetSessionForms(
          records,
        );

      if (createResult?.error) {
        return createResult;
      }

      // Update session's forms_array with the new form IDs
      // Get current forms_array from the session
      const currentSession = await prisma.session.findUnique({
        where: { session_id: sessionId },
        select: { forms_array: true },
      });

      // Parse existing forms_array (handle both array and JSON string)
      const currentForms = Array.isArray(currentSession?.forms_array)
        ? currentSession.forms_array
        : currentSession?.forms_array
        ? JSON.parse(currentSession.forms_array)
        : [];

      // Merge new form codes with existing ones and remove duplicates
      const updatedForms = Array.from(
        new Set([...currentForms, ...formCodesToAdd])
      );

      // Update session's forms_array
      await prisma.session.update({
        where: { session_id: sessionId },
        data: {
          forms_array: updatedForms,
        },
      });

      // Build response message
      let successMessage = 'Treatment target request forms created successfully';
      if (replacedForms.length > 0) {
        successMessage += `. Note: ${replacedForms.length} form(s) were replaced (${replacedForms.join(', ')}).`;
      }

      // No email will be sent - forms are created with is_sent: false

      return {
        message: successMessage,
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


