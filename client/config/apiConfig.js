const ApiConfig = {
  getReferences: "/references",
  getAllCounselors: "/user-profile/?role_id=2",
  services: { getServices: "/service", updateService: "/", deleteService: "/" },
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
};

export default ApiConfig;
