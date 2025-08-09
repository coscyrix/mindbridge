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
import SmartTab from "../../components/SmartTab";
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
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState();
  const [showCreateSessionLayout, setShowCreateSessionLayout] = useState(false);
  const [activeData, setActiveData] = useState();
  const [clientData, setClientData] = useState([]);
  const [showFlyout, setShowFlyout] = useState(false);
  const [initialDataLoading, setInitialDataLoading] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [userProfileId, setUserProfileId] = useState(null);
  const [counselors, setCounselors] = useState([
    { label: "All counselors", value: "allCounselors" },
  ]);
  const [selectCounselor, setSelectCounselor] = useState("allCounselors");
  const [activeTab, setActiveTab] = useState(0);

  const actionDropdownRef = useRef(null);
  const { userObj } = useReferenceContext();

  const tabLabels = [
    { id: 0, label: "Clients", value: "clients" },
    { id: 1, label: "Counselors", value: "counselors" },
    { id: 2, label: "Managers", value: "managers" },
    { id: 3, label: "Admins", value: "admins" },
  ];

  const handleFilterData = (tab) => {
    if (!clients || clients.length === 0) return; // Ensure clients exist

    const filteredData = clients.filter((client) => {
      return client.role_id === tab.id + 1 && client.status_yn === "y"; // Adjusted logic
    });

    setClientData(filteredData);
  };

  const fetchClients = async (counselorId) => {
    try {
      setClientsLoading(true);
      let response;
      if (![3, 4].includes(userObj?.role_id)) {
        response = await CommonServices.getClientsByCounselor({
          role_id: userObj?.role_id,
          counselor_id: userObj?.user_profile_id,
        });
      } else {
        // in case of admin
        if (counselorId && counselorId !== "allCounselors") {
          response = await CommonServices.getClientsByCounselor({
            role_id: 2,
            counselor_id: counselorId,
          });
        } else {
          response = await CommonServices.getClients({
            role_id: userObj?.role_id,
            counselor_id: userObj?.user_profile_id,
          });
        }
      }
      if (response.status === 200) {
        const { data } = response;

        setClients(data?.rec?.length > 0 ? data?.rec : []);
      }
    } catch (error) {
      console.log("Error fetching clients", error);
    } finally {
      setClientsLoading(false);
    }
  };

  const fetchCounsellor = async () => {
    try {
      const response = await CommonServices.getClients();
      if (response.status === 200) {
        const { data } = response;
        const allCounselors = data?.rec?.filter(
          (client) =>
            client?.role_id === 2 && client?.tenant_id === userObj?.tenant_id
        );
        const counselorOptions = allCounselors?.map((item) => {
          return {
            label: item?.user_first_name + " " + item?.user_last_name,
            value: item?.user_profile_id,
          };
        });
        setCounselors([...counselors, ...counselorOptions]);
      }
    } catch (error) {
      console.log("Error fetching clients", error);
    }
  };

  const handleSelectCounselor = (data) => {
    const counselorId = data?.value;
    setSelectCounselor(counselorId);
    setActiveTab(0);
    fetchClients(counselorId);
  };

  const handleEditSessionInfo = async (row) => {
    if (
      ![3, 4].includes(userObj?.role_id) ||
      ([3, 4].includes(userObj?.role_id) && row.has_schedule)
    ) {
      try {
        setInitialDataLoading(true);
        setUserProfileId({
          label: row?.user_first_name + " " + row?.user_last_name,
          serialNumber: row?.clam_num,
          value: row?.user_profile_id,
          has_schedule: row?.has_schedule,
          user_target_outcome: row?.user_target_outcome,
        });
        setShowFlyout(true);
        if (row?.has_schedule) {
          const { req_id } = row?.has_schedule;
          const response = await api.get(
            `/thrpyReq/?req_id=${req_id}&role_id=${
              userObj?.role_id == 3 ? 2 : userObj?.role_id
            }&user_profile_id=${row?.user_target_outcome?.at(0).counselor_id}` // Adjusted to use user_target_outcome
          );
          if (response?.status === 200) {
            const { data } = response;
            Array.isArray(data) && data.length > 0
              ? setActiveData(data[0])
              : setActiveData({ req_id });
          }
        }
      } catch (error) {
        console.log("Error while fetching the current user data", error);
        toast.error(`Error while fetching current user data. ${error}`);
      } finally {
        setInitialDataLoading(false);
      }
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
      handleFilterData({ id: 0 });
    } else {
      setClientData([]);
    }
  }, [clients]);

  useEffect(() => {
    fetchClients();
    if ([3, 4].includes(userObj?.role_id)) {
      fetchCounsellor();
    }
  }, [userObj]);
  return (
    <ClientManagementContainer role={userObj?.role_id}>
      {[3, 4].includes(userObj?.role_id) && (
        <div className="client-session-heading">
          <div className="heading-wrapper">
            <h2 className="heading">Client List</h2>
          </div>
          <p className="sub-heading">
            Your Clients at a Glance: Explore, Manage, and Stay Connected with
            Your Entire Client List in One Place!
          </p>
        </div>
      )}
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
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </CreateSessionLayout>
      <CustomClientDetails
        title="Client List"
        overview="Your Clients at a Glance: Explore, Manage, and Stay Connected with Your Entire Client List in One Place!"
        primaryButton={
          userObj?.role_id === 4
            ? "Create Manager"
            : userObj?.role_id === 3
            ? "Create Counselor"
            : "Create Client"
        }
        handleCreate={handleCreateClient}
        tableData={{ columns: clientDataColumns, data: clientData }}
        tableCaption="Client List"
        loading={clientsLoading}
        conditionalRowStyles={CONDITIONAL_ROW_STYLES?.clientManagent}
        onRowclick={handleEditSessionInfo}
        fixedHeaderScrollHeight="700px"
        selectCounselor={selectCounselor}
        handleSelectCounselor={handleSelectCounselor}
        counselors={counselors}
      >
        {[3, 4].includes(userObj?.role_id) && (
          <div className="custom-client-children">
            <SmartTab
              tabLabels={tabLabels}
              handleFilterData={handleFilterData}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              selectCounselor={selectCounselor}
            />
          </div>
        )}
      </CustomClientDetails>
    </ClientManagementContainer>
  );
}

export default ClientManagement;
