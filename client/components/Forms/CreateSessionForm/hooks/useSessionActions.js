import { useState } from "react";
import { api } from "../../../../utils/auth";
import { toast } from "react-toastify";
import { convertLocalToUTCTime } from "../../../../utils/helper";
import { useQueryClient } from "@tanstack/react-query";

export const useSessionActions = (
  userObj,
  initialData,
  methods,
  getAllSessionOfClients,
  setIsOpen,
  fetchCounselorClient,
  setDischargeOrDelete,
  dischargeOrDelete
) => {
  const queryClient = useQueryClient();
  const [loader, setLoader] = useState(null);
  const [thrpyReqId, setThrpyReqId] = useState(null);
  const [createSessionPayload, setCreateSessionPayload] = useState(null);
  const [showGeneratedSession, setShowGeneratedSession] = useState(false);

  const handleGenerateSchedule = async (
    allSessionsStatusScheduled,
    setSessionTableData,
    setScheduledSession,
    fetchAllSplit
  ) => {
    fetchAllSplit();
    const formData = methods.getValues();
    const { client_first_name } = formData;
    const hasOngoingSession =
      (!initialData && client_first_name?.has_schedule) ||
      (initialData && !allSessionsStatusScheduled);

    if (hasOngoingSession) {
      toast.error(
        "Cannot generate new session for the client having an ongoing session!"
      );
      return;
    }

    try {
      setLoader("generateSessionSchedule");
      if (formData) {
        // Validate required fields before creating payload
        if (!formData?.client_first_name?.value || 
            !formData?.service_id?.value || 
            !formData?.session_format_id?.value) {
          toast.error("Please fill in all required fields (Client, Service, Session Format)");
          return;
        }

        const payloadDate = convertLocalToUTCTime(
          formData?.req_dte,
          formData?.req_time
        );
        const payload = {
          counselor_id: userObj?.user_profile_id,
          client_id: Number(formData?.client_first_name?.value),
          service_id: Number(formData?.service_id?.value),
          session_format_id: Number(formData?.session_format_id?.value),
          intake_dte: payloadDate,
        };

        const response = await api.post("/thrpyReq", payload);
        if (response.status === 200) {
          const { data } = response;
          const { req_dte_not_formatted, ...sessionPayload } = data?.rec[0];
          setCreateSessionPayload(sessionPayload);
          setThrpyReqId(data?.rec[0]?.req_id);
          if (initialData) {
            setScheduledSession(data?.rec[0]?.session_obj);
            await fetchCounselorClient();
          } else {
            setSessionTableData(data?.rec[0]?.session_obj);
          }
          setShowGeneratedSession(true);
          
          // Invalidate clients cache since has_schedule status changed
          await queryClient.invalidateQueries({ queryKey: ["clients"] });
        }
      }
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error(
        error?.response?.data?.message ||
          "Failed to generate schedule. Please try again.",
        {
          position: "top-right",
        }
      );
    } finally {
      setLoader(null);
    }
  };

  const handleDischargeOrDelete = async (id, userProfileId) => {
    try {
      setLoader("dischargeOrDelete");
      let response;
      if (dischargeOrDelete == "Discharge") {
        response = await api.put(
          `thrpyReq/?req_id=${id}&role_id=${userObj?.role_id}&user_profile_id=${userObj?.user_profile_id}`,
          {
            thrpy_status: "DISCHARGED",
          }
        );
        if (response.status === 200) {
          toast.success("Client Discharged!");
          // Invalidate clients cache since has_schedule status changed
          await queryClient.invalidateQueries({ queryKey: ["clients"] });
        }
      } else {
        response = await api.put(
          `thrpyReq/?req_id=${id}&role_id=${userObj?.role_id}&user_profile_id=${userObj?.user_profile_id}`,
          {
            status_yn: "n",
          }
        );
        if (response.status === 200) {
          await fetchCounselorClient(userProfileId);
          toast.success("Client session data deleted!");
          // Invalidate clients cache since has_schedule status changed
          await queryClient.invalidateQueries({ queryKey: ["clients"] });
        }
      }
    } catch (error) {
      const errorMessage =
        dischargeOrDelete == "Discharge"
          ? "Error updating the client session status"
          : error.message;
      console.error("Error updating the client session status :", error);
      toast.error(error?.message);
    } finally {
      setLoader(null);
      setIsOpen(false);
    }
  };

  const handleShowStatus = async (row, setShowStatusConfirmationModal) => {
    try {
      setLoader("showStatusLoader");
      const payload = {
        session_status: 2,
      };
      let response;
      if ([3, 4].includes(userObj?.role_id)) {
        response = await api.put(
          `/session/?session_id=${row?.session_id}&role_id=${userObj?.role_id}&user_profile_id=${userObj?.user_profile_id}`,
          payload
        );
      } else {
        response = await api.put(
          `/session/?session_id=${row?.session_id}`,
          payload
        );
      }
      if (response?.status === 200) {
        setShowStatusConfirmationModal(false);
        toast.success("Session status updated successfully!");
        await getAllSessionOfClients();
        dischargeOrDelete == "Delete" && setDischargeOrDelete("Discharge");
      }
    } catch (error) {
      toast.error(error?.message || "Error while updating the session status!");
    } finally {
      setLoader(null);
      setShowStatusConfirmationModal(false);
    }
  };

  const handleResetStatus = async (row, setShowResetConfirmationModal) => {
    try {
      setLoader("resetStatusLoader");
      const payload = {
        session_status: 1,
      };
      let response;
      if ([3, 4].includes(userObj?.role_id)) {
        response = await api.put(
          `/session/?session_id=${row?.session_id}&role_id=${userObj?.role_id}&user_profile_id=${userObj?.user_profile_id}`,
          payload
        );
      } else {
        response = await api.put(
          `/session/?session_id=${row?.session_id}`,
          payload
        );
      }
      if (response?.status === 200) {
        setShowResetConfirmationModal(false);
        toast.success("Session status updated successfully!");
        await getAllSessionOfClients();
      }
    } catch (error) {
      toast.error("Error while updating the session status!");
    } finally {
      setLoader(null);
      setShowResetConfirmationModal(false);
    }
  };

  const handleAffirmativeAction = async (
    isClose,
    setConfirmationModal,
    setSessionTableData,
    setIsDiscard,
    pendingValueChange,
    setPendingValueChange
  ) => {
    if (pendingValueChange) {
      const { fieldName, value } = pendingValueChange;
      methods.setValue(fieldName, value);
      setPendingValueChange(null);
    }

    try {
      setLoader("discardChanges");
      if (thrpyReqId) {
        const response = await api.put(
          `/thrpyReq?req_id=${thrpyReqId}&role_id=${userObj?.role_id}&user_profile_id=${userObj?.user_profile_id}`,
          {
            status_yn: "n",
          }
        );
        if (response.status === 200) {
          toast.success("Therapy request discarded!");
          // Invalidate clients cache since has_schedule status changed
          await queryClient.invalidateQueries({ queryKey: ["clients"] });
        }
      }
      if (isClose) {
        setIsOpen(false);
      }
    } catch (error) {
      console.log("Error while discarding therapy request :", error);
      toast.error("Error while discarding therapy request.");
    } finally {
      setSessionTableData([]);
      setConfirmationModal(false);
      setThrpyReqId(null);
      setLoader(null);
    }
  };

  return {
    loader,
    setLoader,
    thrpyReqId,
    setThrpyReqId,
    createSessionPayload,
    showGeneratedSession,
    setShowGeneratedSession,
    handleGenerateSchedule,
    handleDischargeOrDelete,
    handleShowStatus,
    handleResetStatus,
    handleAffirmativeAction,
  };
};

