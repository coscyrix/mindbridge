import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import Session from './session.js';
import { cli } from 'winston/lib/winston/config/index.js';

const db = knex(DBconn.dbConn.development);

export default class Feedback {
  //////////////////////////////////////////
  constructor() {
    this.session = new Session();
  }
  //////////////////////////////////////////

  async postFeedback(data) {
    try {
      const tmpFeedback = {
        ...(data.session_id && { session_id: data.session_id }),
        ...(data.form_id && { form_id: data.form_id }),
        client_id: data.client_id,
        feedback_json: data.feedback_json,
        is_discharged: data.is_discharged ? data.is_discharged : 'n',
      };

      const postFeedback = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('feedback')
        .insert(tmpFeedback);

      if (!postFeedback) {
        logger.error('Error creating feedback');
        return { message: 'Error creating feedback', error: -1 };
      }

      return { message: 'Feedback created successfully', rec: postFeedback };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error creating feedback', error: -1 };
    }
  }

  //////////////////////////////////////////

  async putFeedbackById(data) {
    try {
      const tmpFeedback = {
        session_id: data.session_id,
        form_id: data.form_id,
        status_yn: data.status_yn,
      };

      const putFeedback = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('feedback')
        .where('feedback_id', data.feedback_id)
        .update(tmpFeedback);

      if (!putFeedback) {
        logger.error('Error updating feedback');
        return { message: 'Error updating feedback', error: -1 };
      }

      return { message: 'Feedback updated successfully' };
    } catch (error) {
      logger.error(error);
      return { message: 'Error updating feedback', error: -1 };
    }
  }

  //////////////////////////////////////////

  async getFeedbackById(data) {
    try {
      let query = db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('v_feedback');

      if (data.feedback_id) {
        query = query.andWhere('feedback_id', data.feedback_id);
      }

      if (data.session_id) {
        query = query.andWhere('session_id', data.session_id);
      }

      if (data.form_id) {
        query = query.andWhere('form_id', data.form_id);
      }

      if (data.client_id) {
        query = query.andWhere('client_id', data.client_id);
      }

      const rec = await query;
      if (!rec) {
        logger.error('Error getting feedback');
        return { message: 'Error getting feedback', error: -1 };
      }
      return rec;
    } catch (error) {
      logger.error(error);
      return { message: 'Error getting feedback', error: -1 };
    }
  }

  //////////////////////////////////////////

  async postGAD7Feedback(data) {
    try {
      let total = 0;
      total +=
        data.item1 +
        data.item2 +
        data.item3 +
        data.item4 +
        data.item5 +
        data.item6 +
        data.item7;

      const checkSession = await this.session.getSessionById({
        session_id: data.session_id,
      });

      if (checkSession.length === 0) {
        return { message: 'Session not found', error: -1 };
      }

      const checkFeedBackSessionId = await this.getFeedbackById({
        session_id: data.session_id,
        form_id: 21,
      });

      if (checkFeedBackSessionId.length > 0) {
        return {
          message: 'Feedback already exists for this session',
          error: -1,
        };
      }

      const recFeedback = await this.postFeedback({
        session_id: data.session_id,
        client_id: data.client_id,
        feedback_json: data,
        form_id: 21,
      });

      console.log('recFeedback');
      console.log(recFeedback);

      if (recFeedback.error) {
        return recFeedback;
      }

      const tmpGAD7Feedback = {
        total_points: total,
        feedback_id: recFeedback.rec[0],
      };

      const postGAD7Feedback = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('feedback_gad')
        .insert(tmpGAD7Feedback);

      if (!postGAD7Feedback) {
        logger.error('Error creating feedback');
        return { message: 'Error creating feedback', error: -1 };
      }

      return { message: 'Feedback created successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error creating feedback', error: -1 };
    }
  }

  //////////////////////////////////////////

  async postPHQ9Feedback(data) {
    try {
      let total = 0;
      total +=
        data.item1 +
        data.item2 +
        data.item3 +
        data.item4 +
        data.item5 +
        data.item6 +
        data.item7 +
        data.item8 +
        data.item9;

      const checkSession = await this.session.getSessionById({
        session_id: data.session_id,
      });

      if (checkSession.length === 0) {
        return { message: 'Session not found', error: -1 };
      }

      const checkFeedBackSessionId = await this.getFeedbackById({
        session_id: data.session_id,
        form_id: 20,
      });

      if (checkFeedBackSessionId.length > 0) {
        return {
          message: 'Feedback already exists for this session',
          error: -1,
        };
      }

      const recFeedback = await this.postFeedback({
        session_id: data.session_id,
        client_id: data.client_id,
        feedback_json: data,
        form_id: 20,
      });

      console.log('recFeedback');
      console.log(recFeedback);

      if (recFeedback.error) {
        return recFeedback;
      }

      const tmpGAD7Feedback = {
        total_score: total,
        difficulty_score: data.difficulty_score,
        feedback_id: recFeedback.rec[0],
      };

      const postGAD7Feedback = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('feedback_phq9')
        .insert(tmpGAD7Feedback);

      if (!postGAD7Feedback) {
        logger.error('Error creating feedback');
        return { message: 'Error creating feedback', error: -1 };
      }

      return { message: 'Feedback created successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error creating feedback', error: -1 };
    }
  }

  //////////////////////////////////////////

  async postPCL5Feedback(data) {
    try {
      let total = 0;
      total +=
        data.item1 +
        data.item2 +
        data.item3 +
        data.item4 +
        data.item5 +
        data.item6 +
        data.item7 +
        data.item8 +
        data.item9 +
        data.item10 +
        data.item11 +
        data.item12 +
        data.item13 +
        data.item14 +
        data.item15 +
        data.item16 +
        data.item17 +
        data.item18 +
        data.item19 +
        data.item20;

      const checkSession = await this.session.getSessionById({
        session_id: data.session_id,
      });

      if (checkSession.length === 0) {
        return { message: 'Session not found', error: -1 };
      }

      const checkFeedBackSessionId = await this.getFeedbackById({
        session_id: data.session_id,
        form_id: 22,
      });

      if (checkFeedBackSessionId.length > 0) {
        return {
          message: 'Feedback already exists for this session',
          error: -1,
        };
      }

      const recFeedback = await this.postFeedback({
        session_id: data.session_id,
        client_id: data.client_id,
        feedback_json: data,
        form_id: 22,
      });

      console.log('recFeedback');
      console.log(recFeedback);

      if (recFeedback.error) {
        return recFeedback;
      }

      const tmpPCL5Feedback = {
        total_score: total,
        feedback_id: recFeedback.rec[0],
      };

      const postPCL5Feedback = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('feedback_pcl5')
        .insert(tmpPCL5Feedback);

      if (!postPCL5Feedback) {
        logger.error('Error creating feedback');
        return { message: 'Error creating feedback', error: -1 };
      }

      return { message: 'Feedback created successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error creating feedback', error: -1 };
    }
  }

  //////////////////////////////////////////

  async postWHODASFeedback(data) {
    try {
      let total = 0;
      //avg of 6 items (Understanding and communicating)
      let d1_avg =
        (data.item1 +
          data.item2 +
          data.item3 +
          data.item4 +
          data.item5 +
          data.item6) /
        6;
      //avg of 5 items (Getting around)
      let d2_avg =
        (data.item7 + data.item8 + data.item9 + data.item10 + data.item11) / 5;
      //avg of 4 items (Self-care)
      let d3_avg = (data.item12 + data.item13 + data.item14 + data.item15) / 4;
      //avg of 5 items (Getting along with people)
      let d4_avg =
        (data.item16 + data.item17 + data.item18 + data.item19 + data.item20) /
        5;
      //avg of 8 items (Life activities)
      let d5_avg =
        (data.item21 +
          data.item22 +
          data.item23 +
          data.item24 +
          data.item25 +
          data.item26 +
          data.item27 +
          data.item28) /
        8;
      //avg of 8 items (Participation in society)
      let d6_avg =
        (data.item29 +
          data.item30 +
          data.item31 +
          data.item32 +
          data.item33 +
          data.item34 +
          data.item35 +
          data.item36) /
        8;

      total +=
        data.item1 +
        data.item2 +
        data.item3 +
        data.item4 +
        data.item5 +
        data.item6 +
        data.item7 +
        data.item8 +
        data.item9 +
        data.item10 +
        data.item11 +
        data.item12 +
        data.item13 +
        data.item14 +
        data.item15 +
        data.item16 +
        data.item17 +
        data.item18 +
        data.item19 +
        data.item20 +
        data.item21 +
        data.item22 +
        data.item23 +
        data.item24 +
        data.item25 +
        data.item26 +
        data.item27 +
        data.item28 +
        data.item29 +
        data.item30 +
        data.item31 +
        data.item32 +
        data.item33 +
        data.item34 +
        data.item35 +
        data.item36;

      let overall_score = (total / 144) * 100;

      const checkSession = await this.session.getSessionById({
        session_id: data.session_id,
      });

      if (checkSession.length === 0) {
        return { message: 'Session not found', error: -1 };
      }

      const checkFeedBackSessionId = await this.getFeedbackById({
        session_id: data.session_id,
        form_id: 17,
      });

      if (checkFeedBackSessionId.length > 0) {
        return {
          message: 'Feedback already exists for this session',
          error: -1,
        };
      }

      const recFeedback = await this.postFeedback({
        session_id: data.session_id,
        client_id: data.client_id,
        feedback_json: data,
        form_id: 17,
      });

      console.log('recFeedback');
      console.log(recFeedback);

      if (recFeedback.error) {
        return recFeedback;
      }

      const tmpWHODASFeedback = {
        understandingAndCommunicating: d1_avg,
        gettingAround: d2_avg,
        selfCare: d3_avg,
        gettingAlongWithPeople: d4_avg,
        lifeActivities: d5_avg,
        participationInSociety: d6_avg,
        overallScore: overall_score,
        difficultyDays: data.difficultyDays,
        unableDays: data.unableDays,
        healthConditionDays: data.healthConditionDays,
        feedback_id: recFeedback.rec[0],
      };

      const postWHODASFeedback = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('feedback_whodas')
        .insert(tmpWHODASFeedback);

      if (!postWHODASFeedback) {
        logger.error('Error creating feedback');
        return { message: 'Error creating feedback', error: -1 };
      }

      return { message: 'Feedback created successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error creating feedback', error: -1 };
    }
  }

  //////////////////////////////////////////

  async postIPFSFeedback(data) {
    try {
      //avg for Romantic Relationship with Spouse or Partner
      let d1_avg =
        (6 -
          data.item1 +
          (6 - data.item2) +
          data.item3 +
          (6 - data.item4) +
          data.item5 +
          (6 - data.item6) +
          data.item7 +
          (6 - data.item8) +
          (6 - data.item9) +
          (6 - data.item10) +
          data.item11) /
        11;

      //avg for Family Relationship
      let d2_avg =
        (6 -
          data.item12 +
          (6 - data.item13) +
          (6 - data.item14) +
          data.item15 +
          data.item16 +
          data.item17 +
          data.item18) /
        7;

      //avg for Work Relationship
      let d3_avg =
        (data.item19 +
          (6 - data.item20) +
          (6 - data.item21) +
          (6 - data.item22) +
          data.item23 +
          (6 - data.item24) +
          (6 - data.item25) +
          data.item26 +
          (6 - data.item27) +
          (6 - data.item28) +
          (6 - data.item29) +
          (6 - data.item30) +
          (6 - data.item31) +
          (6 - data.item32) +
          (6 - data.item33) +
          (6 - data.item34) +
          (6 - data.item35) +
          (6 - data.item36) +
          (6 - data.item37) +
          data.item38 +
          data.item39) /
        21;

      //avg for Social and Friendship Relationship
      let d4_avg =
        (6 -
          data.item40 +
          (6 - data.item41) +
          (6 - data.item42) +
          (6 - data.item43) +
          data.item44 +
          data.item45 +
          data.item46 +
          data.item47) /
        8;

      //avg for Parenting Relationship
      let d5_avg =
        (6 -
          data.item48 +
          (6 - data.item49) +
          data.item50 +
          (6 - data.item51) +
          (6 - data.item52) +
          (6 - data.item53) +
          (6 - data.item54) +
          (6 - data.item55) +
          data.item56 +
          data.item57) /
        10;

      //avg for Educational Relationship
      let d6_avg =
        (6 -
          data.item58 +
          (6 - data.item59) +
          (6 - data.item60) +
          data.item61 +
          data.item62 +
          (6 - data.item63) +
          (6 - data.item64) +
          (6 - data.item65) +
          data.item66 +
          data.item67 +
          (6 - data.item68) +
          (6 - data.item69) +
          (6 - data.item70) +
          (6 - data.item71) +
          (6 - data.item72)) /
        15;

      //avg for Self-care Relationship
      let d7_avg =
        (data.item73 +
          (6 - data.item74) +
          data.item75 +
          (6 - data.item76) +
          data.item77 +
          data.item78 +
          (6 - data.item79) +
          (6 - data.item80)) /
        8;

      const checkSession = await this.session.getSessionById({
        session_id: data.session_id,
      });

      if (checkSession.length === 0) {
        return { message: 'Session not found', error: -1 };
      }

      const checkFeedBackSessionId = await this.getFeedbackById({
        session_id: data.session_id,
        form_id: 19,
      });

      if (checkFeedBackSessionId.length > 0) {
        return {
          message: 'Feedback already exists for this session',
          error: -1,
        };
      }

      const recFeedback = await this.postFeedback({
        session_id: data.session_id,
        client_id: data.client_id,
        feedback_json: data,
        form_id: 19,
      });

      if (recFeedback.error) {
        return recFeedback;
      }

      // Insert the IPFS feedback into the database
      const tmpIPFSFeedback = {
        romantic_scale_score: d1_avg,
        family_scale_score: d2_avg,
        work_scale_score: d3_avg,
        friendships_socializing_scale_score: d4_avg,
        parenting_scale_score: d5_avg,
        education_scale_score: d6_avg,
        self_care_scale: d7_avg,
        feedback_id: recFeedback.rec[0],
      };

      const postIPFSFeedback = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('feedback_ipf')
        .insert(tmpIPFSFeedback);

      if (!postIPFSFeedback) {
        logger.error('Error creating IPFS feedback');
        return { message: 'Error creating IPFS feedback', error: -1 };
      }

      return { message: 'IPFS feedback created successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error creating IPFS feedback', error: -1 };
    }
  }

  //////////////////////////////////////////

  async postSMARTGOALFeedback(data) {
    try {
      const checkSession = await this.session.getSessionById({
        session_id: data.session_id,
      });

      if (checkSession.length === 0) {
        return { message: 'Session not found', error: -1 };
      }

      const checkFeedBackSessionId = await this.getFeedbackById({
        session_id: data.session_id,
        form_id: 16,
      });

      if (checkFeedBackSessionId.length > 0) {
        return {
          message: 'Feedback already exists for this session',
          error: -1,
        };
      }

      const recFeedback = await this.postFeedback({
        session_id: data.session_id,
        client_id: data.client_id,
        feedback_json: data,
        form_id: 16,
      });

      if (recFeedback.error) {
        return recFeedback;
      }

      const tmpSMARTGOALFeedback = {
        feedback_id: recFeedback.rec[0],
        ...(data.specific_1st_phase && {
          specific_1st_phase: data.specific_1st_phase,
        }),
        ...(data.specific_2nd_phase && {
          specific_2nd_phase: data.specific_2nd_phase,
        }),
        ...(data.specific_3rd_phase && {
          specific_3rd_phase: data.specific_3rd_phase,
        }),
        ...(data.measurable_1st_phase && {
          measurable_1st_phase: data.measurable_1st_phase,
        }),
        ...(data.measurable_2nd_phase && {
          measurable_2nd_phase: data.measurable_2nd_phase,
        }),
        ...(data.measurable_3rd_phase && {
          measurable_3rd_phase: data.measurable_3rd_phase,
        }),
        ...(data.achievable_1st_phase && {
          achievable_1st_phase: data.achievable_1st_phase,
        }),
        ...(data.achievable_2nd_phase && {
          achievable_2nd_phase: data.achievable_2nd_phase,
        }),
        ...(data.achievable_3rd_phase && {
          achievable_3rd_phase: data.achievable_3rd_phase,
        }),
        ...(data.relevant_1st_phase && {
          relevant_1st_phase: data.relevant_1st_phase,
        }),
        ...(data.relevant_2nd_phase && {
          relevant_2nd_phase: data.relevant_2nd_phase,
        }),
        ...(data.relevant_3rd_phase && {
          relevant_3rd_phase: data.relevant_3rd_phase,
        }),
        ...(data.time_bound_1st_phase && {
          time_bound_1st_phase: data.time_bound_1st_phase,
        }),
        ...(data.time_bound_2nd_phase && {
          time_bound_2nd_phase: data.time_bound_2nd_phase,
        }),
        ...(data.time_bound_3rd_phase && {
          time_bound_3rd_phase: data.time_bound_3rd_phase,
        }),
      };

      const postSMARTGOALFeedback = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('feedback_smart_goal')
        .insert(tmpSMARTGOALFeedback);

      if (!postSMARTGOALFeedback) {
        logger.error('Error creating feedback');
        return { message: 'Error creating feedback', error: -1 };
      }

      return { message: 'Feedback created successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error creating feedback', error: -1 };
    }
  }

  //////////////////////////////////////////

  async postCONSENTFeedback(data) {
    try {
      const checkFeedBackSessionId = await this.getFeedbackById({
        client_id: data.client_id,
        form_id: 23,
      });

      if (checkFeedBackSessionId.length > 0) {
        return {
          message: 'Feedback already exists for this session',
          error: -1,
        };
      }

      const recFeedback = await this.postFeedback({
        client_id: data.client_id,
        feedback_json: data,
        form_id: 23,
      });

      if (recFeedback.error) {
        return recFeedback;
      }

      const tmpCONSENTFeedback = {
        feedback_id: recFeedback.rec[0],
        imgBase64: data.imgBase64,
      };

      const postCONSENTFeedback = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('feedback_consent')
        .insert(tmpCONSENTFeedback);

      if (!postCONSENTFeedback) {
        logger.error('Error creating feedback');
        return { message: 'Error creating feedback', error: -1 };
      }

      return { message: 'Feedback created successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error creating feedback', error: -1 };
    }
  }
}
