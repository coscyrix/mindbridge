import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import db from '../utils/db.js';
import logger from '../config/winston.js';
import Service from './service.js';

export default class CounselorService {
  constructor() {
    this.service = new Service();
  }

  async createCounselorService(data) {
    try {
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_services')
        .insert({
          counselor_profile_id: data.counselor_profile_id,
          service_id: data.service_id,
          is_specialty: data.is_specialty || false
        });

      return { message: 'Counselor service created successfully', id: result[0] };
    } catch (error) {
      logger.error('Error creating counselor service:', error);
      return { message: 'Error creating counselor service', error: -1 };
    }
  }

  async updateCounselorService(counselor_service_id, data) {
    try {
      const updateData = {};
      
      if (data.service_id) updateData.service_id = data.service_id;
      if (data.is_specialty !== undefined) updateData.is_specialty = data.is_specialty;

      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_services')
        .where('counselor_service_id', counselor_service_id)
        .update(updateData);

      return { message: 'Counselor service updated successfully' };
    } catch (error) {
      logger.error('Error updating counselor service:', error);
      return { message: 'Error updating counselor service', error: -1 };
    }
  }

  async getCounselorServices(filters) {
    try {
      const query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('cs.*', 's.service_name', 's.service_code')
        .from('counselor_services as cs')
        .join('service as s', 'cs.service_id', 's.service_id');

      if (filters.counselor_profile_id) {
        query.where('cs.counselor_profile_id', filters.counselor_profile_id);
      }

      if (filters.service_id) {
        query.where('cs.service_id', filters.service_id);
      }

      if (filters.is_specialty !== undefined) {
        query.where('cs.is_specialty', filters.is_specialty);
      }

      const results = await query;

      return {
        message: 'Counselor services retrieved successfully',
        rec: results
      };
    } catch (error) {
      logger.error('Error retrieving counselor services:', error);
      return { message: 'Error retrieving counselor services', error: -1, rec: [] };
    }
  }

  async deleteCounselorService(counselor_service_id) {
    try {
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_services')
        .where('counselor_service_id', counselor_service_id)
        .delete();

      return { message: 'Counselor service deleted successfully' };
    } catch (error) {
      logger.error('Error deleting counselor service:', error);
      return { message: 'Error deleting counselor service', error: -1 };
    }
  }

  async deleteAllCounselorServicesByProfileId(counselor_profile_id) {
    try {
      const result = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_services')
        .where('counselor_profile_id', counselor_profile_id)
        .delete();
      return { message: 'All counselor services deleted successfully' };
    } catch (error) {
      logger.error('Error deleting all counselor services:', error);
      return { message: 'Error deleting all counselor services', error: -1 };
    }
  }
} 