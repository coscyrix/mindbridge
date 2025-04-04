import UserTargetOutcomeService from '../services/userTargetOutcome.js';
import dotenv from 'dotenv';

dotenv.config();

export default class UserTargetOutcomeController {
  //////////////////////////////////////////
  async postUserTargetOutcome(req, res) {
    const data = req.body;
    data.tenant_id = process.env.TENANT_ID;

    const userTargetOutcomeService = new UserTargetOutcomeService();
    const result = await userTargetOutcomeService.postUserTargetOutcome(data);

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json(result);
  }

  //////////////////////////////////////////
  async putUserTargetOutcome(req, res) {
    const data = req.body;
    const userTargetOutcomeService = new UserTargetOutcomeService();
    const result = await userTargetOutcomeService.putUserTargetOutcome(data);

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json(result);
  }

  //////////////////////////////////////////
  async getUserTargetOutcome(req, res) {
    const data = req.query;
    const userTargetOutcomeService = new UserTargetOutcomeService();
    const result = await userTargetOutcomeService.getUserTargetOutcome(data);

    if (result.error) {
      res.status(400).json(result);
      return;
    }

    res.status(200).json(result);
  }
}
