import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import TreatmentTargetRequestFormsService from '../services/treatmentTargetRequestForms.js';
import Common from '../models/common.js';
const dotenv = require('dotenv');

dotenv.config();

export default class TreatmentTargetRequestFormsController {
  //////////////////////////////////////////
  constructor() {
    this.common = new Common();
  }
  //////////////////////////////////////////

  /**
   * Manually attach treatment target request forms for a specific therapy request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createManualTreatmentTargetRequestForms(req, res) {
    try {
      const data = req.body || {};

      // Get tenant ID from token if available
      if (req.decoded && req.decoded.tenant_id && !data.tenant_id) {
        data.tenant_id = req.decoded.tenant_id;
      }

      const service = new TreatmentTargetRequestFormsService();
      const result = await service.createManualTreatmentTargetRequestForms(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Internal server error',
        error: -1,
      });
    }
  }

  //////////////////////////////////////////
}


