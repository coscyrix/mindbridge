import CounselorDocumentsService from '../services/counselorDocuments.js';
import logger from '../config/winston.js';

export default class CounselorDocumentsController {
  constructor() {
    this.counselorDocumentsService = new CounselorDocumentsService();
  }

  async addDocument(req, res) {
    try {
      const result = await this.counselorDocumentsService.addDocument(req.body, req.file);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      logger.error('Error adding document:', error);
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  async getDocuments(req, res) {
    try {
      const { counselor_profile_id } = req.params;
      
      const result = await this.counselorDocumentsService.getDocuments(counselor_profile_id);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error retrieving documents:', error);
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  async updateDocument(req, res) {
    try {
      const { document_id } = req.params;
      
      const result = await this.counselorDocumentsService.updateDocument(document_id, req.body);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error updating document:', error);
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  async deleteDocument(req, res) {
    try {
      const { document_id } = req.params;
      
      const result = await this.counselorDocumentsService.deleteDocument(document_id);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error deleting document:', error);
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }
} 