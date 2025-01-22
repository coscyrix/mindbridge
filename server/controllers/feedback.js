//controllers/feedback.js

import FeedbackService from '../services/feedback.js';

export default class FeedbackController {
  //////////////////////////////////////////
  async postFeedback(req, res) {
    const data = req.body;

    if (!data.session_id || !data.form_id) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const feedback = new FeedbackService();
    const rec = await feedback.postFeedback(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async putFeedbackById(req, res) {
    const feedback_id = req.query.feedback_id;
    const data = req.body;
    data.feedback_id = feedback_id;

    if (!data.feedback_id) {
      res.status(400).json({ message: 'Missing mandatory fields' });
      return;
    }

    const feedback = new FeedbackService();
    const rec = await feedback.putFeedbackById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }
    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async getFeedbackById(req, res) {
    const data = req.query;

    const feedback = new FeedbackService();
    const rec = await feedback.getFeedbackById(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async postGAD7Feedback(req, res) {
    const data = req.body;

    const feedback = new FeedbackService();
    const rec = await feedback.postGAD7Feedback(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async postPHQ9Feedback(req, res) {
    const data = req.body;

    const feedback = new FeedbackService();
    const rec = await feedback.postPHQ9Feedback(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async postWHODASFeedback(req, res) {
    const data = req.body;

    const feedback = new FeedbackService();
    const rec = await feedback.postWHODASFeedback(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async postIPFSFeedback(req, res) {
    const data = req.body;

    const feedback = new FeedbackService();
    const rec = await feedback.postIPFFeedback(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }
}
