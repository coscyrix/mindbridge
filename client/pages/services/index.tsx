import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { api } from "../../utils/auth";
import {
  ClientManagementTableActionButton,
  SERVICES_TABLE_COLUMNS,
} from "../../utils/constants";
import { ServicesContainer } from "../../styles/services";
import CreateSessionLayout from "../../components/FormLayouts/CreateSessionLayout/CreateSessionLayout";
import CreateServiceForm from "../../components/Forms/CreateServiceForm";
import CustomClientDetails from "../../components/CustomClientDetails";
import { toast } from "react-toastify";
import CommonServices from "../../services/CommonServices";
import { useReferenceContext } from "../../context/ReferenceContext";
import Cookies from "js-cookie";
import ApiConfig from "../../config/apiConfig";
import { useQueryData } from "../../utils/hooks/useQueryData";
import { useMutationData } from "../../utils/hooks/useMutationData";
function Services() {
  const [showCreateFlyout, setShowCreateFlyout] = useState(false);
  const [activeData, setActiveData] = useState();
  const [formButtonLoading, setFormButtonLoading] = useState(false);
  const actionDropdownRef = useRef(null);
  const { userObj } = useReferenceContext();
  const isManager = userObj?.role_id === 3;
  const [user, setUser] = useState(null);
  const tenant_id = userObj?.tenant?.tenant_generated_id;
  const [allManagers, setAllManagers] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [tenantManagerOptions, setTenantManagerOptions] = useState([]);
  const [activeRowId, setActiveRowId] = useState(null); // Track which row's dropdown is open
  const [selectedTenantId, setSelectedTenantId] = useState(null); // Track selected tenant from dropdown

  // Use the selected tenant ID if available, otherwise use the user's tenant ID
  const queryTenantId = selectedTenantId || tenant_id;

  const {
    data: servicesResponse,
    isPending: servicesDataLoading,
    refetch: refetchServices,
  } = useQueryData(
    ["services", queryTenantId],
    async () => {
      const response = await CommonServices.getServices(
        queryTenantId === "allManager" ? undefined : queryTenantId
      );
      console.log(response, "response services 💀");
      return response;
    },
    !!queryTenantId // Only fetch when tenant_id exists
  );


  const servicesData = useMemo(() => {
    return (servicesResponse?.data?.rec || []).map((service) => ({
      ...service,
      active: service.service_id === activeRowId,
    }));
  }, [servicesResponse?.data?.rec, activeRowId]);

  const handleSelectService = (data) => {
    // Update selected tenant ID - TanStack Query will automatically refetch
    const tenant_id = data?.value;
    console.log(tenant_id, "service");
    setSelectedTenantId(tenant_id);
  };
  const fetchManager = useCallback(async () => {
    try {
      const response = await api.get(`${ApiConfig.clients.getClients}`);
      if (response.status === 200) {
        const { data } = response;
        const filteredManagers = data?.rec?.filter(
          (manager) => manager.role_id === 3
        );
        console.log(filteredManagers, "service");
        setAllManagers(filteredManagers);
        // Don't call combineManagersWithServices here - let the useEffect handle it
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.log("Error fetching clients", error);
    }
  }, []); 
  const combineManagersWithServices = useCallback((services, managers) => {
    const mergedOptions =
      managers
        ?.filter((m) => m?.user_first_name)
        .map((m) => ({
          label: `${m.user_first_name} ${m.user_last_name}`,
          value: m?.tenant.tenant_generated_id,
        })) || [];
    mergedOptions.push({
      label: "All Manager",
      value: "allManager",
    });
    setTenantManagerOptions(mergedOptions);
  }, []); // No external dependencies
  console.log(tenantManagerOptions, "service");
  const handleClickOutside = (e) => {
    if (
      actionDropdownRef.current &&
      !actionDropdownRef.current.contains(e.target)
    ) {
      setActiveRowId(null); // Close all dropdowns
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  useEffect(() => {
    const data = localStorage.getItem("user");
    if (data) {
      const userDetails = JSON.parse(data);
      setUser(userDetails);
    }
  }, []);
  // Combine managers with services when data changes
  useEffect(() => {
    if (
      Array.isArray(servicesData) &&
      servicesData.length > 0 &&
      Array.isArray(allManagers) &&
      allManagers.length > 0
    ) {
      combineManagersWithServices(servicesData, allManagers);
    }
  }, [allManagers, servicesData, combineManagersWithServices]);

  // Fetch managers when userObj is available (services are fetched automatically by useQueryData)
  useEffect(() => {
    if (userObj && Object.keys(userObj).length > 0) {
      fetchManager();
    }
  }, [userObj, fetchManager]);

  // Mutation for deleting service
  const { mutate: deleteService, isPending: isDeleting } = useMutationData(
    ["delete-service"],
    async (serviceId) => {
      return await api.put(`/service/del/?service_id=${serviceId}`);
    },
    "services"
  );

  const handleCellClick = (row) => {
    // Toggle dropdown for this row
    setActiveRowId((prevId) => 
      prevId === row.service_id ? null : row.service_id
    );
  };

  const handleEdit = (row) => {
    setShowCreateFlyout(true);
    setActiveData(row);
  };

  const handleDelete = (row) => {
    deleteService(row?.service_id);
    handleCellClick(row);
  };

  return (
    <>
      <CreateSessionLayout
        isOpen={showCreateFlyout}
        setIsOpen={setShowCreateFlyout}
      >
        <CreateServiceForm
          isManager={isManager}
          isOpen={showCreateFlyout}
          setIsOpen={setShowCreateFlyout}
          initialData={activeData}
          setInitialData={setActiveData}
        />
      </CreateSessionLayout>
      <ServicesContainer>
        <CustomClientDetails
          title=" Service List"
          overview="Comprehensive table detailing health services provided, with service names, descriptions, pricing, and availability to facilitate client bookings."
          tableData={{
            columns: SERVICES_TABLE_COLUMNS(
              handleCellClick,
              handleEdit,
              handleDelete,
              actionDropdownRef
            ),
            data: servicesData,
          }}
          actionButton={ClientManagementTableActionButton}
          handleSelectService={handleSelectService}
          serviceOptions={tenantManagerOptions}
          primaryButton="Create Service"
          handleCreate={() => setShowCreateFlyout(true)}
          loading={servicesDataLoading}
        />
      </ServicesContainer>
    </>
  );
}

export default Services;
