import Feedback from '../models/feedback.js';
import Common from '../models/common.js';
import joi from 'joi';

export default class FeedbackService {
  //////////////////////////////////////////

  async postFeedback(data) {
    const sessionId = await this.common.getSessionId(data.session_id);
    const tenantId = await this.common.getUserTenantId({
      user_profile_id: sessionId[0].counselor_id,
    });
    data.tenant_id = tenantId[0].tenant_id;

    const schema = joi.object({
      session_id: joi.number().required(),
      form_id: joi.number().required(),
      status_yn: joi.string().valid('y', 'n').optional(),
      tenant_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const feedback = new Feedback();
    const result = await feedback.postFeedback(data);
    return result;
  }

  //////////////////////////////////////////

  async putFeedbackById(data) {
    const schema = joi.object({
      feedback_id: joi.number().required(),
      session_id: joi.number().optional(),
      form_id: joi.number().optional(),
      status_yn: joi.string().valid('y', 'n').optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const feedback = new Feedback();
    return feedback.putFeedbackById(data);
  }

  //////////////////////////////////////////

  async getFeedbackById(data) {
    const schema = joi.object({
      feedback_id: joi.number().optional(),
      session_id: joi.number().optional(),
      form_id: joi.number().optional(),
      client_id: joi.number().optional(),
      is_submitted: joi.string().valid('y', 'n').optional(),
      tenant_id: joi.number().optional(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const feedback = new Feedback();
    return feedback.getFeedbackById(data);
  }

  //////////////////////////////////////////

  async postGAD7Feedback(data) {
    const sessionId = await this.common.getSessionId(data.session_id);
    const tenantId = await this.common.getUserTenantId({
      user_profile_id: sessionId[0].counselor_id,
    });
    data.tenant_id = tenantId[0].tenant_id;
    const schema = joi.object({
      item1: joi.number().min(0).max(3).required(),
      item2: joi.number().min(0).max(3).required(),
      item3: joi.number().min(0).max(3).required(),
      item4: joi.number().min(0).max(3).required(),
      item5: joi.number().min(0).max(3).required(),
      item6: joi.number().min(0).max(3).required(),
      item7: joi.number().min(0).max(3).required(),
      session_id: joi.number().required(),
      client_id: joi.number().required(),
      tenant_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const feedback = new Feedback();
    return feedback.postGAD7Feedback(data);
  }

  //////////////////////////////////////////

  async postPHQ9Feedback(data) {
    const sessionId = await this.common.getSessionId(data.session_id);
    const tenantId = await this.common.getUserTenantId({
      user_profile_id: sessionId[0].counselor_id,
    });
    data.tenant_id = tenantId[0].tenant_id;
    const schema = joi.object({
      item1: joi.number().min(0).max(3).required(),
      item2: joi.number().min(0).max(3).required(),
      item3: joi.number().min(0).max(3).required(),
      item4: joi.number().min(0).max(3).required(),
      item5: joi.number().min(0).max(3).required(),
      item6: joi.number().min(0).max(3).required(),
      item7: joi.number().min(0).max(3).required(),
      item8: joi.number().min(0).max(3).required(),
      item9: joi.number().min(0).max(3).required(),
      difficulty_score: joi.number().min(0).max(3).required(),
      session_id: joi.number().required(),
      client_id: joi.number().required(),
      tenant_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const feedback = new Feedback();
    return feedback.postPHQ9Feedback(data);
  }

  //////////////////////////////////////////

  async postPCL5Feedback(data) {
    const sessionId = await this.common.getSessionId(data.session_id);
    const tenantId = await this.common.getUserTenantId({
      user_profile_id: sessionId[0].counselor_id,
    });
    data.tenant_id = tenantId[0].tenant_id;
    const schema = joi.object({
      item1: joi.number().min(0).max(4).required(),
      item2: joi.number().min(0).max(4).required(),
      item3: joi.number().min(0).max(4).required(),
      item4: joi.number().min(0).max(4).required(),
      item5: joi.number().min(0).max(4).required(),
      item6: joi.number().min(0).max(4).required(),
      item7: joi.number().min(0).max(4).required(),
      item8: joi.number().min(0).max(4).required(),
      item9: joi.number().min(0).max(4).required(),
      item10: joi.number().min(0).max(4).required(),
      item11: joi.number().min(0).max(4).required(),
      item12: joi.number().min(0).max(4).required(),
      item13: joi.number().min(0).max(4).required(),
      item14: joi.number().min(0).max(4).required(),
      item15: joi.number().min(0).max(4).required(),
      item16: joi.number().min(0).max(4).required(),
      item17: joi.number().min(0).max(4).required(),
      item18: joi.number().min(0).max(4).required(),
      item19: joi.number().min(0).max(4).required(),
      item20: joi.number().min(0).max(4).required(),
      session_id: joi.number().required(),
      client_id: joi.number().required(),
      tenant_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const feedback = new Feedback();
    return feedback.postPCL5Feedback(data);
  }

  //////////////////////////////////////////

  async postWHODASFeedback(data) {
    const sessionId = await this.common.getSessionId(data.session_id);
    const tenantId = await this.common.getUserTenantId({
      user_profile_id: sessionId[0].counselor_id,
    });
    data.tenant_id = tenantId[0].tenant_id;
    const schema = joi.object({
      item1: joi.number().min(0).max(4).required(),
      item2: joi.number().min(0).max(4).required(),
      item3: joi.number().min(0).max(4).required(),
      item4: joi.number().min(0).max(4).required(),
      item5: joi.number().min(0).max(4).required(),
      item6: joi.number().min(0).max(4).required(),
      item7: joi.number().min(0).max(4).required(),
      item8: joi.number().min(0).max(4).required(),
      item9: joi.number().min(0).max(4).required(),
      item10: joi.number().min(0).max(4).required(),
      item11: joi.number().min(0).max(4).required(),
      item12: joi.number().min(0).max(4).required(),
      item13: joi.number().min(0).max(4).required(),
      item14: joi.number().min(0).max(4).required(),
      item15: joi.number().min(0).max(4).required(),
      item16: joi.number().min(0).max(4).required(),
      item17: joi.number().min(0).max(4).required(),
      item18: joi.number().min(0).max(4).required(),
      item19: joi.number().min(0).max(4).required(),
      item20: joi.number().min(0).max(4).required(),
      item21: joi.number().min(0).max(4).required(),
      item22: joi.number().min(0).max(4).required(),
      item23: joi.number().min(0).max(4).required(),
      item24: joi.number().min(0).max(4).required(),
      item25: joi.number().min(0).max(4).required(),
      item26: joi.number().min(0).max(4).required(),
      item27: joi.number().min(0).max(4).required(),
      item28: joi.number().min(0).max(4).required(),
      item29: joi.number().min(0).max(4).required(),
      item30: joi.number().min(0).max(4).required(),
      item31: joi.number().min(0).max(4).required(),
      item32: joi.number().min(0).max(4).required(),
      item33: joi.number().min(0).max(4).required(),
      item34: joi.number().min(0).max(4).required(),
      item35: joi.number().min(0).max(4).required(),
      item36: joi.number().min(0).max(4).required(),
      difficultyDays: joi.number().min(0).max(30).required(),
      unableDays: joi.number().min(0).max(30).required(),
      healthConditionDays: joi.number().min(0).max(30).required(),
      session_id: joi.number().required(),
      client_id: joi.number().required(),
      tenant_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const feedback = new Feedback();
    return feedback.postWHODASFeedback(data);
  }

  //////////////////////////////////////////

  async postIPFFeedback(data) {
    const sessionId = await this.common.getSessionId(data.session_id);
    const tenantId = await this.common.getUserTenantId({
      user_profile_id: sessionId[0].counselor_id,
    });
    data.tenant_id = tenantId[0].tenant_id;
    const schema = joi.object({
      session_id: joi.number().required(),
      client_id: joi.number().required(),
      item1: joi.number().min(0).max(6).required(),
      item2: joi.number().min(0).max(6).required(),
      item3: joi.number().min(0).max(6).required(),
      item4: joi.number().min(0).max(6).required(),
      item5: joi.number().min(0).max(6).required(),
      item6: joi.number().min(0).max(6).required(),
      item7: joi.number().min(0).max(6).required(),
      item8: joi.number().min(0).max(6).required(),
      item9: joi.number().min(0).max(6).required(),
      item10: joi.number().min(0).max(6).required(),
      item11: joi.number().min(0).max(6).required(),
      item12: joi.number().min(0).max(6).required(),
      item13: joi.number().min(0).max(6).required(),
      item14: joi.number().min(0).max(6).required(),
      item15: joi.number().min(0).max(6).required(),
      item16: joi.number().min(0).max(6).required(),
      item17: joi.number().min(0).max(6).required(),
      item18: joi.number().min(0).max(6).required(),
      item19: joi.number().min(0).max(6).required(),
      item20: joi.number().min(0).max(6).required(),
      item21: joi.number().min(0).max(6).required(),
      item22: joi.number().min(0).max(6).required(),
      item23: joi.number().min(0).max(6).required(),
      item24: joi.number().min(0).max(6).required(),
      item25: joi.number().min(0).max(6).required(),
      item26: joi.number().min(0).max(6).required(),
      item27: joi.number().min(0).max(6).required(),
      item28: joi.number().min(0).max(6).required(),
      item29: joi.number().min(0).max(6).required(),
      item30: joi.number().min(0).max(6).required(),
      item31: joi.number().min(0).max(6).required(),
      item32: joi.number().min(0).max(6).required(),
      item33: joi.number().min(0).max(6).required(),
      item34: joi.number().min(0).max(6).required(),
      item35: joi.number().min(0).max(6).required(),
      item36: joi.number().min(0).max(6).required(),
      item37: joi.number().min(0).max(6).required(),
      item38: joi.number().min(0).max(6).required(),
      item39: joi.number().min(0).max(6).required(),
      item40: joi.number().min(0).max(6).required(),
      item41: joi.number().min(0).max(6).required(),
      item42: joi.number().min(0).max(6).required(),
      item43: joi.number().min(0).max(6).required(),
      item44: joi.number().min(0).max(6).required(),
      item45: joi.number().min(0).max(6).required(),
      item46: joi.number().min(0).max(6).required(),
      item47: joi.number().min(0).max(6).required(),
      item48: joi.number().min(0).max(6).required(),
      item49: joi.number().min(0).max(6).required(),
      item50: joi.number().min(0).max(6).required(),
      item51: joi.number().min(0).max(6).required(),
      item52: joi.number().min(0).max(6).required(),
      item53: joi.number().min(0).max(6).required(),
      item54: joi.number().min(0).max(6).required(),
      item55: joi.number().min(0).max(6).required(),
      item56: joi.number().min(0).max(6).required(),
      item57: joi.number().min(0).max(6).required(),
      item58: joi.number().min(0).max(6).required(),
      item59: joi.number().min(0).max(6).required(),
      item60: joi.number().min(0).max(6).required(),
      item61: joi.number().min(0).max(6).required(),
      item62: joi.number().min(0).max(6).required(),
      item63: joi.number().min(0).max(6).required(),
      item64: joi.number().min(0).max(6).required(),
      item65: joi.number().min(0).max(6).required(),
      item66: joi.number().min(0).max(6).required(),
      item67: joi.number().min(0).max(6).required(),
      item68: joi.number().min(0).max(6).required(),
      item69: joi.number().min(0).max(6).required(),
      item70: joi.number().min(0).max(6).required(),
      item71: joi.number().min(0).max(6).required(),
      item72: joi.number().min(0).max(6).required(),
      item73: joi.number().min(0).max(6).required(),
      item74: joi.number().min(0).max(6).required(),
      item75: joi.number().min(0).max(6).required(),
      item76: joi.number().min(0).max(6).required(),
      item77: joi.number().min(0).max(6).required(),
      item78: joi.number().min(0).max(6).required(),
      item79: joi.number().min(0).max(6).required(),
      item80: joi.number().min(0).max(6).required(),
      tenant_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const feedback = new Feedback();
    return feedback.postIPFSFeedback(data);
  }

  //////////////////////////////////////////

  async postSMARTGOALFeedback(data) {
    const sessionId = await this.common.getSessionId(data.session_id);
    const tenantId = await this.common.getUserTenantId({
      user_profile_id: sessionId[0].counselor_id,
    });
    data.tenant_id = tenantId[0].tenant_id;
    const schema = joi.object({
      session_id: joi.number().required(),
      client_id: joi.number().required(),
      specific_1st_phase: joi.string().optional(),
      specific_2nd_phase: joi.string().optional(),
      specific_3rd_phase: joi.string().optional(),
      measurable_1st_phase: joi.string().optional(),
      measurable_2nd_phase: joi.string().optional(),
      measurable_3rd_phase: joi.string().optional(),
      achievable_1st_phase: joi.string().optional(),
      achievable_2nd_phase: joi.string().optional(),
      achievable_3rd_phase: joi.string().optional(),
      relevant_1st_phase: joi.string().optional(),
      relevant_2nd_phase: joi.string().optional(),
      relevant_3rd_phase: joi.string().optional(),
      time_bound_1st_phase: joi.string().optional(),
      time_bound_2nd_phase: joi.string().optional(),
      time_bound_3rd_phase: joi.string().optional(),
      tenant_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const feedback = new Feedback();
    return feedback.postSMARTGOALFeedback(data);
  }

  //////////////////////////////////////////

  async postCONSENTFeedback(data) {
    const schema = joi.object({
      client_id: joi.number().required(),
      imgBase64: joi.string().required(),
      tenant_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const feedback = new Feedback();
    return feedback.postCONSENTFeedback(data);
  }

  //////////////////////////////////////////

  async postATTENDANCEFeedback(data) {
    const sessionId = await this.common.getSessionId(data.session_id);
    const tenantId = await this.common.getUserTenantId({
      user_profile_id: sessionId[0].counselor_id,
    });
    data.tenant_id = tenantId[0].tenant_id;
    const schema = joi.object({
      session_id: joi.number().required(),
      client_id: joi.number().required(),
      total_sessions: joi.number().required(),
      total_attended_sessions: joi.number().required(),
      total_cancelled_sessions: joi.number().required(),
      tenant_id: joi.number().required(),
    });

    const { error } = schema.validate(data);

    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    const feedback = new Feedback();
    return feedback.postATTENDANCEFeedback(data);
  }
}
