import { useMutation } from "@tanstack/react-query";
import { api } from "../../../utils/auth";
import { toast } from "react-toastify";
import moment from "moment";
import { convertLocalToUTCTime } from "../../../utils/helper";

/**
 * Custom hook for managing additional service operations (add/update)
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Callback function called on successful mutation
 * @param {Function} options.onError - Optional callback function called on error
 * @returns {Object} - Mutation functions and loading state
 */
export const useAdditionalService = ({ onSuccess, onError }) => {
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
      : errorMessage || "Error while adding the service!";
    
    toast.error(displayMessage, {
      position: "top-right",
    });
    
    if (!isTimeCollision) {
      console.log("Error occurred while adding services: ", error);
    }
    
    if (onError) {
      onError(error, isTimeCollision);
    }
  };

  // Add additional service mutation
  const { mutate: addAdditionalService, isPending: isAddingService } = useMutation({
    mutationKey: ["add-additional-service"],
    mutationFn: async (payload) => {
      const response = await api.post("/session", payload);
      return response;
    },
    onSuccess: () => {
      toast.success("Additional service added.");
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: handleError,
  });

  // Update additional service mutation
  const { mutate: updateAdditionalService, isPending: isUpdatingService } = useMutation({
    mutationKey: ["update-additional-service"],
    mutationFn: async ({ sessionId, payload }) => {
      const response = await api.put(
        `/session/?session_id=${sessionId}`,
        payload
      );
      return response;
    },
    onSuccess: () => {
      toast.success("Additional service updated.");
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: handleError,
  });

  // Combined handler that determines whether to add or update
  const handleAddOrUpdateService = (formData, requestData, additionalServicesArray) => {
    const { services, intake_date, scheduled_time, session_id } = formData;
    
    const service = additionalServicesArray?.find(
      (item) => item.service_code === services.value
    );
    
    if (!service) {
      toast.error("Service not found");
      return;
    }

    // Convert local time to UTC using the same utility as EditSessionSchedule
    const utcDateTime = convertLocalToUTCTime(intake_date, scheduled_time);

    if (session_id) {
      // Update existing service
      // Format for PUT: separate date and time (backend will parse ISO format in scheduled_time)
      const intakeDate = moment.utc(utcDateTime).format("YYYY-MM-DD");
      const scheduledTime = moment.utc(utcDateTime).format("YYYY-MM-DD HH:mm:ss[Z]");
      
      updateAdditionalService({
        sessionId: session_id,
        payload: {
          intake_date: intakeDate,
          scheduled_time: scheduledTime,
        },
      });
    } else {
      // Add new service
      // Format for POST: single intake_date field with ISO datetime
      const payload = {
        thrpy_req_id: requestData?.req_id,
        service_id: services?.service_id,
        session_format:
          requestData?.session_format_id.toLowerCase() == "online" ? 1 : 2,
        intake_date: utcDateTime, // ISO format: "YYYY-MM-DDTHH:mm:ss.sssZ"
      };

      addAdditionalService(payload);
    }
  };

  return {
    handleAddOrUpdateService,
    isAddingService,
    isUpdatingService,
    isLoading: isAddingService || isUpdatingService,
  };
};

