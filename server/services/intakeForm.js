//services/intakeForm.js

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const joi = require('joi');
import prisma from '../utils/prisma.js';
import logger from '../config/winston.js';
import AppointmentEmailTracking from '../models/appointmentEmailTracking.js';

export default class IntakeFormService {
  constructor() {
    this.appointmentEmailTracking = new AppointmentEmailTracking();
  }

  async submitIntakeForm(data) {
    const schema = joi.object({
      counselor_id: joi.number().required(),
      appointment_id: joi.number().required(),
      intake_form_id: joi.number().required(),
      full_name: joi.string().required(),
      phone: joi.string().allow('', null).optional(),
      email: joi.string().email().allow('', null).optional(),
      emergency_contact_name: joi.string().allow('', null).optional(),
      emergency_contact_relationship: joi.string().allow('', null).optional(),
      emergency_contact_phone: joi.string().allow('', null).optional(),
      using_insurance: joi.string().valid('yes', 'no').allow('', null).optional(),
      insurance_provider: joi.string().allow('', null).optional(),
      policyholder_name: joi.string().allow('', null).optional(),
      policyholder_date_of_birth: joi.string().allow('', null).optional(),
      member_id: joi.string().allow('', null).optional(),
      group_number: joi.string().allow('', null).optional(),
      reason_for_therapy: joi.string().allow('', null).optional(),
      duration: joi.string().allow('', null).optional(),
      symptoms: joi.array().items(joi.string()).allow(null).optional(),
      thoughts_self_harm: joi.string().valid('no', 'past', 'current').allow('', null).optional(),
      thoughts_harm_others: joi.string().valid('no', 'yes').allow('', null).optional(),
      therapy_goals: joi.string().allow('', null).optional(),
      consent: joi.boolean().optional(),
      signature: joi.string().allow('', null).optional(),
    });

    const { error } = schema.validate(data);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    try {
      // Verify appointment exists and belongs to counselor
      const appointment = await this.appointmentEmailTracking.getAppointmentById(data.appointment_id);
      
      if (!appointment) {
        return { message: 'Appointment not found', error: -1 };
      }

      if (appointment.counselor_profile_id !== data.counselor_id) {
        return { message: 'Appointment does not belong to this counselor', error: -1 };
      }

      // Use counselor_profile_id from appointment (which matches data.counselor_id)
      const counselor_profile_id = data.counselor_id;

      // Double check if intake form exists with the given intake_form_id and counselor_profile_id
      // The form should have been created via sendIntakeForm first

      console.log('counselor_profile_id', counselor_profile_id);
      const existingIntakeForm = await prisma.client_intake_form.findFirst({
        where: {
          id: data.intake_form_id,
          counselor_profile_id: counselor_profile_id,
        },
      });

      if (!existingIntakeForm) {
        return { 
          message: 'Intake form not found. Please ensure the intake form has been sent first and the form ID is correct.', 
          error: -1 
        };
      }

      // Verify the intake form matches the appointment details
      if (existingIntakeForm.full_name !== appointment.customer_name || 
          existingIntakeForm.email !== appointment.customer_email) {
        return { 
          message: 'Intake form does not match the appointment details.', 
          error: -1 
        };
      }

      // Map duration enum values from frontend to schema
      const mapDuration = (duration) => {
        if (!duration) return null;
        const mapping = {
          'less_than_1_month': 'less_than_1_month',
          '1_6_months': 'one_to_six_months',
          '6_12_months': 'six_to_twelve_months',
          'over_1_year': 'over_1_year',
        };
        return mapping[duration] || null;
      };

      // Map using_insurance string to enum
      const mapUsingInsurance = (value) => {
        if (!value) return null;
        return value === 'yes' ? 'yes' : value === 'no' ? 'no' : null;
      };

      // Map self_harm_thoughts string to enum
      const mapSelfHarmThoughts = (value) => {
        if (!value) return null;
        return ['no', 'past', 'current'].includes(value) ? value : null;
      };

      // Map harming_others_thoughts string to enum
      const mapHarmingOthersThoughts = (value) => {
        if (!value) return null;
        return ['no', 'yes'].includes(value) ? value : null;
      };

      // Parse policyholder_date_of_birth if provided
      let policyholderDateOfBirth = null;
      if (data.policyholder_date_of_birth) {
        try {
          policyholderDateOfBirth = new Date(data.policyholder_date_of_birth);
          if (isNaN(policyholderDateOfBirth.getTime())) {
            policyholderDateOfBirth = null;
          }
        } catch (e) {
          policyholderDateOfBirth = null;
        }
      }

      // Prepare data for database with field mapping
      const intakeFormData = {
        // Basic Information
        full_name: data.full_name,
        phone: data.phone || null,
        email: data.email || null,
        // Emergency Contact
        emergency_contact_name: data.emergency_contact_name || null,
        emergency_contact_relationship: data.emergency_contact_relationship || null,
        emergency_contact_phone: data.emergency_contact_phone || null,
        // Insurance Coverage
        using_insurance: mapUsingInsurance(data.using_insurance),
        insurance_provider: data.insurance_provider || null,
        policyholder_name: data.policyholder_name || null,
        policyholder_date_of_birth: policyholderDateOfBirth,
        member_id: data.member_id || null,
        group_number: data.group_number || null,
        // Reason for Seeking Therapy
        reason_for_therapy: data.reason_for_therapy || null,
        concern_duration: mapDuration(data.duration), // Map duration to concern_duration
        // Current Symptoms (stored as JSON array)
        current_symptoms: data.symptoms && data.symptoms.length > 0 ? data.symptoms : null, // Map symptoms to current_symptoms
        // Safety Check
        self_harm_thoughts: mapSelfHarmThoughts(data.thoughts_self_harm), // Map thoughts_self_harm to self_harm_thoughts
        harming_others_thoughts: mapHarmingOthersThoughts(data.thoughts_harm_others), // Map thoughts_harm_others to harming_others_thoughts
        // Goals for Therapy
        therapy_goals: data.therapy_goals || null,
        // Consent
        client_name: data.full_name, // Set client_name from full_name
        signature: data.signature || null,
        consent_date: data.consent ? new Date() : null, // Set consent_date if consent is true
        // Metadata
      };

      // Update existing intake form (we already verified it exists above)
      const intakeForm = await prisma.client_intake_form.update({
        where: {
          id: existingIntakeForm.id,
        },
        data: intakeFormData,
      });

      // Update appointment_email_tracking to mark intake form as submitted
      await prisma.appointment_email_tracking.update({
        where: {
          id: data.appointment_id,
        },
        data: {
          intake_form_submitted: true,
          updated_at: new Date(),
        },
      });

      return {
        message: 'Intake form submitted successfully',
        rec: intakeForm,
      };
    } catch (error) {
      logger.error('Error in submitIntakeForm service:', error);
      return { message: 'Internal server error', error: -1 };
    }
  }

  async getIntakeFormDetails(data) {
    const schema = joi.object({
      intake_form_id: joi.number().required(),
      counselor_profile_id: joi.number().required(),
    });

    const { error } = schema.validate(data);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    try {
      const intakeForm = await prisma.client_intake_form.findFirst({
        where: {
          id: data.intake_form_id,
          counselor_profile_id: data.counselor_profile_id,
        },
      });

      if (!intakeForm) {
        return { 
          message: 'Intake form not found', 
          error: -1 
        };
      }

      return {
        message: 'Intake form retrieved successfully',
        rec: intakeForm,
      };
    } catch (error) {
      logger.error('Error in getIntakeFormDetails service:', error);
      return { message: 'Internal server error', error: -1 };
    }
  }
}

