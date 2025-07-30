const ApiConfig = {
  getReferences: "/references",
  getAllCounselors: (roleId = 2) => `/user-profile/?role_id=${roleId}`,
  dashboard: {
    overallSessions: "/reports/session-stats",
    reportsData: "/reports/session",
    assessmentResultsData: "/reports/user-form",
  },
  clients: {
    getClients: "/user-profile",
    updateClients: "/",
    deleteClients: "/",
  },
  sessions: {
    getSessions: "/thrpyReq",
    updateSessions: "/",
    deleteSessions: "/",
  },
  currentSessions: {
    getTodayAndTomorrowSessions: "/session/today",
  },
  services: { getServices: "/service", updateService: "/", deleteService: "/" },
  forms: {
    submissionDetails: "/userForm",
  },
  feedback: {
    getFeedbackFormDetails: "/feedback",
    submitPCL5Form: "/feedback/pcl5",
    submitPHQ9Form: "/feedback/phq9",
    submitGAD7Form: "/feedback/gad7",
    submitIPFForm: "/feedback/ipf",
    submitWHODASForm: "/feedback/whodas",
    submitSMARTGoalForm: "/feedback/smart-goal",
    submitConsentForm: "/feedback/consent",
  },
  onboarding: {
    uploadDocuments: "/counselor-documents",
  },
  counselorProfile: {
    getCounselorProfile: "/counselor-profile",
    searchCounselors: "/counselor-profile/search",
    getSearchFilters: "/counselor-profile/search/filters",
  },
  getstartedsubmittion: {
    getstarted: "/get-started-form",
    submitgetstartedform: "/onboarding",
  },
  consentFormSubmittion: {
    consentForm: "/consent-description",
  },
  submitServiceTemplate: {
    submitAndCopyServiceTemplates:
      "/service-templates/copy-multiple-to-tenant",
  },
};

export default ApiConfig;
