import ReportService from '../services/report.js';

export default class ReportController {
  //////////////////////////////////////////
  async getUserForm(req, res) {
    const reportService = new ReportService();
    const data = req.query;

    if (data.role_id) {
      data.role_id = Number(data.role_id);
    } else {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const rec = await reportService.getUserForm(data);

    // For "No forms found" or similar informational messages, return 200 status
    // Only return 400 for actual errors like missing data or database failures
    if (rec.error && rec.message && (
      rec.message.includes('No forms found') || 
      rec.message.includes('No data found') ||
      rec.message.includes('No records found')
    )) {
      res.status(200).json(rec);
      return;
    }

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////
  async getSessionReport(req, res) {
    const reportService = new ReportService();
    const data = req.query;

    if (data.role_id) {
      data.role_id = Number(data.role_id);
    } else {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const rec = await reportService.getSessionReport(data);

    // For "No data found" or similar informational messages, return 200 status
    if (rec.error && rec.message && (
      rec.message.includes('No data found') || 
      rec.message.includes('No records found') ||
      rec.message.includes('No sessions found')
    )) {
      res.status(200).json(rec);
      return;
    }

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////
  async getUserSessionStatReport(req, res) {
    const reportService = new ReportService();
    const data = req.query;

    if (data.role_id) {
      data.role_id = Number(data.role_id);
    } else {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const rec = await reportService.getUserSessionStatReport(data);

    // For "No data found" or similar informational messages, return 200 status
    if (rec.error && rec.message && (
      rec.message.includes('No data found') || 
      rec.message.includes('No records found') ||
      rec.message.includes('No statistics found')
    )) {
      res.status(200).json(rec);
      return;
    }

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }
}
