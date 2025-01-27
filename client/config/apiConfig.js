const ApiConfig = {
  getReferences: "/references",
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
