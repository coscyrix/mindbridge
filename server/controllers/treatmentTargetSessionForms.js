import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import TreatmentTargetSessionFormsService from '../services/treatmentTargetSessionForms.js';
import Common from '../models/common.js';
const dotenv = require('dotenv');;

dotenv.config();

export default class TreatmentTargetSessionFormsController {
  //////////////////////////////////////////
  constructor() {
    this.common = new Common();
  }
  //////////////////////////////////////////

  /**
   * Manually attach treatment target session forms for a specific session
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createManualTreatmentTargetSessionForms(req, res) {
    try {
      const data = req.body || {};

      // Get tenant ID from token if available
      if (req.decoded && req.decoded.tenant_id && !data.tenant_id) {
        data.tenant_id = req.decoded.tenant_id;
      }

      const treatmentTargetSessionFormsService =
        new TreatmentTargetSessionFormsService();
      const result =
        await treatmentTargetSessionFormsService.createManualTreatmentTargetSessionForms(
          data
        );

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Internal server error",
        error: -1,
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment target session forms by request ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTreatmentTargetSessionFormsByReqId(req, res) {
    try {
      const data = req.query;
      
      // Get tenant ID from token if available
      if (req.decoded && req.decoded.tenant_id) {
        data.tenant_id = req.decoded.tenant_id;
      }

      const treatmentTargetSessionFormsService = new TreatmentTargetSessionFormsService();
      const result = await treatmentTargetSessionFormsService.getTreatmentTargetSessionFormsByReqId(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment target session forms by session ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTreatmentTargetSessionFormsBySessionId(req, res) {
    try {
      const data = req.query;
      
      // Get tenant ID from token if available
      if (req.decoded && req.decoded.tenant_id) {
        data.tenant_id = req.decoded.tenant_id;
      }

      const treatmentTargetSessionFormsService = new TreatmentTargetSessionFormsService();
      const result = await treatmentTargetSessionFormsService.getTreatmentTargetSessionFormsBySessionId(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment target session forms by client ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTreatmentTargetSessionFormsByClientId(req, res) {
    try {
      const data = req.query;
      
      // Get tenant ID from token if available
      if (req.decoded && req.decoded.tenant_id) {
        data.tenant_id = req.decoded.tenant_id;
      }

      const treatmentTargetSessionFormsService = new TreatmentTargetSessionFormsService();
      const result = await treatmentTargetSessionFormsService.getTreatmentTargetSessionFormsByClientId(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Update treatment target session form sent status
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateTreatmentTargetSessionFormSentStatus(req, res) {
    try {
      const data = req.body;

      const treatmentTargetSessionFormsService = new TreatmentTargetSessionFormsService();
      const result = await treatmentTargetSessionFormsService.updateTreatmentTargetSessionFormSentStatus(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Delete treatment target session forms by request ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteTreatmentTargetSessionFormsByReqId(req, res) {
    try {
      const data = req.body;

      const treatmentTargetSessionFormsService = new TreatmentTargetSessionFormsService();
      const result = await treatmentTargetSessionFormsService.deleteTreatmentTargetSessionFormsByReqId(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Update treatment target session forms by session ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async updateTreatmentTargetSessionFormsBySessionId(req, res) {
    try {
      const data = req.body;

      const treatmentTargetSessionFormsService = new TreatmentTargetSessionFormsService();
      const result = await treatmentTargetSessionFormsService.updateTreatmentTargetSessionFormsBySessionId(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Get forms to send for a specific session
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getFormsToSendForSession(req, res) {
    try {
      const data = req.query;
      
      // Get tenant ID from token if available
      if (req.decoded && req.decoded.tenant_id) {
        data.tenant_id = req.decoded.tenant_id;
      }

      const treatmentTargetSessionFormsService = new TreatmentTargetSessionFormsService();
      const result = await treatmentTargetSessionFormsService.getFormsToSendForSession(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment target session forms statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTreatmentTargetSessionFormsStats(req, res) {
    try {
      const data = req.query;
      
      // Get tenant ID from token if available
      if (req.decoded && req.decoded.tenant_id) {
        data.tenant_id = req.decoded.tenant_id;
      }

      const treatmentTargetSessionFormsService = new TreatmentTargetSessionFormsService();
      const result = await treatmentTargetSessionFormsService.getTreatmentTargetSessionFormsStats(data);

      if (result.error) {
        res.status(400).json(result);
        return;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: 'Internal server error',
        error: -1
      });
    }
  }

  //////////////////////////////////////////
}
