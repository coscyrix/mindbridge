import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const joi = require('joi');;
import Common from '../models/common.js';
import TreatmentTargetSessionForms from '../models/treatmentTargetSessionForms.js';

export default class TreatmentTargetSessionFormsService {
  //////////////////////////////////////////
  constructor() {
    this.common = new Common();
  }
  //////////////////////////////////////////

  /**
   * Get treatment target session forms by request ID
   * @param {Object} data - Query data
   * @param {number} data.req_id - Therapy request ID
   * @param {number} data.tenant_id - Tenant ID (optional)
   */
  async getTreatmentTargetSessionFormsByReqId(data) {
    try {
      const schema = joi.object({
        req_id: joi.number().required(),
        tenant_id: joi.number().optional(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
      return await treatmentTargetSessionForms.getTreatmentTargetSessionFormsByReqId(data);
    } catch (error) {
      console.error(error);
      return { message: 'Error retrieving treatment target session forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment target session forms by session ID
   * @param {Object} data - Query data
   * @param {number} data.session_id - Session ID
   * @param {number} data.tenant_id - Tenant ID (optional)
   */
  async getTreatmentTargetSessionFormsBySessionId(data) {
    try {
      const schema = joi.object({
        session_id: joi.number().required(),
        tenant_id: joi.number().optional(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
      return await treatmentTargetSessionForms.getTreatmentTargetSessionFormsBySessionId(data);
    } catch (error) {
      console.error(error);
      return { message: 'Error retrieving treatment target session forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment target session forms by client ID
   * @param {Object} data - Query data
   * @param {number} data.client_id - Client ID
   * @param {number} data.tenant_id - Tenant ID (optional)
   */
  async getTreatmentTargetSessionFormsByClientId(data) {
    try {
      const schema = joi.object({
        client_id: joi.number().required(),
        tenant_id: joi.number().optional(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
      return await treatmentTargetSessionForms.getTreatmentTargetSessionFormsByClientId(data);
    } catch (error) {
      console.error(error);
      return { message: 'Error retrieving treatment target session forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Update treatment target session form sent status
   * @param {Object} data - Update data
   * @param {number} data.id - Session form ID
   * @param {boolean} data.is_sent - Sent status
   */
  async updateTreatmentTargetSessionFormSentStatus(data) {
    try {
      const schema = joi.object({
        id: joi.number().required(),
        is_sent: joi.boolean().required(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
      return await treatmentTargetSessionForms.updateTreatmentTargetSessionFormSentStatus(data);
    } catch (error) {
      console.error(error);
      return { message: 'Error updating treatment target session form sent status', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Update treatment target session forms by session ID
   * @param {Object} data - Update data
   * @param {number} data.session_id - Session ID
   * @param {boolean} data.is_sent - Sent status
   */
  async updateTreatmentTargetSessionFormsBySessionId(data) {
    try {
      const schema = joi.object({
        session_id: joi.number().required(),
        is_sent: joi.boolean().required(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
      return await treatmentTargetSessionForms.updateTreatmentTargetSessionFormsBySessionId(data);
    } catch (error) {
      console.error(error);
      return { message: 'Error updating treatment target session forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Delete treatment target session forms by request ID
   * @param {Object} data - Delete data
   * @param {number} data.req_id - Therapy request ID
   */
  async deleteTreatmentTargetSessionFormsByReqId(data) {
    try {
      const schema = joi.object({
        req_id: joi.number().required(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
      return await treatmentTargetSessionForms.deleteTreatmentTargetSessionFormsByReqId(data);
    } catch (error) {
      console.error(error);
      return { message: 'Error deleting treatment target session forms', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get forms to send for a specific session
   * @param {Object} data - Query data
   * @param {number} data.session_id - Session ID
   * @param {number} data.tenant_id - Tenant ID (optional)
   */
  async getFormsToSendForSession(data) {
    try {
      const schema = joi.object({
        session_id: joi.number().required(),
        tenant_id: joi.number().optional(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
      return await treatmentTargetSessionForms.getFormsToSendForSession(data);
    } catch (error) {
      console.error(error);
      return { message: 'Error retrieving forms to send', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment target session forms statistics
   * @param {Object} data - Query data
   * @param {number} data.req_id - Therapy request ID (optional)
   * @param {number} data.client_id - Client ID (optional)
   * @param {number} data.tenant_id - Tenant ID (optional)
   */
  async getTreatmentTargetSessionFormsStats(data) {
    try {
      const schema = joi.object({
        req_id: joi.number().optional(),
        client_id: joi.number().optional(),
        tenant_id: joi.number().optional(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
      return await treatmentTargetSessionForms.getTreatmentTargetSessionFormsStats(data);
    } catch (error) {
      console.error(error);
      return { message: 'Error retrieving treatment target session forms statistics', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Update treatment target session form by session ID and form ID
   * @param {Object} data - Update data
   * @param {number} data.session_id - Session ID
   * @param {number} data.form_id - Form ID
   * @param {boolean} data.form_submit - Form submission status
   */
  async updateTreatmentTargetSessionFormBySessionIdAndFormId(data) {
    try {
      const schema = joi.object({
        session_id: joi.number().required(),
        form_id: joi.number().required(),
        form_submit: joi.boolean().required(),
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
      return await treatmentTargetSessionForms.updateTreatmentTargetSessionFormBySessionIdAndFormId(data);
    } catch (error) {
      console.error(error);
      return { message: 'Error updating treatment target session form', error: -1 };
    }
  }

  //////////////////////////////////////////
}
