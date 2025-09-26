import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import CounselorDocuments from '../models/counselorDocuments.js';
const joi = require('joi');;
import { saveFile } from '../utils/fileUpload.js';

export default class CounselorDocumentsService {
  constructor() {
    this.counselorDocuments = new CounselorDocuments();
  }

  async addDocument(data, file) {
    try {
      // Parse date strings to Date objects before validation
      if (data.expiry_date && typeof data.expiry_date === 'string') {
        // Handle DD-MM-YYYY format
        const dateParts = data.expiry_date.split('-');
        if (dateParts.length === 3) {
          const day = parseInt(dateParts[0]);
          const month = parseInt(dateParts[1]) - 1; // Month is 0-indexed
          const year = parseInt(dateParts[2]);
          data.expiry_date = new Date(year, month, day);
        }
      }

      const schema = joi.object({
        counselor_profile_id: joi.number().required(),
        document_type: joi.string().valid(
          'license',
          'certification',
          'insurance',
          'education',
          'identification',
          'other'
        ).required(),
        document_name: joi.string().required(),
        is_verified: joi.boolean().default(false),
        verification_date: joi.date().optional(),
        verification_notes: joi.string().optional(),
        expiry_date: joi.date().optional()
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      // Validate file
      if (!file) {
        return { message: 'No file provided', error: -1 };
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return { message: 'Invalid file type. Only PDF, JPEG and PNG are allowed', error: -1 };
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        return { message: 'File too large. Maximum size is 10MB', error: -1 };
      }

      // File is already saved by multer, just get the path
      const documentUrl = `/uploads/counselor-documents/${file.filename}`;
      data.document_url = documentUrl;

      return this.counselorDocuments.addDocument(data);
    } catch (error) {
      return { message: 'Error adding document', error: -1 };
    }
  }

  async getDocuments(counselor_profile_id) {
    if (!counselor_profile_id) {
      return { message: 'Counselor profile ID is required', error: -1 };
    }

    return this.counselorDocuments.getDocuments(counselor_profile_id);
  }

  async updateDocument(document_id, data) {
    try {
      const schema = joi.object({
        document_type: joi.string().valid(
          'license',
          'certification',
          'insurance',
          'education',
          'identification',
          'other'
        ).optional(),
        document_name: joi.string().optional(),
        is_verified: joi.boolean().optional(),
        verification_date: joi.date().optional(),
        verification_notes: joi.string().optional(),
        expiry_date: joi.date().optional()
      });

      const { error } = schema.validate(data);
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      return this.counselorDocuments.updateDocument(document_id, data);
    } catch (error) {
      return { message: 'Error updating document', error: -1 };
    }
  }

  async deleteDocument(document_id) {
    if (!document_id) {
      return { message: 'Document ID is required', error: -1 };
    }

    return this.counselorDocuments.deleteDocument(document_id);
  }
} 