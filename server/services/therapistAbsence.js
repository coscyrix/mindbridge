//services/therapistAbsence.js

import TherapistAbsence from '../models/therapistAbsence.js';

export default class TherapistAbsenceService {
  async handleTherapistAbsence(data) {
    const therapistAbsence = new TherapistAbsence();
    return therapistAbsence.handleTherapistAbsence(data);
  }
}
