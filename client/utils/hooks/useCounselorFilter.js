import { useState, useEffect } from "react";
import { useReferenceContext } from "../../context/ReferenceContext";

/**
 * Custom hook to manage counselor filtering for managers/admins
 * Gets tenant ID and counselors directly from ReferenceContext
 * @returns {Object} Counselor options and selected counselor state
 */
export const useCounselorFilter = () => {
  const { allCounselors, userObj } = useReferenceContext();
  const [counselorOptions, setCounselorOptions] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);

  useEffect(() => {
    const tenantId = userObj?.tenant_id;
    
    if (allCounselors?.length && tenantId) {
      const filtered = allCounselors
        .filter((c) => c.tenant_id === tenantId)
        .map((c) => ({
          label: `${c.user_first_name} ${c.user_last_name}`,
          value: c.user_profile_id,
          tenant_id: c.tenant_id,
        }));

      setCounselorOptions([
        { label: "All Counselors", value: "ALL" },
        ...filtered,
      ]);
    }
  }, [allCounselors, userObj?.tenant_id]);

  return {
    counselorOptions,
    selectedCounselor,
    setSelectedCounselor,
  };
};

