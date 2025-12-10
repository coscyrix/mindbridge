import React, { useEffect, useState } from "react";
import { DashboardContainer } from "../styles/dashboard";
import OverallSession from "../components/DashboardComponents/OverallSession";
import Reports from "../components/DashboardComponents/Reports";
import HomeworkStats from "../components/DashboardComponents/HomeworkStats";
import AssessmentResults from "../components/DashboardComponents/AssessmentResults";
import { DashboardTableContainer } from "../styles/dashboard";
import CommonServices from "../services/CommonServices";
import { toast } from "react-toastify";
import { useReferenceContext } from "../context/ReferenceContext";
import CustomMultiSelect from "../components/CustomMultiSelect";
import dynamic from "next/dynamic";
import Spinner from "../components/common/Spinner";
import {
  useSessionModal,
  useFeeSplit,
  useCounselorFilter,
} from "../utils/hooks";
import { useQueryData } from "../utils/hooks/useQueryData";

const CreateSessionForm = dynamic(
  () => import("../components/Forms/CreateSessionForm"),
  { ssr: false }
);
const CreateSessionLayout = dynamic(
  () =>
    import("../components/FormLayouts/CreateSessionLayout/CreateSessionLayout"),
  { ssr: false }
);

// Modal for creating a new schedule
const CreateScheduleForm = dynamic(
  () => import("../components/Forms/CreateSessionForm"),
  { ssr: false }
);

function Dashboard() {
  const { userObj, tokenExpired } = useReferenceContext();
  const { role_id, user_profile_id, tenant_id } = userObj || {};

  // Custom hooks - they get userObj internally from context
  const {
    showModal: showSessionModal,
    sessionData: activeSessionData,
    openSessionModal,
    closeSessionModal,
    setSessionData: setActiveSessionData,
  } = useSessionModal();

  const { counselorConfiguration, managerSplitDetails, fetchFeeSplit } =
    useFeeSplit();

  const { counselorOptions, selectedCounselor, setSelectedCounselor } =
    useCounselorFilter();

  const [counselorId, setCounselorId] = useState(null);

  // State for creating a new schedule for clients without sessions
  const [showCreateScheduleModal, setShowCreateScheduleModal] = useState(false);
  const [selectedClientForSchedule, setSelectedClientForSchedule] =
    useState(null);

  // Determine the counselor filter value
  const filterCounselorId =
    selectedCounselor?.value === "ALL" ? null : selectedCounselor?.value;

  // Build query parameters based on role and selected counselor
  const buildQueryParams = (counselorIdOverride) => {
    const counselor_id = counselorIdOverride ?? filterCounselorId;

    if ([3, 4].includes(role_id)) {
      return {
        role_id,
        ...(role_id === 3 && { tenant_id }),
        ...(counselor_id && { counselor_id }),
      };
    } else {
      return {
        role_id,
        counselor_id: user_profile_id,
      };
    }
  };

  // Use TanStack Query for data fetching
  const {
    data: overallSessionsResponse,
    isPending: overallSessionsLoading,
    error: overallSessionsError,
  } = useQueryData(
    ["overall-sessions", role_id, tenant_id, filterCounselorId],
    async () => {
      const params = buildQueryParams();
      const response = await CommonServices.getOverallSessionsData(params);
      return response.data;
    },
    !tokenExpired && !!role_id // Only fetch when not expired and role exists
  );

  const {
    data: reportsResponse,
    isPending: reportsLoading,
    error: reportsError,
  } = useQueryData(
    ["reports-table", role_id, tenant_id, filterCounselorId],
    async () => {
      const params = buildQueryParams();
      const response = await CommonServices.getReportsTableData(params);
      return response.data;
    },
    !tokenExpired && !!role_id
  );

  const {
    data: assessmentResultsResponse,
    isPending: assessmentResultsLoading,
    error: assessmentResultsError,
  } = useQueryData(
    ["assessment-results", role_id, tenant_id, filterCounselorId],
    async () => {
      const params = buildQueryParams();
      const response = await CommonServices.getAssessmentResults(params);
      return response.data;
    },
    !tokenExpired && !!role_id
  );

  // Handle errors - show toast notifications like original code
  useEffect(() => {
    if (overallSessionsError) {
      console.log(
        "Error while fetching overall sessions",
        overallSessionsError
      );
      toast.error(
        overallSessionsError?.message || "Error fetching overall sessions!"
      );
    }
  }, [overallSessionsError]);

  useEffect(() => {
    if (reportsError) {
      console.log("Error fetching reports table data", reportsError);
      toast.error(reportsError?.message || "Error fetching reports data!");
    }
  }, [reportsError]);

  useEffect(() => {
    if (assessmentResultsError) {
      console.log("Error fetching assessment results", assessmentResultsError);
      toast.error(
        assessmentResultsError?.message || "Error fetching assessment results!"
      );
    }
  }, [assessmentResultsError]);

  const handleClientClick = async (row) => {
    if (!row?.thrpy_req_id) {
      // Open modal to create a new schedule for this client
      setSelectedClientForSchedule(row);
      setShowCreateScheduleModal(true);
      return;
    }

    if (row?.tenant_id && userObj?.role_id !== 3) {
      setCounselorId(row?.counselor_id);
      await fetchFeeSplit(row?.tenant_id);
    }

    await openSessionModal(row.thrpy_req_id, row?.counselor_id);
  };

  const closeCreateScheduleModal = () => {
    setShowCreateScheduleModal(false);
    setSelectedClientForSchedule(null);
  };

  return (
    <>
      <h2 style={{ padding: "0px 30px", marginBottom: 0 }}>
        MindBridge Analytics
      </h2>
      <p style={{ padding: "0px 30px", marginBottom: 0 }}>
        The MindBridge app provides an intuitive and real-time overview of key
        metrics and insights for counselors and administrators.
      </p>

      {/* Session Modal */}
      <CreateSessionLayout
        isOpen={showSessionModal}
        setIsOpen={closeSessionModal}
        initialData={activeSessionData}
        setConfirmationModal={() => {}}
      >
        {activeSessionData ? (
          <CreateSessionForm
            time={null}
            fetchHomeWorkUploadStatus={() => {}}
            isOpen={showSessionModal}
            setIsOpen={closeSessionModal}
            initialData={activeSessionData}
            setInitialData={setActiveSessionData}
            confirmationModal={false}
            setConfirmationModal={() => {}}
            userProfileId={user_profile_id}
            fetchCounselorClient={() => {}}
            session={activeSessionData}
            fetchSessions={() => {}}
            counselorConfiguration={counselorConfiguration}
            managerSplitDetails={managerSplitDetails}
            counselor_id={counselorId}
            isHomeworkUpload={true}
            setHomeWorkUpload={() => {}}
          />
        ) : (
          <Spinner color="blue" />
        )}
      </CreateSessionLayout>

      {/* Create Schedule Modal for clients without sessions */}
      <CreateSessionLayout
        isOpen={showCreateScheduleModal}
        setIsOpen={closeCreateScheduleModal}
        initialData={null}
        setConfirmationModal={() => {}}
      >
        <CreateScheduleForm
          time={null}
          fetchHomeWorkUploadStatus={() => {}}
          isOpen={showCreateScheduleModal}
          setIsOpen={closeCreateScheduleModal}
          initialData={null}
          setInitialData={() => {}}
          confirmationModal={false}
          setConfirmationModal={() => {}}
          userProfileId={user_profile_id}
          fetchCounselorClient={() => {}}
          session={null}
          fetchSessions={() => {}}
          counselorConfiguration={counselorConfiguration}
          managerSplitDetails={managerSplitDetails}
          counselor_id={selectedClientForSchedule?.counselor_id}
          isHomeworkUpload={false}
          setHomeWorkUpload={() => {}}
        />
      </CreateSessionLayout>

      <DashboardTableContainer>
        <div className="dashboardTableContainer">
          {userObj?.role_id === 3 && (
            <CustomMultiSelect
              isMulti={false}
              options={counselorOptions}
              placeholder="Select a Counselor"
              value={selectedCounselor}
              onChange={(val) => setSelectedCounselor(val)}
            ></CustomMultiSelect>
          )}

          {/* <CustomTab lines={SERVICE_FEE_INFO}/> */}
          <AssessmentResults
            assessmentResultsData={assessmentResultsResponse}
            onClientClick={handleClientClick}
          />
          <Reports
            reportsData={reportsResponse}
            onClientClick={handleClientClick}
          />
        </div>
      </DashboardTableContainer>
      <DashboardContainer>
        <OverallSession overallSessionsData={overallSessionsResponse} />
        <HomeworkStats filterCounselorId={filterCounselorId} />
      </DashboardContainer>
    </>
  );
}

export default Dashboard;
