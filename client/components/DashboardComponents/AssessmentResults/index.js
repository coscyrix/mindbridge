import React, { useEffect, useState } from "react";
import CustomCard from "../../CustomCard";
import CustomClientDetails from "../../CustomClientDetails";
import { AssessmentResultsContainer } from "./style";
import { ASSESSMENT_DATA_COLUMNS } from "../../../utils/constants";
import CustomModal from "../../CustomModal";
import BarGraph from "../../CustomGraphs/BarGraph";
import CommonServices from "../../../services/CommonServices";
import SmartGoals from "./SmartGoals";
import IpfGraph from "./IpfGraph";
import ConsentForm from "../../Forms/PatientForms/ConsentForm";
function AssessmentResults({ assessmentResultsData }) {
  const [loading, setLoading] = useState("assessmentResultsData");
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [formName, setFormName] = useState("");
  const [xAxisLabels, setXAxisLabels] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [smartGoalsData, setSmartGoalsData] = useState([]);
  const [ipfData, setIpfData] = useState([]);
  const [consentFormData, setConsentFormData] = useState([]);
  const [graphDataHeading, setGraphDataHeading] = useState("");

  const keyNameArr = [
    {
      formName: "gad",
      keyName: "total_points",
      barColor: { default: "#6fd0ef" },
      heading: "GAD-7 Assessment Scores with Interpretation",
      targetMarkLines: [
        {
          yAxis: 5,
          name: "Mild Anxiety (5 - 9)",
          lineStyle: { type: "dashed" },
        },
        {
          yAxis: 10,
          name: "Moderate Anxiety (10 - 14)",
          lineStyle: { type: "dashed" },
        },
        {
          yAxis: 15,
          name: "Severe Anxiety (15 - 21)",
          lineStyle: { type: "dashed" },
        },
      ],
    },
    {
      formName: "whodas",
      keyName: "overall_score",
      heading:
        "WHODAS Overall Scores Across Assessments with Disability Interpretation",
      barColor: { mild: "", moderate: "", severe: "" },
      labelFormatter: (value) => {
        return value < 0.2
          ? `${value}\nMild Disability`
          : value < 0.5
          ? `${value}\nModerate Disability`
          : `${value}\nSevere Disability`;
      },
    },
    {
      formName: "pcl5",
      keyName: "total_score",
      heading: "PCL-5 Assessment Scores Over Time for",
      barColor: { default: "#6fd0ef" },
      targetMarkLines: [
        {
          yAxis: 20,
          name: "Low Severity (0-20)",
          lineStyle: { type: "dashed" },
        },
        {
          yAxis: 40,
          name: "Moderate Severity (21-40)",
          lineStyle: { type: "dashed" },
        },
        {
          yAxis: 60,
          name: "High Severity (41-60)",
          lineStyle: { type: "dashed" },
        },
        {
          yAxis: 80,
          name: "Very High Severity (61-80)",
          lineStyle: { type: "dashed" },
        },
      ],
    },
    {
      formName: "phq9",
      keyName: "total_score",
      heading: "PHQ-9 Assessment Scores Over Time for",
      labelFormatter: (value) => {
        if (value < 10) return "Mild";
        if (value < 15) return "Moderate";
        if (value < 20) return "Moderately Severe";
        return "Severe";
      },
    },
  ];

  const handleTreatmentTools = async (row) => {
    try {
      setFormName(row.form_cde);
      row.form_cde == "SMART-GOAL"
        ? setLoading("smartGoalsData")
        : row?.form_cde == "IPF"
        ? setLoading("ipfData")
        : row?.form_cde == "CONSENT"
        ? setLoading("consentData")
        : setLoading("graphData");
      setShowReportDetails(true);
      setSmartGoalsData([]);
      setIpfData([]);
      setSeriesData([]);
      setGraphDataHeading("");
      setConsentFormData("");
      const response = await CommonServices.getFeedbackFormDetails({
        form_id: row.form_id,
        client_id: row.client_id,
      });
      if (response.status === 200) {
        const { data } = response;
        if (row.form_cde == "SMART-GOAL") {
          setSmartGoalsData(data);
          setGraphDataHeading("Smart Goal Assessment Results");
        } else if (row.form_cde == "IPF") {
          setIpfData(data);
          setGraphDataHeading("IPF Assessment Comparison");
        } else if (row.form_cde == "CONSENT") {
          setConsentFormData({
            clientName: `${row.client_first_name} ${row.client_last_name}`,
            ...data?.[0].feedback_consent[0],
          });
        } else {
          setXAxisLabels(data.map((item) => item.session_dte));
          const formattedFormName =
            row.form_cde === "GAD-7"
              ? "gad"
              : row.form_cde.replace(/-(\d+)/g, "$1").toLowerCase();
          const keyName = keyNameArr.find(
            (formObj) => formObj.formName == formattedFormName
          );
          setGraphDataHeading(
            keyName?.formName == "pcl5" || keyName?.formName == "phq9"
              ? `${keyName?.heading} ${row.client_first_name} ${row.client_last_name}`
              : keyName?.heading
          );
          const mainSeries = {
            name: "Scores",
            data: data.map((item) => {
              const score =
                formattedFormName == "whodas"
                  ? item[`feedback_${formattedFormName}`][0]?.[
                      keyName.keyName
                    ] / 100
                  : item[`feedback_${formattedFormName}`][0]?.[keyName.keyName];
              return score;
            }),
            type: "bar",
            itemStyle: {
              color: keyName.barColor?.default || "#6fd0ef",
            },
            label: {
              show: true,
              position: "top",
              fontSize: 12,
              color: "#333",
              formatter: ({ value }) => {
                return keyName.labelFormatter
                  ? keyName.labelFormatter(value)
                  : value;
              },
            },
          };

          // Convert targetMarkLines into separate series
          const markLineSeries = keyName?.targetMarkLines
            ? keyName.targetMarkLines.map((line) => ({
                name: line.name,
                type: "line",
                data: [], // Empty array to prevent rendering as a line
                markLine: {
                  silent: true,
                  data: [{ yAxis: line.yAxis }],
                  lineStyle: line.lineStyle,
                },
              }))
            : [];

          setSeriesData([mainSeries, ...markLineSeries]);
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
        customStyles={{ maxWidth: "unset" }}
      >
        <div>
          <h4 style={{ textAlign: "center", margin: 0 }}>{graphDataHeading}</h4>
          {formName == "SMART-GOAL" ? (
            <SmartGoals
              smartGoalsData={smartGoalsData}
              loading={loading == "smartGoalsData"}
            />
          ) : formName == "IPF" ? (
            <IpfGraph ipfData={ipfData} loading={loading == "ipfData"} />
          ) : formName == "CONSENT" ? (
            <ConsentForm
              initialData={consentFormData}
              loader={loading == "consentData"}
            />
          ) : (
            <BarGraph
              xAxisTitle="Date of Assessment"
              yAxisTitle={`${formName} Score`}
              xAxisLabels={xAxisLabels}
              seriesData={seriesData}
              loading={loading === "graphData"}
            />
          )}
        </div>
      </CustomModal>
    </AssessmentResultsContainer>
  );
}

export default AssessmentResults;
