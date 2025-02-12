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
import { useReferenceContext } from "../../context/ReferenceContext";
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
  const [clientData, setClientData] = useState([]);
  const [showFlyout, setShowFlyout] = useState(false);
  const [initialDataLoading, setInitialDataLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [userProfileId, setUserProfileId] = useState(null);
  const [selectCounselor, setSelectCounselor] = useState(null);
  const actionDropdownRef = useRef(null);
  const { userObj } = useReferenceContext();

  const fetchClients = async (counselorId) => {
    try {
      setClientsLoading(true);
      let response;
      if (userObj?.role_id !== 4) {
        response = await CommonServices.getClientsByCounselor({
          role_id: userObj?.role_id,
          counselor_id: userObj?.user_profile_id,
        });
      } else {
        // in case of admin
        if (counselorId && counselorId !== "allCounselors") {
          response = await CommonServices.getClientsByCounselor({
            counselor_id: counselorId,
          });
        } else {
          response = await CommonServices.getClients();
        }
      }
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

  const handleSelectCounselor = (data) => {
    const counselorId = data?.value;
    setSelectCounselor(counselorId);
    fetchClients(counselorId);
  };

  const handleEditSessionInfo = async (row) => {
    try {
      setInitialDataLoading(true);
      setUserProfileId({
        label:row?.user_first_name + " " + row?.user_last_name,
        serialNumber:row?.clam_num,
        value:row?.user_profile_id
      });
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
      const filteredData = clients.filter(
        (client) => client.status_yn === "y" && client.role_id == 1
      );
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
          fetchClients={fetchClients}
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
            fetchCounselorClient={fetchClients} // after creating session =>when user click on submit => we update client // => to make green
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
        selectCounselor={selectCounselor}
        handleSelectCounselor={handleSelectCounselor}
      />
    </ClientManagementContainer>
  );
}

export default ClientManagement;
