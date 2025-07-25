import Onboarding from '../models/onboarding.js';
import joi from 'joi';

export default class OnboardingService {
  async createOnboardingRequest(data) {
    const schema = joi.object({
      organization: joi.string().required(),
      contact: joi.string().required(),
      position: joi.string().required(),
      email: joi.string().email().required(),
      phone: joi.string().allow('').optional(),
      contact_number: joi.string().allow('').optional(),
      website: joi.string().allow('').optional(),
      address: joi.string().allow('').optional(),
      counselors: joi.number().integer().optional(),
      clients: joi.number().integer().optional(),
      features: joi.string().allow('').optional(),
      demoTime: joi.date().iso().optional(),
      notes: joi.string().allow('').optional(),
      description: joi.string().allow('').optional(),
      typedName: joi.string().required(),
      signature: joi.string().allow('').optional(),
      date: joi.date().iso().optional(),
    });
    const { error } = schema.validate(data);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }
    const onboarding = new Onboarding();
    return await onboarding.createOnboardingRequest(data);
  }
} 