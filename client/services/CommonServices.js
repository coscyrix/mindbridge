import ApiConfig from "../config/apiConfig";
import { api, liveAppApi } from "../utils/auth";

const CommonServices = {
  getReferences() {
    return api.get(ApiConfig.getReferences);
  },
  getAllCounselors(roleId = 2) {
    return api.get(ApiConfig.getAllCounselors(roleId));
  },
  getServices() {
    return api.get(ApiConfig.services.getServices);
  },
  getClients(params) {
    return api.get(ApiConfig.clients.getClients, { params });
  },
  getClientsByCounselor(params) {
    return api.get(ApiConfig.clients.getClients, { params });
  },
  getSessions() {
    return api.get(ApiConfig.sessions.getSessions);
  },
  getSessionsByCounselor(params) {
    return api.get(ApiConfig.sessions.getSessions, { params });
  },
  getCurrentSessions(params) {
    return api.get(ApiConfig.currentSessions.getTodayAndTomorrowSessions, {
      params,
    });
  },
  getFormSubmissionDetails(params) {
    return api.get(ApiConfig.forms.submissionDetails, { params });
  },
  getOverallSessionsData(params) {
    return api.get(ApiConfig.dashboard.overallSessions, { params });
  },
  getReportsTableData(params) {
    return api.get(ApiConfig.dashboard.reportsData, { params });
  },
  getAssessmentResults(params) {
    return api.get(ApiConfig.dashboard.assessmentResultsData, { params });
  },
  getFeedbackFormDetails(params) {
    return api.get(ApiConfig.feedback.getFeedbackFormDetails, { params });
  },
  uploadOnboardingDocuments(formData){
    return liveAppApi.post(ApiConfig.onboarding.uploadDocuments, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getCounselorProfile(counselorId){
    return liveAppApi.get(`${ApiConfig.counselorProfile.getCounselorProfile}/${counselorId}`);
  },
  getSearchedCounselors(payload){
    return liveAppApi.get(`${ApiConfig.counselorProfile.searchCounselors}/`, {
      params: payload
    });
  },
  getSearchFilters(){
    return liveAppApi.get(ApiConfig.counselorProfile.getSearchFilters);
  }
};

export default CommonServices;
