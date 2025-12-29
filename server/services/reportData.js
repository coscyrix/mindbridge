import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import ReportData from '../models/reportData.js';
import Common from '../models/common.js';
import logger from '../config/winston.js';
const joi = require('joi');

export default class ReportDataService {
  ///////////////////////////////////////////
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
    // Get tenant_id if not provided
    if (!data.tenant_id) {
      if (data.counselor_id) {
        const tenantId = await this.common.getUserTenantId({
          user_profile_id: data.counselor_id,
        });
        if (tenantId && tenantId.length > 0) {
          data.tenant_id = Number(tenantId[0].tenant_id);
        }
      } else if (data.client_id) {
        const tenantId = await this.common.getUserTenantId({
          user_profile_id: data.client_id,
        });
        if (tenantId && tenantId.length > 0) {
          data.tenant_id = Number(tenantId[0].tenant_id);
        }
      }
    }

    const schema = joi.object({
      session_id: joi.number().optional(),
      client_id: joi.number().optional(),
      counselor_id: joi.number().optional(),
      report_type: joi.string().valid('INTAKE', 'TREATMENT_PLAN', 'PROGRESS', 'DISCHARGE').required(),
      report_json: joi.any().optional(),
      tenant_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const reportData = new ReportData();
    const result = await reportData.postReport(data);
    return result;
  }

  //////////////////////////////////////////

  /**
   * Update a report by ID
   * @param {Object} data - Report data with report_id
   * @returns {Promise<Object>} Updated report result
   */
  async putReportById(data) {
    const schema = joi.object({
      report_id: joi.number().required(),
      session_id: joi.number().optional(),
      client_id: joi.number().optional(),
      counselor_id: joi.number().optional(),
      report_type: joi.string().valid('INTAKE', 'TREATMENT_PLAN', 'PROGRESS', 'DISCHARGE').optional(),
      report_json: joi.any().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const reportData = new ReportData();
    return reportData.putReportById(data);
  }

  //////////////////////////////////////////

  /**
   * Get report(s) by various filters
   * @param {Object} data - Query filters
   * @returns {Promise<Array>} Array of reports
   */
  async getReportById(data) {
    const schema = joi.object({
      report_id: joi.number().optional(),
      session_id: joi.number().optional(),
      client_id: joi.number().optional(),
      counselor_id: joi.number().optional(),
      report_type: joi.string().valid('INTAKE', 'TREATMENT_PLAN', 'PROGRESS', 'DISCHARGE').optional(),
      tenant_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const reportData = new ReportData();
    return reportData.getReportById(data);
  }

  //////////////////////////////////////////

  /**
   * Create intake report
   * @param {Object} data - Intake report data
   * @returns {Promise<Object>} Created intake report result
   */
  async postIntakeReport(data) {
    const reportDataModel = new ReportData();
    let reportId = data.report_id;

    // If session_id is provided instead of report_id, get or create the report
    if (!reportId && data.session_id) {
      // Try to get existing report
      const existingReport = await reportDataModel.getReportById({
        session_id: data.session_id,
        report_type: 'INTAKE',
      });

      if (existingReport && !existingReport.error && existingReport.length > 0) {
        reportId = existingReport[0].report_id;
        // Get tenant_id from existing report if not provided
        if (!data.tenant_id && existingReport[0].tenant_id) {
          data.tenant_id = existingReport[0].tenant_id;
        }
      } else {
        // Create new report
        const newReport = await reportDataModel.postReport({
          session_id: data.session_id,
          client_id: data.client_id,
          counselor_id: data.counselor_id,
          report_type: 'INTAKE',
          tenant_id: data.tenant_id,
        });

        if (newReport.error || !newReport.report_id) {
          return { message: 'Error creating report', error: -1 };
        }

        reportId = newReport.report_id;
      }
    }

    // Get tenant_id if not provided and we have report_id
    if (!data.tenant_id && reportId) {
      const report = await reportDataModel.getReportById({ report_id: reportId });
      if (report && !report.error && report.length > 0) {
        data.tenant_id = report[0].tenant_id;
      }
    }

    const schema = joi.object({
      report_id: joi.number().optional(),
      session_id: joi.number().optional(),
      client_id: joi.number().optional(),
      counselor_id: joi.number().optional(),
      metadata: joi.object().optional(), // Support new metadata format
      intake_data: joi.any().optional(),
      assessment_summary: joi.string().optional(),
      presenting_concerns: joi.string().optional(),
      background_info: joi.string().optional(),
      tenant_id: joi.number().optional(),
    }).or('report_id', 'session_id'); // Require either report_id or session_id

    const { error } = schema.validate({ ...data, report_id: reportId });

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    // Update data with the report_id
    data.report_id = reportId;
    const result = await reportDataModel.postIntakeReport(data);
    return result;
  }

  //////////////////////////////////////////

  /**
   * Create treatment plan report
   * @param {Object} data - Treatment plan report data
   * @returns {Promise<Object>} Created treatment plan report result
   */
  async postTreatmentPlanReport(data) {
    // Get tenant_id if not provided
    if (!data.tenant_id && data.report_id) {
      const reportData = new ReportData();
      const report = await reportData.getReportById({ report_id: data.report_id });
      if (report && !report.error && report.length > 0) {
        data.tenant_id = report[0].tenant_id;
      }
    }

    const schema = joi.object({
      report_id: joi.number().required(),
      treatment_data: joi.any().optional(),
      goals: joi.string().optional(),
      objectives: joi.string().optional(),
      interventions: joi.string().optional(),
      timeline: joi.string().optional(),
      tenant_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const reportData = new ReportData();
    const result = await reportData.postTreatmentPlanReport(data);
    return result;
  }

  //////////////////////////////////////////

  /**
   * Create progress report
   * @param {Object} data - Progress report data
   * @returns {Promise<Object>} Created progress report result
   */
  async postProgressReport(data) {
    const reportDataModel = new ReportData();
    let reportId = data.report_id;

    // If session_id is provided instead of report_id, get or create the report
    if (!reportId && data.session_id) {
      // Try to get existing report
      const existingReport = await reportDataModel.getReportById({
        session_id: data.session_id,
        report_type: 'PROGRESS',
      });

      if (existingReport && !existingReport.error && existingReport.length > 0) {
        reportId = existingReport[0].report_id;
        // Get tenant_id from existing report if not provided
        if (!data.tenant_id && existingReport[0].tenant_id) {
          data.tenant_id = existingReport[0].tenant_id;
        }
      } else {
        // Create new report
        const newReport = await reportDataModel.postReport({
          session_id: data.session_id,
          client_id: data.client_id,
          counselor_id: data.counselor_id,
          report_type: 'PROGRESS',
          tenant_id: data.tenant_id,
        });

        if (newReport.error || !newReport.report_id) {
          return { message: 'Error creating report', error: -1 };
        }

        reportId = newReport.report_id;
      }
    }

    // Get tenant_id if not provided and we have report_id
    if (!data.tenant_id && reportId) {
      const report = await reportDataModel.getReportById({ report_id: reportId });
      if (report && !report.error && report.length > 0) {
        data.tenant_id = report[0].tenant_id;
      }
    }

    const schema = joi.object({
      report_id: joi.number().optional(),
      session_id: joi.number().optional(),
      client_id: joi.number().optional(),
      counselor_id: joi.number().optional(),
      session_summary: joi.string().optional(),
      progress_since_last_session: joi.string().optional(),
      risk_screening_note: joi.string().optional(),
      risk_screening_flags: joi.object({
        no_risk: joi.boolean().optional(),
        suicidal_ideation: joi.boolean().optional(),
        self_harm: joi.boolean().optional(),
        substance_concerns: joi.boolean().optional(),
      }).optional(),
      assessments: joi.array().items(joi.object({
        form_name: joi.string().optional(),
        score: joi.alternatives().try(joi.string(), joi.number()).optional(),
        therapist_notes: joi.string().optional(),
      })).optional(),
      frequency: joi.string().valid('Weekly', 'Biweekly', 'Other').optional(),
      // Header and client information
      practice_name: joi.string().optional(),
      therapist_name: joi.string().optional(),
      therapist_designation: joi.string().optional(),
      report_date: joi.string().optional(),
      treatment_block_name: joi.string().optional(),
      client_full_name: joi.string().optional(),
      client_id_reference: joi.string().optional(),
      session_number: joi.number().optional(),
      total_sessions_completed: joi.number().optional(),
      tenant_id: joi.number().optional(),
    }).or('report_id', 'session_id'); // Require either report_id or session_id

    const { error } = schema.validate({ ...data, report_id: reportId });

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    // Update data with the report_id
    data.report_id = reportId;
    const result = await reportDataModel.postProgressReport(data);
    return result;
  }

  //////////////////////////////////////////

  /**
   * Create discharge report
   * @param {Object} data - Discharge report data
   * @returns {Promise<Object>} Created discharge report result
   */
  async postDischargeReport(data) {
    const reportDataModel = new ReportData();
    let reportId = data.report_id;

    // If session_id is provided instead of report_id, get or create the report
    if (!reportId && data.session_id) {
      // Try to get existing report
      const existingReport = await reportDataModel.getReportById({
        session_id: data.session_id,
        report_type: 'DISCHARGE',
      });

      if (existingReport && !existingReport.error && existingReport.length > 0) {
        reportId = existingReport[0].report_id;
        // Get tenant_id from existing report if not provided
        if (!data.tenant_id && existingReport[0].tenant_id) {
          data.tenant_id = existingReport[0].tenant_id;
        }
      } else {
        // Create new report
        const newReport = await reportDataModel.postReport({
          session_id: data.session_id,
          client_id: data.client_id,
          counselor_id: data.counselor_id,
          report_type: 'DISCHARGE',
          tenant_id: data.tenant_id,
        });

        if (newReport.error || !newReport.report_id) {
          return { message: 'Error creating report', error: -1 };
        }

        reportId = newReport.report_id;
      }
    }

    // Get tenant_id if not provided and we have report_id
    if (!data.tenant_id && reportId) {
      const report = await reportDataModel.getReportById({ report_id: reportId });
      if (report && !report.error && report.length > 0) {
        data.tenant_id = report[0].tenant_id;
      }
    }

    const schema = joi.object({
      report_id: joi.number().optional(),
      session_id: joi.number().optional(),
      metadata: joi.object({
        meta: joi.object({
          client_id: joi.alternatives().try(joi.string(), joi.number()).allow(null).optional(),
          session_id: joi.number().allow(null).optional(),
          session_number: joi.number().allow(null).optional(),
          total_sessions_completed: joi.number().allow(null).optional(),
          report_date: joi.string().allow(null).optional(),
        }).optional(),
        client: joi.object({
          full_name: joi.string().allow(null).optional(),
          client_id_reference: joi.string().allow(null).optional(),
        }).optional(),
        practice: joi.object({
          frequency: joi.string().allow(null).optional(),
          practice_name: joi.string().allow(null).optional(),
          treatment_block_name: joi.string().allow(null).optional(),
        }).optional(),
        therapist: joi.object({
          name: joi.string().allow(null).optional(),
          designation: joi.string().allow(null).optional(),
        }).optional(),
        report: joi.object({
          assessments: joi.array().items(joi.object({
            tool: joi.string().allow('', null).optional(),
            score: joi.alternatives().try(joi.string(), joi.number()).allow('', null).optional(),
            therapist_notes: joi.string().allow('', null).optional(),
          })).allow(null).optional(),
          treatment_summary: joi.string().allow('', null).optional(),
          remaining_concerns: joi.string().allow('', null).optional(),
          recommendations: joi.string().allow('', null).optional(),
          client_understanding: joi.string().allow('', null).optional(),
          discharge_reason_flags: joi.object({
            goals_met: joi.boolean().optional(),
            client_withdrew: joi.boolean().optional(),
            referral_made: joi.boolean().optional(),
            other: joi.boolean().optional(),
          }).allow(null).optional(),
          discharge_reason_other: joi.string().allow('', null).optional(),
        }).optional(),
        sign_off: joi.object({
          method: joi.string().allow(null).optional(),
          approved_by: joi.string().allow(null).optional(),
          approved_on: joi.string().allow(null).optional(),
        }).optional(),
      }).optional(),
      // Backward compatibility: flat structure fields
      client_id: joi.number().optional(),
      counselor_id: joi.number().optional(),
      discharge_data: joi.any().optional(),
      discharge_reason_flags: joi.object({
        goals_met: joi.boolean().optional(),
        client_withdrew: joi.boolean().optional(),
        referral_made: joi.boolean().optional(),
        other: joi.boolean().optional(),
      }).optional(),
      discharge_reason_other: joi.string().allow('', null).optional(),
      treatment_summary: joi.string().allow('', null).optional(),
      remaining_concerns: joi.string().allow('', null).optional(),
      recommendations: joi.string().allow('', null).optional(),
      client_understanding: joi.string().allow('', null).optional(),
      assessments: joi.array().items(joi.object({
        form_name: joi.string().allow('', null).optional(),
        score: joi.alternatives().try(joi.string(), joi.number()).allow('', null).optional(),
        therapist_notes: joi.string().allow('', null).optional(),
      })).optional(),
      discharge_date: joi.date().optional(),
      tenant_id: joi.number().optional(),
    }).or('report_id', 'session_id'); // Require either report_id or session_id

    const { error } = schema.validate({ ...data, report_id: reportId });

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    // Update data with the report_id
    data.report_id = reportId;
    const result = await reportDataModel.postDischargeReport(data);
    return result;
  }

  //////////////////////////////////////////

  /**
   * Get complete report with type-specific data
   * @param {Object} data - Query filters
   * @returns {Promise<Object>} Complete report with type-specific data
   */
  async getCompleteReport(data) {
    const reportData = new ReportData();
    const reports = await reportData.getReportById(data);

    if (reports.error || !reports || reports.length === 0) {
      return reports;
    }

    // For each report, fetch the type-specific data
    const completeReports = await Promise.all(
      reports.map(async (report) => {
        let typeData = null;

        switch (report.report_type) {
          case 'INTAKE':
            typeData = await reportData.getIntakeReportByReportId(report.report_id);
            break;
          case 'TREATMENT_PLAN':
            typeData = await reportData.getTreatmentPlanReportByReportId(report.report_id);
            break;
          case 'PROGRESS':
            typeData = await reportData.getProgressReportByReportId(report.report_id);
            break;
          case 'DISCHARGE':
            typeData = await reportData.getDischargeReportByReportId(report.report_id);
            break;
        }

        return {
          ...report,
          type_data: typeData,
        };
      })
    );

    return completeReports;
  }

  //////////////////////////////////////////

  /**
   * Get treatment plan report data by report_id
   * @param {Object} data - Query data
   * @param {number} data.report_id - Report ID (required)
   * @returns {Promise<Object>} Treatment plan report data
   */
  async getTreatmentPlanReportByReportId(data) {
    const schema = joi.object({
      report_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const reportData = new ReportData();
    const result = await reportData.getTreatmentPlanReportByReportId(data.report_id);
    
    if (!result) {
      return { message: 'Treatment plan report not found', error: -1 };
    }

    return result;
  }

  //////////////////////////////////////////

  /**
   * Update treatment plan report data by report_id
   * @param {Object} data - Treatment plan report data
   * @returns {Promise<Object>} Updated treatment plan report result
   */
  async putTreatmentPlanReportByReportId(data) {
    // Get tenant_id if not provided
    if (!data.tenant_id && data.report_id) {
      const reportData = new ReportData();
      const report = await reportData.getReportById({ report_id: data.report_id });
      if (report && !report.error && report.length > 0) {
        data.tenant_id = report[0].tenant_id;
      }
    }

    const schema = joi.object({
      report_id: joi.number().required(),
      metadata: joi.object().optional(),
      tenant_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const reportData = new ReportData();
    const result = await reportData.putTreatmentPlanReportByReportId(data);
    return result;
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
      const schema = joi.object({
        thrpy_req_id: joi.number().required(),
        session_id: joi.number().optional(),
      });

      const { error } = schema.validate(data);

      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      const reportDataModel = new ReportData();
      const progressReportData = await reportDataModel.getProgressReportData(data);

      if (progressReportData.error) {
        return progressReportData;
      }

      return progressReportData;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error getting progress report data', error: -1 };
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
    const schema = joi.object({
      thrpy_req_id: joi.number().required(),
      session_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const reportData = new ReportData();
    const result = await reportData.getIntakeReportData(data);
    
    if (result.error) {
      return result;
    }

    return result;
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
      const schema = joi.object({
        thrpy_req_id: joi.number().required(),
        session_id: joi.number().optional(),
      });

      const { error } = schema.validate(data);

      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      const reportDataModel = new ReportData();
      const dischargeReportData = await reportDataModel.getDischargeReportData(data);

      if (dischargeReportData.error) {
        return dischargeReportData;
      }

      return dischargeReportData;
    } catch (error) {
      console.error(error);
      logger.error(error);
      return { message: 'Error getting discharge report data', error: -1 };
    }
  }

  //////////////////////////////////////////

  /**
   * Generate PDF for a report
   * @param {Object} data - Query data
   * @param {number} data.report_id - Report ID
   * @returns {Promise<Object>} PDF buffer or error
   */
  async generateReportPDF(data) {
    const schema = joi.object({
      report_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const reportData = new ReportData();
    const result = await reportData.generateReportPDF(data);

    return result;
  }
}

