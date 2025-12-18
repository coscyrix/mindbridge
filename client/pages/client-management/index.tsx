import React, { useEffect, useRef, useState, useMemo } from "react";
import CustomClientDetails from "../../components/CustomClientDetails";
import {
  CLIENT_MANAGEMENT_DATA,
  CONDITIONAL_ROW_STYLES,
} from "../../utils/constants";
import { ClientManagementContainer } from "../../styles/client-management";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import CommonServices from "../../services/CommonServices";
import CreateSessionForm from "../../components/Forms/CreateSessionForm";
import Spinner from "../../components/common/Spinner";
import { useReferenceContext } from "../../context/ReferenceContext";
import SmartTab from "../../components/SmartTab";
import { useRouter } from "next/router";
import { useSessionModal, useFeeSplit } from "../../utils/hooks";
import { useQueryData } from "../../utils/hooks/useQueryData";
import { useMutationData } from "../../utils/hooks/useMutationData";
import { api } from "../../utils/auth";
import { useQueryClient } from "@tanstack/react-query";

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
  const router = useRouter();
  const { userObj } = useReferenceContext();
  const queryClient = useQueryClient();
  
  const [showCreateSessionLayout, setShowCreateSessionLayout] = useState(false);
  const [clientFormData, setClientFormData] = useState();
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [userProfileId, setUserProfileId] = useState(null);
  const [selectCounselor, setSelectCounselor] = useState("allCounselors");
  const [activeTab, setActiveTab] = useState(0);
  const [counselorId, setCounselorId] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null); // Track active dropdown row

  const actionDropdownRef = useRef(null);

  // Custom hooks - they get userObj internally from context
  const {
    showModal: showFlyout,
    sessionData: activeData,
    openSessionModal,
    closeSessionModal,
    setSessionData: setActiveData,
  } = useSessionModal();

  const { counselorConfiguration, managerSplitDetails, fetchFeeSplit } =
    useFeeSplit();

  const tabLabels = [
    { id: 0, label: "Clients", value: "clients" },
    { id: 1, label: "Counselors", value: "counselors" },
    { id: 2, label: "Managers", value: "managers" },
    { id: 3, label: "Admins", value: "admins" },
  ];

  // Build query params for fetching clients
  const buildClientParams = () => {
    const isAdminOrManager = [3, 4].includes(userObj?.role_id);

    if (!isAdminOrManager) {
      return {
        role_id: userObj?.role_id,
        counselor_id: userObj?.user_profile_id,
      };
    }

    // For admin/manager with counselor filter
    if (selectCounselor && selectCounselor !== "allCounselors") {
      return {
        role_id: 2,
        counselor_id: selectCounselor,
      };
    }

    // For admin/manager without filter (all clients)
    return {
      role_id: userObj?.role_id,
      counselor_id: userObj?.user_profile_id,
    };
  };

  // Fetch clients using TanStack Query
  const {
    data: clientsResponse,
    isPending: clientsLoading,
    refetch: refetchClients,
    error: clientsError,
  } = useQueryData(
    ["clients", userObj?.role_id, userObj?.user_profile_id, selectCounselor],
    async () => {
      const params = buildClientParams();
      const isAdminOrManager = [3, 4].includes(userObj?.role_id);
      const isCounselorFiltered =
        selectCounselor && selectCounselor !== "allCounselors";

      let response;
      if (!isAdminOrManager || isCounselorFiltered) {
        response = await CommonServices.getClientsByCounselor(params);
      } else {
        response = await CommonServices.getClients(params);
      }

      return response?.data?.rec || [];
    },
    !!userObj?.role_id && !!userObj?.user_profile_id
  );

  // Fetch counselors for dropdown (only for admin/manager)
  const { data: counselorsResponse, error: counselorsError } = useQueryData(
    ["counselors-dropdown", userObj?.tenant_id],
    async () => {
      const response = await CommonServices.getClients();
      const allCounselors = response?.data?.rec?.filter(
        (client) =>
          client?.role_id === 2 && client?.tenant_id === userObj?.tenant_id
      );
      return allCounselors || [];
    },
    [3, 4].includes(userObj?.role_id) && !!userObj?.tenant_id
  );

  // Transform counselors data for dropdown
  const counselors = useMemo(() => {
    const counselorOptions =
      counselorsResponse?.map((item) => ({
        label: `${item?.user_first_name} ${item?.user_last_name}`,
        value: item?.user_profile_id,
      })) || [];

    return [
      { label: "All counselors", value: "allCounselors" },
      ...counselorOptions,
    ];
  }, [counselorsResponse]);

  // Delete client mutation
  const { mutate: deleteClient, isPending: isDeleting } = useMutationData(
    ["delete-client"],
    async (userId) => {
      return await api.put(`user-profile/del/?user_profile_id=${userId}`);
    },
    ["clients", "sessions"] // This will auto-invalidate all "clients" and "sessions" queries after delete
  );

  // Handle errors
  useEffect(() => {
    if (clientsError) {
      console.log("Error fetching clients", clientsError);
      toast.error("Error fetching clients");
    }
  }, [clientsError]);

  useEffect(() => {
    if (counselorsError) {
      console.log("Error fetching counselors", counselorsError);
    }
  }, [counselorsError]);

  // Filter and prepare client data based on active tab
  const clientData = useMemo(() => {
    const clients = clientsResponse || [];
    if (!clients || clients.length === 0) return [];

    const filtered = clients.filter((client) => {
      return client.role_id === activeTab + 1 && client.status_yn === "y";
    });

    return filtered.map((client) => ({
      ...client,
      active: client.user_profile_id === activeRowId,
    }));
  }, [clientsResponse, activeTab, activeRowId]);

  const handleFilterData = (tab) => {
    setActiveTab(tab.id);
  };

  const handleSelectCounselor = (data) => {
    const counselorId = data?.value;
    setSelectCounselor(counselorId);
    setActiveTab(0);
    // Query will automatically refetch due to key change
  };

  const handleEditSessionInfo = async (row) => {
    if (
      ![3, 4, 2].includes(userObj?.role_id) ||
      ([3, 4, 2].includes(userObj?.role_id) && row.has_schedule)
    ) {
      if (row?.tenant_id) {
        setCounselorId(row?.user_target_outcome?.at(0).counselor_id);
        await fetchFeeSplit(row?.tenant_id);
      }

      setUserProfileId({
        label: row?.user_first_name + " " + row?.user_last_name,
        serialNumber: row?.clam_num,
        value: row?.user_profile_id,
        has_schedule: row?.has_schedule,
        user_target_outcome: row?.user_target_outcome,
      });

      if (row?.has_schedule) {
        const { req_id } = row?.has_schedule;
        await openSessionModal(
          req_id,
          row?.user_target_outcome?.at(0).counselor_id
        );
      }
    } else {
      if (userObj?.role_id === 2) {
        router.push("/client-session?open=true");
      }
    }
  };

  const handleCellClick = (row) => {
    setActiveRowId((prevId) =>
      prevId === row.user_profile_id ? null : row.user_profile_id
    );
  };

  const handleEdit = (row) => {
    setClientFormData(row);
    setShowCreateSessionLayout(true);
  };

  const handleDelete = (row) => {
    deleteClient(row?.user_profile_id);
    setActiveRowId(null);
  };

  // Activate user mutation (works for both counselors and tenants)
  const { mutate: activateUser, isPending: isActivating } = useMutationData(
    ["activate-user"],
    async ({ user_id, tenant_id }) => {
      return await CommonServices.activateUser(user_id, tenant_id);
    },
    ["clients", "counselors-dropdown"] // Invalidate queries after activation
  );

  // Deactivate user mutation (works for both counselors and tenants)
  const { mutate: deactivateUser, isPending: isDeactivating } = useMutationData(
    ["deactivate-user"],
    async ({ user_id, tenant_id }) => {
      return await CommonServices.deactivateUser(user_id, tenant_id);
    },
    ["clients", "counselors-dropdown"] // Invalidate queries after deactivation
  );

  const handleActivate = (row) => {
    if (!row?.user_id) {
      toast.error("Unable to activate: User ID not found");
      return;
    }

    const tenantId = row?.tenant_id || userObj?.tenant_id;
    if (!tenantId) {
      toast.error("Unable to activate: Tenant ID not found");
      return;
    }

    activateUser(
      { user_id: row.user_id, tenant_id: tenantId },
      {
        onSuccess: () => {
          toast.success("User activated successfully");
          setActiveRowId(null);
          refetchClients();
        },
        onError: (error) => {
          toast.error(
            error?.response?.data?.message || "Failed to activate user"
          );
        },
      }
    );
  };

  const handleDeactivate = (row) => {
    if (!row?.user_id) {
      toast.error("Unable to deactivate: User ID not found");
      return;
    }

    const tenantId = row?.tenant_id || userObj?.tenant_id;
    if (!tenantId) {
      toast.error("Unable to deactivate: Tenant ID not found");
      return;
    }

    deactivateUser(
      { user_id: row.user_id, tenant_id: tenantId },
      {
        onSuccess: () => {
          toast.success("User deactivated successfully");
          setActiveRowId(null);
          refetchClients();
        },
        onError: (error) => {
          toast.error(
            error?.response?.data?.message || "Failed to deactivate user"
          );
        },
      }
    );
  };

  const handleClickOutside = (e) => {
    if (
      actionDropdownRef.current &&
      !actionDropdownRef.current.contains(e.target)
    ) {
      setActiveRowId(null);
    }
  };

  useEffect(() => {
    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Determine if activation actions should be shown
  // Only show for tenants/admins (role_id 3 or 4) and when viewing counselors or managers tab (activeTab === 1 or 2)
  const showActivationActions =
    [3, 4].includes(userObj?.role_id) && (activeTab === 1 || activeTab === 2);

  const clientDataColumns = CLIENT_MANAGEMENT_DATA(
    handleCellClick,
    handleEdit,
    handleDelete,
    handleEditSessionInfo,
    actionDropdownRef,
    handleActivate,
    handleDeactivate,
    showActivationActions,
    userObj?.role_id,
    userObj?.user_profile_id || userObj?.user_id
  );

  const handleCreateClient = () => {
    setShowCreateSessionLayout(true);
  };

  // Function to invalidate sessions and clients queries when session is created/updated
  const handleSessionChange = async () => {
    // Invalidate sessions queries so they refetch on the client-session page
    await queryClient.invalidateQueries({ queryKey: ["sessions"] });
    // Also invalidate clients because client's has_schedule status might change
    await queryClient.invalidateQueries({ queryKey: ["clients"] });
  };

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
          initialData={clientFormData}
          setInitialData={setClientFormData}
          tableData={clientData}
          setTableData={() => {}} // No longer needed with TanStack Query
          fetchClients={refetchClients} // Refetch clients after create/update
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </CreateSessionLayout>
      <CreateSessionLayout isOpen={showFlyout} setIsOpen={closeSessionModal}>
        {activeData ? (
          <CreateSessionForm
            isOpen={showFlyout}
            setIsOpen={closeSessionModal}
            initialData={activeData}
            setInitialData={setActiveData}
            confirmationModal={confirmationModal}
            setConfirmationModal={setConfirmationModal}
            setSessions={() => {}}
            session={activeData}
            fetchSessions={handleSessionChange} // Invalidate sessions query when session is created/updated
            counselorConfiguration={counselorConfiguration}
            managerSplitDetails={managerSplitDetails}
            counselor_id={counselorId}
            isHomeworkUpload={true}
          />
        ) : (
          <Spinner color="blue" />
        )}
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
