import React, { useEffect, useRef, useState } from "react";
import CustomClientDetails from "../../components/CustomClientDetails";
import {
  CLIENT_MANAGEMENT_DATA,
  CONDITIONAL_ROW_STYLES,
} from "../../utils/constants";
import { ClientManagementContainer } from "../../styles/client-management";
import { api } from "../../utils/auth";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import CommonServices from "../../services/CommonServices";
import CreateSessionForm from "../../components/Forms/CreateSessionForm";
import Spinner from "../../components/common/Spinner";
const CreateClientForm = dynamic(
  () => import("../../components/Forms/CreateClientForm"),
  { ssr: false }
);
const CreateSessionLayout = dynamic(
  () =>
    import(
      "../../components/FormLayouts/CreateSessionLayout/CreateSessionLayout"
    ),
  { ssr: false }
);
function ClientManagement() {
  const [clients, setClients] = useState();
  const [clientsLoading, setClientsLoading] = useState();
  const [showCreateSessionLayout, setShowCreateSessionLayout] = useState(false);
  const [activeData, setActiveData] = useState();
  const [clientData, setClientData] = useState();
  const [showFlyout, setShowFlyout] = useState(false);
  const [initialDataLoading, setInitialDataLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [userProfileId, setUserProfileId] = useState(null);

  const actionDropdownRef = useRef(null);

  const fetchClients = async () => {
    try {
      setClientsLoading(true);
      const response = await CommonServices.getClients();
      if (response.status === 200) {
        const { data } = response;
        setClients(data?.rec);
      }
    } catch (error) {
      console.log("Error fetching clients", error);
    } finally {
      setClientsLoading(false);
    }
  };

  const handleEditSessionInfo = async (row) => {
    try {
      setInitialDataLoading(true);
      setUserProfileId(row?.user_profile_id);
      setShowFlyout(true);
      if (row?.has_schedule) {
        const { req_id } = row?.has_schedule;
        const response = await api.get(`/thrpyReq/?req_id=${req_id}`);
        if (response?.status === 200) {
          const { data } = response;
          Array.isArray(data) && data.length > 0
            ? setActiveData(data[0])
            : setActiveData(data);
        }
      }
    } catch (error) {
      console.log("Error while fetching the current user data", error);
      toast.error(`Error while fetching current user data. ${error}`);
    } finally {
      setInitialDataLoading(false);
    }
  };

  const handleCellClick = (row) => {
    console.log(row, "row");
    setClientData((prev) => {
      return prev?.map((data) => {
        if (data.user_profile_id === row.user_profile_id) {
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
      });
    });
  };

  const handleEdit = (row) => {
    setShowCreateSessionLayout(true);
    setActiveData(row);
  };

  const handleDelete = async (row) => {
    try {
      const res = await api.put(
        `user-profile/del/?user_profile_id=${row?.user_profile_id}`
      );
      if (res.status === 200) {
        setClientData((prev) => {
          const updatedData = prev?.filter(
            (data) => data.user_profile_id !== row?.user_profile_id
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
      toast.success("Error while deleting the Client", {
        position: "top-right",
      });
    }
  };

  const handleClickOutside = (e) => {
    if (
      actionDropdownRef.current &&
      !actionDropdownRef.current.contains(e.target)
    ) {
      setClientData((prev) => {
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

  const clientDataColumns = CLIENT_MANAGEMENT_DATA(
    handleCellClick,
    handleEdit,
    handleDelete,
    handleEditSessionInfo,
    actionDropdownRef
  );

  const handleCreateClient = () => {
    setShowCreateSessionLayout(true);
  };

  useEffect(() => {
    if (clients?.length > 0) {
      const filteredData = clients.filter((client) => client.status_yn === "y");
      setClientData(filteredData);
    }
  }, [clients]);

  useEffect(() => {
    fetchClients();
  }, []);

  return (
    <ClientManagementContainer>
      <CreateSessionLayout
        isOpen={showCreateSessionLayout}
        setIsOpen={setShowCreateSessionLayout}
      >
        <CreateClientForm
          isOpen={showCreateSessionLayout}
          setIsOpen={setShowCreateSessionLayout}
          initialData={activeData}
          setInitialData={setActiveData}
          tableData={clientData}
          setTableData={setClientData}
        />
      </CreateSessionLayout>
      <CreateSessionLayout
        isOpen={showFlyout}
        setIsOpen={setShowFlyout}
        initialData={activeData}
        setConfirmationModal={setConfirmationModal}
      >
        {initialDataLoading ? (
          <Spinner color="#525252" />
        ) : (
          <CreateSessionForm
            isOpen={showFlyout}
            setIsOpen={setShowFlyout}
            initialData={activeData}
            setInitialData={setActiveData}
            confirmationModal={confirmationModal}
            setConfirmationModal={setConfirmationModal}
            userProfileId={userProfileId}
          />
        )}
      </CreateSessionLayout>
      <CustomClientDetails
        title="Client List"
        overview="Your Clients at a Glance: Explore, Manage, and Stay Connected with Your Entire Client List in One Place!"
        primaryButton="Create Client"
        handleCreate={handleCreateClient}
        tableData={{ columns: clientDataColumns, data: clientData }}
        tableCaption="Client List"
        loading={clientsLoading}
        conditionalRowStyles={CONDITIONAL_ROW_STYLES?.clientManagent}
        onRowclick={handleEditSessionInfo}
        fixedHeaderScrollHeight="700px"
      />
    </ClientManagementContainer>
  );
}

export default ClientManagement;
