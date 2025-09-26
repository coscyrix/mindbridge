import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import DBconn from '../config/db.config.js';
const knex = require('knex');;
import logger from '../config/winston.js';
import CounselorTargetOutcome from './counselorTargetOutcome.js';

const db = knex(DBconn.dbConn.development);

export default class CounselorProfile {
  constructor() {
    this.db = db;
    this.counselorTargetOutcome = new CounselorTargetOutcome();
  }

  async createCounselorProfile(data) {
    try {
      // Check if a profile already exists for this user
      const existingProfile = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('counselor_profile_id')
        .from('counselor_profile')
        .where('user_profile_id', data.user_profile_id)
        .first();

      if (existingProfile) {
        logger.error('Counselor profile already exists for this user');
        return { 
          message: 'A counselor profile already exists for this user', 
          error: -1,
          existing_profile_id: existingProfile.counselor_profile_id
        };
      }

      const result = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_profile')
        .insert({
          user_profile_id: data.user_profile_id,
          profile_picture_url: data.profile_picture_url,
          license_number: data.license_number,
          license_provider: data.license_provider,
          license_file_url: data.license_file_url,
          profile_notes: data.profile_notes,
          location: data.location,
          service_modalities: data.service_modalities,
          availability: data.availability,
          is_verified: data.is_verified || false,
          patients_seen: data.patients_seen || 0,
          gender: data.gender,
          race: data.race,
          public_phone: data.public_phone
        });

      const counselor_profile_id = result[0];

      // Handle treatment_target mapping to target_outcome_id
      let targetOutcomeIds = [];
      
      // If treatment_target is provided, use it as target_outcome_id
      if (data.treatment_target && Array.isArray(data.treatment_target)) {
        targetOutcomeIds = data.treatment_target;
      } else if (data.treatment_target) {
        targetOutcomeIds = [data.treatment_target];
      }
      
      // If target_outcome_id is provided, use it (for backward compatibility)
      if (data.target_outcome_id && Array.isArray(data.target_outcome_id)) {
        targetOutcomeIds = data.target_outcome_id;
      } else if (data.target_outcome_id) {
        targetOutcomeIds = [data.target_outcome_id];
      }

      // Add target outcome mappings if provided
      if (targetOutcomeIds.length > 0) {
        for (const tid of targetOutcomeIds) {
          await this.counselorTargetOutcome.addCounselorTargetOutcome({
            counselor_profile_id,
            target_outcome_id: tid
          });
        }
      }

      return { message: 'Counselor profile created successfully', id: counselor_profile_id };
    } catch (error) {
      logger.error('Error creating counselor profile:', error);
      if (error.code === 'ER_DUP_ENTRY') {
        return { 
          message: 'A counselor profile already exists for this user', 
          error: -1 
        };
      }
      return { message: 'Error creating counselor profile', error: -1 };
    }
  }

  async updateCounselorProfile(counselor_profile_id, data) {
    try {
      const updateData = {};
      if (data.profile_picture_url) updateData.profile_picture_url = data.profile_picture_url;
      if (data.license_number) updateData.license_number = data.license_number;
      if (data.license_provider) updateData.license_provider = data.license_provider;
      if (data.license_file_url) updateData.license_file_url = data.license_file_url;
      if (data.profile_notes) updateData.profile_notes = data.profile_notes;
      if (data.location) updateData.location = data.location;
      if (data.service_modalities) updateData.service_modalities = data.service_modalities;
      if (data.availability) updateData.availability = data.availability;
      if (data.is_verified !== undefined) updateData.is_verified = data.is_verified;
      if (data.patients_seen) updateData.patients_seen = data.patients_seen;
      if (data.gender) updateData.gender = data.gender;
      if (data.race) updateData.race = data.race;
      if (data.public_phone) updateData.public_phone = data.public_phone;

      await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_profile')
        .where('counselor_profile_id', counselor_profile_id)
        .update(updateData);

      // Handle treatment_target mapping to target_outcome_id
      let targetOutcomeIds = [];
      
      // If treatment_target is provided, use it as target_outcome_id
      if (data.treatment_target && Array.isArray(data.treatment_target)) {
        targetOutcomeIds = data.treatment_target;
      } else if (data.treatment_target) {
        targetOutcomeIds = [data.treatment_target];
      }
      
      // If target_outcome_id is provided, use it (for backward compatibility)
      if (data.target_outcome_id && Array.isArray(data.target_outcome_id)) {
        targetOutcomeIds = data.target_outcome_id;
      } else if (data.target_outcome_id) {
        targetOutcomeIds = [data.target_outcome_id];
      }

      // Update or add target outcome mappings if provided
      if (targetOutcomeIds.length > 0) {
        // Remove all existing mappings first
        const existing = await this.counselorTargetOutcome.getCounselorTargetOutcome({ counselor_profile_id });
        if (existing.rec && existing.rec.length > 0) {
          for (const row of existing.rec) {
            await this.counselorTargetOutcome.deleteCounselorTargetOutcome(row.id);
          }
        }
        
        // Add new mappings
        for (const tid of targetOutcomeIds) {
          await this.counselorTargetOutcome.addCounselorTargetOutcome({
            counselor_profile_id,
            target_outcome_id: tid
          });
        }
      }

      return { message: 'Counselor profile updated successfully' };
    } catch (error) {
      logger.error('Error updating counselor profile:', error);
      return { message: 'Error updating counselor profile', error: -1 };
    }
  }

  async getCounselorProfile(filters) {
    try {
      const query = this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select(
          'cp.*',
          'up.user_first_name',
          'up.user_last_name',
          'u.email'
        )
        .from('counselor_profile as cp')
        .join('user_profile as up', 'cp.user_profile_id', 'up.user_profile_id')
        .join('users as u', 'up.user_id', 'u.user_id');

      if (filters.counselor_profile_id) {
        query.where('cp.counselor_profile_id', filters.counselor_profile_id);
      }
      if (filters.user_profile_id) {
        query.where('cp.user_profile_id', filters.user_profile_id);
      }
      if (filters.location) {
        query.where('cp.location', 'like', `%${filters.location}%`);
      }
      if (filters.gender) {
        query.where('cp.gender', filters.gender);
      }
      if (filters.race) {
        query.where('cp.race', filters.race);
      }

      const results = await query;

      // Attach all target outcomes for each profile
      for (const profile of results) {
        const targetOutcomes = await this.counselorTargetOutcome.getCounselorTargetOutcome({
          counselor_profile_id: profile.counselor_profile_id
        });
        profile.target_outcomes = targetOutcomes.rec || [];
      }

      return {
        message: 'Counselor profiles retrieved successfully',
        rec: results
      };
    } catch (error) {
      logger.error('Error retrieving counselor profiles:', error);
      return { message: 'Error retrieving counselor profiles', error: -1, rec: [] };
    }
  }

  async getRelatedCounselors(counselor_profile_id, limit = 5) {
    try {
      // First get the current counselor's details
      const currentCounselor = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('*')
        .from('counselor_profile')
        .where('counselor_profile_id', counselor_profile_id)
        .first();

      if (!currentCounselor) {
        return { message: 'Counselor not found', error: -1, rec: [] };
      }

      // Get related counselors based on specialties and location
      const relatedCounselors = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('cp.*', 'up.user_first_name', 'up.user_last_name', 'u.email')
        .from('counselor_profile as cp')
        .join('user_profile as up', 'cp.user_profile_id', 'up.user_profile_id')
        .join('users as u', 'up.user_id', 'u.user_id')
        .where('cp.counselor_profile_id', '!=', counselor_profile_id)
        .where(function() {
          // Match by location
          this.orWhere('cp.location', 'like', `%${currentCounselor.location}%`);
          
          // Match by specialties (using LIKE on the JSON string)
          this.orWhere('cp.specialties', 'like', `%${currentCounselor.specialties}%`);
        })
        .orderByRaw(`
          CASE 
            WHEN cp.location = ? THEN 1
            WHEN cp.location LIKE ? THEN 2
            ELSE 3
          END
        `, [currentCounselor.location, `%${currentCounselor.location}%`])
        .limit(limit);

      return {
        message: 'Related counselors retrieved successfully',
        rec: relatedCounselors
      };
    } catch (error) {
      logger.error('Error retrieving related counselors:', error);
      return { message: 'Error retrieving related counselors', error: -1, rec: [] };
    }
  }

  async searchCounselors(searchParams) {
    try {
      const {
        location,
        gender,
        race,
        specialties,
        service_modalities,
        is_verified,
        min_rating,
        availability_day,
        availability_time,
        min_price,
        max_price,
        limit = 10,
        offset = 0
      } = searchParams;

      const query = this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select(
          'cp.*',
          'up.user_first_name',
          'up.user_last_name',
          'u.email',
          this.db.raw('COALESCE(AVG(cr.rating), 0) as average_rating'),
          this.db.raw('COUNT(DISTINCT cr.review_id) as review_count')
        )
        .from('counselor_profile as cp')
        .join('user_profile as up', 'cp.user_profile_id', 'up.user_profile_id')
        .join('users as u', 'up.user_id', 'u.user_id')
        .leftJoin('counselor_reviews as cr', 'cp.counselor_profile_id', 'cr.counselor_profile_id')
        .leftJoin('counselor_services as cs', 'cp.counselor_profile_id', 'cs.counselor_profile_id')
        .leftJoin('service as s', 'cs.service_id', 's.service_id')
        .groupBy('cp.counselor_profile_id');

      // Apply filters
      if (location) {
        query.where('cp.location', 'like', `%${location}%`);
      }

      if (gender) {
        query.where('cp.gender', gender);
      }

      if (race) {
        query.where('cp.race', race);
      }

      if (specialties) {
        query.where('cp.specialties', 'like', `%${specialties}%`);
      }

      if (service_modalities) {
        query.where('cp.service_modalities', 'like', `%${service_modalities}%`);
      }

      if (is_verified !== undefined) {
        query.where('cp.is_verified', is_verified);
      }

      if (min_rating) {
        query.having('average_rating', '>=', min_rating);
      }

      if (availability_day && availability_time) {
        query.where(function() {
          this.where('cp.availability', 'like', `%"${availability_day}":%`)
            .andWhere('cp.availability', 'like', `%"${availability_time}"%`);
        });
      }

      // Price range filter (on any service)
      if (min_price !== undefined && max_price !== undefined) {
        query.whereBetween('s.total_invoice', [min_price, max_price]);
      } else if (min_price !== undefined) {
        query.where('s.total_invoice', '>=', min_price);
      } else if (max_price !== undefined) {
        query.where('s.total_invoice', '<=', max_price);
      }

      // Add pagination
      query.limit(limit).offset(offset);

      // Add sorting
      query.orderBy([
        { column: 'average_rating', order: 'desc' },
        { column: 'review_count', order: 'desc' },
        { column: 'cp.is_verified', order: 'desc' }
      ]);

      const results = await query;

      // Add computed fields
      const resultsWithComputed = results.map(profile => ({
        ...profile,
        average_rating: parseFloat(profile.average_rating) || 0,
        review_count: parseInt(profile.review_count) || 0
      }));

      // Get total count for pagination
      const totalCount = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_profile')
        .count('* as total')
        .first();

      return {
        message: 'Counselors retrieved successfully',
        rec: resultsWithComputed,
        pagination: {
          total: parseInt(totalCount.total) || 0,
          limit,
          offset,
          has_more: offset + limit < (parseInt(totalCount.total) || 0)
        }
      };
    } catch (error) {
      logger.error('Error searching counselors:', error);
      return { message: 'Error searching counselors', error: -1, rec: [] };
    }
  }

  async addReview(data) {
    try {
      const result = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_reviews')
        .insert({
          counselor_profile_id: data.counselor_profile_id,
          client_id: data.client_id,
          rating: data.rating,
          review_text: data.review_text
        });

      return { message: 'Review added successfully', id: result[0] };
    } catch (error) {
      logger.error('Error adding review:', error);
      return { message: 'Error adding review', error: -1 };
    }
  }

  async getReviews(counselor_profile_id) {
    try {
      const reviews = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('cr.*', 'up.user_first_name', 'up.user_last_name', 'u.email')
        .from('counselor_reviews as cr')
        .join('user_profile as up', 'cr.client_id', 'up.user_profile_id')
        .join('users as u', 'up.user_id', 'u.user_id')
        .where('cr.counselor_profile_id', counselor_profile_id)
        .orderBy('cr.created_at', 'desc');

      return { message: 'Reviews retrieved successfully', rec: reviews };
    } catch (error) {
      logger.error('Error retrieving reviews:', error);
      return { message: 'Error retrieving reviews', error: -1, rec: [] };
    }
  }

  async updateProfileImage(counselor_profile_id, imageUrl) {
    try {
      // Get current profile to check if there's an existing image
      const currentProfile = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('profile_picture_url')
        .from('counselor_profile')
        .where('counselor_profile_id', counselor_profile_id)
        .first();

      if (!currentProfile) {
        return { message: 'Counselor profile not found', error: -1 };
      }

      // Update the profile with new image URL
      const result = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_profile')
        .where('counselor_profile_id', counselor_profile_id)
        .update({ profile_picture_url: imageUrl });

      if (!result) {
        return { message: 'Error updating profile image', error: -1 };
      }

      return { 
        message: 'Profile image updated successfully',
        profile_picture_url: imageUrl
      };
    } catch (error) {
      logger.error('Error updating profile image:', error);
      return { message: 'Error updating profile image', error: -1 };
    }
  }

  async updateLicenseFile(counselor_profile_id, fileUrl) {
    try {
      // Get current profile to check if it exists
      const currentProfile = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .select('license_file_url')
        .from('counselor_profile')
        .where('counselor_profile_id', counselor_profile_id)
        .first();

      if (!currentProfile) {
        return { message: 'Counselor profile not found', error: -1 };
      }

      // Update the profile with new license file URL
      const result = await this.db
        .withSchema(`${process.env.MYSQL_DATABASE}`)
        .from('counselor_profile')
        .where('counselor_profile_id', counselor_profile_id)
        .update({ license_file_url: fileUrl });

      if (!result) {
        return { message: 'Error updating license file', error: -1 };
      }

      return { 
        message: 'License file updated successfully',
        license_file_url: fileUrl
      };
    } catch (error) {
      logger.error('Error updating license file:', error);
      return { message: 'Error updating license file', error: -1 };
    }
  }
} 