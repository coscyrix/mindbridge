//controllers/feedback.js

import FeedbackService from '../services/feedback.js';
import Common from '../models/common.js';
import dotenv from 'dotenv';

dotenv.config();

export default class FeedbackController {
  constructor() {
    this.common = new Common();
    
    // Bind methods to preserve 'this' context
    this.getFeedbackById = this.getFeedbackById.bind(this);
    this.postFeedback = this.postFeedback.bind(this);
    this.putFeedbackById = this.putFeedbackById.bind(this);
    this.postGAD7Feedback = this.postGAD7Feedback.bind(this);
    this.postPHQ9Feedback = this.postPHQ9Feedback.bind(this);
    this.postPCL5Feedback = this.postPCL5Feedback.bind(this);
    this.postWHODASFeedback = this.postWHODASFeedback.bind(this);
    this.postIPFSFeedback = this.postIPFSFeedback.bind(this);
    this.postSMARTGOALFeedback = this.postSMARTGOALFeedback.bind(this);
    this.postCONSENTFeedback = this.postCONSENTFeedback.bind(this);
    this.postGASFeedback = this.postGASFeedback.bind(this);
    this.postATTENDANCEFeedback = this.postATTENDANCEFeedback.bind(this);
  }

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

    // If no tenant_id is provided but client_id is, extract tenant_id from client_id
    if (!data.tenant_id && data.client_id) {
      try {
        const clientTenant = await this.common.getUserTenantId({ user_profile_id: data.client_id });
        if (clientTenant && clientTenant.length > 0) {
          data.tenant_id = Number(clientTenant[0].tenant_id);
          console.log('Extracted tenant_id:', data.tenant_id, 'for client_id:', data.client_id);
        }
      } catch (error) {
        console.log('Error extracting tenant_id from client_id:', error);
        // Continue without tenant_id if extraction fails
      }
    }

    console.log('Final data for getFeedbackById:', data);

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

  async postPCL5Feedback(req, res) {
    const data = req.body;

    const feedback = new FeedbackService();
    const rec = await feedback.postPCL5Feedback(data);

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

  //////////////////////////////////////////

  async postSMARTGOALFeedback(req, res) {
    const data = req.body;

    const feedback = new FeedbackService();
    const rec = await feedback.postSMARTGOALFeedback(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async postCONSENTFeedback(req, res) {
    const data = req.body;
    data.tenant_id = req.body.tenant_id;

    const feedback = new FeedbackService();
    const rec = await feedback.postCONSENTFeedback(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async postGASFeedback(req, res) {
    const data = req.body;

    const feedback = new FeedbackService();
    const rec = await feedback.postGASFeedback(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }

  //////////////////////////////////////////

  async postATTENDANCEFeedback(req, res) {
    const data = req.body;

    const feedback = new FeedbackService();
    const rec = await feedback.postATTENDANCEFeedback(data);

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }
}
