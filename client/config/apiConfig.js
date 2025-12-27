const ApiConfig = {
  getReferences: "/references",
  getAllCounselors: (roleId = 2) => `/user-profile/?role_id=${roleId}`,
  dashboard: {
    overallSessions: "/reports/session-stats",
    reportsData: "/reports/session",
    assessmentResultsData: "/reports/user-form",
    homeworkStats: "/reports/homework-stats",
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
    submitGASForm: "/feedback/gas",
  },
  onboarding: {
    uploadDocuments: "/counselor-documents",
  },
  counselorProfile: {
    getCounselorProfile: "/counselor-profile",
    searchCounselors: "/counselor-profile/search",
    getSearchFilters: "/counselor-profile/search/filters",
    getAppointmentById: "/counselor-profile/appointment",
  },
  getstartedsubmittion: {
    getstarted: "/get-started-form",
    submitgetstartedform: "/onboarding",
  },
  consentFormSubmittion: {
    consentForm: "/consent-description",
  },
  submitServiceTemplate: {
    submitAndCopyServiceTemplates: "/service-templates/copy-multiple-to-tenant",
  },
  homeworkUpload: {
    enableAndDisableUpload: "/tenant-configuration",
    fetchHomeworkUploadStatus: "/tenant-configuration",
    gethomeworkdetail: "/homework/session",
    submitHomeworkdetails: "/homework",
  },
  feeSplitManagment: {
    getAllfeesSplit: "/fee-split-management/configuration",
    
  },
  sessionManagement: {
    getByHash: "/thrpyReq/by-hash",
    cancelSession: "/thrpyReq/cancel",
    rescheduleSession: "/thrpyReq/reschedule",
  },
};

export default ApiConfig;
