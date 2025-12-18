import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import logger from '../config/winston.js';
import prisma from '../utils/prisma.js';

export default class TreatmentTargetServiceFrequencies {
  //////////////////////////////////////////

  /**
   * Create a service frequency record
   * @param {Object} data - Service frequency data
   * @returns {Promise<Object>} Created record
   */
  async createServiceFrequency(data) {
    try {
      const record = await prisma.treatment_target_service_frequencies.create({
        data: {
          template_id: data.template_id,
          service_ref_id: data.service_ref_id || null,
          nbr_of_sessions: data.nbr_of_sessions,
          sessions: data.sessions,
        },
        include: {
          template: true,
          service_template: true,
        },
      });

      return {
        message: 'Service frequency created successfully',
        rec: record,
      };
    } catch (error) {
      if (error.code === 'P2002') {
        return {
          message: 'Service frequency already exists for this template, service, and session count',
          error: -1,
        };
      }
      logger.error(error);
      return { message: 'Error creating service frequency', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Create multiple service frequency records
   * @param {Array} records - Array of service frequency data
   * @returns {Promise<Object>} Creation result
   */
  async createManyServiceFrequencies(records) {
    try {
      if (!Array.isArray(records) || !records.length) {
        return { message: 'No service frequencies to create', error: -1 };
      }

      const insertRecords = records.map((rec) => ({
        template_id: rec.template_id,
        service_ref_id: rec.service_ref_id || null,
        nbr_of_sessions: rec.nbr_of_sessions,
        sessions: rec.sessions,
      }));

      const result = await prisma.treatment_target_service_frequencies.createMany({
        data: insertRecords,
        skipDuplicates: true,
      });

      return {
        message: `${result.count} service frequencies created successfully`,
        rec: { count: result.count },
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error creating service frequencies', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get service frequencies by template ID
   * @param {number} templateId - Template ID
   * @returns {Promise<Object>} Service frequencies
   */
  async getServiceFrequenciesByTemplateId(templateId) {
    try {
      const records = await prisma.treatment_target_service_frequencies.findMany({
        where: { template_id: templateId },
        include: {
          service_template: {
            select: {
              template_service_id: true,
              service_name: true,
              service_code: true,
              nbr_of_sessions: true,
            },
          },
        },
        orderBy: [{ nbr_of_sessions: 'asc' }],
      });

      return {
        message: 'Service frequencies retrieved successfully',
        rec: records,
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving service frequencies', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Update a service frequency record
   * @param {number} id - Service frequency ID
   * @param {Object} data - Update data
   * @returns {Promise<Object>} Updated record
   */
  async updateServiceFrequency(id, data) {
    try {
      const record = await prisma.treatment_target_service_frequencies.update({
        where: { id },
        data: {
          service_ref_id: data.service_ref_id,
          nbr_of_sessions: data.nbr_of_sessions,
          sessions: data.sessions,
          updated_at: new Date(),
        },
        include: {
          template: true,
          service_template: true,
        },
      });

      return {
        message: 'Service frequency updated successfully',
        rec: record,
      };
    } catch (error) {
      if (error.code === 'P2025') {
        return { message: 'Service frequency not found', error: -1 };
      }
      logger.error(error);
      return { message: 'Error updating service frequency', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Delete a service frequency record
   * @param {number} id - Service frequency ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteServiceFrequency(id) {
    try {
      await prisma.treatment_target_service_frequencies.delete({
        where: { id },
      });

      return { message: 'Service frequency deleted successfully' };
    } catch (error) {
      if (error.code === 'P2025') {
        return { message: 'Service frequency not found', error: -1 };
      }
      logger.error(error);
      return { message: 'Error deleting service frequency', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Delete all service frequencies for a template
   * @param {number} templateId - Template ID
   * @returns {Promise<Object>} Deletion result
   */
  async deleteServiceFrequenciesByTemplateId(templateId) {
    try {
      const result = await prisma.treatment_target_service_frequencies.deleteMany({
        where: { template_id: templateId },
      });

      return {
        message: `${result.count} service frequencies deleted successfully`,
        rec: { count: result.count },
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error deleting service frequencies', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get session frequency for a specific treatment target, form, service, and session count
   * @param {string} treatmentTarget - Treatment target name
   * @param {string} formName - Form name
   * @param {number} serviceId - Service ID
   * @param {number} nbrOfSessions - Number of sessions
   * @returns {Promise<Object>} Session frequency
   */
  async getSessionFrequency(treatmentTarget, formName, serviceTemplateId, nbrOfSessions) {
    try {
      const record = await prisma.treatment_target_service_frequencies.findFirst({
        where: {
          template: {
            treatment_target: treatmentTarget,
            form_name: formName,
            is_active: true,
          },
          service_ref_id: serviceTemplateId,
          nbr_of_sessions: nbrOfSessions,
        },
        include: {
          template: true,
          service_template: true,
        },
      });

      if (!record) {
        // Try to find a default (service_ref_id = null) for this session count
        const defaultRecord = await prisma.treatment_target_service_frequencies.findFirst({
          where: {
            template: {
              treatment_target: treatmentTarget,
              form_name: formName,
              is_active: true,
            },
            service_ref_id: null,
            nbr_of_sessions: nbrOfSessions,
          },
          include: {
            template: true,
          },
        });

        if (defaultRecord) {
          return {
            message: 'Default session frequency retrieved successfully',
            rec: defaultRecord,
          };
        }

        return { message: 'Session frequency not found', error: -1 };
      }

      return {
        message: 'Session frequency retrieved successfully',
        rec: record,
      };
    } catch (error) {
      logger.error(error);
      return { message: 'Error retrieving session frequency', error: -1 };
    }
  }

  //////////////////////////////////////////
}

