import Report from '../models/report.js';

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
}
