import { createContext, useContext, useEffect, useState } from "react";
import CommonServices from "../services/CommonServices";
import { logout } from "../utils/auth";
import Cookies from "js-cookie";
import { useRouter } from "next/router";

const ReferenceContext = createContext({});

export const ReferenceContextProvider = ({ children }) => {
  const [position, setPosition] = useState();
  const [serviceId, setServiceId] = useState();
  const [roles, setRoles] = useState();
  const [targetOutcomes, setTargetOutcomes] = useState();
  const [servicesData, setServicesData] = useState();
  const [forms, setForms] = useState();
  const user = Cookies.get("user");
  const userObj = user && JSON.parse(user);
  const router = useRouter();

  const fetchReferences = async () => {
    try {
      const response = await CommonServices.getReferences();
      if (response.status === 200) {
        const { data } = response;
        setServicesData(data?.service);
        setRoles(data?.roles);
        setTargetOutcomes(data?.ref_target_outcomes);
        setForms(data?.forms);
      }
    } catch (err) {
      if (err.status === 403) {
        logout();
        return;
      }
      console.error("Error fetching references:", err);
    }
  };

  useEffect(() => {
    if (router.pathname !== "/patient-forms") {
      fetchReferences();
    }
  }, []);

  return (
    <ReferenceContext.Provider
      value={{
        position,
        serviceId,
        roles,
        targetOutcomes,
        servicesData,
        userObj,
        forms,
      }}
    >
      {children}
    </ReferenceContext.Provider>
  );
};

export const useReferenceContext = () => useContext(ReferenceContext);
