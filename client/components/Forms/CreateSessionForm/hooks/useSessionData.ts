import { useState, useEffect } from "react";
import { api } from "../../../../utils/auth";
import CommonServices from "../../../../services/CommonServices";
import { toast } from "react-toastify";

export const useSessionData = (userObj, initialData, isOpen) => {
  const [servicesData, setServicesData] = useState(null);
  const [clients, setClients] = useState();
  const [scheduledSession, setScheduledSession] = useState([]);
  const [additionalSessions, setAddittionalSessions] = useState([]);
  const [sessionTableData, setSessionTableData] = useState(null);
  const [countNotes, setCountNotes] = useState([]);
  const [feeSplitDetails, setFeeSplitDetails] = useState(null);
  const [counselorSplit, setCounselorSplit] = useState(null);
  const [managerSplit, setManagerSplit] = useState(null);
  const [dischargeOrDelete, setDischargeOrDelete] = useState("Delete");

  const fetchServices = async () => {
    try {
      let tenant_id = userObj?.tenant?.tenant_generated_id;
      const response = await api.get(`/service?tenant_id=${tenant_id}`);
      if (response.status === 200) {
        const { data } = response;
        const serviceList = data?.rec || [];
        setServicesData(serviceList);
      }
    } catch (error) {
      console.log(error?.response?.data?.message);
    }
  };

  const fetchClients = async () => {
    try {
      let response;
      if (userObj?.role_id == 2) {
        response = await api.get(
          `/user-profile/?role_id=2&counselor_id=${userObj?.user_profile_id}`
        );
      } else {
        response = await CommonServices.getClients({
          role_id: `${userObj?.role_id}`,
          counselor_id: `${userObj?.user_profile_id}`,
        });
      }
      if (response.status === 200) {
        const { data } = response;
        setClients(data?.rec?.filter((users) => users?.role_id === 1));
      }
    } catch (error) {
      console.log("Error fetching clients", error);
    }
  };

  const fetchAllSplit = async () => {
    try {
      const response = await api.get(
        `${ApiConfig.feeSplitManagment.getAllfeesSplit}?tenant_id=${userObj?.tenant_id}`
      );
      if (response.status == 200) {
        setCounselorSplit(
          response?.data?.data?.counselor_specific_configurations
        );
        setManagerSplit(response?.data?.data?.default_configuration);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
    }
  };

  const getAllSessionOfClients = async () => {
    try {
      const response = await api.get(
        `/thrpyReq/?req_id=${initialData?.req_id}&role_id=${
          userObj?.role_id == 3 ? 2 : userObj?.role_id
        }&user_profile_id=${initialData?.counselor_id}`
      );
      if (response?.status === 200) {
        const scheduledSession = response?.data[0]?.session_obj;
        setFeeSplitDetails(response?.data[0]?.fee_split_management);
        const result =
          scheduledSession &&
          scheduledSession?.some(
            (session) => session.session_status.toLowerCase() === "show"
          )
            ? "Discharge"
            : "Delete";
        setDischargeOrDelete(result);
        const addittionalSession = scheduledSession?.filter(
          (session) => session?.is_additional === 1
        );
        const updatedSessions = scheduledSession?.filter(
          (session) => session?.is_additional === 0
        );
        setScheduledSession(updatedSessions);
        setAddittionalSessions(addittionalSession);
        
        // Initialize countNotes from session_notes array
        // session_notes can be: array of notes, null, or undefined
        const notes = scheduledSession?.map((session) => {
          let count = 0;
          if (session?.session_notes) {
            // Check if it's an array and get its length
            if (Array.isArray(session.session_notes)) {
              count = session.session_notes.length;
            }
            // If it's not an array (shouldn't happen, but handle it), count = 0
          }
          return {
            session_id: session?.session_id,
            count: count,
          };
        }) || [];
        setCountNotes(notes);
      }
    } catch (error) {
      console.log(":: Error in getAllSessionOfClients", error);
    }
  };

  useEffect(() => {
    if (userObj && Object.keys(userObj).length > 0) {
      if (userObj?.role_id !== 4) {
        fetchServices();
      }
      fetchClients();
    }
  }, [userObj]);

  return {
    servicesData,
    clients,
    scheduledSession,
    setScheduledSession,
    additionalSessions,
    setAddittionalSessions,
    sessionTableData,
    setSessionTableData,
    countNotes,
    setCountNotes,
    feeSplitDetails,
    counselorSplit,
    managerSplit,
    dischargeOrDelete,
    setDischargeOrDelete,
    fetchServices,
    fetchClients,
    fetchAllSplit,
    getAllSessionOfClients,
  };
};

