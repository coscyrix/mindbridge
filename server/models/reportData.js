import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import db from '../utils/db.js';
import logger from '../config/winston.js';
import Common from './common.js';

export default class ReportData {
  //////////////////////////////////////////
  constructor() {
    this.common = new Common();
  }
  //////////////////////////////////////////

  /**
   * Create a new report
   * @param {Object} data - Report data
   * @returns {Promise<Object>} Created report result
   */
  async postReport(data) {
    try {
      const tmpReport = {
        ...(data.session_id && { session_id: data.session_id }),
        ...(data.client_id && { client_id: data.client_id }),
        ...(data.counselor_id && { counselor_id: data.counselor_id }),
        report_type: data.report_type,
        ...(data.report_json && { report_json: data.report_json }),
        tenant_id: data.tenant_id,
      };

      const postReport = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('reports')
        .insert(tmpReport);

      if (!postReport) {
        logger.error('Error creating report');
        return { message: 'Error creating report', error: -1 };
      }

      const reportId = Array.isArray(postReport) ? postReport[0] : postReport;

      return {
        message: 'Report created successfully',
        report_id: reportId,
      };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error creating report', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Update a report by ID
   * @param {Object} data - Report data with report_id
   * @returns {Promise<Object>} Updated report result
   */
  async putReportById(data) {
    try {
      const reportId = data.report_id;
      if (!reportId) {
        return { message: 'report_id is required', error: -1 };
      }

      const updateData = {};
      if (data.session_id !== undefined) updateData.session_id = data.session_id;
      if (data.client_id !== undefined) updateData.client_id = data.client_id;
      if (data.counselor_id !== undefined) updateData.counselor_id = data.counselor_id;
      if (data.report_type !== undefined) updateData.report_type = data.report_type;
      if (data.report_json !== undefined) updateData.report_json = data.report_json;
      if (data.is_locked !== undefined) updateData.is_locked = data.is_locked;
      updateData.updated_at = new Date();

      const updateReport = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('reports')
        .where('report_id', reportId)
        .update(updateData);

      if (updateReport === 0) {
        logger.error('Report not found or no changes made');
        return { message: 'Report not found or no changes made', error: -1 };
      }

      return {
        message: 'Report updated successfully',
        report_id: reportId,
      };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error updating report', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get report(s) by various filters
   * @param {Object} data - Query filters
   * @returns {Promise<Array>} Array of reports
   */
  async getReportById(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('reports as r');

      if (data.report_id) {
        query = query.where('r.report_id', data.report_id);
      }
      if (data.session_id) {
        query = query.where('r.session_id', data.session_id);
      }
      if (data.client_id) {
        query = query.where('r.client_id', data.client_id);
      }
      if (data.counselor_id) {
        query = query.where('r.counselor_id', data.counselor_id);
      }
      if (data.report_type) {
        query = query.where('r.report_type', data.report_type);
      }
      if (data.status_yn) {
        query = query.where('r.status_yn', data.status_yn);
      }
      if (data.tenant_id) {
        query = query.where('r.tenant_id', data.tenant_id);
      }

      const reports = await query.orderBy('r.created_at', 'desc');

      if (!reports || reports.length === 0) {
        return { message: 'No reports found', error: -1 };
      }

      return reports;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error getting reports', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Create intake report data
   * @param {Object} data - Intake report data
   * @returns {Promise<Object>} Created intake report result
   */
  async postIntakeReport(data) {
    try {
      // Check if intake report already exists
      const existingReport = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('report_intake')
        .where('report_id', data.report_id)
        .first();

      // Prepare metadata from data (support both old and new formats)
      let metadata = null;
      if (data.metadata) {
        metadata = data.metadata;
      } else {
        // Build metadata from flat structure (backward compatibility)
        metadata = {
          meta: data.meta || {},
          client: data.client || {},
          practice: data.practice || {},
          therapist: data.therapist || {},
          report: data.report || {},
          sign_off: data.sign_off || {},
        };
      }

      const updateData = {
        updated_at: new Date(),
      };

      // Store all data in metadata JSON field
      if (metadata && Object.keys(metadata).length > 0) {
        updateData.metadata = db.raw('?', [JSON.stringify(metadata)]);
      }

      let intakeReportId;

      if (existingReport) {
        // Update existing record
        await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('report_intake')
          .where('report_id', data.report_id)
          .update(updateData);

        intakeReportId = existingReport.id;
      } else {
        // Insert new record
        const insertData = {
          report_id: data.report_id,
          ...updateData,
          tenant_id: data.tenant_id,
        };

        const postIntakeReport = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('report_intake')
          .insert(insertData);

        if (!postIntakeReport) {
          logger.error('Error creating intake report');
          return { message: 'Error creating intake report', error: -1 };
        }

        intakeReportId = Array.isArray(postIntakeReport) ? postIntakeReport[0] : postIntakeReport;
      }

      return {
        message: existingReport ? 'Intake report updated successfully' : 'Intake report created successfully',
        id: intakeReportId,
        report_id: data.report_id,
      };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error creating/updating intake report', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Create treatment plan report data
   * @param {Object} data - Treatment plan report data
   * @returns {Promise<Object>} Created treatment plan report result
   */
  async postTreatmentPlanReport(data) {
    try {
      const tmpTreatmentPlanReport = {
        report_id: data.report_id,
        ...(data.treatment_data && { treatment_data: data.treatment_data }),
        ...(data.goals && { goals: data.goals }),
        ...(data.objectives && { objectives: data.objectives }),
        ...(data.interventions && { interventions: data.interventions }),
        ...(data.timeline && { timeline: data.timeline }),
        tenant_id: data.tenant_id,
      };

      const postTreatmentPlanReport = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('report_treatment_plan')
        .insert(tmpTreatmentPlanReport);

      if (!postTreatmentPlanReport) {
        logger.error('Error creating treatment plan report');
        return { message: 'Error creating treatment plan report', error: -1 };
      }

      const treatmentPlanReportId = Array.isArray(postTreatmentPlanReport)
        ? postTreatmentPlanReport[0]
        : postTreatmentPlanReport;

      return {
        message: 'Treatment plan report created successfully',
        id: treatmentPlanReportId,
        report_id: data.report_id,
      };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error creating treatment plan report', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Create progress report data
   * @param {Object} data - Progress report data
   * @returns {Promise<Object>} Created progress report result
   */
  async postProgressReport(data) {
    try {
      // Check if a progress report already exists for this report_id
      const existingReport = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('report_progress')
        .where('report_id', data.report_id)
        .first();

      // Build structured metadata object with nested organization
      const metadata = {};

      // Meta section
      if (data.session_id !== undefined || data.client_id !== undefined || data.session_number !== undefined || data.total_sessions_completed !== undefined || data.report_date !== undefined) {
        metadata.meta = {};
        if (data.session_id !== undefined) metadata.meta.session_id = data.session_id;
        if (data.client_id_reference !== undefined) metadata.meta.client_id = data.client_id_reference;
        if (data.session_number !== undefined) metadata.meta.session_number = data.session_number;
        if (data.total_sessions_completed !== undefined) metadata.meta.total_sessions_completed = data.total_sessions_completed;
        // Parse report_date to extract just the date (YYYY-MM-DD format)
        if (data.report_date !== undefined) {
          // Try to parse the date string (could be "February 09, 2026" or ISO format)
          try {
            const dateObj = new Date(data.report_date);
            if (!isNaN(dateObj.getTime())) {
              metadata.meta.report_date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
            } else {
              metadata.meta.report_date = data.report_date;
            }
          } catch (e) {
            metadata.meta.report_date = data.report_date;
          }
        }
      }

      // Practice section
      if (data.practice_name !== undefined || data.treatment_block_name !== undefined || data.frequency !== undefined) {
        metadata.practice = {};
        if (data.practice_name !== undefined) metadata.practice.practice_name = data.practice_name;
        if (data.treatment_block_name !== undefined) metadata.practice.treatment_block_name = data.treatment_block_name;
        if (data.frequency !== undefined) metadata.practice.frequency = data.frequency;
      }

      // Therapist section
      if (data.therapist_name !== undefined || data.therapist_designation !== undefined) {
        metadata.therapist = {};
        if (data.therapist_name !== undefined) metadata.therapist.name = data.therapist_name;
        if (data.therapist_designation !== undefined) metadata.therapist.designation = data.therapist_designation;
      }

      // Client section
      if (data.client_full_name !== undefined || data.client_id_reference !== undefined) {
        metadata.client = {};
        if (data.client_full_name !== undefined) metadata.client.full_name = data.client_full_name;
        if (data.client_id_reference !== undefined) metadata.client.client_id_reference = data.client_id_reference;
      }

      // Report section
      if (data.session_summary !== undefined || data.progress_since_last_session !== undefined || data.risk_screening_note !== undefined || data.risk_screening_flags !== undefined || data.assessments !== undefined) {
        metadata.report = {};
        if (data.session_summary !== undefined) metadata.report.session_summary = data.session_summary;
        if (data.progress_since_last_session !== undefined) metadata.report.progress_since_last_session = data.progress_since_last_session;

        // Risk screening nested in report
        if (data.risk_screening_note !== undefined || data.risk_screening_flags !== undefined) {
          metadata.report.risk_screening = {};
          if (data.risk_screening_note !== undefined) metadata.report.risk_screening.note = data.risk_screening_note;
          if (data.risk_screening_flags !== undefined && data.risk_screening_flags !== null) {
            metadata.report.risk_screening.flags = data.risk_screening_flags;
          }
        }

        // Assessments nested in report (transform form_name to tool)
        if (data.assessments !== undefined && data.assessments !== null && Array.isArray(data.assessments)) {
          metadata.report.assessments = data.assessments.map(assessment => ({
            tool: assessment.form_name || assessment.tool || 'Unknown',
            score: assessment.score || 'N/A',
            therapist_notes: assessment.therapist_notes || ''
          }));
        }
      }

      // Sign off section
      if (data.therapist_name !== undefined || data.report_date !== undefined) {
        metadata.sign_off = {};
        if (data.therapist_name !== undefined) metadata.sign_off.approved_by = data.therapist_name;
        // Use the parsed date from meta section if available, otherwise parse it
        if (data.report_date !== undefined) {
          try {
            const dateObj = new Date(data.report_date);
            if (!isNaN(dateObj.getTime())) {
              metadata.sign_off.approved_on = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
            } else {
              metadata.sign_off.approved_on = data.report_date;
            }
          } catch (e) {
            metadata.sign_off.approved_on = data.report_date;
          }
        }
        metadata.sign_off.method = 'Electronic';
      }

      const updateData = {
        updated_at: new Date(),
      };

      // Store all data in metadata JSON field
      if (Object.keys(metadata).length > 0) {
        updateData.metadata = db.raw('?', [JSON.stringify(metadata)]);
      }

      let progressReportId;

      if (existingReport) {
        // Update existing record
        await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('report_progress')
          .where('report_id', data.report_id)
          .update(updateData);

        progressReportId = existingReport.id;
      } else {
        // Insert new record
        const insertData = {
          report_id: data.report_id,
          ...updateData,
          tenant_id: data.tenant_id,
        };

        const postProgressReport = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('report_progress')
          .insert(insertData);

        if (!postProgressReport) {
          logger.error('Error creating progress report');
          return { message: 'Error creating progress report', error: -1 };
        }

        progressReportId = Array.isArray(postProgressReport) ? postProgressReport[0] : postProgressReport;
      }

      return {
        message: existingReport ? 'Progress report updated successfully' : 'Progress report created successfully',
        id: progressReportId,
        report_id: data.report_id,
      };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error creating/updating progress report', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Create discharge report data
   * @param {Object} data - Discharge report data
   * @returns {Promise<Object>} Created discharge report result
   */
  async postDischargeReport(data) {
    try {
      // Check if a discharge report already exists for this report_id
      const existingReport = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('report_discharge')
        .where('report_id', data.report_id)
        .first();

      // If metadata is provided, use it directly (new format)
      // Otherwise, build metadata from flat structure (backward compatibility)
      let metadata = null;

      if (data.metadata && typeof data.metadata === 'object') {
        // New format: metadata is already structured
        metadata = data.metadata;
      } else {
        // Old format: build metadata structure from flat data
        metadata = {};

        // Meta section
        if (data.session_id !== undefined || data.client_id !== undefined || data.discharge_date !== undefined) {
          metadata.meta = {};
          if (data.session_id !== undefined) metadata.meta.session_id = data.session_id;
          if (data.client_id !== undefined) metadata.meta.client_id = typeof data.client_id === 'number' ? data.client_id.toString() : data.client_id;
          // Parse discharge_date to extract just the date (YYYY-MM-DD format)
          if (data.discharge_date !== undefined) {
            try {
              const dateObj = new Date(data.discharge_date);
              if (!isNaN(dateObj.getTime())) {
                metadata.meta.report_date = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
              } else if (typeof data.discharge_date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(data.discharge_date)) {
                metadata.meta.report_date = data.discharge_date.split('T')[0]; // Extract date part
              } else {
                metadata.meta.report_date = data.discharge_date;
              }
            } catch (e) {
              metadata.meta.report_date = data.discharge_date;
            }
          }
        }

        // Client section (if provided)
        if (data.client) {
          metadata.client = data.client;
        }

        // Practice section (if provided)
        if (data.practice) {
          metadata.practice = data.practice;
        }

        // Therapist section (if provided)
        if (data.therapist) {
          metadata.therapist = data.therapist;
        }

        // Report section - contains all the discharge-specific fields
        metadata.report = {};
        if (data.treatment_summary !== undefined) metadata.report.treatment_summary = data.treatment_summary;
        if (data.remaining_concerns !== undefined) metadata.report.remaining_concerns = data.remaining_concerns;
        if (data.recommendations !== undefined) metadata.report.recommendations = data.recommendations;
        if (data.client_understanding !== undefined) metadata.report.client_understanding = data.client_understanding;
        if (data.discharge_reason_flags !== undefined && data.discharge_reason_flags !== null) {
          metadata.report.discharge_reason_flags = data.discharge_reason_flags;
        }
        if (data.discharge_reason_other !== undefined) metadata.report.discharge_reason_other = data.discharge_reason_other;
        
        // Assessments - convert form_name to tool if needed
        if (data.assessments !== undefined && data.assessments !== null && Array.isArray(data.assessments)) {
          metadata.report.assessments = data.assessments.map(assessment => ({
            tool: assessment.tool || assessment.form_name || `Assessment`,
            score: assessment.score || 'N/A',
            therapist_notes: assessment.therapist_notes || '',
          }));
        }

        // Sign-off section (if provided)
        if (data.sign_off) {
          metadata.sign_off = data.sign_off;
        }
      }

      const updateData = {
        updated_at: new Date(),
      };

      // Store all data in metadata JSON field
      if (metadata && Object.keys(metadata).length > 0) {
        updateData.metadata = db.raw('?', [JSON.stringify(metadata)]);
      }

      let dischargeReportId;

      if (existingReport) {
        // Update existing record
        await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('report_discharge')
          .where('report_id', data.report_id)
          .update(updateData);

        dischargeReportId = existingReport.id;
      } else {
        // Insert new record
        const insertData = {
          report_id: data.report_id,
          ...updateData,
          tenant_id: data.tenant_id,
        };

        const postDischargeReport = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('report_discharge')
          .insert(insertData);

        if (!postDischargeReport) {
          logger.error('Error creating discharge report');
          return { message: 'Error creating discharge report', error: -1 };
        }

        dischargeReportId = Array.isArray(postDischargeReport) ? postDischargeReport[0] : postDischargeReport;
      }

      return {
        message: existingReport ? 'Discharge report updated successfully' : 'Discharge report created successfully',
        id: dischargeReportId,
        report_id: data.report_id,
      };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error creating/updating discharge report', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get intake report data by report_id
   * @param {Number} reportId - Report ID
   * @returns {Promise<Object>} Intake report data
   */
  async getIntakeReportByReportId(reportId) {
    try {
      const intakeReport = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('report_intake')
        .where('report_id', reportId)
        .first();

      return intakeReport || null;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return null;
    }
  }

  //////////////////////////////////////////

  /**
   * Get intake report data for a therapy request
   * @param {Object} data - Query data
   * @param {number} data.thrpy_req_id - Therapy request ID (required)
   * @param {number} data.session_id - Session ID (optional)
   * @returns {Promise<Object>} Intake report data
   */
  async getIntakeReportData(data) {
    try {
      const { thrpy_req_id, session_id } = data;

      if (!thrpy_req_id) {
        return { message: 'thrpy_req_id is required', error: -1 };
      }

      // Get therapy request data first to find the intake report session
      const ThrpyReq = (await import('./thrpyReq.js')).default;
      const thrpyReqModel = new ThrpyReq();
      const recThrpy = await thrpyReqModel.getThrpyReqById({ req_id: thrpy_req_id });

      if (!recThrpy || recThrpy.length === 0 || recThrpy.error) {
        return { message: 'Therapy request not found', error: -1 };
      }

      const therapyRequest = recThrpy[0];

      // Find the intake report session
      let intakeReportSession = null;
      if (session_id) {
        if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
          intakeReportSession = therapyRequest.session_obj.find(
            (s) => s.session_id === session_id && (s.is_report === 1 || s.service_code === 'INTAKE' || s.service_code?.includes('INTAKE'))
          );
        }
      } else {
        if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
          intakeReportSession = therapyRequest.session_obj.find(
            (s) => s.is_report === 1 && (s.service_code === 'INTAKE' || s.service_code?.includes('INTAKE'))
          );
        }
      }

      if (!intakeReportSession) {
        return { message: 'Intake report session not found', error: -1 };
      }

      // Check if a report exists for this session and if it's locked
      let existingReport = null;
      let metadata = null;
      const reportQuery = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('reports as r')
        .where('r.session_id', intakeReportSession.session_id)
        .andWhere('r.report_type', 'INTAKE')
        .first();

      if (reportQuery) {
        existingReport = reportQuery;
        
        // If report is locked, fetch and return only metadata (skip all extra fetching)
        if (existingReport.is_locked === true) {
          const intakeReport = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('report_intake')
            .where('report_id', existingReport.report_id)
            .first();

          if (intakeReport && intakeReport.metadata) {
            metadata = intakeReport.metadata;
            if (typeof metadata === 'string') {
              try {
                metadata = JSON.parse(metadata);
              } catch (e) {
                logger.error('Error parsing metadata:', e);
                return { message: 'Error parsing locked report metadata', error: -1 };
              }
            }

            // Return metadata directly without any extra fetching
            return metadata;
          } else {
            return { message: 'Locked report found but metadata is missing', error: -1 };
          }
        } else {
          // Report exists but is not locked - fetch metadata for merging later
          const intakeReport = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('report_intake')
            .where('report_id', existingReport.report_id)
            .first();

          if (intakeReport && intakeReport.metadata) {
            metadata = intakeReport.metadata;
            if (typeof metadata === 'string') {
              try {
                metadata = JSON.parse(metadata);
              } catch (e) {
                logger.error('Error parsing metadata:', e);
                metadata = null;
              }
            }
          }
        }
      }

      // Get client information - first try from client_intake_form
      // Link through counselor_profile_id to find the intake form
      let clientIntakeForm = null;
      let clientUserInfo = null;

      // Get counselor profile to find intake form
      if (therapyRequest.counselor_id) {
        try {
          const counselorProfileQuery = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('counselor_profile')
            .where('user_profile_id', therapyRequest.counselor_id)
            .first();

          if (counselorProfileQuery) {
            // Try to find client_intake_form by counselor_profile_id and client_enrollment_id
            // First, get client_enrollment_id if client_id exists
            if (therapyRequest.client_id) {
              const clientEnrollmentQuery = await db
                .withSchema(`${process.env.MYSQL_DATABASE}`)
                .from('client_enrollments')
                .where('client_id', therapyRequest.client_id)
                .where('user_id', therapyRequest.counselor_id)
                .orderBy('id', 'desc')
                .first();

              if (clientEnrollmentQuery) {
                clientIntakeForm = await db
                  .withSchema(`${process.env.MYSQL_DATABASE}`)
                  .from('client_intake_form')
                  .where('client_enrollment_id', clientEnrollmentQuery.id)
                  .where('counselor_profile_id', counselorProfileQuery.counselor_profile_id)
                  .first();
              }
            }

            // If not found via enrollment, try to find by counselor_profile_id and client name match
            if (!clientIntakeForm) {
              // Get client info first
              const recUser = await this.common.getUserProfileByUserProfileId(
                therapyRequest.client_id
              );

              if (recUser && recUser.length > 0) {
                clientUserInfo = recUser[0];
                const clientFullName = `${clientUserInfo.user_first_name} ${clientUserInfo.user_last_name}`;

                // Find intake form by counselor_profile_id and full_name match
                clientIntakeForm = await db
                  .withSchema(`${process.env.MYSQL_DATABASE}`)
                  .from('client_intake_form')
                  .where('counselor_profile_id', counselorProfileQuery.counselor_profile_id)
                  .where('full_name', clientFullName)
                  .orderBy('created_at', 'desc')
                  .first();
              }
            }

            // If still not found, try by counselor_profile_id only (most recent)
            if (!clientIntakeForm) {
              clientIntakeForm = await db
                .withSchema(`${process.env.MYSQL_DATABASE}`)
                .from('client_intake_form')
                .where('counselor_profile_id', counselorProfileQuery.counselor_profile_id)
                .orderBy('created_at', 'desc')
                .first();
            }
          }
        } catch (error) {
          logger.error('Error fetching client intake form:', error);
        }
      }

      // Get client information (from user_profile if not from intake form)
      if (!clientUserInfo && therapyRequest.client_id) {
        const recUser = await this.common.getUserProfileByUserProfileId(
          therapyRequest.client_id
        );

        if (!recUser || recUser.length === 0) {
          return { message: 'Client not found', error: -1 };
        }

        clientUserInfo = recUser[0];
      }

      // Get counselor information
      const counselorInfo = await this.common.getUserProfileByUserProfileId(
        therapyRequest.counselor_id
      );

      if (!counselorInfo || counselorInfo.length === 0) {
        return { message: 'Counselor not found', error: -1 };
      }

      // Get counselor designation
      let counselorDesignation = 'Therapist';
      try {
        const counselorProfileQuery = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('counselor_profile')
          .where('user_profile_id', therapyRequest.counselor_id)
          .select('profile_notes')
          .first();
      } catch (error) {
        logger.error('Error fetching counselor designation:', error);
      }

      // Format date for metadata
      const formatDateForMeta = (date) => {
        if (!date) return null;
        try {
          const dateObj = new Date(date);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toISOString().split('T')[0];
          }
        } catch (e) {
          if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
          }
        }
        return null;
      };

      // Map concern_duration enum to frontend format
      const mapDurationToFrontend = (duration) => {
        if (!duration) return null;
        const mapping = {
          'less_than_1_month': 'less_than_1_month',
          'one_to_six_months': '1_6_months',
          'six_to_twelve_months': '6_12_months',
          'over_1_year': 'over_1_year',
        };
        return mapping[duration] || duration;
      };

      // Map self_harm_thoughts enum to frontend format
      const mapSelfHarmToFrontend = (value) => {
        if (!value) return null;
        return value; // Already matches: 'no', 'past', 'current'
      };

      // Map harming_others_thoughts enum to frontend format
      const mapHarmingOthersToFrontend = (value) => {
        if (!value) return null;
        return value; // Already matches: 'no', 'yes'
      };

      // Build response in metadata format, merging intake form data with saved metadata
      const response = {
        // Include report_id if report exists so frontend can use PUT instead of POST
        report_id: existingReport?.report_id || null,
        meta: {
          client_id: clientUserInfo?.clam_num?.toString() || null,
          session_id: intakeReportSession.session_id,
          session_number: intakeReportSession.session_number || null,
          total_sessions_completed: null, // Intake is typically session 0
          report_date: formatDateForMeta(intakeReportSession.intake_date) || null,
        },
        client: {
          full_name: 
            clientIntakeForm?.full_name ||
            (clientUserInfo?.user_first_name && clientUserInfo?.user_last_name 
              ? `${clientUserInfo.user_first_name} ${clientUserInfo.user_last_name}` 
              : null),
          client_id_reference: clientUserInfo?.clam_num?.toString() || null,
        },
        practice: {
          frequency: 'Other', // Default for intake
          practice_name: therapyRequest.service_name || null,
          treatment_block_name: therapyRequest.treatment_target || null,
        },
        therapist: {
          name: 
            (counselorInfo[0].user_first_name && counselorInfo[0].user_last_name
              ? `${counselorInfo[0].user_first_name} ${counselorInfo[0].user_last_name}`
              : null),
          designation: counselorDesignation || 'Therapist',
        },
        report: {
          client_information: {
            full_name: metadata?.report?.client_information?.full_name || clientIntakeForm?.full_name || null,
            phone: metadata?.report?.client_information?.phone || clientIntakeForm?.phone || null,
            email: metadata?.report?.client_information?.email || clientIntakeForm?.email || null,
            emergency_contact: metadata?.report?.client_information?.emergency_contact || 
              (clientIntakeForm?.emergency_contact_name 
                ? `${clientIntakeForm.emergency_contact_name}${clientIntakeForm.emergency_contact_phone ? ` - ${clientIntakeForm.emergency_contact_phone}` : ''}`
                : null),
          },
          presenting_problem: {
            reason: metadata?.report?.presenting_problem?.reason || clientIntakeForm?.reason_for_therapy || null,
            duration: metadata?.report?.presenting_problem?.duration || mapDurationToFrontend(clientIntakeForm?.concern_duration) || null,
          },
          symptoms: {
            ...(metadata?.report?.symptoms || {}),
            // Merge with intake form symptoms if available
            ...(clientIntakeForm?.current_symptoms && typeof clientIntakeForm.current_symptoms === 'object'
              ? clientIntakeForm.current_symptoms
              : {}),
          },
          mental_health_history: {
            previous_therapy: metadata?.report?.mental_health_history?.previous_therapy || null,
            current_medications: metadata?.report?.mental_health_history?.current_medications || null,
            medical_conditions: metadata?.report?.mental_health_history?.medical_conditions || null,
          },
          safety_assessment: {
            thoughts_of_self_harm: metadata?.report?.safety_assessment?.thoughts_of_self_harm || 
              mapSelfHarmToFrontend(clientIntakeForm?.self_harm_thoughts) || null,
            thoughts_of_harming_others: metadata?.report?.safety_assessment?.thoughts_of_harming_others || 
              mapHarmingOthersToFrontend(clientIntakeForm?.harming_others_thoughts) || null,
            immediate_safety_concerns: metadata?.report?.safety_assessment?.immediate_safety_concerns || null,
          },
          clinical_impression: metadata?.report?.clinical_impression || null,
        },
        sign_off: metadata?.sign_off || {
          method: 'Electronic',
          approved_by: counselorInfo[0].user_first_name && counselorInfo[0].user_last_name
            ? `${counselorInfo[0].user_first_name} ${counselorInfo[0].user_last_name}`
            : null,
          approved_on: formatDateForMeta(intakeReportSession.intake_date) || null,
        },
      };

      return response;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error getting intake report data', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment plan report data by report_id
   * @param {Number} reportId - Report ID
   * @returns {Promise<Object>} Treatment plan report data
   */
  async getTreatmentPlanReportByReportId(reportId) {
    try {
      const treatmentPlanReport = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('report_treatment_plan')
        .where('report_id', reportId)
        .first();

      return treatmentPlanReport || null;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return null;
    }
  }

  //////////////////////////////////////////

  /**
   * Get progress report data by report_id
   * @param {Number} reportId - Report ID
   * @returns {Promise<Object>} Progress report data
   */
  async getProgressReportByReportId(reportId) {
    try {
      const progressReport = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('report_progress')
        .where('report_id', reportId)
        .first();

      return progressReport || null;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return null;
    }
  }

  //////////////////////////////////////////

  /**
   * Get discharge report data by report_id
   * @param {Number} reportId - Report ID
   * @returns {Promise<Object>} Discharge report data
   */
  async getDischargeReportByReportId(reportId) {
    try {
      const dischargeReport = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('report_discharge')
        .where('report_id', reportId)
        .first();

      return dischargeReport || null;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return null;
    }
  }

  //////////////////////////////////////////

  /**
   * Get progress report data for a therapy request
   * @param {Object} data - Query data
   * @param {number} data.thrpy_req_id - Therapy request ID (required)
   * @param {number} data.session_id - Session ID (optional)
   * @returns {Promise<Object>} Progress report data
   */
  async getProgressReportData(data) {
    try {
      const { thrpy_req_id, session_id } = data;

      if (!thrpy_req_id) {
        return { message: 'thrpy_req_id is required', error: -1 };
      }

      // Get therapy request data first to find the progress report session
      const ThrpyReq = (await import('./thrpyReq.js')).default;
      const thrpyReqModel = new ThrpyReq();
      const recThrpy = await thrpyReqModel.getThrpyReqById({ req_id: thrpy_req_id });

      if (!recThrpy || recThrpy.length === 0 || recThrpy.error) {
        return { message: 'Therapy request not found', error: -1 };
      }

      const therapyRequest = recThrpy[0];

      // Find the progress report session
      let progressReportSession = null;
      if (session_id) {
        // If session_id is provided, find that specific session
        if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
          progressReportSession = therapyRequest.session_obj.find(
            (s) => s.session_id === session_id && (s.is_report === 1 || s.service_code === 'PR')
          );
        }
      } else {
        // Otherwise, find the first progress report session
        if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
          progressReportSession = therapyRequest.session_obj.find(
            (s) => s.is_report === 1 && (s.service_code === 'PR' || s.service_code?.includes('PR'))
          );
        }
      }

      if (!progressReportSession) {
        return { message: 'Progress report session not found', error: -1 };
      }

      // Check if a report exists for this session and if it's locked
      let existingReport = null;
      let metadata = null;
      const reportQuery = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('reports as r')
        .where('r.session_id', progressReportSession.session_id)
        .andWhere('r.report_type', 'PROGRESS')
        .first();

      if (reportQuery) {
        existingReport = reportQuery;
        
        // If report is locked, fetch and return only metadata (skip all extra fetching)
        if (existingReport.is_locked === true) {
          const progressReport = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('report_progress')
            .where('report_id', existingReport.report_id)
            .first();

          if (progressReport && progressReport.metadata) {
            // Parse metadata if it's a string
            metadata = progressReport.metadata;
            if (typeof metadata === 'string') {
              try {
                metadata = JSON.parse(metadata);
              } catch (e) {
                logger.error('Error parsing metadata:', e);
                return { message: 'Error parsing locked report metadata', error: -1 };
              }
            }

            // Return metadata directly without any extra fetching
            return metadata;
          } else {
            return { message: 'Locked report found but metadata is missing', error: -1 };
          }
        } else {
          // Report exists but is not locked - fetch metadata for merging later
          const progressReport = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('report_progress')
            .where('report_id', existingReport.report_id)
            .first();

          if (progressReport && progressReport.metadata) {
            // Parse metadata if it's a string
            metadata = progressReport.metadata;
            if (typeof metadata === 'string') {
              try {
                metadata = JSON.parse(metadata);
              } catch (e) {
                logger.error('Error parsing metadata:', e);
                metadata = null;
              }
            }
          }
        }
      }

      // Proceed with ongoing process to get base data (only if report is not locked)
      // Get client information
      const recUser = await this.common.getUserProfileByUserProfileId(
        therapyRequest.client_id
      );

      if (!recUser || recUser.length === 0) {
        return { message: 'Client not found', error: -1 };
      }

      // Get tenant information
      const tenantId = therapyRequest.tenant_id;
      let tenantName = 'N/A';
      if (tenantId) {
        const tenantQuery = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('tenant')
          .where('tenant_id', tenantId)
          .select('tenant_name')
          .first();
        
        if (tenantQuery) {
          tenantName = tenantQuery.tenant_name;
        }
      }

      // Get counselor information
      const counselorInfo = await this.common.getUserProfileByUserProfileId(
        therapyRequest.counselor_id
      );

      if (!counselorInfo || counselorInfo.length === 0) {
        return { message: 'Counselor not found', error: -1 };
      }

      // Get counselor designation (if available from counselor_profile)
      let counselorDesignation = 'Therapist';
      try {
        const counselorProfileQuery = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('counselor_profile')
          .where('user_profile_id', therapyRequest.counselor_id)
          .select('profile_notes')
          .first();
        
        // You might need to parse profile_notes or have a separate designation field
        // For now, using default
      } catch (error) {
        logger.error('Error fetching counselor designation:', error);
      }

      // Calculate total sessions and completed sessions (similar to emailTmplt.js logic)
      let totalSessions = 0;
      let totalSessionsCompleted = 0;
      
      if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
        // Sort sessions by session_id
        const sortedSessions = [...therapyRequest.session_obj].sort(
          (a, b) => a.session_id - b.session_id
        );

        // Remove reports sessions and inactive sessions
        const removeReportsSessions = sortedSessions.filter(
          (session) => session.is_report !== 1 && session.session_status !== 'INACTIVE'
        );

        // Filter sessions up to the progress report session (if session_id is provided)
        // Otherwise, count all sessions
        let filteredSessions = removeReportsSessions;
        if (session_id && progressReportSession.session_id) {
          filteredSessions = removeReportsSessions.filter(
            (session) => session.session_id <= progressReportSession.session_id
          );
        }

        // Calculate total sessions (excluding reports and inactive)
        totalSessions = filteredSessions.length;

        // Count completed sessions (status === 'SHOW')
        totalSessionsCompleted = filteredSessions.filter(
          (session) => session.session_status === 'SHOW'
        ).length;
      }

      // Get frequency from service
      const serviceName = therapyRequest.service_name || '';
      const frequency = serviceName.toLowerCase().includes('weekly')
        ? 'Weekly'
        : serviceName.toLowerCase().includes('biweekly')
        ? 'Biweekly'
        : 'Other';

      // Get assessments/feedback from all sessions in the therapy request (excluding report sessions)
      // Get the most recent assessments up to the progress report session
      let assessments = [];
      try {
        // Get all session IDs from the therapy request (excluding report sessions and inactive)
        const sessionIds = therapyRequest.session_obj
          ? therapyRequest.session_obj
              .filter(
                (s) =>
                  s.is_report !== 1 &&
                  s.session_status !== 'INACTIVE' &&
                  (!session_id || s.session_id <= progressReportSession.session_id)
              )
              .map((s) => s.session_id)
          : [];

        if (sessionIds.length > 0) {
          const feedbackQuery = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('feedback as fb')
            .leftJoin('forms as f', 'fb.form_id', 'f.form_id')
            .leftJoin('session as s', 'fb.session_id', 's.session_id')
            .leftJoin('feedback_phq9 as phq9', 'fb.feedback_id', 'phq9.feedback_id')
            .leftJoin('feedback_gad as gad', 'fb.feedback_id', 'gad.feedback_id')
            .leftJoin('feedback_pcl5 as pcl5', 'fb.feedback_id', 'pcl5.feedback_id')
            .leftJoin('feedback_whodas as whodas', 'fb.feedback_id', 'whodas.feedback_id')
            .leftJoin('feedback_gas as gas', db.raw('CAST(fb.feedback_id AS SIGNED)', []), 'gas.feedback_id')
            .whereIn('fb.session_id', sessionIds)
            .andWhere('fb.status_yn', 'y')
            .andWhere('s.is_report', 0) // Exclude report sessions
            .andWhere('f.form_cde', '!=', 'SESSION SUM REPORT') // Exclude attendance forms
            .select(
              'fb.feedback_id',
              'fb.session_id',
              'fb.form_id',
              'f.form_cde',
              'phq9.total_score as phq9_score',
              'gad.total_points as gad_score',
              'pcl5.total_score as pcl5_score',
              'whodas.overallScore as whodas_score',
              'gas.total_score as gas_score',
              'fb.created_at'
            )
            .orderBy('fb.created_at', 'desc')
            .limit(5);

          assessments = feedbackQuery.map((fb) => {
            let score = 'N/A';
            if (fb.phq9_score !== null && fb.phq9_score !== undefined) {
              score = fb.phq9_score.toString();
            } else if (fb.gad_score !== null && fb.gad_score !== undefined) {
              score = fb.gad_score.toString();
            } else if (fb.pcl5_score !== null && fb.pcl5_score !== undefined) {
              score = fb.pcl5_score.toString();
            } else if (fb.whodas_score !== null && fb.whodas_score !== undefined) {
              score = fb.whodas_score.toString();
            } else if (fb.gas_score !== null && fb.gas_score !== undefined) {
              score = fb.gas_score.toString();
            }

            return {
              feedback_id: fb.feedback_id,
              form_id: fb.form_id,
              form_cde: fb.form_cde,
              score: score,
            };
          });
        }
      } catch (error) {
        logger.error('Error fetching assessments:', error);
        assessments = [];
      }

      // Format date for metadata
      const formatDateForMeta = (date) => {
        if (!date) return null;
        try {
          const dateObj = new Date(date);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
          }
        } catch (e) {
          // If date is already in YYYY-MM-DD format, return as is
          if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
          }
        }
        return null;
      };

      // Build response in metadata format, merging original data with saved metadata
      const response = {
        meta: {
          client_id: recUser[0].clam_num?.toString() || null,
          session_id: progressReportSession.session_id, // Always use actual session_id
          report_date:formatDateForMeta(progressReportSession.intake_date) || null,
          session_number: progressReportSession.session_number || null,
          total_sessions_completed:  totalSessionsCompleted || null,
        },
        client: {
          full_name: 
            (recUser[0].user_first_name && recUser[0].user_last_name 
              ? `${recUser[0].user_first_name} ${recUser[0].user_last_name}` 
              : null),
          client_id_reference: recUser[0].clam_num?.toString() || null,
        },
        practice: {
          frequency:  frequency || 'Other',
          practice_name:  therapyRequest.service_name  || null,
          treatment_block_name: therapyRequest.treatment_target || null,
        },
        therapist: {
          name: 
            (counselorInfo[0].user_first_name && counselorInfo[0].user_last_name
              ? `${counselorInfo[0].user_first_name} ${counselorInfo[0].user_last_name}`
              : null),
          designation: counselorDesignation || 'Therapist',
        },
        report: {
          // Assessments - merge metadata assessments with fetched assessments
          assessments: (() => {
            // Start with fetched assessments from feedback (these are the actual assessment results)
            const mergedAssessments = assessments.map(assessment => ({
              tool: assessment.form_cde,
              score: assessment.score,
              therapist_notes: '',
            }));

            // If metadata has assessments, merge therapist_notes by matching tool
            if (metadata?.report?.assessments && Array.isArray(metadata.report.assessments)) {
              metadata.report.assessments.forEach((metaAssessment) => {
                // Try to match by tool name (case-insensitive for better matching)
                const toolToMatch = metaAssessment.tool || metaAssessment.form_name;
                const matchingIndex = mergedAssessments.findIndex(
                  (a) => {
                    const aTool = (a.tool || '').toLowerCase().trim();
                    const metaTool = (toolToMatch || '').toLowerCase().trim();
                    return aTool === metaTool || aTool === toolToMatch || a.tool === toolToMatch;
                  }
                );
                
                if (matchingIndex >= 0) {
                  // Update existing assessment with therapist notes from metadata
                  // Keep the fetched score (actual assessment result) but add therapist notes
                  mergedAssessments[matchingIndex].therapist_notes = metaAssessment.therapist_notes || '';
                } else if (toolToMatch) {
                  // Add new assessment from metadata if it doesn't exist in fetched assessments
                  // This handles cases where therapist added notes for assessments not in feedback
                  mergedAssessments.push({
                    tool: toolToMatch,
                    score: metaAssessment.score || 'N/A',
                    therapist_notes: metaAssessment.therapist_notes || '',
                  });
                }
              });
            }

            return mergedAssessments;
          })(),
          // Risk screening - use metadata if available, otherwise provide defaults
          risk_screening: metadata?.report?.risk_screening || {
            note: null,
            flags: {
              no_risk: false,
              suicidal_ideation: false,
              self_harm: false,
              substance_concerns: false,
            },
          },
          // Session summary and progress - use metadata if available
          session_summary: metadata?.report?.session_summary || null,
          progress_since_last_session: metadata?.report?.progress_since_last_session || null,
        },
        sign_off: metadata?.sign_off || {
          method: 'Electronic',
          approved_by: counselorInfo[0].user_first_name && counselorInfo[0].user_last_name
            ? `${counselorInfo[0].user_first_name} ${counselorInfo[0].user_last_name}`
            : null,
          approved_on: formatDateForMeta(progressReportSession.intake_date) || null,
        },
      };

      return response;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error getting progress report data', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get discharge report data for a therapy request
   * @param {Object} data - Query data
   * @param {number} data.thrpy_req_id - Therapy request ID (required)
   * @param {number} data.session_id - Session ID (optional)
   * @returns {Promise<Object>} Discharge report data
   */
  async getDischargeReportData(data) {
    try {
      const { thrpy_req_id, session_id } = data;

      if (!thrpy_req_id) {
        return { message: 'thrpy_req_id is required', error: -1 };
      }

      // Get therapy request data first to find the discharge report session
      const ThrpyReq = (await import('./thrpyReq.js')).default;
      const thrpyReqModel = new ThrpyReq();
      const recThrpy = await thrpyReqModel.getThrpyReqById({ req_id: thrpy_req_id });

      if (!recThrpy || recThrpy.length === 0 || recThrpy.error) {
        return { message: 'Therapy request not found', error: -1 };
      }

      const therapyRequest = recThrpy[0];

      // Find the discharge report session
      let dischargeReportSession = null;
      if (session_id) {
        if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
          dischargeReportSession = therapyRequest.session_obj.find(
            (s) => s.session_id === session_id && (s.is_report === 1 || s.service_code === 'DR' || s.service_code?.includes('DR'))
          );
        }
      } else {
        if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
          dischargeReportSession = therapyRequest.session_obj.find(
            (s) => s.is_report === 1 && (s.service_code === 'DR' || s.service_code?.includes('DR'))
          );
        }
      }

      if (!dischargeReportSession) {
        return { message: 'Discharge report session not found', error: -1 };
      }

      // Check if a report exists for this session and if it's locked
      let existingReport = null;
      let metadata = null;
      const reportQuery = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('reports as r')
        .where('r.session_id', dischargeReportSession.session_id)
        .andWhere('r.report_type', 'DISCHARGE')
        .first();

      if (reportQuery) {
        existingReport = reportQuery;
        
        // If report is locked, fetch and return only metadata (skip all extra fetching)
        if (existingReport.is_locked === true) {
          const dischargeReport = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('report_discharge')
            .where('report_id', existingReport.report_id)
            .first();

          if (dischargeReport && dischargeReport.metadata) {
            metadata = dischargeReport.metadata;
            if (typeof metadata === 'string') {
              try {
                metadata = JSON.parse(metadata);
              } catch (e) {
                logger.error('Error parsing metadata:', e);
                return { message: 'Error parsing locked report metadata', error: -1 };
              }
            }

            // Return metadata directly without any extra fetching
            return metadata;
          } else {
            return { message: 'Locked report found but metadata is missing', error: -1 };
          }
        } else {
          // Report exists but is not locked - fetch metadata for merging later
          const dischargeReport = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('report_discharge')
            .where('report_id', existingReport.report_id)
            .first();

          if (dischargeReport && dischargeReport.metadata) {
            metadata = dischargeReport.metadata;
            if (typeof metadata === 'string') {
              try {
                metadata = JSON.parse(metadata);
              } catch (e) {
                logger.error('Error parsing metadata:', e);
                metadata = null;
              }
            }
          }
        }
      }

      // Proceed with ongoing process to get base data (only if report is not locked)
      // Get client information
      const recUser = await this.common.getUserProfileByUserProfileId(
        therapyRequest.client_id
      );

      if (!recUser || recUser.length === 0) {
        return { message: 'Client not found', error: -1 };
      }

      // Get counselor information
      const counselorInfo = await this.common.getUserProfileByUserProfileId(
        therapyRequest.counselor_id
      );

      if (!counselorInfo || counselorInfo.length === 0) {
        return { message: 'Counselor not found', error: -1 };
      }

      // Get counselor designation
      let counselorDesignation = 'Therapist';
      try {
        const counselorProfileQuery = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('counselor_profile')
          .where('user_profile_id', therapyRequest.counselor_id)
          .select('profile_notes')
          .first();
      } catch (error) {
        logger.error('Error fetching counselor designation:', error);
      }

      // Calculate total sessions and completed sessions
      let totalSessions = 0;
      let totalSessionsCompleted = 0;
      
      if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
        const sortedSessions = [...therapyRequest.session_obj].sort(
          (a, b) => a.session_id - b.session_id
        );

        const removeReportsSessions = sortedSessions.filter(
          (session) => session.is_report !== 1 && session.session_status !== 'INACTIVE'
        );

        let filteredSessions = removeReportsSessions;
        if (session_id && dischargeReportSession.session_id) {
          filteredSessions = removeReportsSessions.filter(
            (session) => session.session_id <= dischargeReportSession.session_id
          );
        }

        totalSessions = filteredSessions.length;
        totalSessionsCompleted = filteredSessions.filter(
          (session) => session.session_status === 'SHOW'
        ).length;
      }

      // Get frequency from service
      const serviceName = therapyRequest.service_name || '';
      const frequency = serviceName.toLowerCase().includes('weekly')
        ? 'Weekly'
        : serviceName.toLowerCase().includes('biweekly')
        ? 'Biweekly'
        : 'Other';

      // Get assessments/feedback
      let assessments = [];
      try {
        const sessionIds = therapyRequest.session_obj
          ? therapyRequest.session_obj
              .filter(
                (s) =>
                  s.is_report !== 1 &&
                  s.session_status !== 'INACTIVE' &&
                  (!session_id || s.session_id <= dischargeReportSession.session_id)
              )
              .map((s) => s.session_id)
          : [];

        if (sessionIds.length > 0) {
          const feedbackQuery = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('feedback as fb')
            .leftJoin('forms as f', 'fb.form_id', 'f.form_id')
            .leftJoin('session as s', 'fb.session_id', 's.session_id')
            .leftJoin('feedback_phq9 as phq9', 'fb.feedback_id', 'phq9.feedback_id')
            .leftJoin('feedback_gad as gad', 'fb.feedback_id', 'gad.feedback_id')
            .leftJoin('feedback_pcl5 as pcl5', 'fb.feedback_id', 'pcl5.feedback_id')
            .leftJoin('feedback_whodas as whodas', 'fb.feedback_id', 'whodas.feedback_id')
            .leftJoin('feedback_gas as gas', db.raw('CAST(fb.feedback_id AS SIGNED)', []), 'gas.feedback_id')
            .whereIn('fb.session_id', sessionIds)
            .andWhere('fb.status_yn', 'y')
            .andWhere('s.is_report', 0)
            .andWhere('f.form_cde', '!=', 'SESSION SUM REPORT')
            .select(
              'fb.feedback_id',
              'fb.session_id',
              'fb.form_id',
              'f.form_cde',
              'phq9.total_score as phq9_score',
              'gad.total_points as gad_score',
              'pcl5.total_score as pcl5_score',
              'whodas.overallScore as whodas_score',
              'gas.total_score as gas_score',
              'fb.created_at'
            )
            .orderBy('fb.created_at', 'desc')
            .limit(5);

          assessments = feedbackQuery.map((fb) => {
            let score = 'N/A';
            if (fb.phq9_score !== null && fb.phq9_score !== undefined) {
              score = fb.phq9_score.toString();
            } else if (fb.gad_score !== null && fb.gad_score !== undefined) {
              score = fb.gad_score.toString();
            } else if (fb.pcl5_score !== null && fb.pcl5_score !== undefined) {
              score = fb.pcl5_score.toString();
            } else if (fb.whodas_score !== null && fb.whodas_score !== undefined) {
              score = fb.whodas_score.toString();
            } else if (fb.gas_score !== null && fb.gas_score !== undefined) {
              score = fb.gas_score.toString();
            }

            return {
              feedback_id: fb.feedback_id,
              form_id: fb.form_id,
              form_cde: fb.form_cde,
              score: score,
            };
          });
        }
      } catch (error) {
        logger.error('Error fetching assessments:', error);
        assessments = [];
      }

      // Format date for metadata
      const formatDateForMeta = (date) => {
        if (!date) return null;
        try {
          const dateObj = new Date(date);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toISOString().split('T')[0];
          }
        } catch (e) {
          if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return date;
          }
        }
        return null;
      };

      // Build response in metadata format, merging original data with saved metadata
      const response = {
        meta: {
          client_id: recUser[0].clam_num?.toString() || null,
          session_id: dischargeReportSession.session_id,
          session_number: dischargeReportSession.session_number || null,
          total_sessions_completed: totalSessionsCompleted || null,
          report_date: formatDateForMeta(dischargeReportSession.intake_date) || null,
        },
        client: {
          full_name: 
            (recUser[0].user_first_name && recUser[0].user_last_name 
              ? `${recUser[0].user_first_name} ${recUser[0].user_last_name}` 
              : null),
          client_id_reference: recUser[0].clam_num?.toString() || null,
        },
        practice: {
          frequency: frequency || 'Other',
          practice_name: therapyRequest.service_name || null,
          treatment_block_name: therapyRequest.treatment_target || null,
        },
        therapist: {
          name: 
            (counselorInfo[0].user_first_name && counselorInfo[0].user_last_name
              ? `${counselorInfo[0].user_first_name} ${counselorInfo[0].user_last_name}`
              : null),
          designation: counselorDesignation || 'Therapist',
        },
        report: {
          assessments: (() => {
            const mergedAssessments = assessments.map(assessment => ({
              tool: assessment.form_cde,
              score: assessment.score,
              therapist_notes: '',
            }));

            if (metadata?.report?.assessments && Array.isArray(metadata.report.assessments)) {
              metadata.report.assessments.forEach((metaAssessment) => {
                const toolToMatch = metaAssessment.tool || metaAssessment.form_name;
                const matchingIndex = mergedAssessments.findIndex(
                  (a) => {
                    const aTool = (a.tool || '').toLowerCase().trim();
                    const metaTool = (toolToMatch || '').toLowerCase().trim();
                    return aTool === metaTool || aTool === toolToMatch || a.tool === toolToMatch;
                  }
                );
                
                if (matchingIndex >= 0) {
                  mergedAssessments[matchingIndex].therapist_notes = metaAssessment.therapist_notes || '';
                } else if (toolToMatch) {
                  mergedAssessments.push({
                    tool: toolToMatch,
                    score: metaAssessment.score || 'N/A',
                    therapist_notes: metaAssessment.therapist_notes || '',
                  });
                }
              });
            }

            return mergedAssessments;
          })(),
          treatment_summary: metadata?.report?.treatment_summary || null,
          remaining_concerns: metadata?.report?.remaining_concerns || null,
          recommendations: metadata?.report?.recommendations || null,
          client_understanding: metadata?.report?.client_understanding || null,
          discharge_reason_flags: metadata?.report?.discharge_reason_flags || {
            goals_met: false,
            client_withdrew: false,
            referral_made: false,
            other: false,
          },
          discharge_reason_other: metadata?.report?.discharge_reason_other || null,
        },
        sign_off: metadata?.sign_off || {
          method: 'Electronic',
          approved_by: counselorInfo[0].user_first_name && counselorInfo[0].user_last_name
            ? `${counselorInfo[0].user_first_name} ${counselorInfo[0].user_last_name}`
            : null,
          approved_on: formatDateForMeta(dischargeReportSession.intake_date) || null,
        },
      };

      return response;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error getting discharge report data', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Get treatment plan report data for a therapy request
   * @param {Object} data - Query data
   * @param {number} data.thrpy_req_id - Therapy request ID (required)
   * @param {number} data.session_id - Session ID (optional)
   * @returns {Promise<Object>} Treatment plan report data
   */
  async getTreatmentPlanReportData(data) {
    try {
      const { thrpy_req_id, session_id } = data;

      if (!thrpy_req_id) {
        return { message: 'thrpy_req_id is required', error: -1 };
      }

      // Get therapy request data first to find the treatment plan report session
      const ThrpyReq = (await import('./thrpyReq.js')).default;
      const thrpyReqModel = new ThrpyReq();
      const recThrpy = await thrpyReqModel.getThrpyReqById({ req_id: thrpy_req_id });

      if (!recThrpy || recThrpy.length === 0 || recThrpy.error) {
        return { message: 'Therapy request not found', error: -1 };
      }

      const therapyRequest = recThrpy[0];

      // Find the treatment plan report session
      let treatmentPlanReportSession = null;
      if (session_id) {
        // If session_id is provided, find that specific session
        if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
          treatmentPlanReportSession = therapyRequest.session_obj.find(
            (s) => s.session_id === session_id && (s.is_report === 1 || s.service_code === 'TP' || s.service_code?.includes('TREATMENT_PLAN'))
          );
        }
      } else {
        // Otherwise, find the first treatment plan report session
        if (therapyRequest.session_obj && Array.isArray(therapyRequest.session_obj)) {
          treatmentPlanReportSession = therapyRequest.session_obj.find(
            (s) => s.is_report === 1 && (s.service_code === 'TP' || s.service_code?.includes('TREATMENT_PLAN'))
          );
        }
      }

      if (!treatmentPlanReportSession) {
        return { message: 'Treatment plan report session not found', error: -1 };
      }

      // Check if a report exists for this session
      let existingReport = null;
      let metadata = null;
      const reportQuery = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('reports as r')
        .where('r.session_id', treatmentPlanReportSession.session_id)
        .andWhere('r.report_type', 'TREATMENT_PLAN')
        .first();

      if (reportQuery) {
        existingReport = reportQuery;
        
        // If report is locked, fetch and return only metadata (skip all extra fetching)
        if (existingReport.is_locked === true) {
          const treatmentPlanReport = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('report_treatment_plan')
            .where('report_id', existingReport.report_id)
            .first();

          if (treatmentPlanReport && treatmentPlanReport.metadata) {
            // Parse metadata if it's a string
            metadata = treatmentPlanReport.metadata;
            if (typeof metadata === 'string') {
              try {
                metadata = JSON.parse(metadata);
              } catch (e) {
                logger.error('Error parsing metadata:', e);
                return { message: 'Error parsing locked report metadata', error: -1 };
              }
            }

            // Return metadata directly without any extra fetching
            return metadata;
          } else {
            return { message: 'Locked report found but metadata is missing', error: -1 };
          }
        } else {
          // Report exists but is not locked - fetch metadata for merging later
          const treatmentPlanReport = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('report_treatment_plan')
            .where('report_id', existingReport.report_id)
            .first();

          if (treatmentPlanReport && treatmentPlanReport.metadata) {
            // Parse metadata if it's a string
            metadata = treatmentPlanReport.metadata;
            if (typeof metadata === 'string') {
              try {
                metadata = JSON.parse(metadata);
              } catch (e) {
                logger.error('Error parsing metadata:', e);
                metadata = null;
              }
            }
          }
        }
      }

      // Get client information
      const recUser = await this.common.getUserProfileByUserProfileId(
        therapyRequest.client_id
      );

      if (!recUser || recUser.length === 0) {
        return { message: 'Client not found', error: -1 };
      }

      // Get counselor information
      const counselorInfo = await this.common.getUserProfileByUserProfileId(
        therapyRequest.counselor_id
      );

      if (!counselorInfo || counselorInfo.length === 0) {
        return { message: 'Counselor not found', error: -1 };
      }

      // Format date for metadata
      const formatDateForMeta = (date) => {
        if (!date) return null;
        try {
          const dateObj = new Date(date);
          if (!isNaN(dateObj.getTime())) {
            return dateObj.toISOString();
          }
        } catch (e) {
          // If date is already in ISO format, return as is
          if (typeof date === 'string') {
            return date;
          }
        }
        return null;
      };

      // Get client name
      const clientFullName = 
        (recUser[0].user_first_name && recUser[0].user_last_name 
          ? `${recUser[0].user_first_name} ${recUser[0].user_last_name}` 
          : null);

      // Get therapist name
      const therapistName = 
        (counselorInfo[0].user_first_name && counselorInfo[0].user_last_name
          ? `${counselorInfo[0].user_first_name} ${counselorInfo[0].user_last_name}`
          : null);

      // Use intake date or current date for treatment plan date
      const treatmentPlanDate = formatDateForMeta(
        treatmentPlanReportSession.intake_date || therapyRequest.req_dte_not_formatted || new Date()
      );

      // Fetch latest smart goal from feedback_smart_goal related to this therapy request
      let latestSmartGoalWording = null;
      try {
        // Use innerJoin since we need the feedback and session to exist
        const smartGoalQuery = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('feedback_smart_goal as fsg')
          .innerJoin('feedback as fb', 'fsg.feedback_id', 'fb.feedback_id')
          .innerJoin('session as s', 'fb.session_id', 's.session_id')
          .where('s.thrpy_req_id', thrpy_req_id)
          .andWhere('fb.status_yn', 'y')
          .andWhere('fb.form_id', 16) // Smart goal form_id
          .whereNotNull('fsg.goal_wording')
          .select('fsg.goal_wording', 'fsg.created_at', 'fsg.updated_at', 'fb.session_id', 's.thrpy_req_id')
          .orderBy('fsg.created_at', 'desc')
          .orderBy('fsg.updated_at', 'desc')
          .first();

        console.log('Smart goal query result:', smartGoalQuery);

        if (smartGoalQuery && smartGoalQuery.goal_wording) {
          latestSmartGoalWording = smartGoalQuery.goal_wording;
        } else {
          // Debug: check if there are any smart goals without the filters
          const debugQuery = await db
            .withSchema(`${process.env.MYSQL_DATABASE}`)
            .from('feedback_smart_goal as fsg')
            .innerJoin('feedback as fb', 'fsg.feedback_id', 'fb.feedback_id')
            .innerJoin('session as s', 'fb.session_id', 's.session_id')
            .where('s.thrpy_req_id', thrpy_req_id)
            .select('fsg.id', 'fsg.feedback_id', 'fsg.goal_wording', 'fb.session_id', 'fb.form_id', 'fb.status_yn', 's.thrpy_req_id')
            .limit(5);
          
          console.log('Debug query (all smart goals for thrpy_req_id):', debugQuery);
        }
      } catch (error) {
        console.error('Error fetching smart goal:', error);
        logger.error('Error fetching smart goal:', error);
        // Continue with default value if error occurs
      }

      // Build response in metadata format, merging saved metadata with prefilled defaults
      const response = {
        report_id: existingReport ? existingReport.report_id : null,
        client_information: {
          client_name: metadata?.client_information?.client_name || clientFullName || 'N/A',
          treatment_plan_date: metadata?.client_information?.treatment_plan_date || treatmentPlanDate || new Date().toISOString(),
        },
        report: {
          clinical_assessment: {
            clinical_impressions: metadata?.report?.clinical_assessment?.clinical_impressions || '',
          },
          treatment_goals: {
            long_term: metadata?.report?.treatment_goals?.long_term || latestSmartGoalWording || 'No Smart-goal data found',
            short_term: metadata?.report?.treatment_goals?.short_term || '',
          },
          planned_interventions: {
            therapeutic_approaches: metadata?.report?.planned_interventions?.therapeutic_approaches || '',
            session_frequency: metadata?.report?.planned_interventions?.session_frequency || '',
          },
          progress_measurement: {
            how_measured: metadata?.report?.progress_measurement?.how_measured || '',
          },
          review_updates: {
            review_date: metadata?.report?.review_updates?.review_date || '',
            updates: metadata?.report?.review_updates?.updates || '',
          },
        },
        therapist_acknowledgment: metadata?.therapist_acknowledgment || {
          therapist_name: therapistName || 'N/A',
          signature: '',
          date: new Date().toISOString(),
        },
      };

      console.log('latestSmartGoalWording ❤️❤️❤️', latestSmartGoalWording, thrpy_req_id);

      return response;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error getting treatment plan report data', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Update treatment plan report data by report_id
   * @param {Object} data - Treatment plan report data
   * @returns {Promise<Object>} Updated treatment plan report result
   */
  async putTreatmentPlanReportByReportId(data) {
    try {
      // Check if a treatment plan report already exists for this report_id
      const existingReport = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('report_treatment_plan')
        .where('report_id', data.report_id)
        .first();

      // Prepare metadata - if provided, use it directly
      let metadata = null;
      if (data.metadata && typeof data.metadata === 'object') {
        metadata = data.metadata;
      }

      const updateData = {
        updated_at: new Date(),
      };

      // Store metadata in JSON field if provided
      if (metadata && Object.keys(metadata).length > 0) {
        updateData.metadata = db.raw('?', [JSON.stringify(metadata)]);
      }

      let treatmentPlanReportId;

      if (existingReport) {
        // Update existing record
        await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('report_treatment_plan')
          .where('report_id', data.report_id)
          .update(updateData);

        treatmentPlanReportId = existingReport.id;
      } else {
        // Insert new record
        const insertData = {
          report_id: data.report_id,
          ...updateData,
          tenant_id: data.tenant_id || null,
        };

        const postTreatmentPlanReport = await db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('report_treatment_plan')
          .insert(insertData);

        if (!postTreatmentPlanReport) {
          logger.error('Error creating treatment plan report');
          return { message: 'Error creating treatment plan report', error: -1 };
        }

        treatmentPlanReportId = Array.isArray(postTreatmentPlanReport) 
          ? postTreatmentPlanReport[0] 
          : postTreatmentPlanReport;
      }

      return {
        message: existingReport 
          ? 'Treatment plan report updated successfully' 
          : 'Treatment plan report created successfully',
        id: treatmentPlanReportId,
        report_id: data.report_id,
      };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error creating/updating treatment plan report', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Generate PDF for a report by report_id
   * @param {Object} data - Query data
   * @param {number} data.report_id - Report ID
   * @returns {Promise<Object>} PDF buffer or error
   */
  async generateReportPDF(data) {
    try {
      const { report_id } = data;

      if (!report_id) {
        return { message: 'report_id is required', error: -1 };
      }

      // Get the report to determine report type
      const report = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('reports')
        .where('report_id', report_id)
        .first();

      if (!report) {
        return { message: 'Report not found', error: -1 };
      }

      const { report_type, session_id } = report;

      // Get thrpy_req_id from session
      const session = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .where('session_id', session_id)
        .first();

      if (!session) {
        return { message: 'Session not found', error: -1 };
      }

      const thrpy_req_id = session.thrpy_req_id;

      if (!thrpy_req_id) {
        return { message: 'Therapy request ID not found for this session', error: -1 };
      }

      // Import PDF templates
      const { ProgressReportPDF, DischargeReportPDF, IntakeReportPDF, TreatmentPlanReportPDF } = await import('../utils/reportPdfTemplates.js');
      const PDFGenerator = (await import('../middlewares/pdf.js')).default;

      let pdfData = null;
      let pdfBuffer = null;

      switch (report_type) {
        case 'PROGRESS':
          // Get progress report data
          const progressData = await this.getProgressReportData({
            thrpy_req_id,
            session_id,
          });

          if (progressData.error) {
            return progressData;
          }

          // Transform the data structure for PDF template
          pdfData = {
            practice_name: progressData.practice?.practice_name || 'N/A',
            therapist_name: progressData.therapist?.name || 'N/A',
            therapist_designation: progressData.therapist?.designation || 'Therapist',
            report_date: progressData.meta?.report_date || progressData.sign_off?.approved_on || 'N/A',
            treatment_block_name: progressData.practice?.treatment_block_name || 'N/A',
            client_full_name: progressData.client?.full_name || 'N/A',
            client_id: progressData.client?.client_id_reference || progressData.meta?.client_id || 'N/A',
            session_number: progressData.meta?.session_number || 'N/A',
            total_sessions_completed: progressData.meta?.total_sessions_completed || 'N/A',
            session_summary: progressData.report?.session_summary || '',
            progress_since_last_session: progressData.report?.progress_since_last_session || '',
            risk_screening: progressData.report?.risk_screening || {},
            assessments: progressData.report?.assessments || [],
            frequency: progressData.practice?.frequency || 'Other',
          };

          // Generate PDF with appropriate filename
          const pdfFilename = `progress_report_${report_id}_${Date.now()}.pdf`;
          pdfBuffer = await PDFGenerator(ProgressReportPDF(pdfData), pdfFilename);
          break;

        case 'INTAKE':
          // Get intake report data
          const intakeData = await this.getIntakeReportData({
            thrpy_req_id,
            session_id,
          });

          if (intakeData.error) {
            return intakeData;
          }

          // Transform the data structure for PDF template
          pdfData = {
            practice_name: intakeData.practice?.practice_name || 'N/A',
            therapist_name: intakeData.therapist?.name || 'N/A',
            therapist_designation: intakeData.therapist?.designation || 'Therapist',
            report_date: intakeData.meta?.report_date || intakeData.sign_off?.approved_on || 'N/A',
            treatment_block_name: intakeData.practice?.treatment_block_name || 'N/A',
            client_full_name: intakeData.client?.full_name || 'N/A',
            client_id: intakeData.client?.client_id_reference || intakeData.meta?.client_id || 'N/A',
            client_information: intakeData.report?.client_information || {},
            presenting_problem: intakeData.report?.presenting_problem || {},
            symptoms: intakeData.report?.symptoms || {},
            mental_health_history: intakeData.report?.mental_health_history || {},
            safety_assessment: intakeData.report?.safety_assessment || {},
            clinical_impression: intakeData.report?.clinical_impression || '',
          };

          // Generate PDF with appropriate filename
          const intakePdfFilename = `intake_report_${report_id}_${Date.now()}.pdf`;
          pdfBuffer = await PDFGenerator(IntakeReportPDF(pdfData), intakePdfFilename);
          break;

        case 'TREATMENT_PLAN':
          // Get treatment plan report data from report_treatment_plan table
          const treatmentPlanReport = await this.getTreatmentPlanReportByReportId(report_id);

          if (!treatmentPlanReport) {
            return { message: 'Treatment plan report data not found', error: -1 };
          }

          // Parse metadata if it's a string
          let treatmentPlanMetadata = treatmentPlanReport.metadata;
          if (typeof treatmentPlanMetadata === 'string') {
            try {
              treatmentPlanMetadata = JSON.parse(treatmentPlanMetadata);
            } catch (e) {
              logger.error('Error parsing treatment plan metadata:', e);
              return { message: 'Error parsing treatment plan metadata', error: -1 };
            }
          }

          // Transform the data structure for PDF template
          pdfData = {
            client_name: treatmentPlanMetadata?.client_information?.client_name || 'N/A',
            treatment_plan_date: treatmentPlanMetadata?.client_information?.treatment_plan_date || 'N/A',
            clinical_impressions: treatmentPlanMetadata?.report?.clinical_assessment?.clinical_impressions || '',
            long_term_goals: treatmentPlanMetadata?.report?.treatment_goals?.long_term || '',
            short_term_goals: treatmentPlanMetadata?.report?.treatment_goals?.short_term || '',
            therapeutic_approaches: treatmentPlanMetadata?.report?.planned_interventions?.therapeutic_approaches || '',
            session_frequency: treatmentPlanMetadata?.report?.planned_interventions?.session_frequency || '',
            how_measured: treatmentPlanMetadata?.report?.progress_measurement?.how_measured || '',
            review_date: treatmentPlanMetadata?.report?.review_updates?.review_date || '',
            updates: treatmentPlanMetadata?.report?.review_updates?.updates || '',
            therapist_name: treatmentPlanMetadata?.therapist_acknowledgment?.therapist_name || 'N/A',
            therapist_signature: treatmentPlanMetadata?.therapist_acknowledgment?.signature || '',
            signature_date: treatmentPlanMetadata?.therapist_acknowledgment?.date || 'N/A',
          };

          // Generate PDF with appropriate filename
          const treatmentPlanPdfFilename = `treatment_plan_report_${report_id}_${Date.now()}.pdf`;
          pdfBuffer = await PDFGenerator(TreatmentPlanReportPDF(pdfData), treatmentPlanPdfFilename);
          break;

        case 'DISCHARGE':
          // Get discharge report data
          const dischargeData = await this.getDischargeReportData({
            thrpy_req_id,
            session_id,
          });

          if (dischargeData.error) {
            return dischargeData;
          }

          // Transform the data structure for PDF template
          pdfData = {
            practice_name: dischargeData.practice?.practice_name || 'N/A',
            therapist_name: dischargeData.therapist?.name || 'N/A',
            therapist_designation: dischargeData.therapist?.designation || 'Therapist',
            report_date: dischargeData.meta?.report_date || dischargeData.sign_off?.approved_on || 'N/A',
            treatment_block_name: dischargeData.practice?.treatment_block_name || 'N/A',
            client_full_name: dischargeData.client?.full_name || 'N/A',
            client_id: dischargeData.client?.client_id_reference || dischargeData.meta?.client_id || 'N/A',
            discharge_date: dischargeData.meta?.report_date || 'N/A',
            total_sessions_completed: dischargeData.meta?.total_sessions_completed || 'N/A',
            discharge_reason_flags: dischargeData.report?.discharge_reason_flags || {},
            discharge_reason_other: dischargeData.report?.discharge_reason_other || '',
            treatment_summary: dischargeData.report?.treatment_summary || '',
            assessments: dischargeData.report?.assessments || [],
            remaining_concerns: dischargeData.report?.remaining_concerns || '',
            recommendations: dischargeData.report?.recommendations || '',
            client_understanding: dischargeData.report?.client_understanding || '',
          };

          // Generate PDF with appropriate filename
          const dischargePdfFilename = `discharge_report_${report_id}_${Date.now()}.pdf`;
          pdfBuffer = await PDFGenerator(DischargeReportPDF(pdfData), dischargePdfFilename);
          break;

        default:
          return { message: `Unknown report type: ${report_type}`, error: -1 };
      }

      return {
        message: 'PDF generated successfully',
        buffer: pdfBuffer,
        filename: `${report_type.toLowerCase()}_report_${report_id}.pdf`,
        contentType: 'application/pdf',
      };
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error generating report PDF', error: -1 };
    }
  }
}

