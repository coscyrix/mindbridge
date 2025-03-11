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
function Services() {
  const [showCreateFlyout, setShowCreateFlyout] = useState(false);
  const [activeData, setActiveData] = useState();
  const [formButtonLoading, setFormButtonLoading] = useState(false);
  const actionDropdownRef = useRef(null);
  const [servicesData, setServicesData] = useState(null);
  const [servicesDataLoading, setServicesDataLoading] = useState(false);

  const fetchServices = async () => {
    try {
      setServicesDataLoading(true);
      const response = await CommonServices.getServices();

      if (response.status === 200) {
        const { data } = response;
        setServicesData(data?.rec || []);
      }
    } catch (err) {
      console.error("Error fetching references:", err);
      setServicesData([]);
    } finally {
      setServicesDataLoading(false);
    }
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
      toast.error("Failed to create service. Please try again.", {
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
          primaryButton="Create Service"
          handleCreate={() => setShowCreateFlyout(true)}
          loading={servicesDataLoading}
        />
      </ServicesContainer>
    </>
  );
}

export default Services;
