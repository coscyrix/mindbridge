import { useState, useCallback } from "react";
import { api } from "../auth";
import { toast } from "react-toastify";
import ApiConfig from "../../config/apiConfig";
import { useReferenceContext } from "../../context/ReferenceContext";

/**
 * Custom hook to fetch and manage fee split configurations
 * Gets user data directly from ReferenceContext
 * @returns {Object} Fee split data and fetch function
 */
export const useFeeSplit = () => {
  const { userObj } = useReferenceContext();
  const [counselorConfiguration, setCounselorConfiguration] = useState(null);
  const [managerSplitDetails, setManagerSplitDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  /**
   * Fetches fee split configuration for a given tenant
   * @param {number} tenantId - Tenant ID to fetch fee split for
   */
  const fetchFeeSplit = useCallback(
    async (tenantId) => {
      if (!tenantId) {
        return;
      }

      try {
        setLoading(true);
        const response = await api.get(
          `${ApiConfig.feeSplitManagment.getAllfeesSplit}?tenant_id=${tenantId}`
        );

        if (response.status === 200) {
          setCounselorConfiguration(
            response?.data?.data?.counselor_specific_configurations
          );
          setManagerSplitDetails(response?.data?.data?.default_configuration);
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Error fetching fee split data"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return {
    counselorConfiguration,
    managerSplitDetails,
    loading,
    fetchFeeSplit,
  };
};

