import Reference from '../models/reference.js';

export default class ReferencesService {
  //////////////////////////////////////////
  async getReferences() {
    try {
      const reference = new Reference();
      const references = await reference.getAllReferences();

      if (references.error) {
        return references;
      }

      return references;
    } catch (error) {
      console.error(error);
      return { message: 'Error fetching references', error: -1 };
    }
  }
}
