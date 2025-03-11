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
function Dashboard() {
  const { userObj, tokenExpired } = useReferenceContext();
  const { role_id, user_profile_id } = userObj || {};

  const [overallSessionsData, setOverallSessionsData] = useState();
  const [reports, setReports] = useState();
  const [assessmentResults, setAssessmentResults] = useState();

  const fetchOverallSessionData = async () => {
    try {
      let response;
      if (role_id == 1)
        response = await CommonServices.getOverallSessionsData();
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

  const fetchReportsTableData = async () => {
    try {
      let response;
      if (role_id == 1) response = await CommonServices.getReportsTableData();
      else
        response = await CommonServices.getReportsTableData({
          role_id,
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

  const fetchAssessmentResults = async () => {
    try {
      let response;
      if (role_id == 1) response = await CommonServices.getAssessmentResults();
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
