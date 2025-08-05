import Homework from '../models/homework.js';
import TenantConfigurationService from './tenantConfigurationService.js';
import joi from 'joi';

const homeworkModel = new Homework();
const tenantConfigService = new TenantConfigurationService();

export default class HomeworkService {
  //////////////////////////////////////////
  async createHomework(data) {
    const schema = joi.object({
      homework_title: joi.string().required(),
      homework_filename: joi.string().optional(),
      homework_file_path: joi.string().optional(),
      tenant_id: joi.number().required(),
      session_id: joi.number().optional(),
      file_size: joi.number().optional(),
      file_type: joi.string().optional(),
      email: joi.string().email().optional()
    });

    const { error } = schema.validate(data);
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    // Check if homework upload is enabled for this tenant
    const isEnabled = await tenantConfigService.isFeatureEnabled(data.tenant_id, 'homework_upload_enabled');
    if (!isEnabled) {
      return { message: 'Homework upload is disabled for this tenant', error: -1 };
    }

    return await homeworkModel.postHomework(data);
  }

  //////////////////////////////////////////
  async getHomeworkBySessionId(session_id) {
    const schema = joi.object({
      session_id: joi.number().required()
    });

    const { error } = schema.validate({ session_id });
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await homeworkModel.getHomeworkBySessionId(session_id);
  }

  //////////////////////////////////////////
  async getHomeworkById(homework_id) {
    const schema = joi.object({
      homework_id: joi.number().required()
    });

    const { error } = schema.validate({ homework_id });
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await homeworkModel.getHomeworkById(homework_id);
  }

  //////////////////////////////////////////
  async deleteHomework(homework_id) {
    const schema = joi.object({
      homework_id: joi.number().required()
    });

    const { error } = schema.validate({ homework_id });
    if (error) {
      return { message: error.details[0].message, error: -1 };
    }

    return await homeworkModel.deleteHomework(homework_id);
  }
}
