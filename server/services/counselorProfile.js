import CounselorProfile from '../models/counselorProfile.js';
import joi from 'joi';
import { saveFile } from '../utils/fileUpload.js';

export default class CounselorProfileService {
  constructor() {
    this.counselorProfile = new CounselorProfile();
  }

  async createCounselorProfile(data) {
    const schema = joi.object({
      user_profile_id: joi.number().required(),
      profile_picture_url: joi.string().uri().optional(),
      license_number: joi.string().required(),
      license_file_url: joi.string().uri().required(),
      profile_notes: joi.string().optional(),
      location: joi.string().required(),
      services_offered: joi.string().required(),
      specialties: joi.string().required(),
      service_modalities: joi.string().required(),
      availability: joi.string().required(),
      is_verified: joi.boolean().default(false),
      patients_seen: joi.number().integer().min(0).default(0),
      gender: joi.string().required(),
      race: joi.string().required(),
      public_phone: joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
    });

    const { error } = schema.validate(data);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return this.counselorProfile.createCounselorProfile(data);
  }

  async updateCounselorProfile(counselor_profile_id, data) {
    const schema = joi.object({
      profile_picture_url: joi.string().uri().optional(),
      license_number: joi.string().optional(),
      license_file_url: joi.string().uri().optional(),
      profile_notes: joi.string().optional(),
      location: joi.string().optional(),
      services_offered: joi.string().optional(),
      specialties: joi.string().optional(),
      service_modalities: joi.string().optional(),
      availability: joi.string().optional(),
      is_verified: joi.boolean().optional(),
      patients_seen: joi.number().integer().min(0).optional(),
      gender: joi.string().optional(),
      race: joi.string().optional(),
      public_phone: joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
    });

    const { error } = schema.validate(data);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return this.counselorProfile.updateCounselorProfile(counselor_profile_id, data);
  }

  async getCounselorProfile(filters) {
    const schema = joi.object({
      counselor_profile_id: joi.number().optional(),
      user_profile_id: joi.number().optional(),
      location: joi.string().optional(),
      gender: joi.string().optional(),
      race: joi.string().optional(),
      specialty: joi.string().optional()
    });

    const { error } = schema.validate(filters);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return this.counselorProfile.getCounselorProfile(filters);
  }

  async addReview(data) {
    const schema = joi.object({
      counselor_profile_id: joi.number().required(),
      client_id: joi.number().required(),
      rating: joi.number().integer().min(1).max(5).required(),
      review_text: joi.string().required()
    });

    const { error } = schema.validate(data);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return this.counselorProfile.addReview(data);
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
      specialties: joi.alternatives().try(
        joi.string(),
        joi.array().items(joi.string())
      ).optional(),
      service_modalities: joi.alternatives().try(
        joi.string().valid('Online', 'In Person', 'Phone'),
        joi.array().items(joi.string().valid('Online', 'In Person', 'Phone'))
      ).optional(),
      is_verified: joi.boolean().optional(),
      min_rating: joi.number().min(0).max(5).optional(),
      availability_day: joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday').optional(),
      availability_time: joi.string().pattern(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
      limit: joi.number().integer().min(1).max(100).default(10),
      offset: joi.number().integer().min(0).default(0)
    });

    const { error } = schema.validate(searchParams);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return this.counselorProfile.searchCounselors(searchParams);
  }

  async updateProfileImage(counselor_profile_id, file) {
    try {
      // Validate file
      if (!file) {
        return { message: 'No file provided', error: -1 };
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.mimetype)) {
        return { message: 'Invalid file type. Only JPEG, PNG and GIF are allowed', error: -1 };
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        return { message: 'File too large. Maximum size is 5MB', error: -1 };
      }

      // Save file
      const imageUrl = await saveFile(file, 'profile_images');

      // Update profile with new image URL
      return this.counselorProfile.updateProfileImage(counselor_profile_id, imageUrl);
    } catch (error) {
      return { message: 'Error updating profile image', error: -1 };
    }
  }
} 