import ApiConfig from "../config/apiConfig";
import { api } from "../utils/auth";
import axios from "axios";

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
  uploadOnboardingDocuments(formData) {
    return api.post(ApiConfig.onboarding.uploadDocuments, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  getCounselorProfile(counselorId) {
    console.log("counselorId", counselorId);

    return api.get(`${ApiConfig.counselorProfile.getCounselorProfile}`, {
      params: {
        counselor_profile_id: counselorId,
      },
    });
  },
  getSearchedCounselors(payload) {
    return api.get(`${ApiConfig.counselorProfile.searchCounselors}/`, {
      params: payload,
    });
  },
  getSearchFilters() {
    return api.get(ApiConfig.counselorProfile.getSearchFilters, {
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
  async uploadProfileImage(counselorProfileId, formData) {
    try {
      const response = await api.put(
        `${ApiConfig.counselorProfile.getCounselorProfile}/${counselorProfileId}/image`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async uploadLicenseFile(counselorProfileId, formData) {
    try {
      const response = await api.put(
        `${ApiConfig.counselorProfile.getCounselorProfile}/${counselorProfileId}/license`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  async uploadOnboardingDocuments(formData) {
    try {
      const response = await axios.post(
        ApiConfig.onboarding.uploadDocuments,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  async deleteDocument(documentId) {
    try {
      const response = await axios.delete(
        `${ApiConfig.onboarding.uploadDocuments}/${documentId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
  async getDocuments(counselorProfileId) {
    try {
      const response = await axios.get(
        `${ApiConfig.onboarding.uploadDocuments}/${counselorProfileId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default CommonServices;
