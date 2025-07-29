import ConsentDescription from '../models/consentDescription.js';

const consentDescriptionModel = new ConsentDescription();

export default class ConsentDescriptionService {
  //////////////////////////////////////////
  async createConsentDescription(data) {
    return await consentDescriptionModel.createConsentDescription(data);
  }

  async getConsentDescription(query) {
    return await consentDescriptionModel.getConsentDescription(query);
  }

  async updateConsentDescription(id, data) {
    return await consentDescriptionModel.updateConsentDescription(id, data);
  }

  async deleteConsentDescription(id) {
    return await consentDescriptionModel.deleteConsentDescription(id);
  }
} 