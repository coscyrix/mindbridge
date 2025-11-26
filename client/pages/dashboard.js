import React, { useEffect, useState } from "react";
import { DashboardContainer } from "../styles/dashboard";
import OverallSession from "../components/DashboardComponents/OverallSession";
import Reports from "../components/DashboardComponents/Reports";
import OverallScore from "../components/DashboardComponents/OverallScore";
import AssessmentResults from "../components/DashboardComponents/AssessmentResults";
import { DashboardTableContainer } from "../styles/dashboard";
import CommonServices from "../services/CommonServices";
import { toast } from "react-toastify";
import { useReferenceContext } from "../context/ReferenceContext";
import CustomMultiSelect from "../components/CustomMultiSelect";
import dynamic from "next/dynamic";
import Spinner from "../components/common/Spinner";
import { useSessionModal, useFeeSplit, useCounselorFilter } from "../utils/hooks";

const CreateSessionForm = dynamic(
  () => import("../components/Forms/CreateSessionForm"),
  { ssr: false }
);
const CreateSessionLayout = dynamic(
  () =>
    import(
      "../components/FormLayouts/CreateSessionLayout/CreateSessionLayout"
    ),
  { ssr: false }
);

function Dashboard() {
  const { userObj, tokenExpired } = useReferenceContext();
  const { role_id, user_profile_id, tenant_id } = userObj || {};

  const [overallSessionsData, setOverallSessionsData] = useState();
  const [reports, setReports] = useState();
  const [assessmentResults, setAssessmentResults] = useState();
  
  // Custom hooks - they get userObj internally from context
  const {
    showModal: showSessionModal,
    sessionData: activeSessionData,
    openSessionModal,
    closeSessionModal,
    setSessionData: setActiveSessionData,
  } = useSessionModal();

  const {
    counselorConfiguration,
    managerSplitDetails,
    fetchFeeSplit,
  } = useFeeSplit();

  const {
    counselorOptions,
    selectedCounselor,
    setSelectedCounselor,
  } = useCounselorFilter();

  const [counselorId, setCounselorId] = useState(null);
  const handleSelectCounselor = async () => {
    if (!selectedCounselor) return;

    if (selectedCounselor.value === "ALL") {
      fetchOverallSessionData();
      fetchReportsTableData();
      fetchAssessmentResults();
    } else {
      fetchOverallSessionData({ counselor_id: selectedCounselor.value });
      fetchReportsTableData({ counselor_id: selectedCounselor.value });
      fetchAssessmentResults({ counselor_id: selectedCounselor.value });
    }
  };


  const fetchOverallSessionData = async ({ counselor_id } = {}) => {
    try {
      let response;
      if ([3, 4].includes(role_id))
        response = await CommonServices.getOverallSessionsData({
          role_id,
          // counselor_id: user_profile_id,
          ...(userObj?.role_id === 3 && { tenant_id: userObj?.tenant_id }),
          ...(counselor_id ? { counselor_id } : {}),
        });
      else
        response = await CommonServices.getOverallSessionsData({
          role_id,
          counselor_id: user_profile_id,
        });
      if (response.status === 200) {
        setOverallSessionsData(response.data);
      }
    } catch (error) {
      console.log("Error while fetching overall sessions", error);
      toast.error(error?.message || "Error fetching overall sessions!");
    }
  };

  const fetchReportsTableData = async ({ counselor_id } = {}) => {
    try {
      let response;
      if ([3, 4].includes(role_id))
        response = await CommonServices.getReportsTableData({
          role_id,
          ...(userObj?.role_id === 3 && { tenant_id: userObj?.tenant_id }),
          // counselor_id: user_profile_id,
          ...(counselor_id ? { counselor_id } : {}),
        });
      else
        response = await CommonServices.getReportsTableData({
          role_id,
          ...(userObj?.role_id === 3 && { tenant_id: userObj?.tenant_id }),
          counselor_id: user_profile_id,
        });
      if (response.status == 200) {
        setReports(response.data);
      }
    } catch (error) {
      console.log("Error fetching reports table data", error);
      toast.error(error?.message || "Error fetching overall sessions!");
    }
  };

  const fetchAssessmentResults = async ({ counselor_id } = {}) => {
    try {
      let response;
      if ([3, 4].includes(role_id))
        response = await CommonServices.getAssessmentResults({
          role_id,
          ...(userObj?.role_id === 3 && { tenant_id: userObj?.tenant_id }),
          ...(counselor_id ? { counselor_id } : {}),
          // counselor_id: user_profile_id,
        });
      else
        response = await CommonServices.getAssessmentResults({
          role_id,
          counselor_id: user_profile_id,
        });
      if (response.status == 200) {
        setAssessmentResults(response.data);
      }
    } catch (error) {
      console.log("Error fetching assessment results", error);
      toast.error(error?.message || "Error fetching assessment results");
    }
  };

  const handleClientClick = async (row) => {
    if (!row?.thrpy_req_id) {
      toast.info("This client is not associated with a session");
      return;
    }

    if (row?.tenant_id && userObj?.role_id !== 3) {
      setCounselorId(row?.counselor_id);
      await fetchFeeSplit(row?.tenant_id);
    }

    await openSessionModal(row.thrpy_req_id, row?.counselor_id);
  };

  useEffect(() => {
    if (!tokenExpired) {
      fetchOverallSessionData();
      fetchReportsTableData();
      fetchAssessmentResults();
    }
  }, [tokenExpired]);

  useEffect(() => {
    if (selectedCounselor) {
      handleSelectCounselor();
    }
  }, [selectedCounselor]);


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
      <CreateSessionLayout isOpen={showSessionModal} setIsOpen={closeSessionModal}>
        {activeSessionData ? (
          <CreateSessionForm
            isOpen={showSessionModal}
            setIsOpen={closeSessionModal}
            initialData={activeSessionData}
            setInitialData={setActiveSessionData}
            confirmationModal={false}
            setConfirmationModal={() => {}}
            setSessions={() => {}}
            session={activeSessionData}
            fetchSessions={() => {}}
            counselorConfiguration={counselorConfiguration}
            managerSplitDetails={managerSplitDetails}
            counselor_id={counselorId}
          />
        ) : (
          <Spinner color="blue" />
        )}
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
            assessmentResultsData={assessmentResults} 
            onClientClick={handleClientClick} 
          />
          <Reports 
            reportsData={reports} 
            onClientClick={handleClientClick} 
          />
        </div>
      </DashboardTableContainer>
      <DashboardContainer>
        <OverallSession overallSessionsData={overallSessionsData} />
        <OverallScore />
      </DashboardContainer>
    </>
  );
}

export default Dashboard;
