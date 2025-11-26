import { useState } from "react";
import { api } from "../auth";
import { toast } from "react-toastify";
import ApiConfig from "../../config/apiConfig";
import { useReferenceContext } from "../../context/ReferenceContext";

/**
 * Custom hook to manage session modal state and data fetching
 * Gets user data directly from ReferenceContext
 * @returns {Object} Modal state and control functions
 */
export const useSessionModal = () => {
  const { userObj } = useReferenceContext();
  const [showModal, setShowModal] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Opens session modal and fetches session data
   * @param {number} reqId - Therapy request ID
   * @param {number} counselorId - Counselor profile ID
   */
  const openSessionModal = async (reqId, counselorId) => {
    if (!reqId) {
      toast.info("No session associated with this item");
      return;
    }

    // Get userObj from context or fallback to localStorage
    let currentUserObj = userObj;
    
    // If userObj is empty/loading, try to get it directly from localStorage
    if (!currentUserObj?.role_id) {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          currentUserObj = JSON.parse(storedUser);
        }
      } catch (error) {
        console.error("Error reading user from localStorage", error);
      }
    }

    // Final check
    if (!currentUserObj?.role_id) {
      console.error("User role_id is not available. User may not be logged in.");
      toast.error("User information not available. Please refresh the page.");
      return;
    }

    try {
      setLoading(true);
      setShowModal(true);

      // Ensure role_id is a number
      const roleId = Number(currentUserObj.role_id);
      const effectiveRoleId = roleId === 3 ? 2 : roleId;

      const response = await api.get(
        `${ApiConfig.sessions.getSessions}/?req_id=${reqId}&role_id=${effectiveRoleId}&user_profile_id=${counselorId}`
      );

      if (response?.status === 200) {
        const { data } = response;
        Array.isArray(data) && data.length > 0
          ? setSessionData(data[0])
          : setSessionData({ req_id: reqId });
      }
    } catch (error) {
      console.error("Error fetching session data", error);
      toast.error(`Error fetching session data. ${error?.message || error}`);
      setShowModal(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Closes the session modal and clears session data
   */
  const closeSessionModal = () => {
    setShowModal(false);
    setSessionData(null);
  };

  return {
    showModal,
    sessionData,
    loading,
    openSessionModal,
    closeSessionModal,
    // Expose setters for advanced use cases (e.g., manual modal control, data updates)
    setShowModal,
    setSessionData,
  };
};

