import React, { use, useEffect, useState } from "react";
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
function Dashboard() {
  const { userObj, tokenExpired } = useReferenceContext();
  const { role_id, user_profile_id, tenant_id } = userObj || {};

  const [overallSessionsData, setOverallSessionsData] = useState();
  const [reports, setReports] = useState();
  const [assessmentResults, setAssessmentResults] = useState();
  const { allCounselors } = useReferenceContext();
  const [counselorOptions, setCounselorOptions] = useState([]);
  const [selectedCounselor, setSelectedCounselor] = useState(null);
  console.log(allCounselors);
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

  useEffect(() => {
    if (!tokenExpired) {
      fetchOverallSessionData();
      fetchReportsTableData();
      fetchAssessmentResults();
    }
  }, [tokenExpired]);
  useEffect(() => {
    if (allCounselors?.length && tenant_id) {
      const filtered = allCounselors
        .filter((c) => c.tenant_id === tenant_id)
        .map((c) => ({
          label: `${c.user_first_name} ${c.user_last_name}`,
          value: c.user_profile_id,
        }));
      setCounselorOptions([
        { label: "All Counselors", value: "ALL" },
        ...filtered,
      ]);
    }
  }, [allCounselors, tenant_id]);
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
          <AssessmentResults assessmentResultsData={assessmentResults} />
          <Reports reportsData={reports} />
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
