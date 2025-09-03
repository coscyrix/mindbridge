import DBconn from '../config/db.config.js';
import knex from 'knex';
import logger from '../config/winston.js';
import Session from './session.js';
import UserForm from './userForm.js';
import UserTargetOutcome from './userTargetOutcome.js';

const db = knex(DBconn.dbConn.development);

export default class Feedback {
  //////////////////////////////////////////
  constructor() {
    this.session = new Session();
    this.userForm = new UserForm();
    this.userTargetOutcome = new UserTargetOutcome();
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
        tenant_id: data.tenant_id,
      };

      const postFeedback = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('feedback')
        .insert(tmpFeedback);

      if (!postFeedback) {
        logger.error('Error creating feedback');
        return { message: 'Error creating feedback', error: -1 };
      }

      // Update form submission status based on environment variable
      const formMode = process.env.FORM_MODE || 'auto';
      
      // Only update treatment target session forms if session_id is provided
      if (data.session_id && formMode === 'treatment_target') {
        // Treatment target mode: update treatment target session forms
        console.log('Treatment target mode - importing TreatmentTargetSessionForms');
        const TreatmentTargetSessionForms = (await import('./treatmentTargetSessionForms.js')).default;
        console.log('TreatmentTargetSessionForms imported:', typeof TreatmentTargetSessionForms);
        const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
        console.log('treatmentTargetSessionForms instance created:', typeof treatmentTargetSessionForms);
        
        try {
          console.log('Calling updateTreatmentTargetSessionFormBySessionIdAndFormId with data:', {
            session_id: data.session_id,
            form_id: data.form_id,
            form_submit: true,
          });
          
          const updateTreatmentTargetForm = await treatmentTargetSessionForms.updateTreatmentTargetSessionFormBySessionIdAndFormId({
            session_id: data.session_id,
            form_id: data.form_id,
            form_submit: true,
          });

          console.log('updateTreatmentTargetForm result:', updateTreatmentTargetForm);

          if (updateTreatmentTargetForm?.error) {
            logger.error('Error updating treatment target session form:', updateTreatmentTargetForm.message);
            return { message: 'Error updating treatment target session forms', error: -1 };
          }
        } catch (updateError) {
          console.log('Exception in updateTreatmentTargetSessionFormBySessionIdAndFormId:', updateError);
          logger.error('Exception updating treatment target session form:', updateError);
          return { message: 'Error updating treatment target session forms', error: -1 };
        }
      } else {
        // Service mode or auto mode: update user forms (service-based forms)
        const updateUserForm =
          await this.userForm.putUserFormBySessionIdAndFormID({
            client_id: data.client_id,
            session_id: data.session_id,
            form_id: data.form_id,
            form_submit: true,
          });

        if (updateUserForm?.error) {
          logger.error('Error updating user form');
          return { message: 'Error updating user form', error: -1 };
        }
        
        // In auto mode, also try to update treatment target forms if they exist
        if (data.session_id && formMode === 'auto') {
          try {
            const TreatmentTargetSessionForms = (await import('./treatmentTargetSessionForms.js')).default;
            const treatmentTargetSessionForms = new TreatmentTargetSessionForms();
            
            const updateTreatmentTargetForm = await treatmentTargetSessionForms.updateTreatmentTargetSessionFormBySessionIdAndFormId({
              session_id: data.session_id,
              form_id: data.form_id,
              form_submit: true,
            });

            console.log('Auto mode updateTreatmentTargetForm result:', updateTreatmentTargetForm);

            // Don't return error for treatment target forms in auto mode, just log it
            if (updateTreatmentTargetForm?.error) {
              logger.error('Error updating treatment target session form in auto mode:', updateTreatmentTargetForm.message);
            }
          } catch (updateError) {
            console.log('Exception in auto mode updateTreatmentTargetSessionFormBySessionIdAndFormId:', updateError);
            logger.error('Exception updating treatment target session form in auto mode:', updateError);
          }
        }
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
      // Get form mode from environment variable
      const formMode = process.env.FORM_MODE || 'auto';
      
      let query;

      console.log('formMode', formMode);
      

      if (formMode === 'treatment_target') {
        // Treatment target mode: query treatment target session forms
        query = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('treatment_target_session_forms as tt')
          .join('user_profile as client', 'tt.client_id', 'client.user_profile_id')
          .join('forms as fm', 'tt.form_id', 'fm.form_id')
          .join('feedback as f', function() {
            this.on('f.session_id', '=', 'tt.session_id')
                .andOn('f.form_id', '=', 'tt.form_id');
          })
          .leftJoin('v_session as vs', 'f.session_id', 'vs.session_id')
          .select(
            'f.feedback_id',
            'f.session_id',
            'vs.intake_date as session_dte',
            'f.form_id',
            'fm.form_cde',
            'f.client_id',
            'f.feedback_json',
            'f.status_yn',
            db.raw(`(select json_arrayagg(json_object('id',fg.id,'total_points',fg.total_points,'feedback_id',fg.feedback_id,'created_at',fg.created_at,'updated_at',fg.updated_at)) from feedback_gad fg where (fg.feedback_id = f.feedback_id)) as feedback_gad`),
            db.raw(`(select json_arrayagg(json_object('id',fi.id,'romantic_scale_score',fi.romantic_scale_score,'family_scale_score',fi.family_scale_score,'work_scale_score',fi.work_scale_score,'friendships_socializing_scale_score',fi.friendships_socializing_scale_score,'parenting_scale_score',fi.parenting_scale_score,'education_scale_score',fi.education_scale_score,'self_care_scale',fi.self_care_scale,'feedback_id',fi.feedback_id,'created_at',fi.created_at,'updated_at',fi.updated_at)) from feedback_ipf fi where (fi.feedback_id = f.feedback_id)) as feedback_ipf`),
            db.raw(`(select json_arrayagg(json_object('id',fp.id,'total_score',fp.total_score,'difficulty_score',fp.difficulty_score,'feedback_id',fp.feedback_id,'created_at',fp.created_at,'updated_at',fp.updated_at)) from feedback_phq9 fp where (fp.feedback_id = f.feedback_id)) as feedback_phq9`),
            db.raw(`(select json_arrayagg(json_object('id',fw.id,'understanding_and_communicating',fw.understandingAndCommunicating,'getting_around',fw.gettingAround,'self_care',fw.selfCare,'getting_along_with_people',fw.gettingAlongWithPeople,'life_activities',fw.lifeActivities,'participation_in_society',fw.participationInSociety,'overall_score',fw.overallScore,'difficulty_days',fw.difficultyDays,'unable_days',fw.unableDays,'health_condition_days',fw.healthConditionDays,'feedback_id',fw.feedback_id,'created_at',fw.created_at,'updated_at',fw.updated_at)) from feedback_whodas fw where (fw.feedback_id = f.feedback_id)) as feedback_whodas`),
            db.raw(`(select json_arrayagg(json_object('id',pcl.id,'total_score',pcl.total_score,'feedback_id',pcl.feedback_id,'created_at',pcl.created_at,'updated_at',pcl.updated_at)) from feedback_pcl5 pcl where (pcl.feedback_id = f.feedback_id)) as feedback_pcl5`),
            db.raw(`(select json_arrayagg(json_object('id',sg.id,'feedback_id',sg.feedback_id,'specific_1st_phase',sg.specific_1st_phase,'specific_2nd_phase',sg.specific_2nd_phase,'specific_3rd_phase',sg.specific_3rd_phase,'measurable_1st_phase',sg.measurable_1st_phase,'measurable_2nd_phase',sg.measurable_2nd_phase,'measurable_3rd_phase',sg.measurable_3rd_phase,'achievable_1st_phase',sg.achievable_1st_phase,'achievable_2nd_phase',sg.achievable_2nd_phase,'achievable_3rd_phase',sg.achievable_3rd_phase,'relevant_1st_phase',sg.relevant_1st_phase,'relevant_2nd_phase',sg.relevant_2nd_phase,'relevant_3rd_phase',sg.relevant_3rd_phase,'time_bound_1st_phase',sg.time_bound_1st_phase,'time_bound_2nd_phase',sg.time_bound_2nd_phase,'time_bound_3rd_phase',sg.time_bound_3rd_phase,'created_at',sg.created_at,'updated_at',sg.updated_at)) from feedback_smart_goal sg where (sg.feedback_id = f.feedback_id)) as feedback_smart_goal`),
            db.raw(`(select json_arrayagg(json_object('id',fc.id,'feedback_id',fc.feedback_id,'imgBase64',fc.imgBase64,'status_yn',fc.status_yn,'created_at',fc.created_at,'updated_at',fc.updated_at)) from feedback_consent fc where (fc.feedback_id = f.feedback_id)) as feedback_consent`),
            db.raw(`(select json_arrayagg(json_object('id',fa.id,'total_sessions',fa.total_sessions,'total_attended_sessions',fa.total_attended_sessions,'total_cancelled_sessions',fa.total_cancelled_sessions,'status_yn',fa.status_yn,'created_at',fa.created_at,'updated_at',fa.updated_at)) from feedback_attendance fa where (fa.feedback_id = f.feedback_id)) as feedback_attendance`),
            'f.created_at',
            'f.updated_at',
            'tt.tenant_id'
          )
          .where('tt.is_sent', 1);

        // Apply filters for treatment target mode
        if (data.feedback_id) {
          query = query.where('f.feedback_id', data.feedback_id);
        }
        if (data.session_id) {
          query = query.where('f.session_id', data.session_id);
        }
        if (data.form_id) {
          query = query.where('f.form_id', data.form_id);
        }
        if (data.client_id) {
          query = query.where('f.client_id', data.client_id);
        }
        if (data.tenant_id) {
          query = query.where('tt.tenant_id', data.tenant_id);
        }

        // Execute treatment target query
        const treatmentTargetResults = await query;

        // Now get consent forms separately using UNION
        let consentQuery = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('feedback_consent as fc')
          .join('feedback as f', 'fc.feedback_id', 'f.feedback_id')
          .leftJoin('v_session as vs', 'f.session_id', 'vs.session_id')
          .select(
            'f.feedback_id',
            'f.session_id',
            'vs.intake_date as session_dte',
            'f.form_id',
            db.raw("'CONSENT' as form_cde"),
            'f.client_id',
            'f.feedback_json',
            'f.status_yn',
            db.raw(`(select json_arrayagg(json_object('id',fg.id,'total_points',fg.total_points,'feedback_id',fg.feedback_id,'created_at',fg.created_at,'updated_at',fg.updated_at)) from feedback_gad fg where (fg.feedback_id = f.feedback_id)) as feedback_gad`),
            db.raw(`(select json_arrayagg(json_object('id',fi.id,'romantic_scale_score',fi.romantic_scale_score,'family_scale_score',fi.family_scale_score,'work_scale_score',fi.work_scale_score,'friendships_socializing_scale_score',fi.friendships_socializing_scale_score,'parenting_scale_score',fi.parenting_scale_score,'education_scale_score',fi.education_scale_score,'self_care_scale',fi.self_care_scale,'feedback_id',fi.feedback_id,'created_at',fi.created_at,'updated_at',fi.updated_at)) from feedback_ipf fi where (fi.feedback_id = f.feedback_id)) as feedback_ipf`),
            db.raw(`(select json_arrayagg(json_object('id',fp.id,'total_score',fp.total_score,'difficulty_score',fp.difficulty_score,'feedback_id',fp.feedback_id,'created_at',fp.created_at,'updated_at',fp.updated_at)) from feedback_phq9 fp where (fp.feedback_id = f.feedback_id)) as feedback_phq9`),
            db.raw(`(select json_arrayagg(json_object('id',fw.id,'understanding_and_communicating',fw.understandingAndCommunicating,'getting_around',fw.gettingAround,'self_care',fw.selfCare,'getting_along_with_people',fw.gettingAlongWithPeople,'life_activities',fw.lifeActivities,'participation_in_society',fw.participationInSociety,'overall_score',fw.overallScore,'difficulty_days',fw.difficultyDays,'unable_days',fw.unableDays,'health_condition_days',fw.healthConditionDays,'feedback_id',fw.feedback_id,'created_at',fw.created_at,'updated_at',fw.updated_at)) from feedback_whodas fw where (fw.feedback_id = f.feedback_id)) as feedback_whodas`),
            db.raw(`(select json_arrayagg(json_object('id',pcl.id,'total_score',pcl.total_score,'feedback_id',pcl.feedback_id,'created_at',pcl.created_at,'updated_at',pcl.updated_at)) from feedback_pcl5 pcl where (pcl.feedback_id = f.feedback_id)) as feedback_pcl5`),
            db.raw(`(select json_arrayagg(json_object('id',sg.id,'feedback_id',sg.feedback_id,'specific_1st_phase',sg.specific_1st_phase,'specific_2nd_phase',sg.specific_2nd_phase,'specific_3rd_phase',sg.specific_3rd_phase,'measurable_1st_phase',sg.measurable_1st_phase,'measurable_2nd_phase',sg.measurable_2nd_phase,'measurable_3rd_phase',sg.measurable_3rd_phase,'achievable_1st_phase',sg.achievable_1st_phase,'achievable_2nd_phase',sg.achievable_2nd_phase,'achievable_3rd_phase',sg.achievable_3rd_phase,'relevant_1st_phase',sg.relevant_1st_phase,'relevant_2nd_phase',sg.relevant_2nd_phase,'relevant_3rd_phase',sg.relevant_3rd_phase,'time_bound_1st_phase',sg.time_bound_1st_phase,'time_bound_2nd_phase',sg.time_bound_2nd_phase,'time_bound_3rd_phase',sg.time_bound_3rd_phase,'created_at',sg.created_at,'updated_at',sg.updated_at)) from feedback_smart_goal sg where (sg.feedback_id = f.feedback_id)) as feedback_smart_goal`),
            db.raw(`(select json_arrayagg(json_object('id',fc.id,'feedback_id',fc.feedback_id,'imgBase64',fc.imgBase64,'status_yn',fc.status_yn,'created_at',fc.created_at,'updated_at',fc.updated_at)) from feedback_consent fc2 where (fc2.feedback_id = f.feedback_id)) as feedback_consent`),
            db.raw(`(select json_arrayagg(json_object('id',fa.id,'total_sessions',fa.total_sessions,'total_attended_sessions',fa.total_attended_sessions,'total_cancelled_sessions',fa.total_cancelled_sessions,'status_yn',fa.status_yn,'created_at',fa.created_at,'updated_at',fa.updated_at)) from feedback_attendance fa where (fa.feedback_id = f.feedback_id)) as feedback_attendance`),
            'f.created_at',
            'f.updated_at',
            db.raw('NULL as tenant_id')
          )
          .where('fc.status_yn', 'y');

        // Apply filters for consent query
        if (data.feedback_id) {
          consentQuery = consentQuery.where('f.feedback_id', data.feedback_id);
        }
        if (data.session_id) {
          consentQuery = consentQuery.where('f.session_id', data.session_id);
        }
        if (data.client_id) {
          consentQuery = consentQuery.where('f.client_id', data.client_id);
        }

        // Execute consent query
        const consentResults = await consentQuery;

        // Filter out null/empty consent results and only include when feedback_id is not specified
        // or when consent forms actually exist
        const validConsentResults = consentResults.filter(result => 
          result.feedback_id !== null && 
          result.form_id !== null && 
          result.client_id !== null
        );

        // Only include consent results if they're valid or if we're not filtering by specific feedback_id
        const combinedResults = data.feedback_id 
          ? [...treatmentTargetResults] // Only include treatment target results when filtering by feedback_id
          : [...treatmentTargetResults, ...validConsentResults]; // Include both when not filtering

        // Check if feedback already exists for this session
        if (data.is_submitted) {
          if (data.client_id && data.form_id && data.session_id) {
            const existingFeedback = combinedResults.filter(feedback => 
              feedback.client_id === data.client_id && 
              feedback.form_id === data.form_id && 
              feedback.session_id === data.session_id
            );

            if (existingFeedback && existingFeedback.length > 0) {
              return {
                message: 'Feedback already exists for this session',
                error: -1,
              };
            }
          }
        }

        // Return single object if only one result, otherwise return array
        return { 
          rec: combinedResults.length === 1 ? combinedResults[0] : combinedResults 
        };

      } else {
        // Service mode or auto mode: query user forms (service-based forms)
        query = db
          .withSchema(`${process.env.MYSQL_DATABASE}`)
          .from('feedback as f')
          .leftJoin('forms as fm', 'f.form_id', 'fm.form_id')
          .leftJoin('v_session as vs', 'f.session_id', 'vs.session_id')
          .select(
            'f.feedback_id',
            'f.session_id',
            'vs.intake_date as session_dte',
            'f.form_id',
            'fm.form_cde',
            'f.client_id',
            'f.feedback_json',
            'f.status_yn',
            db.raw(`(select json_arrayagg(json_object('id',fg.id,'total_points',fg.total_points,'feedback_id',fg.feedback_id,'created_at',fg.created_at,'updated_at',fg.updated_at)) from feedback_gad fg where (fg.feedback_id = f.feedback_id)) as feedback_gad`),
            db.raw(`(select json_arrayagg(json_object('id',fi.id,'romantic_scale_score',fi.romantic_scale_score,'family_scale_score',fi.family_scale_score,'work_scale_score',fi.work_scale_score,'friendships_socializing_scale_score',fi.friendships_socializing_scale_score,'parenting_scale_score',fi.parenting_scale_score,'education_scale_score',fi.education_scale_score,'self_care_scale',fi.self_care_scale,'feedback_id',fi.feedback_id,'created_at',fi.created_at,'updated_at',fi.updated_at)) from feedback_ipf fi where (fi.feedback_id = f.feedback_id)) as feedback_ipf`),
            db.raw(`(select json_arrayagg(json_object('id',fp.id,'total_score',fp.total_score,'difficulty_score',fp.difficulty_score,'feedback_id',fp.feedback_id,'created_at',fp.created_at,'updated_at',fp.updated_at)) from feedback_phq9 fp where (fp.feedback_id = f.feedback_id)) as feedback_phq9`),
            db.raw(`(select json_arrayagg(json_object('id',fw.id,'understanding_and_communicating',fw.understandingAndCommunicating,'getting_around',fw.gettingAround,'self_care',fw.selfCare,'getting_along_with_people',fw.gettingAlongWithPeople,'life_activities',fw.lifeActivities,'participation_in_society',fw.participationInSociety,'overall_score',fw.overallScore,'difficulty_days',fw.difficultyDays,'unable_days',fw.unableDays,'health_condition_days',fw.healthConditionDays,'feedback_id',fw.feedback_id,'created_at',fw.created_at,'updated_at',fw.updated_at)) from feedback_whodas fw where (fw.feedback_id = f.feedback_id)) as feedback_whodas`),
            db.raw(`(select json_arrayagg(json_object('id',pcl.id,'total_score',pcl.total_score,'feedback_id',pcl.feedback_id,'created_at',pcl.created_at,'updated_at',pcl.updated_at)) from feedback_pcl5 pcl where (pcl.feedback_id = f.feedback_id)) as feedback_pcl5`),
            db.raw(`(select json_arrayagg(json_object('id',sg.id,'feedback_id',sg.feedback_id,'specific_1st_phase',sg.specific_1st_phase,'specific_2nd_phase',sg.specific_2nd_phase,'specific_3rd_phase',sg.specific_3rd_phase,'measurable_1st_phase',sg.measurable_1st_phase,'measurable_2nd_phase',sg.measurable_2nd_phase,'measurable_3rd_phase',sg.measurable_3rd_phase,'achievable_1st_phase',sg.achievable_1st_phase,'achievable_2nd_phase',sg.achievable_2nd_phase,'achievable_3rd_phase',sg.achievable_3rd_phase,'relevant_1st_phase',sg.relevant_1st_phase,'relevant_2nd_phase',sg.relevant_2nd_phase,'relevant_3rd_phase',sg.relevant_3rd_phase,'time_bound_1st_phase',sg.time_bound_1st_phase,'time_bound_2nd_phase',sg.time_bound_2nd_phase,'time_bound_3rd_phase',sg.time_bound_3rd_phase,'created_at',sg.created_at,'updated_at',sg.updated_at)) from feedback_smart_goal sg where (sg.feedback_id = f.feedback_id)) as feedback_smart_goal`),
            db.raw(`(select json_arrayagg(json_object('id',fc.id,'feedback_id',fc.feedback_id,'imgBase64',fc.imgBase64,'status_yn',fc.status_yn,'created_at',fc.created_at,'updated_at',fc.updated_at)) from feedback_consent fc where (fc.feedback_id = f.feedback_id)) as feedback_consent`),
            db.raw(`(select json_arrayagg(json_object('id',fa.id,'total_sessions',fa.total_sessions,'total_attended_sessions',fa.total_attended_sessions,'total_cancelled_sessions',fa.total_cancelled_sessions,'status_yn',fa.status_yn,'created_at',fa.created_at,'updated_at',fa.updated_at)) from feedback_attendance fa where (fa.feedback_id = f.feedback_id)) as feedback_attendance`),
            'f.created_at',
            'f.updated_at',
            'f.tenant_id'
          )
          .where('f.status_yn', 'y');

        // Check if feedback already exists for this session
        if (data.is_submitted) {
          if (data.client_id && data.form_id && data.session_id) {
            const existingFeedback = await query.clone()
              .where('f.client_id', data.client_id)
              .andWhere('f.form_id', data.form_id)
              .andWhere('f.session_id', data.session_id);

            if (existingFeedback && existingFeedback.length > 0) {
              return {
                message: 'Feedback already exists for this session',
                error: -1,
              };
            }
          }
        }

        // Apply filters
        if (data.feedback_id) {
          query = query.where('f.feedback_id', data.feedback_id);
        }
        if (data.session_id) {
          query = query.where('f.session_id', data.session_id);
        }
        if (data.form_id) {
          query = query.where('f.form_id', data.form_id);
        }
        if (data.client_id) {
          query = query.where('f.client_id', data.client_id);
        }
        if (data.tenant_id) {
          query = query.where('f.tenant_id', data.tenant_id);
        }

        const results = await query;
        
        // Return single object if only one result, otherwise return array
        return { 
          rec: results.length === 1 ? results[0] : results 
        };
      }
    } catch (error) {
      console.error('Error in getFeedbackById:', error);
      return { message: 'Error fetching feedback', error: -1 };
    }
  }

  //////////////////////////////////////////

  async postGAD7Feedback(data) {
    try {
      // Convert all item values to numbers to avoid string concatenation
      const items = {};
      for (let i = 1; i <= 7; i++) {
        items['item' + i] = Number(data['item' + i]);
      }

      let total = 0;
      total +=
        items.item1 +
        items.item2 +
        items.item3 +
        items.item4 +
        items.item5 +
        items.item6 +
        items.item7;

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
        tenant_id: data.tenant_id,
      });

      console.log('recFeedback');
      console.log(recFeedback);

      if (recFeedback.error) {
        return recFeedback;
      }

      const tmpGAD7Feedback = {
        total_points: total,
        feedback_id: recFeedback.rec[0],
        tenant_id: data.tenant_id,
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
      // Convert all item values to numbers to avoid string concatenation
      const items = {};
      for (let i = 1; i <= 9; i++) {
        items['item' + i] = Number(data['item' + i]);
      }

      let total = 0;
      total +=
        items.item1 +
        items.item2 +
        items.item3 +
        items.item4 +
        items.item5 +
        items.item6 +
        items.item7 +
        items.item8 +
        items.item9;

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
        tenant_id: data.tenant_id,
      });

      if (recFeedback.error) {
        return recFeedback;
      }

      const tmpGAD7Feedback = {
        total_score: total,
        difficulty_score: data.difficulty_score,
        feedback_id: recFeedback.rec[0],
        tenant_id: data.tenant_id,
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
      // Convert all item values to numbers to avoid string concatenation
      const items = {};
      for (let i = 1; i <= 20; i++) {
        items['item' + i] = Number(data['item' + i]);
      }

      let total = 0;
      total +=
        items.item1 +
        items.item2 +
        items.item3 +
        items.item4 +
        items.item5 +
        items.item6 +
        items.item7 +
        items.item8 +
        items.item9 +
        items.item10 +
        items.item11 +
        items.item12 +
        items.item13 +
        items.item14 +
        items.item15 +
        items.item16 +
        items.item17 +
        items.item18 +
        items.item19 +
        items.item20;

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
        tenant_id: data.tenant_id,
      });

      if (recFeedback.error) {
        return recFeedback;
      }

      const tmpPCL5Feedback = {
        total_score: total,
        feedback_id: recFeedback.rec[0],
        tenant_id: data.tenant_id,
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
      // Convert all item values to numbers to avoid string concatenation
      const items = {};
      for (let i = 1; i <= 36; i++) {
        items['item' + i] = Number(data['item' + i]);
      }

      let total = 0;
      //avg of 6 items (Understanding and communicating)
      let d1_avg =
        (items.item1 +
          items.item2 +
          items.item3 +
          items.item4 +
          items.item5 +
          items.item6) /
        6;
      //avg of 5 items (Getting around)
      let d2_avg =
        (items.item7 +
          items.item8 +
          items.item9 +
          items.item10 +
          items.item11) /
        5;
      //avg of 4 items (Self-care)
      let d3_avg =
        (items.item12 + items.item13 + items.item14 + items.item15) / 4;
      //avg of 5 items (Getting along with people)
      let d4_avg =
        (items.item16 +
          items.item17 +
          items.item18 +
          items.item19 +
          items.item20) /
        5;
      //avg of 8 items (Life activities)
      let d5_avg =
        (items.item21 +
          items.item22 +
          items.item23 +
          items.item24 +
          items.item25 +
          items.item26 +
          items.item27 +
          items.item28) /
        8;
      //avg of 8 items (Participation in society)
      let d6_avg =
        (items.item29 +
          items.item30 +
          items.item31 +
          items.item32 +
          items.item33 +
          items.item34 +
          items.item35 +
          items.item36) /
        8;

      total +=
        items.item1 +
        items.item2 +
        items.item3 +
        items.item4 +
        items.item5 +
        items.item6 +
        items.item7 +
        items.item8 +
        items.item9 +
        items.item10 +
        items.item11 +
        items.item12 +
        items.item13 +
        items.item14 +
        items.item15 +
        items.item16 +
        items.item17 +
        items.item18 +
        items.item19 +
        items.item20 +
        items.item21 +
        items.item22 +
        items.item23 +
        items.item24 +
        items.item25 +
        items.item26 +
        items.item27 +
        items.item28 +
        items.item29 +
        items.item30 +
        items.item31 +
        items.item32 +
        items.item33 +
        items.item34 +
        items.item35 +
        items.item36;

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
        tenant_id: data.tenant_id,
      });

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
        tenant_id: data.tenant_id,
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
      // Convert all item values to numbers to avoid string concatenation
      const items = {};
      for (let i = 1; i <= 80; i++) {
        items['item' + i] = Number(data['item' + i]);
      }

      //avg for Romantic Relationship with Spouse or Partner
      let d1_avg =
        (6 -
          items.item1 +
          (6 - items.item2) +
          items.item3 +
          (6 - items.item4) +
          items.item5 +
          (6 - items.item6) +
          items.item7 +
          (6 - items.item8) +
          (6 - items.item9) +
          (6 - items.item10) +
          items.item11) /
        11;

      //avg for Family Relationship
      let d2_avg =
        (6 -
          items.item12 +
          (6 - items.item13) +
          (6 - items.item14) +
          items.item15 +
          items.item16 +
          items.item17 +
          items.item18) /
        7;

      //avg for Work Relationship
      let d3_avg =
        (items.item19 +
          (6 - items.item20) +
          (6 - items.item21) +
          (6 - items.item22) +
          items.item23 +
          (6 - items.item24) +
          (6 - items.item25) +
          items.item26 +
          (6 - items.item27) +
          (6 - items.item28) +
          (6 - items.item29) +
          (6 - items.item30) +
          (6 - items.item31) +
          (6 - items.item32) +
          (6 - items.item33) +
          (6 - items.item34) +
          (6 - items.item35) +
          (6 - items.item36) +
          (6 - items.item37) +
          items.item38 +
          items.item39) /
        21;

      //avg for Social and Friendship Relationship
      let d4_avg =
        (6 -
          items.item40 +
          (6 - items.item41) +
          (6 - items.item42) +
          (6 - items.item43) +
          items.item44 +
          items.item45 +
          items.item46 +
          items.item47) /
        8;

      //avg for Parenting Relationship
      let d5_avg =
        (6 -
          items.item48 +
          (6 - items.item49) +
          items.item50 +
          (6 - items.item51) +
          (6 - items.item52) +
          (6 - items.item53) +
          (6 - items.item54) +
          (6 - items.item55) +
          items.item56 +
          items.item57) /
        10;

      //avg for Educational Relationship
      let d6_avg =
        (6 -
          items.item58 +
          (6 - items.item59) +
          (6 - items.item60) +
          items.item61 +
          items.item62 +
          (6 - items.item63) +
          (6 - items.item64) +
          (6 - items.item65) +
          items.item66 +
          items.item67 +
          (6 - items.item68) +
          (6 - items.item69) +
          (6 - items.item70) +
          (6 - items.item71) +
          (6 - items.item72)) /
        15;

      //avg for Self-care Relationship
      let d7_avg =
        (items.item73 +
          (6 - items.item74) +
          items.item75 +
          (6 - items.item76) +
          items.item77 +
          items.item78 +
          (6 - items.item79) +
          (6 - items.item80)) /
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
        tenant_id: data.tenant_id,
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
        tenant_id: data.tenant_id,
      };

      console.log('tmpIPFSFeedback', tmpIPFSFeedback);

      const postIPFSFeedback = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('feedback_ipf')
        .insert(tmpIPFSFeedback);

      if (!postIPFSFeedback) {
        logger.error('Error creating IPF feedback');
        return { message: 'Error creating IPF feedback', error: -1 };
      }

      return { message: 'IPF feedback created successfully' };
    } catch (error) {
      console.log(error);
      logger.error(error);
      return { message: 'Error creating IPF feedback', error: -1 };
    }
  }

  //////////////////////////////////////////

  async postATTENDANCEFeedback(data) {
    try {
      const checkSession = await this.session.getSessionById({
        session_id: data.session_id,
      });
      if (checkSession.length === 0) {
        return { message: 'Session not found', error: -1 };
      }
      const checkFeedBackSessionId = await this.getFeedbackById({
        session_id: data.session_id,
        form_id: 24,
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
        form_id: 24,
        tenant_id: data.tenant_id,
      });
      if (recFeedback.error) {
        return recFeedback;
      }
      const tmpATTENDANCEFeedback = {
        feedback_id: recFeedback.rec[0],
        total_sessions: data.total_sessions,
        total_attended_sessions: data.total_attended_sessions,
        total_cancelled_sessions: data.total_cancelled_sessions,
        tenant_id: data.tenant_id,
      };
      const postATTENDANCEFeedback = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('feedback_attendance')
        .insert(tmpATTENDANCEFeedback);
      if (!postATTENDANCEFeedback) {
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
        tenant_id: data.tenant_id,
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
        ...(data.tenant_id && { tenant_id: data.tenant_id }),
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
        tenant_id: data.tenant_id,
      });

      if (recFeedback.error) {
        return recFeedback;
      }

      const tmpCONSENTFeedback = {
        feedback_id: recFeedback.rec[0],
        imgBase64: data.imgBase64,
        tenant_id: data.tenant_id,
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
      console.log('error', error);
      
      return { message: 'Error creating feedbacks', error: -1 };
    }
  }

  //////////////////////////////////////////

  async postGASFeedback(data) {
    try {
      // Calculate total score from responses
      let totalScore = 0;
      data.responses.forEach(response => {
        totalScore += response.score;
      });

      const checkSession = await this.session.getSessionById({
        session_id: data.session_id,
      });

      if (checkSession.length === 0) {
        return { message: 'Session not found', error: -1 };
      }

      const checkFeedBackSessionId = await this.getFeedbackById({
        session_id: data.session_id,
        form_id: 25, // GAS form uses form_id 25
      });

      if (checkFeedBackSessionId.length > 0) {
        return {
          message: 'Feedback already exists for this session',
          error: -1,
        };
      }

      // Get client's target outcome ID - use from request if provided, otherwise fetch from database
      let clientTargetOutcomeId = data.target_outcome_id || null;
      if (!clientTargetOutcomeId && data.client_id) {
        const clientTargetOutcome = await this.userTargetOutcome.getUserTargetOutcomeLatest({
          user_profile_id: data.client_id,
        });
        
        if (clientTargetOutcome && clientTargetOutcome.length > 0) {
          clientTargetOutcomeId = clientTargetOutcome[0].target_outcome_id;
        }
      }

      const recFeedback = await this.postFeedback({
        session_id: data.session_id,
        client_id: data.client_id,
        feedback_json: data,
        form_id: 25, // GAS form uses form_id 25
        tenant_id: data.tenant_id,
      });

      if (recFeedback.error) {
        return recFeedback;
      }

      const tmpGASFeedback = {
        goal: data.goal,
        total_score: totalScore,
        responses_json: JSON.stringify(data.responses),
        feedback_id: recFeedback.rec[0],
        tenant_id: data.tenant_id,
        client_target_outcome_id: clientTargetOutcomeId, // Add client target outcome ID
      };

      const postGASFeedback = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('feedback_gas')
        .insert(tmpGASFeedback);

      if (!postGASFeedback) {
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

  /**
   * Check if attendance feedback already exists for a therapy request at a specific session count
   * @param {number} thrpy_req_id - Therapy request ID
   * @param {number} session_count - Number of sessions completed
   * @returns {Promise<boolean>} - True if attendance feedback already exists
   */
  async checkAttendanceFeedbackExists(thrpy_req_id, session_count) {
    try {
      // Get all sessions for this therapy request
      const sessions = await db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('session')
        .select('session_id')
        .where('thrpy_req_id', thrpy_req_id)
        .where('status_yn', 1)
        .where('is_report', 0) // Exclude report sessions
        .orderBy('session_id', 'asc');

      // Check if we have the required number of sessions
      if (sessions.length < session_count) {
        return false;
      }

      // Get the session at the specified count
      const targetSession = sessions[session_count - 1];
      
      // Check if attendance feedback exists for this session
      const existingFeedback = await this.getFeedbackById({
        session_id: targetSession.session_id,
        form_id: 24, // Attendance form ID
      });

      return existingFeedback && existingFeedback.length > 0;
    } catch (error) {
      console.log(error);
      logger.error(error);
      return false;
    }
  }
}
