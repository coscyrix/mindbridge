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

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }
}
