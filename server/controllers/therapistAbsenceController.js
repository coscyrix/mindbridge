//controllers/therapistAbsenceController.js

import TherapistAbsenceService from '../services/therapistAbsence.js';
import logger from '../config/winston.js';

export default class TherapistAbsenceController {
  async handleAbsence(req, res) {
    try {
      const { counselor_id, start_date, end_date, notify_admin, tenant_id } = req.body;

      // Validate required fields
      if (!counselor_id || !start_date || !end_date) {
        return res.status(400).json({
          message: 'Missing required fields: counselor_id, start_date, end_date',
          error: -1,
        });
      }

      // Validate dates
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return res.status(400).json({
          message: 'Invalid date format',
          error: -1,
        });
      }

      if (startDate > endDate) {
        return res.status(400).json({
          message: 'Start date cannot be after end date',
          error: -1,
        });
      }

      // Validate minimum 3 weeks (21 days) absence period
      const daysDifference = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
      const minimumDays = 21; // 3 weeks
      
      if (daysDifference < minimumDays) {
        return res.status(400).json({
          message: `Absence period must be at least ${minimumDays} days (3 weeks). Current period: ${daysDifference} days`,
          error: -1,
        });
      }

      const therapistAbsenceService = new TherapistAbsenceService();
      const result = await therapistAbsenceService.handleTherapistAbsence({
        counselor_id: parseInt(counselor_id),
        start_date,
        end_date,
        notify_admin: notify_admin || false,
        tenant_id: tenant_id ? parseInt(tenant_id) : null,
      });

      if (result.error) {
        return res.status(500).json(result);
      }

      return res.status(200).json(result);
    } catch (error) {
      logger.error('Error in handleAbsence controller:', error);
      return res.status(500).json({
        message: 'Error handling therapist absence',
        error: -1,
      });
    }
  }
}
