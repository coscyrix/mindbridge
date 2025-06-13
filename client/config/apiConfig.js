const ApiConfig = {
  getReferences: "/references",
  getAllCounselors: (roleId) => `/user-profile/?role_id=${roleId}`,
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
  },
  onboarding:{
    uploadDocuments:"/counselor-documents"
  },
  counselorProfile:{
    getCounselorProfile: '/counselor-profile',
    searchCounselors:'/counselor-profile/search',
    getSearchFilters:'/counselor-profile/search/filters',
  }
};

export default ApiConfig;
