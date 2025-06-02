import CounselorProfileService from '../services/counselorProfile.js';
import logger from '../config/winston.js';

export default class CounselorProfileController {
  constructor() {
    this.counselorProfileService = new CounselorProfileService();
  }

  async createCounselorProfile(req, res) {
    try {
      const result = await this.counselorProfileService.createCounselorProfile(req.body);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  async updateCounselorProfile(req, res) {
    try {
      const { counselor_profile_id } = req.params;
      
      if (!counselor_profile_id) {
        return res.status(400).json({ message: 'Counselor profile ID is required', error: -1 });
      }

      const result = await this.counselorProfileService.updateCounselorProfile(
        counselor_profile_id,
        req.body
      );
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  async getCounselorProfile(req, res) {
    try {
      const result = await this.counselorProfileService.getCounselorProfile(req.query);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  async addReview(req, res) {
    try {
      const result = await this.counselorProfileService.addReview(req.body);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  async getReviews(req, res) {
    try {
      const { counselor_profile_id } = req.params;
      
      if (!counselor_profile_id) {
        return res.status(400).json({ message: 'Counselor profile ID is required', error: -1 });
      }

      const result = await this.counselorProfileService.getReviews(counselor_profile_id);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Internal server error', error: -1 });
    }
  }

  async searchCounselors(req, res) {
    try {
      const result = await this.counselorProfileService.searchCounselors(req.query);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error searching counselors:', error);
      res.status(500).json({ 
        message: 'Error searching counselors', 
        error: error.message 
      });
    }
  }

  getSearchFilters = (req, res) => {
    try {
      const filters = {
        service_modalities: ['Online', 'In Person', 'Phone'],
        availability_days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
        availability_times: [
          '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
        ],
        gender_options: ['male', 'female', 'non-binary', 'prefer not to say'],
        race_options: [
          'American Indian or Alaska Native',
          'Asian',
          'Black or African American',
          'Hispanic or Latino',
          'Native Hawaiian or Other Pacific Islander',
          'White',
          'Two or More Races',
          'Prefer not to say'
        ],
        rating_ranges: [
          { min: 4.5, label: '4.5+ stars' },
          { min: 4.0, label: '4.0+ stars' },
          { min: 3.5, label: '3.5+ stars' },
          { min: 3.0, label: '3.0+ stars' }
        ]
      };

      // Get unique specialties and services from existing profiles
      this.counselorProfileService.getCounselorProfile({})
        .then(profiles => {
          const specialties = new Set();
          const services = new Set();

          profiles.rec.forEach(profile => {
            if (Array.isArray(profile.specialties)) {
              profile.specialties.forEach(specialty => specialties.add(specialty));
            }
            if (Array.isArray(profile.services_offered)) {
              profile.services_offered.forEach(service => services.add(service));
            }
          });

          filters.specialties = Array.from(specialties).sort();
          filters.services = Array.from(services).sort();

          res.status(200).json({
            message: 'Search filters retrieved successfully',
            filters
          });
        })
        .catch(error => {
          console.error('Error getting search filters:', error);
          res.status(500).json({
            message: 'Error retrieving search filters',
            error: error.message
          });
        });
    } catch (error) {
      console.error('Error getting search filters:', error);
      res.status(500).json({
        message: 'Error retrieving search filters',
        error: error.message
      });
    }
  };

  async updateProfileImage(req, res) {
    try {
      const { counselor_profile_id } = req.params;
      const file = req.file;

      if (!counselor_profile_id) {
        return res.status(400).json({ message: 'Counselor profile ID is required', error: -1 });
      }

      const result = await this.counselorProfileService.updateProfileImage(counselor_profile_id, file);
      
      if (result.error) {
        return res.status(400).json(result);
      }
      
      res.status(200).json(result);
    } catch (error) {
      logger.error('Error updating profile image:', error);
      res.status(500).json({ 
        message: 'Error updating profile image', 
        error: error.message 
      });
    }
  }
} 