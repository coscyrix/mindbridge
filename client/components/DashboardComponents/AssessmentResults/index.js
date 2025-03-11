import React, { useEffect, useState } from "react";
import CustomCard from "../../CustomCard";
import CustomClientDetails from "../../CustomClientDetails";
import { AssessmentResultsContainer } from "./style";
import { ASSESSMENT_DATA_COLUMNS } from "../../../utils/constants";
import CustomModal from "../../CustomModal";
import BarGraph from "../../CustomGraphs/BarGraph";
import CommonServices from "../../../services/CommonServices";
import SmartGoals from "./SmartGoals";
function AssessmentResults({ assessmentResultsData }) {
  const [loading, setLoading] = useState("assessmentResultsData");
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [formName, setFormName] = useState("");
  const [xAxisLabels, setXAxisLabels] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [smartGoalsData, setSmartGoalsData] = useState([]);

  const handleTreatmentTools = async (row) => {
    try {
      setFormName(row.form_cde);
      row.form_cde == "SMART-GOAL"
        ? setLoading("smartGoalsData")
        : setLoading("graphData");
      setShowReportDetails(true);
      setSmartGoalsData([]);
      const response = await CommonServices.getFeedbackFormDetails({
        form_id: row.form_id,
        client_id: row.client_id,
      });
      if (response.status === 200) {
        const { data } = response;
        if (row.form_cde == "SMART-GOAL") {
          setSmartGoalsData(data);
        } else {
          setXAxisLabels(data.map((item) => item.session_dte));
          const formattedFormName =
            row.form_cde === "GAD-7"
              ? "gad"
              : row.form_cde.replace(/-(\d+)/g, "$1").toLowerCase();
          setSeriesData([
            {
              data: data.map(
                (item) => item[`feedback_${formattedFormName}`][0]?.total_score
              ),
              itemStyle: { color: "#6fd0ef", paddingTop: 0 },
            },
          ]);
        }
      }
    } catch (error) {
      console.log(error, "error");
    } finally {
      setLoading(null);
    }
  };

  useEffect(() => {
    if (assessmentResultsData) setLoading(null);
  }, [assessmentResultsData]);

  return (
    <AssessmentResultsContainer>
      <CustomCard title="Homework And Assessment Tools Results">
        <CustomClientDetails
          tableData={{
            columns: ASSESSMENT_DATA_COLUMNS(handleTreatmentTools),
            data: assessmentResultsData,
          }}
          fixedHeaderScrollHeight="230px"
          loading={loading === "assessmentResultsData"}
          loaderBackground="transparent"
          tableCaption="Homework And Assessment Tools Results"
        />
      </CustomCard>
      <CustomModal
        title={"Report Details"}
        isOpen={showReportDetails}
        onRequestClose={() => setShowReportDetails(false)}
      >
        {formName !== "SMART-GOAL" ? (
          <div>
            <h4 style={{ textAlign: "center", margin: 0 }}>
              {formName} Scores Over Time with Target Line
            </h4>
            <BarGraph
              targetScore={50}
              xAxisTitle="Date"
              yAxisTitle={`${formName} Score`}
              xAxisLabels={xAxisLabels}
              seriesData={seriesData}
              loading={loading === "graphData"}
            />
          </div>
        ) : (
          <SmartGoals
            smartGoalsData={smartGoalsData}
            loading={loading == "smartGoalsData"}
          />
        )}
      </CustomModal>
    </AssessmentResultsContainer>
  );
}

export default AssessmentResults;
