import ApiConfig from "../config/apiConfig";
import { api } from "../utils/auth";

const CommonServices = {
  getReferences() {
    return api.get(ApiConfig.getReferences);
  },
  getServices() {
    return api.get(ApiConfig.services.getServices);
  },
  getClients() {
    return api.get(ApiConfig.clients.getClients);
  },
  getSessions() {
    return api.get(ApiConfig.sessions.getSessions);
  },
};

export default CommonServices;
