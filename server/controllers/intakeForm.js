//controllers/intakeForm.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import IntakeFormService from '../services/intakeForm.js';
import logger from '../config/winston.js';

export default class IntakeFormController {
  constructor() {
    this.intakeFormService = new IntakeFormService();
  }

  async submitIntakeForm(req, res) {
    try {
      const data = req.body;

      if (!data.appointment_id || !data.counselor_id || !data.intake_form_id) {
        return res.status(400).json({ 
          message: 'appointment_id, counselor_id, and intake_form_id are required', 
          error: -1 
        });
      }

      const result = await this.intakeFormService.submitIntakeForm(data);

      if (result.error) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in submitIntakeForm controller:', error);
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  async getIntakeFormDetails(req, res) {
    try {
      const { intake_form_id, counselor_profile_id } = req.query;

      if (!intake_form_id || !counselor_profile_id) {
        return res.status(400).json({ 
          message: 'intake_form_id and counselor_profile_id are required', 
          error: -1 
        });
      }

      const result = await this.intakeFormService.getIntakeFormDetails({
        intake_form_id: Number(intake_form_id),
        counselor_profile_id: Number(counselor_profile_id),
      });

      if (result.error) {
        return res.status(400).json(result);
      }

      res.status(200).json(result);
    } catch (error) {
      logger.error('Error in getIntakeFormDetails controller:', error);
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }
}

