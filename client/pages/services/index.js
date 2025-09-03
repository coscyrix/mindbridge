import React, { useEffect, useRef, useState } from "react";
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
function Services() {
  const [showCreateFlyout, setShowCreateFlyout] = useState(false);
  const [activeData, setActiveData] = useState();
  const [formButtonLoading, setFormButtonLoading] = useState(false);
  const actionDropdownRef = useRef(null);
  const [servicesData, setServicesData] = useState(null);
  const [servicesDataLoading, setServicesDataLoading] = useState(false);
  const { userObj } = useReferenceContext();
  const isManager = userObj?.role_id === 3;
  const userData = Cookies.get("user");
  const user = userData ? JSON.parse(userData) : null;
  const tenant_id = user?.tenant?.tenant_generated_id;
  const [allManagers, setAllManagers] = useState([]);
  const [allServices, setAllServices] = useState([]);
  const [tenantManagerOptions, setTenantManagerOptions] = useState([]);
  const fetchServices = async () => {
    try {
      setServicesDataLoading(true);
      const response = await CommonServices.getServices(tenant_id);

      if (response.status === 200) {
        const { data } = response;
        const serviceList = data?.rec || [];
        setServicesData(serviceList);
        if (Array.isArray(allManagers) && allManagers.length > 0) {
          combineManagersWithServices(serviceList, allManagers);
        }
      }
    } catch (err) {
      console.error("Error fetching services:", err);
      setServicesData([]);
    } finally {
      setServicesDataLoading(false);
    }
  };
  const handleSelectService = async (data) => {
    try {
      const tenant_id = data?.value;
      setServicesDataLoading(true);
      let response;
      if (tenant_id == "allManager") {
        response = await CommonServices.getServices();
      } else {
        response = await CommonServices.getServices(tenant_id);
      }
      if (response.status === 200) {
        const { data } = response;
        setServicesData(data?.rec || []);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.error("Error fetching references:", error);
      setServicesData([]);
    } finally {
      setServicesDataLoading(false);
    }
  };
  const fetchManager = async () => {
    try {
      const response = await api.get(
         `${ApiConfig.clients.getClients}`
      );
      if (response.status === 200) {
        const { data } = response;
        const filteredManagers = data?.rec?.filter(
          (manager) => manager.role_id === 3
        );
        setAllManagers(filteredManagers);
        if (Array.isArray(servicesData) && servicesData.length > 0) {
          combineManagersWithServices(servicesData, filteredManagers);
        }
      }
    } catch (error) {
      toast.error(error?.response?.data?.message);
      console.log("Error fetching clients", error);
    }
  };
  const combineManagersWithServices = (services, managers) => {

    const mergedOptions =
      managers
        ?.filter((m) => m?.user_first_name)
        .map((m) => ({
          label: `${m.user_first_name} ${m.user_last_name}`,
          value: m.tenant_generated_id,
        })) || [];
    mergedOptions.push({
      label: "All Manager",
      value: "allManager",
    });
    setTenantManagerOptions(mergedOptions);
  };

  const handleClickOutside = (e) => {
    if (
      actionDropdownRef.current &&
      !actionDropdownRef.current.contains(e.target)
    ) {
      setServicesData((prev) => {
        return prev?.map((data) => {
          return {
            ...data,
            active: false,
          };
        });
      });
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (
      Array.isArray(servicesData) &&
      servicesData.length > 0 &&
      Array.isArray(allManagers) &&
      allManagers.length > 0
    ) {
      combineManagersWithServices(servicesData, allManagers);
    }
  }, [allManagers, servicesData]);
  useEffect(() => {
    fetchManager();
    fetchServices();
  }, []);

  const handleCreateService = async (payload) => {
    try {
      const response = await api.post("/service", payload);

      if (response.status === 200) {
        toast.success("Service created successfully", {
          position: "top-right",
        });
        setShowCreateFlyout(false);
      }
    } catch (error) {
      console.error("Error while creating service:", error);
      toast.error(error.response.data.message, {
        position: "top-right",
      });
    }
  };
  const handleUpdateService = async (payload, serviceId) => {
    try {
      const response = await api.put(
        `/service/?service_id=${serviceId}`,
        payload
      );

      if (response.status === 200) {
        toast.success("Service updated successfully", {
          position: "top-right",
        });
        setShowCreateFlyout(false);
      }
    } catch (error) {
      console.error("Error while updating service:", error);
      toast.error("Failed to update service. Please try again.", {
        position: "top-right",
      });
    }
  };

  const handleCellClick = (row) => {
    setServicesData((prev) =>
      prev?.map((data) => {
        if (data.service_id === row.service_id) {
          return {
            ...data,
            active: !row.active,
          };
        } else {
          return {
            ...data,
            active: false,
          };
        }
      })
    );
  };

  const handleEdit = (row) => {
    setShowCreateFlyout(true);
    setActiveData(row);
  };

  const handleDelete = async (row) => {
    try {
      const res = await api.put(`/service/del/?service_id=${row?.service_id}`);
      if (res.status === 200) {
        setServicesData((prev) => {
          const updatedData = prev?.filter(
            (data) => data.service_id !== row?.service_id
          );

          return updatedData;
        });
      }
      toast.success("Client deleted Successfully", {
        position: "top-right",
      });
      handleCellClick(row);
    } catch (err) {
      console.error(err);
      toast.error("Error, While deleting the Client", {
        position: "top-right",
      });
    }
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
          handleCreateService={handleCreateService}
          handleUpdateService={handleUpdateService}
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
