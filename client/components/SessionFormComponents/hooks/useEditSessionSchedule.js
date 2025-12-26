import { useMutation } from "@tanstack/react-query";
import { api } from "../../../utils/auth";
import { toast } from "react-toastify";
import moment from "moment";
import { convertLocalToUTCTime } from "../../../utils/helper";

/**
 * Custom hook for managing session schedule updates
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback function called on successful mutation
 * @param {Function} options.onError - Optional callback function called on error
 * @returns {Object} - Mutation functions and loading state
 */
export const useEditSessionSchedule = ({ onSuccess, onError }) => {
  // Helper function to check if error is a time collision
  const isTimeCollisionError = (error) => {
    const errorMessage = error?.response?.data?.message || error?.message || "";
    const errorMessageLower = errorMessage.toLowerCase();
    return (
      errorMessageLower.includes("session time conflicts") ||
      errorMessageLower.includes("conflicts with an existing session") ||
      errorMessageLower.includes("collision") ||
      errorMessageLower.includes("time slot") ||
      errorMessageLower.includes("please choose a different time slot")
    );
  };

  // Custom error handler
  const handleError = (error) => {
    const errorMessage = error?.response?.data?.message || error?.message || "";
    const isTimeCollision = isTimeCollisionError(error);
    
    const displayMessage = isTimeCollision
      ? "Time slot taken. Please choose a different time slot."
      : errorMessage || "Error updating session schedule";
    
    toast.error(displayMessage, {
      position: "top-right",
    });
    
    if (!isTimeCollision) {
      console.error("Error updating session schedule:", error.message || error);
    }
    
    if (onError) {
      onError(error, isTimeCollision);
    }
  };

  // Update session schedule mutation
  const { mutate: updateSessionSchedule, isPending: isUpdatingSchedule } = useMutation({
    mutationKey: ["update-session-schedule"],
    mutationFn: async ({ sessionId, payload, setScheduledSessions, activeData, utcDateTime }) => {
      const response = await api.put(
        `session/?session_id=${sessionId}`,
        payload
      );
      
      // Only proceed if response is successful
      if (response?.status !== 200) {
        throw new Error(response?.data?.message || "Failed to update session");
      }
      
      // Update local state if response is successful
      if (setScheduledSessions && activeData && utcDateTime) {
        const inputTime = moment.utc(utcDateTime).format("HH:mm");
        const inputDate = moment.utc(utcDateTime).format("YYYY-MM-DD");
        const sessionTableFormattedTime = moment(inputTime, "HH:mm").format(
          "HH:mm:ss.SSS[Z]"
        );

        setScheduledSessions((prevData) =>
          prevData.map((item, index) =>
            index === activeData?.rowIndex
              ? {
                  ...item,
                  intake_date: inputDate,
                  scheduled_time: sessionTableFormattedTime,
                }
              : item
          )
        );
      }
      
      return response;
    },
    onSuccess: (response) => {
      toast.success("Session updated successfully!");
      // Call the onSuccess callback to close modal and reset state
      if (onSuccess) {
        onSuccess(response);
      }
    },
    onError: handleError,
  });

  // Handler that validates and updates session schedule
  const handleUpdateSessionSchedule = (formData, activeData, existingSessions, setScheduledSessions) => {
    const utcDateTime = convertLocalToUTCTime(
      formData?.intake_date,
      formData?.scheduled_time
    );

    const updatedSessionMoment = moment.utc(utcDateTime);
    if (!updatedSessionMoment.isValid()) {
      toast.error("Invalid session date or time selected. Please try again.");
      return;
    }

    // Client-side validation for overlapping sessions
    const getSessionMoment = (session) => {
      if (!session) return null;
      const sessionDate =
        session?.intake_date || session?.req_dte_not_formatted || session?.req_dte;
      const sessionTime =
        session?.scheduled_time || session?.req_time || session?.scheduledTime;
      if (!sessionDate || !sessionTime) return null;

      const ensureTrailingZ = (value) => {
        if (typeof value !== "string") return value;
        if (/Z$/i.test(value) || /[+-]\d{2}:?\d{2}$/.test(value)) {
          return value;
        }
        return `${value}Z`;
      };

      let combinedDateTime = "";
      if (typeof sessionTime === "string") {
        if (sessionTime.includes("T")) {
          combinedDateTime = sessionTime;
        } else if (sessionTime.includes(" ")) {
          combinedDateTime = sessionTime.includes("Z")
            ? sessionTime
            : ensureTrailingZ(sessionTime);
        } else {
          combinedDateTime = `${sessionDate}T${sessionTime}`;
        }
      }

      if (!combinedDateTime) {
        combinedDateTime = `${sessionDate}T${sessionTime}`;
      }

      let parsedMoment = moment.utc(combinedDateTime, moment.ISO_8601, true);
      if (!parsedMoment.isValid()) {
        parsedMoment = moment.utc(`${sessionDate} ${sessionTime}`, [
          "YYYY-MM-DD HH:mm:ss",
          "YYYY-MM-DD HH:mm:ss.SSS",
          "YYYY-MM-DD HH:mm:ss.SSSZ",
          "YYYY-MM-DD HH:mm",
          "YYYY-MM-DDTHH:mm:ss",
          "YYYY-MM-DDTHH:mm:ss.SSS",
          "YYYY-MM-DDTHH:mm:ss[Z]",
          moment.ISO_8601,
        ]);
      }

      return parsedMoment.isValid() ? parsedMoment : null;
    };

    const getPossibleIdentifiers = (session) => {
      if (!session) return [];
      const directIds = [
        session?.session_id,
        session?.sessionId,
        session?.scheduled_session_id,
        session?.session_obj_id,
        session?.sessionNumber,
        session?.session_number,
        session?.id,
      ]
        .filter((value) => value !== undefined && value !== null)
        .map((value) => String(value));

      const nestedSessionId = session?.session_obj?.session_id;
      if (nestedSessionId !== undefined && nestedSessionId !== null) {
        directIds.push(String(nestedSessionId));
      }

      return directIds;
    };

    const hasSharedIdentifier = (firstSession, secondSession) => {
      const firstIdentifiers = getPossibleIdentifiers(firstSession);
      const secondIdentifiers = getPossibleIdentifiers(secondSession);
      return (
        firstIdentifiers.length > 0 &&
        secondIdentifiers.length > 0 &&
        firstIdentifiers.some((id) => secondIdentifiers.includes(id))
      );
    };

    const currentSessionMoment = getSessionMoment(activeData);
    const overlapsWithExistingSession = existingSessions?.some((session) => {
      if (!session) return false;
      const sessionMoment = getSessionMoment(session);
      if (!sessionMoment) return false;

      const isSameSession =
        hasSharedIdentifier(session, activeData) ||
        (currentSessionMoment && sessionMoment.isSame(currentSessionMoment));

      if (isSameSession) {
        return false;
      }

      return sessionMoment.isSame(updatedSessionMoment);
    });

    if (overlapsWithExistingSession) {
      toast.error(
        "Selected date and time overlap with an existing session. Please choose a different slot."
      );
      return;
    }

    // Prepare payload
    const intakeDate = moment.utc(utcDateTime).format("YYYY-MM-DD");
    const scheduledTime = moment
      .utc(utcDateTime)
      .format("YYYY-MM-DD HH:mm:ss[Z]");

    const payload = {
      intake_date: intakeDate,
      scheduled_time: scheduledTime,
    };

    // Call mutation
    updateSessionSchedule({
      sessionId: formData?.session_id,
      payload,
      setScheduledSessions,
      activeData,
      utcDateTime,
    });
  };

  return {
    handleUpdateSessionSchedule,
    isUpdatingSchedule,
    isLoading: isUpdatingSchedule,
  };
};

