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

  //////////////////////////////////////////
  async getSessionsWithHomeworkStats(req, res) {
    const reportService = new ReportService();
    const data = req.query;

    if (!data.role_id) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    data.role_id = Number(data.role_id);

    // For non-admin roles (role_id !== 4), counselor_id is required
    // Exception: When role_id=3 and tenant_id is provided, show all counselors for that tenant
    if (Number(data.role_id) !== 4 && !data.counselor_id) {
      // Special case for role_id=3 with tenant_id - allow showing all counselors
      if (Number(data.role_id) === 3 && data.tenant_id) {
        // Allow this case - will show data for all counselors in the tenant
      } else {
        res.status(400).json({ message: 'Missing mandatory fields' });
        return;
      }
    }

    const rec = await reportService.getSessionsWithHomeworkStats(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////
  async getProgressReportData(req, res) {
    const reportService = new ReportService();
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

    const rec = await reportService.getProgressReportData(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json({ rec: rec });
  }

  //////////////////////////////////////////
  async getDischargeReportData(req, res) {
    const reportService = new ReportService();
    const data = req.query;

    if (!data.thrpy_req_id) {
      res.status(400).json({ message: 'Missing mandatory field: thrpy_req_id' });
      return;
    }

    if (data.thrpy_req_id) {
      data.thrpy_req_id = Number(data.thrpy_req_id);
    }

    if (data.session_id) {
      data.session_id = Number(data.session_id);
    }

    const rec = await reportService.getDischargeReportData(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json({ rec: rec });
  }
}
