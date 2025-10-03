import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import DBconn from '../config/db.config.js';
const knex = require('knex');;
import logger from '../config/winston.js';

const db = knex(DBconn.dbConn.development);

export default class CounselorDocuments {
  constructor() {
    this.db = db;
  }

  async addDocument(data) {
    try {
      const result = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_documents')
        .insert({
          counselor_profile_id: data.counselor_profile_id,
          document_type: data.document_type,
          document_url: data.document_url,
          document_name: data.document_name,
          is_verified: data.is_verified || false,
          verification_date: data.verification_date,
          verification_notes: data.verification_notes,
          expiry_date: data.expiry_date
        });

      return { 
        message: 'Document added successfully', 
        id: result[0] 
      };
    } catch (error) {
      logger.error('Error adding counselor document:', error);
      return { message: 'Error adding counselor document', error: -1 };
    }
  }

  async getDocuments(counselor_profile_id) {
    try {
      const documents = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('*')
        .from('counselor_documents')
        .where('counselor_profile_id', counselor_profile_id)
        .orderBy('created_at', 'desc');

      return { 
        message: 'Documents retrieved successfully', 
        rec: documents 
      };
    } catch (error) {
      logger.error('Error retrieving counselor documents:', error);
      return { message: 'Error retrieving counselor documents', error: -1, rec: [] };
    }
  }

  async updateDocument(document_id, data) {
    try {
      const updateData = {};
      
      if (data.document_type) updateData.document_type = data.document_type;
      if (data.document_url) updateData.document_url = data.document_url;
      if (data.document_name) updateData.document_name = data.document_name;
      if (data.is_verified !== undefined) updateData.is_verified = data.is_verified;
      if (data.verification_date) updateData.verification_date = data.verification_date;
      if (data.verification_notes) updateData.verification_notes = data.verification_notes;
      if (data.expiry_date) updateData.expiry_date = data.expiry_date;

      const result = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_documents')
        .where('document_id', document_id)
        .update(updateData);

      return { message: 'Document updated successfully' };
    } catch (error) {
      logger.error('Error updating counselor document:', error);
      return { message: 'Error updating counselor document', error: -1 };
    }
  }

  async deleteDocument(document_id) {
    try {
      await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_documents')
        .where('document_id', document_id)
        .del();

      return { message: 'Document deleted successfully' };
    } catch (error) {
      logger.error('Error deleting counselor document:', error);
      return { message: 'Error deleting counselor document', error: -1 };
    }
  }
} 