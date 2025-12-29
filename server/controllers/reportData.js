//controllers/reportData.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import ReportDataService from '../services/reportData.js';
import Common from '../models/common.js';
const dotenv = require('dotenv');

dotenv.config();

export default class ReportDataController {
  constructor() {
    this.common = new Common();

    // Bind methods to preserve 'this' context
    this.getReportById = this.getReportById.bind(this);
    this.postReport = this.postReport.bind(this);
    this.putReportById = this.putReportById.bind(this);
    this.postIntakeReport = this.postIntakeReport.bind(this);
    this.postTreatmentPlanReport = this.postTreatmentPlanReport.bind(this);
    this.postProgressReport = this.postProgressReport.bind(this);
    this.postDischargeReport = this.postDischargeReport.bind(this);
    this.getCompleteReport = this.getCompleteReport.bind(this);
    this.getTreatmentPlanReportByReportId = this.getTreatmentPlanReportByReportId.bind(this);
    this.putTreatmentPlanReportByReportId = this.putTreatmentPlanReportByReportId.bind(this);
    this.getProgressReportData = this.getProgressReportData.bind(this);
    this.getIntakeReportData = this.getIntakeReportData.bind(this);
    this.getDischargeReportData = this.getDischargeReportData.bind(this);
    this.generateReportPDF = this.generateReportPDF.bind(this);
  }

  //////////////////////////////////////////
  async postReport(req, res) {
    const data = req.body;

    if (!data.report_type) {
      res.status(400).json({ message: 'Missing mandatory field: report_type' });
      return;
    }

    const reportData = new ReportDataService();
    const rec = await reportData.postReport(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async putReportById(req, res) {
    const report_id = req.query.report_id;
    const data = req.body;
    data.report_id = report_id;

    if (!data.report_id) {
      res.status(400).json({ message: 'Missing mandatory field: report_id' });
      return;
    }

    const reportData = new ReportDataService();
    const rec = await reportData.putReportById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }
    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async getReportById(req, res) {
    const data = req.query;

    // If no tenant_id is provided but client_id is, extract tenant_id from client_id
    if (!data.tenant_id && data.client_id) {
      try {
        const clientTenant = await this.common.getUserTenantId({ user_profile_id: data.client_id });
        if (clientTenant && clientTenant.length > 0) {
          data.tenant_id = Number(clientTenant[0].tenant_id);
        }
      } catch (error) {
        console.log('Error extracting tenant_id from client_id:', error);
        // Continue without tenant_id if extraction fails
      }
    }

    const reportData = new ReportDataService();
    const rec = await reportData.getReportById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async getCompleteReport(req, res) {
    const data = req.query;

    // If no tenant_id is provided but client_id is, extract tenant_id from client_id
    if (!data.tenant_id && data.client_id) {
      try {
        const clientTenant = await this.common.getUserTenantId({ user_profile_id: data.client_id });
        if (clientTenant && clientTenant.length > 0) {
          data.tenant_id = Number(clientTenant[0].tenant_id);
        }
      } catch (error) {
        console.log('Error extracting tenant_id from client_id:', error);
        // Continue without tenant_id if extraction fails
      }
    }

    const reportData = new ReportDataService();
    const rec = await reportData.getCompleteReport(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async postIntakeReport(req, res) {
    const data = req.body;

    if (!data.report_id) {
      res.status(400).json({ message: 'Missing mandatory field: report_id' });
      return;
    }

    const reportData = new ReportDataService();
    const rec = await reportData.postIntakeReport(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async postTreatmentPlanReport(req, res) {
    const data = req.body;

    if (!data.report_id) {
      res.status(400).json({ message: 'Missing mandatory field: report_id' });
      return;
    }

    const reportData = new ReportDataService();
    const rec = await reportData.postTreatmentPlanReport(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async postProgressReport(req, res) {
    const data = req.body;

    if (!data.report_id && !data.session_id) {
      res.status(400).json({ message: 'Missing mandatory field: report_id or session_id' });
      return;
    }

    const reportData = new ReportDataService();
    const rec = await reportData.postProgressReport(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async postDischargeReport(req, res) {
    const data = req.body;

    if (!data.report_id && !data.session_id) {
      res.status(400).json({ message: 'Missing mandatory field: report_id or session_id' });
      return;
    }

    const reportData = new ReportDataService();
    const rec = await reportData.postDischargeReport(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  /**
   * Get treatment plan report data by report_id
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getTreatmentPlanReportByReportId(req, res) {
    const reportDataService = new ReportDataService();
    const data = req.query;

    if (!data.report_id) {
      res.status(400).json({ message: 'Missing mandatory field: report_id' });
      return;
    }

    // Convert to number if provided
    if (data.report_id) {
      data.report_id = Number(data.report_id);
    }

    const rec = await reportDataService.getTreatmentPlanReportByReportId(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  /**
   * Update treatment plan report data by report_id
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async putTreatmentPlanReportByReportId(req, res) {
    const data = req.body;

    if (!data.report_id) {
      res.status(400).json({ message: 'Missing mandatory field: report_id' });
      return;
    }

    const reportData = new ReportDataService();
    const rec = await reportData.putTreatmentPlanReportByReportId(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  /**
   * Get progress report data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getProgressReportData(req, res) {
    const reportDataService = new ReportDataService();
    const data = req.query;

    if (!data.thrpy_req_id) {
      res.status(400).json({ message: 'Missing mandatory field: thrpy_req_id' });
      return;
    }

    // Convert to number if provided
    if (data.thrpy_req_id) {
      data.thrpy_req_id = Number(data.thrpy_req_id);
    }

    if (data.session_id) {
      data.session_id = Number(data.session_id);
    }

    const rec = await reportDataService.getProgressReportData(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json({ rec: rec });
  }

  //////////////////////////////////////////

  /**
   * Get intake report data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getIntakeReportData(req, res) {
    const reportDataService = new ReportDataService();
    const data = req.query;

    if (!data.thrpy_req_id) {
      res.status(400).json({ message: 'Missing mandatory field: thrpy_req_id' });
      return;
    }

    // Convert to number if provided
    if (data.thrpy_req_id) {
      data.thrpy_req_id = Number(data.thrpy_req_id);
    }

    if (data.session_id) {
      data.session_id = Number(data.session_id);
    }

    const rec = await reportDataService.getIntakeReportData(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json({ rec: rec });
  }

  //////////////////////////////////////////

  /**
   * Get discharge report data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getDischargeReportData(req, res) {
    const reportDataService = new ReportDataService();
    const data = req.query;

    if (!data.thrpy_req_id) {
      res.status(400).json({ message: 'Missing mandatory field: thrpy_req_id' });
      return;
    }

    // Convert to number if provided
    if (data.thrpy_req_id) {
      data.thrpy_req_id = Number(data.thrpy_req_id);
    }

    if (data.session_id) {
      data.session_id = Number(data.session_id);
    }

    const rec = await reportDataService.getDischargeReportData(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json({ rec: rec });
  }

  //////////////////////////////////////////

  /**
   * Generate PDF for a report
   * GET /report-data/pdf/:report_id
   */
  async generateReportPDF(req, res) {
    const reportDataService = new ReportDataService();
    const { report_id } = req.params;

    if (!report_id) {
      res.status(400).json({ message: 'Missing mandatory field: report_id' });
      return;
    }

    const result = await reportDataService.generateReportPDF({
      report_id: Number(report_id),
    });

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    // Set response headers for PDF download
    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', result.buffer.length);

    // Send the PDF buffer
    res.send(result.buffer);
  }
}

