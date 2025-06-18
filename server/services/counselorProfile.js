import CounselorProfile from '../models/counselorProfile.js';
import joi from 'joi';
import { saveFile } from '../utils/fileUpload.js';
import CounselorService from '../models/counselorServices.js';
import Service from '../models/service.js';

export default class CounselorProfileService {
  constructor() {
    this.counselorProfile = new CounselorProfile();
    this.counselorService = new CounselorService();
    this.service = new Service();
  }

  async createCounselorProfile(data) {
    try {
      const { services_offered, specialties, ...profileData } = data;
      
      // Parse JSON strings to arrays
      const parsedServices = services_offered ? JSON.parse(services_offered) : [];
      const parsedSpecialties = specialties ? JSON.parse(specialties) : [];
      
      // Create the counselor profile
      const profile = await this.counselorProfile.createCounselorProfile(profileData);
      
      if (profile.error) {
        return profile;
      }

      // Add services and specialties
      if (parsedServices.length || parsedSpecialties.length) {
        const serviceRecords = [];

        // Add regular services
        if (parsedServices.length) {
          // Get services by IDs
          const serviceIds = await this.service.getServiceById({ service_id: parsedServices });
          
          if (serviceIds.rec) {
            serviceRecords.push(...serviceIds.rec.map(s => ({
              counselor_profile_id: profile.id,
              service_id: s.service_id,
              is_specialty: false
            })));
          }
        }

        // Add specialties
        if (parsedSpecialties.length) {
          // Get services by IDs
          const specialtyIds = await this.service.getServiceById({ service_id: parsedSpecialties });
          
          if (specialtyIds.rec) {
            serviceRecords.push(...specialtyIds.rec.map(s => ({
              counselor_profile_id: profile.id,
              service_id: s.service_id,
              is_specialty: true
            })));
          }
        }

        if (serviceRecords.length) {
          for (const record of serviceRecords) {
            await this.counselorService.createCounselorService(record);
          }
        }
      }

      return profile;
    } catch (error) {
      logger.error('Error creating counselor profile:', error);
      return { message: 'Error creating counselor profile', error: -1 };
    }
  }

  async updateCounselorProfile(counselor_profile_id, data) {
    try {
      const { services, specialties, ...profileData } = data;
      
      // Update the counselor profile
      const profile = await this.counselorProfile.updateCounselorProfile(counselor_profile_id, profileData);
      
      if (profile.error) {
        return profile;
      }

      // Update services and specialties
      if (services || specialties) {
        // Get existing services
        const existingServices = await this.counselorService.getCounselorServices({
          counselor_profile_id
        });

        // Delete existing services
        if (existingServices.rec) {
          for (const service of existingServices.rec) {
            await this.counselorService.deleteCounselorService(service.counselor_service_id);
          }
        }

        const serviceRecords = [];

        // Add new services
        if (services?.length) {
          const serviceIds = await this.service.getServiceById({ service_name: services });
          
          if (serviceIds.rec) {
            serviceRecords.push(...serviceIds.rec.map(s => ({
              counselor_profile_id,
              service_id: s.service_id,
              is_specialty: false
            })));
          }
        }

        // Add new specialties
        if (specialties?.length) {
          const specialtyIds = await this.service.getServiceById({ service_name: specialties });
          
          if (specialtyIds.rec) {
            serviceRecords.push(...specialtyIds.rec.map(s => ({
              counselor_profile_id,
              service_id: s.service_id,
              is_specialty: true
            })));
          }
        }

        if (serviceRecords.length) {
          for (const record of serviceRecords) {
            await this.counselorService.createCounselorService(record);
          }
        }
      }

      return profile;
    } catch (error) {
      logger.error('Error updating counselor profile:', error);
      return { message: 'Error updating counselor profile', error: -1 };
    }
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

    const profile = await this.counselorProfile.getCounselorProfile(filters);
    
    if (profile.error) {
      return profile;
    }
    
    return profile;
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

    const results = await this.counselorProfile.searchCounselors(searchParams);
    
    if (results.error) {
      return results;
    }

    // Get services for each profile
    if (results.rec) {
      for (const profile of results.rec) {
        const services = await this.counselorService.getCounselorServices({
          counselor_profile_id: profile.counselor_profile_id
        });
        
        if (services.rec) {
          profile.services_offered = services.rec
            .filter(s => !s.is_specialty)
            .map(s => s.service_name);
          profile.specialties = services.rec
            .filter(s => s.is_specialty)
            .map(s => s.service_name);
        }
      }
    }

    return results;
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

  async updateLicenseFile(counselor_profile_id, file) {
    try {
      // Validate file
      if (!file) {
        return { message: 'No file provided', error: -1 };
      }

      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return { message: 'Invalid file type. Only PDF, JPEG and PNG are allowed', error: -1 };
      }

      // Validate file size (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB in bytes
      if (file.size > maxSize) {
        return { message: 'File too large. Maximum size is 10MB', error: -1 };
      }

      // Save file
      const fileUrl = await saveFile(file, 'license_files');

      // Update profile with new license file URL
      return this.counselorProfile.updateLicenseFile(counselor_profile_id, fileUrl);
    } catch (error) {
      return { message: 'Error updating license file', error: -1 };
    }
  }
}