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
    fetchAllSplit,
    isGroupSession = false,
    selectedGroupClients = [],
    groupName = "",
    groupDescription = "",
    maxParticipants = 10,
    servicesData = null
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

        // Check if this is a group session
        const selectedServiceId = formData?.service_id?.value;
        let selectedServiceName = "Group Session";
        if (servicesData) {
          const selectedService = servicesData.find(
            (service) => service.service_id === selectedServiceId
          );
          if (selectedService) {
            selectedServiceName = selectedService.service_name;
          }
        }
        const isGroup = isGroupSession || false;

        if (isGroup) {
          // Group session payload
          if (!selectedGroupClients || selectedGroupClients.length === 0) {
            toast.error("Please select at least one participant for the group session");
            return;
          }

          const payload = {
            counselor_id: userObj?.user_profile_id,
            client_id: Number(formData?.client_first_name?.value), // Primary client
            service_id: Number(formData?.service_id?.value),
            session_format_id: Number(formData?.session_format_id?.value),
            intake_dte: payloadDate,
            group_name: groupName || selectedServiceName,
            group_description: groupDescription || null,
            max_participants: maxParticipants || 10,
            participant_client_ids: selectedGroupClients.map(client => 
              typeof client === 'object' ? client.value : client
            ),
          };

          // Add number_of_sessions if limit_sessions toggle is on
          if (formData?.limit_sessions && formData?.number_of_sessions) {
            payload.number_of_sessions = Number(formData.number_of_sessions);
          }

          const response = await api.post("/thrpyReq/group", payload);
          if (response.status === 200) {
            const { data } = response;
            // For group sessions, use the primary client's therapy request (first in array)
            if (data?.rec && data.rec.length > 0) {
              const primaryReq = data.rec[0];
              const { req_dte_not_formatted, ...sessionPayload } = primaryReq;
              setCreateSessionPayload(sessionPayload);
              setThrpyReqId(primaryReq?.req_id);
              if (initialData) {
                setScheduledSession(primaryReq?.session_obj);
                await fetchCounselorClient();
              } else {
                setSessionTableData(primaryReq?.session_obj);
              }
              setShowGeneratedSession(true);
              
              // Invalidate clients cache since has_schedule status changed
              await queryClient.invalidateQueries({
                predicate: (query) => query.queryKey[0] === "clients",
                refetchType: "all",
              });
            }
          }
        } else {
          // Regular session payload
          const payload = {
            counselor_id: userObj?.user_profile_id,
            client_id: Number(formData?.client_first_name?.value),
            service_id: Number(formData?.service_id?.value),
            session_format_id: Number(formData?.session_format_id?.value),
            intake_dte: payloadDate,
          };

          // Add number_of_sessions if limit_sessions toggle is on
          if (formData?.limit_sessions && formData?.number_of_sessions) {
            payload.number_of_sessions = Number(formData.number_of_sessions);
          }

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
            await queryClient.invalidateQueries({
              predicate: (query) => query.queryKey[0] === "clients",
              refetchType: "all",
            });
          }
        }
      }
    } catch (error) {
      // Check if the error is due to session time collision
      const errorMessage = error?.response?.data?.message || error?.message || "";
      const errorMessageLower = errorMessage.toLowerCase();
      const isTimeCollision = 
        errorMessageLower.includes("session time conflicts") ||
        errorMessageLower.includes("conflicts with an existing session") ||
        errorMessageLower.includes("collision") ||
        errorMessageLower.includes("time slot");
      
      const displayMessage = isTimeCollision
        ? "Time slot taken"
        : errorMessage || "Failed to generate schedule. Please try again.";
      
      // Show toast notification
      toast.error(displayMessage, {
        position: "top-right",
      });
      
      // For time collisions, don't log as error since it's expected behavior
      if (!isTimeCollision) {
        console.error("Error generating schedule:", error);
      }
      
      // Return to prevent further execution
      return;
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
          await queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === "clients",
            refetchType: "all",
          }); 
          
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
          await queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === "clients",
            refetchType: "all",
          });        
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
        // Invalidate clients cache since session status changed
        await queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === "clients",
          refetchType: "all",
        });
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
        // Invalidate clients cache since session status changed
        await queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === "clients",
          refetchType: "all",
        });
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
          await queryClient.invalidateQueries({
            predicate: (query) => query.queryKey[0] === "clients",
            refetchType: "all",
          });        }
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

