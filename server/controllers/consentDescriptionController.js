import ConsentDescriptionService from '../services/consentDescriptionService.js';
import logger from '../config/winston.js';

export default class ConsentDescriptionController {
  constructor() {
    this.consentDescriptionService = new ConsentDescriptionService();
  }

  async createConsentDescription(req, res) {
    try {
      const result = await this.consentDescriptionService.createConsentDescription(req.body);
      if (result.error) {
        return res.status(400).json(result);
      }
      res.status(201).json(result);
    } catch (error) {
      logger.error('Error creating consent description:', error);
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  async getConsentDescription(req, res) {
    try {
      const { tenant_id, counselor_id, role_id } = req.query;
      
      // If role_id == 4 (admin), always fetch system default consent form
      if (role_id && Number(role_id) === 4) {
        const result = await this.consentDescriptionService.getDefaultConsentTemplate();
        if (result && result.error) {
          return res.status(400).json(result);
        }
        return res.status(200).json(result);
      }
      
      if (!tenant_id) {
        return res.status(400).json({ message: 'tenant_id is required', error: -1 });
      }
      const result = await this.consentDescriptionService.getConsentDescription({ tenant_id, counselor_id });
      if (result && result.error) {
        return res.status(400).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error fetching consent description:', error);
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  async updateConsentDescription(req, res) {
    try {
      const { id } = req.params;
      const result = await this.consentDescriptionService.updateConsentDescription(id, req.body);
      if (result.error) {
        return res.status(400).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error updating consent description:', error);
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  async deleteConsentDescription(req, res) {
    try {
      const { id } = req.params;
      const result = await this.consentDescriptionService.deleteConsentDescription(id);
      if (result.error) {
        return res.status(400).json(result);
      }
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error deleting consent description:', error);
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }
} 