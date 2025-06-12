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
};

export default ApiConfig;
