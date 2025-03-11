import { createContext, useContext, useEffect, useState } from "react";
import CommonServices from "../services/CommonServices";
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
  const [allCounselors, setAllCounselors] = useState();
  const [tokenExpired, setTokenExpired] = useState(true);
  const user = Cookies.get("user");
  const userObj = user && JSON.parse(user);
  const router = useRouter();

  const fetchReferences = async () => {
    try {
      const response = await CommonServices.getReferences();
      if (response.status === 200) {
        setTokenExpired(false);
        const { data } = response;
        setServicesData(data?.service);
        setRoles(data?.roles);
        setTargetOutcomes(data?.ref_target_outcomes);
        setForms(data?.forms);
        getAllCounselors();
      }
    } catch (err) {
      setTokenExpired(true);
      console.error("Error fetching references:", err);
    }
  };

  const getAllCounselors = async () => {
    try {
      const response = await CommonServices.getAllCounselors();
      if (response.status === 200) {
        const { data } = response;
        setAllCounselors(data?.rec);
      }
    } catch (error) {
      console.error("Error while fetching all the users", error);
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
        allCounselors,
        tokenExpired,
      }}
    >
      {children}
    </ReferenceContext.Provider>
  );
};

export const useReferenceContext = () => useContext(ReferenceContext);
