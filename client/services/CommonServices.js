import ApiConfig from "../config/apiConfig";
import { api } from "../utils/auth";

const CommonServices = {
  getReferences() {
    return api.get(ApiConfig.getReferences);
  },
  getAllCounselors() {
    return api.get(ApiConfig.getAllCounselors);
  },
  getServices() {
    return api.get(ApiConfig.services.getServices);
  },
  getClients() {
    return api.get(ApiConfig.clients.getClients);
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
};

export default CommonServices;
