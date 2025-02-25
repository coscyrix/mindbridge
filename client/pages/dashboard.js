import React, { useEffect } from "react";
import { DashboardContainer } from "../styles/dashboard";
import OverallSession from "../components/DashboardComponents/OverallSession";
import Reports from "../components/DashboardComponents/Reports";
import OverallScore from "../components/DashboardComponents/OverallScore";
import AssessmentResults from "../components/DashboardComponents/AssessmentResults";
import { DashboardTableContainer } from "../styles/dashboard";
function Dashboard() {
  // const fetchSessionData = async () => {
  //   try {
  //     const res = await api.get("/session/?session_id=2137");
  //     if (res.status === 200) {
  //       setServicesData(res?.data?.rec);
  //     }
  //   } catch (error) {
  //     console?.error(error);
  //   }
  // };

  // useEffect(() => {
  //   fetchSessionData();
  // }, []);
  return (
    <>
      <h2 style={{ padding: "0px 30px", marginBottom: 0 }}>
        MindBridge Analytics
      </h2>
      <p style={{ padding: "0px 30px", marginBottom: 0 }}>
        The MindBridge app provides an intuitive and real-time overview of key
        metrics and insights for counselors and administrators.
      </p>
      <DashboardContainer>
        <OverallSession />
        <OverallScore />
      </DashboardContainer>
      <DashboardTableContainer>
        <div className="dashboardTableContainer">
          <Reports />
          <AssessmentResults />
        </div>
      </DashboardTableContainer>
    </>
  );
}

export default Dashboard;
