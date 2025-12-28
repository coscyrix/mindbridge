import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import Report from '../models/report.js';
const joi = require('joi');

export default class ReportService {
  //////////////////////////////////////////
  async getUserForm(data) {
    try {
      const report = new Report();
      const userForms = await report.getUserForm(data);

      if (userForms.error) {
        return userForms;
      }

      return userForms;
    } catch (error) {
      console.error(error);
      return { message: 'Error fetching user forms', error: -1 };
    }
  }

  //////////////////////////////////////////
  async getSessionReport(data) {
    try {
      const report = new Report();
      const sessionReports = await report.getSessionReport(data);

      if (sessionReports.error) {
        return sessionReports;
      }

      return sessionReports;
    } catch (error) {
      console.error(error);
      return { message: 'Error fetching session reports', error: -1 };
    }
  }

  //////////////////////////////////////////
  async getUserSessionStatReport(data) {
    try {
      const report = new Report();
      const statReports = await report.getUserSessionStatReport(data);

      if (statReports.error) {
        return statReports;
      }

      return statReports;
    } catch (error) {
      console.error(error);
      return { message: 'Error fetching user session statistics', error: -1 };
    }
  }

  //////////////////////////////////////////
  async getSessionsWithHomeworkStats(data) {
    try {
      const schema = joi.object({
        counselor_id: joi.number().optional(),
        client_id: joi.number().optional(),
        role_id: joi.number().required(),
        tenant_id: joi.number().optional(),
        start_date: joi.date().optional(),
        end_date: joi.date().optional(),
      });

      const { error } = schema.validate(data);

      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      const report = new Report();
      const homeworkStats = await report.getSessionsWithHomeworkStats(data);

      if (homeworkStats.error) {
        return homeworkStats;
      }

      return homeworkStats;
    } catch (error) {
      console.error(error);
      return { message: 'Error fetching session homework statistics', error: -1 };
    }
  }

  //////////////////////////////////////////
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

      const report = new Report();
      const progressReportData = await report.getProgressReportData(data);

      if (progressReportData.error) {
        return progressReportData;
      }

      return progressReportData;
    } catch (error) {
      console.error(error);
      return { message: 'Error fetching progress report data', error: -1 };
    }
  }

  //////////////////////////////////////////
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

      const report = new Report();
      const dischargeReportData = await report.getDischargeReportData(data);

      if (dischargeReportData.error) {
        return dischargeReportData;
      }

      return dischargeReportData;
    } catch (error) {
      console.error(error);
      return { message: 'Error fetching discharge report data', error: -1 };
    }
  }
}
