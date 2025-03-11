const ApiConfig = {
  getReferences: "/references",
  getAllCounselors: "/user-profile/?role_id=2",
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
  services: { getServices: "/service", updateService: "/", deleteService: "/" },
  forms: {
    submissionDetails: "/userForm",
  },
  feedback: {
    getFeedbackFormDetails: "/feedback",
  },
};

export default ApiConfig;
