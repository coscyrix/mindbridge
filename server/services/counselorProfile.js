import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import CounselorProfile from '../models/counselorProfile.js';
const joi = require('joi');;
import { saveFile } from '../utils/fileUpload.js';
import SendEmail from '../middlewares/sendEmail.js';
import logger from '../config/winston.js';
import CounselorDocumentsService from './counselorDocuments.js';
import CounselorTargetOutcome from '../models/counselorTargetOutcome.js';
import AppointmentEmailTracking from '../models/appointmentEmailTracking.js';
import { newAppointmentEmail } from '../utils/emailTmplt.js';
import { parsePhoneNumber } from '../utils/phoneUtils.js';

export default class CounselorProfileService {
  constructor() {
    this.counselorProfile = new CounselorProfile();
    this.sendEmail = new SendEmail();
    this.counselorDocumentsService = new CounselorDocumentsService();
    this.counselorTargetOutcome = new CounselorTargetOutcome();
    this.appointmentEmailTracking = new AppointmentEmailTracking();
  }

  async createCounselorProfile(data) {
    // Validate the input data
    const schema = joi.object({
      user_profile_id: joi.number().optional(),
      counselor_profile_id: joi.number().optional(),
      location_lat: joi.alternatives().try(
        joi.number(),
        joi.string()
      ).optional(),
      location_lng: joi.alternatives().try(
        joi.number(),
        joi.string()
      ).optional(),
      profile_picture_url: joi.string().optional(),
      license_number: joi.string().optional(),
      license_provider: joi.string().optional(),
      license_file_url: joi.string().optional(),
      profile_notes: joi.string().optional(),
      location: joi.string().optional(),
      service_modalities: joi.string().optional(),
      availability: joi.string().optional(),
      is_verified: joi.boolean().optional(),
      patients_seen: joi.number().optional(),
      gender: joi.string().optional(),
      race: joi.string().optional(),
      public_phone: joi.string().optional(),
      treatment_target: joi.alternatives().try(
        joi.number(),
        joi.array().items(joi.number())
      ).optional(),
      target_outcome_id: joi.alternatives().try(
        joi.number(),
        joi.array().items(joi.number())
      ).optional()
    });

    const { error } = schema.validate(data);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    // Directly pass to model, which now handles multiple target outcomes
    return this.counselorProfile.createCounselorProfile(data);
  }

  async updateCounselorProfile(counselor_profile_id, data) {
    // Validate the input data
    const schema = joi.object({
      user_profile_id: joi.number().optional(),
      counselor_profile_id: joi.number().optional(),
      location_lat: joi.alternatives().try(
        joi.number(),
        joi.string()
      ).optional(),
      location_lng: joi.alternatives().try(
        joi.number(),
        joi.string()
      ).optional(),
      profile_picture_url: joi.string().optional(),
      license_number: joi.string().optional(),
      license_provider: joi.string().optional(),
      license_file_url: joi.string().optional(),
      profile_notes: joi.string().optional(),
      location: joi.string().optional(),
      service_modalities: joi.string().optional(),
      availability: joi.string().optional(),
      is_verified: joi.boolean().optional(),
      patients_seen: joi.number().optional(),
      gender: joi.string().optional(),
      race: joi.string().optional(),
      public_phone: joi.string().optional(),
      treatment_target: joi.alternatives().try(
        joi.number(),
        joi.array().items(joi.number())
      ).optional(),
      target_outcome_id: joi.alternatives().try(
        joi.number(),
        joi.array().items(joi.number())
      ).optional()
    });

    const { error } = schema.validate(data);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    // Directly pass to model, which now handles multiple target outcomes
    return this.counselorProfile.updateCounselorProfile(counselor_profile_id, data);
  }

  async getCounselorProfile(filters) {
    const schema = joi.object({
      counselor_profile_id: joi.number().optional(),
      user_profile_id: joi.number().optional(),
      location: joi.string().optional(),
      gender: joi.string().optional(),
      race: joi.string().optional(),
      // No specialty/service
      target_outcome_id: joi.alternatives().try(
        joi.number(),
        joi.array().items(joi.number())
      ).optional()
    });
    const { error } = schema.validate(filters);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }
    // Fetch profiles
    const profile = await this.counselorProfile.getCounselorProfile(filters);
    if (profile.error) {
      return profile;
    }
    // Fetch documents if profile exists and has an ID
    let documents = [];
    if (profile.rec && profile.rec.length > 0) {
      // If specific counselor_profile_id is requested, fetch documents for that profile
      if (filters.counselor_profile_id) {
        const docsResult = await this.counselorDocumentsService.getDocuments(filters.counselor_profile_id);
        if (!docsResult.error) {
          documents = docsResult.rec || [];
        }
      } else {
        // If no specific profile requested, fetch documents for all profiles
        const allDocuments = [];
        for (const profileItem of profile.rec) {
          const docsResult = await this.counselorDocumentsService.getDocuments(profileItem.counselor_profile_id);
          if (!docsResult.error && docsResult.rec) {
            allDocuments.push(...docsResult.rec);
          }
        }
        documents = allDocuments;
      }
    }
    return { ...profile, documents };
  }

  async getReviews(counselor_profile_id) {
    if (!counselor_profile_id) {
      return { message: 'Counselor profile ID is required', error: -1 };
    }
    return this.counselorProfile.getReviews(counselor_profile_id);
  }

  async searchCounselors(searchParams) {
    const schema = joi.object({
      location: joi.string().optional(),
      gender: joi.string().optional(),
      race: joi.string().optional(),
      target_outcome_id: joi.alternatives().try(
        joi.number(),
        joi.array().items(joi.number())
      ).optional(),
      service_modalities: joi.alternatives().try(
        joi.string().valid('Online', 'In Person', 'Phone'),
        joi.array().items(joi.string().valid('Online', 'In Person', 'Phone'))
      ).optional(),
      is_verified: joi.boolean().optional(),
      min_rating: joi.number().min(0).max(5).optional(),
      availability_day: joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').optional(),
      availability_time: joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      min_price: joi.number().min(0).optional(),
      max_price: joi.number().min(0).optional(),
      limit: joi.number().integer().min(1).max(100).default(10),
      offset: joi.number().integer().min(0).default(0)
    });
    const { error } = schema.validate(searchParams);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }
    // Fetch all profiles
    const allProfiles = await this.counselorProfile.getCounselorProfile({});
    if (allProfiles.error) {
      return allProfiles;
    }
    let filtered = allProfiles.rec;
    // Filter by target_outcome_id if provided
    if (searchParams.target_outcome_id) {
      const ids = Array.isArray(searchParams.target_outcome_id)
        ? searchParams.target_outcome_id.map(Number)
        : [Number(searchParams.target_outcome_id)];
      filtered = filtered.filter(profile =>
        profile.target_outcomes &&
        profile.target_outcomes.some(to => ids.includes(Number(to.target_outcome_id)))
      );
    }
    // Other filters (location, gender, race, etc.)
    if (searchParams.location) {
      filtered = filtered.filter(profile =>
        profile.location && profile.location.toLowerCase().includes(searchParams.location.toLowerCase())
      );
    }
    if (searchParams.gender) {
      filtered = filtered.filter(profile => profile.gender === searchParams.gender);
    }
    if (searchParams.race) {
      filtered = filtered.filter(profile => profile.race === searchParams.race);
    }
    if (searchParams.service_modalities) {
      const modalities = Array.isArray(searchParams.service_modalities)
        ? searchParams.service_modalities
        : [searchParams.service_modalities];
      filtered = filtered.filter(profile =>
        profile.service_modalities &&
        modalities.some(m => profile.service_modalities.includes(m))
      );
    }
    // Pagination
    const offset = searchParams.offset || 0;
    const limit = searchParams.limit || 10;
    const paginated = filtered.slice(offset, offset + limit);
    return {
      message: 'Counselors retrieved successfully',
      rec: paginated,
      pagination: {
        total: filtered.length,
        limit,
        offset,
        has_more: offset + limit < filtered.length
      }
    };
  }

  async updateProfileImage(counselor_profile_id, file) {
    try {
      if (!file) {
        return { message: 'No file provided', error: -1 };
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.mimetype)) {
        return { message: 'Invalid file type. Only JPEG, PNG and GIF are allowed', error: -1 };
      }
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        return { message: 'File too large. Maximum size is 5MB', error: -1 };
      }
      const imageUrl = await saveFile(file, 'profile_images');
      return this.counselorProfile.updateProfileImage(counselor_profile_id, imageUrl);
    } catch (error) {
      console.error('Error updating profile image:', error);
      return { message: 'Error updating profile image', error: -1 };
    }
  }

  async updateLicenseFile(counselor_profile_id, file) {
    try {
      if (!file) {
        return { message: 'No file provided', error: -1 };
      }
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return { message: 'Invalid file type. Only PDF, JPEG and PNG are allowed', error: -1 };
      }
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        return { message: 'File too large. Maximum size is 10MB', error: -1 };
      }
      const fileUrl = await saveFile(file, 'license_files');
      return this.counselorProfile.updateLicenseFile(counselor_profile_id, fileUrl);
    } catch (error) {
      console.error('Error updating license file:', error);
      return { message: 'Error updating license file', error: -1 };
    }
  }

  async sendAppointmentEmail(data) {
    const schema = joi.object({
      counselor_profile_id: joi.number().required(),
      client_name: joi.string().required(),
      client_email: joi.string().email().required(),
      contact_number: joi.string().required(),
      service: joi.string().required(),
      appointment_date: joi.date().iso().required(),
      description: joi.string().optional(),
    });
    const { error } = schema.validate(data);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }
    try {
      // Check if email has already been sent to this client for this counselor
      const emailAlreadySent = await this.appointmentEmailTracking.checkEmailAlreadySent(
        data.counselor_profile_id,
        data.client_email
      );
      
      if (emailAlreadySent) {
        return { 
          message: 'Appointment email has already been sent to this client for this counselor', 
          error: -1,
          alreadySent: true
        };
      }

      const counselorProfile = await this.counselorProfile.getCounselorProfile({
        counselor_profile_id: data.counselor_profile_id,
      });
      if (!counselorProfile.rec || counselorProfile.rec.length === 0) {
        return { message: 'Counselor not found', error: -1 };
      }
      const counselor = counselorProfile.rec[0];
      const counselorEmail = counselor.email;
      const counselorName = `${counselor.user_first_name} ${counselor.user_last_name}`;
      
      // Parse phone number to extract country code and contact number
      const { country_code, contact_number } = parsePhoneNumber(data.contact_number);
      
      const emailMsg = newAppointmentEmail(
        counselorEmail,
        counselorName,
        data.client_name,
        data.client_email,
        country_code,
        contact_number,
        data.service,
        data.appointment_date,
        data.description,
      );
      const emailResult = await this.sendEmail.sendMail(emailMsg);
      if (!emailResult || emailResult.error) {
        const errorMessage = emailResult?.message || 'Failed to send appointment email';
        logger.error('Error sending appointment email to counselor:', errorMessage);
        return { message: 'Failed to send appointment email', error: -1 };
      }

      // Record that the email was sent successfully with parsed phone data
      await this.appointmentEmailTracking.recordEmailSent({
        ...data,
        country_code,
        contact_number,
      });
      
      return { message: 'Appointment email sent successfully' };
    } catch (err) {
      logger.error('Error in sendAppointmentEmail service:', err);
      return { message: 'Internal server error', error: -1 };
    }
  }

  async getAppointmentEmailHistory(counselor_profile_id, limit = 10) {
    try {
      const schema = joi.object({
        counselor_profile_id: joi.number().required(),
        limit: joi.number().min(1).max(100).optional()
      });
      
      const { error } = schema.validate({ counselor_profile_id, limit });
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      const emailHistory = await this.appointmentEmailTracking.getEmailHistory(counselor_profile_id, limit);
      return { 
        message: 'Email history retrieved successfully',
        data: emailHistory
      };
    } catch (err) {
      logger.error('Error in getAppointmentEmailHistory service:', err);
      return { message: 'Internal server error', error: -1 };
    }
  }

  async getMyAppointments(user_profile_id) {
    try {
      const schema = joi.object({
        user_profile_id: joi.number().required(),
      });
      
      const { error } = schema.validate({ user_profile_id });
      if (error) {
        return { message: error.details[0].message, error: -1 };
      }

      // Get counselor_profile_id from user_profile_id
      const counselorProfile = await this.counselorProfile.getCounselorProfile({
        user_profile_id: user_profile_id,
      });

      if (!counselorProfile.rec || counselorProfile.rec.length === 0) {
        return { 
          message: 'Counselor profile not found', 
          error: -1 
        };
      }

      const counselor_profile_id = counselorProfile.rec[0].counselor_profile_id;

      // Get all appointments for this counselor
      const appointments = await this.appointmentEmailTracking.getAppointmentsByCounselor(
        counselor_profile_id
      );

      return { 
        message: 'Appointments retrieved successfully',
        data: appointments
      };
    } catch (err) {
      logger.error('Error in getMyAppointments service:', err);
      return { message: 'Internal server error', error: -1 };
    }
  }
}