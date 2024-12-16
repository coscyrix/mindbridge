import ReferencesService from '../services/references.js';

export default class ReferencesController {
  //////////////////////////////////////////
  async getReferences(req, res) {
    const referencesService = new ReferencesService();
    const rec = await referencesService.getReferences();

    if (rec.error) {
      res.status(400).json(rec);
      return;
    }

    res.status(200).json(rec);
  }
}
