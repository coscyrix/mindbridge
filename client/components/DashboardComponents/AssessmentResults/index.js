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
import AttendanceGraph from "./AttendanceGraph";
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
  const [attendanceData, setAttendanceData] = useState([]);
  const [tenant_id, setTenant_Id] = useState(null);
  const keyNameArr = [
    {
      formName: "gad",
      keyName: "total_points",
      barColor: { default: "#6fd0ef" },
      heading: "GAD-7 Assessment Scores with Interpretation",
      targetMarkLines: [
        {
          yAxis: 4,
          name: "Minimal Anxiety (0 - 4)",
          lineStyle: { type: "dashed" },
        },
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
      labelFormatter: (data) => {
        return data?.value < 0.2
          ? `${data?.value}\nMild Disability`
          : data?.value < 0.5
          ? `${data?.value}\nModerate Disability`
          : `${data?.value}\nSevere Disability`;
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
      labelFormatter: (data) => {
        const labels = [
          "Minimal Depression",
          "Mild Depression",
          "Moderate Depression",
          "Moderately Severe Depression",
          "Severe Depression",
        ];

        const index = Math.min(Math.floor(data?.value / 5), labels.length - 1);
        return `${labels[index]}`;
      },
    },
  ];

  const handleTreatmentTools = async (row) => {
    console.log(row);
    if (row.form_cde === "CONSENT") {
      setTenant_Id(row.tenant_id);
    }
    try {
      setFormName(row.form_cde);
      row.form_cde == "SMART-GOAL"
        ? setLoading("smartGoalsData")
        : row?.form_cde == "IPF"
        ? setLoading("ipfData")
        : row?.form_cde == "CONSENT"
        ? setLoading("consentData")
        : row?.form_cde == "ATTENDENCE"
        ? setLoading("attendanceData")
        : row?.form_cde == "GAS"
        ? setLoading("graphData")
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
        } else if (row.form_cde == "ATTENDENCE") {
          setAttendanceData(data);
          setGraphDataHeading(
            `Attendence Details of ${row.client_first_name} ${row.client_last_name}`
          );
        } else if (row.form_cde == "GAS") {
          if (row.form_cde == "GAS") {
            const responses = data[0]?.feedback_json?.responses || [];

            setGraphDataHeading("Goal Attainment Scaling Results");

            // Prepare labels and tooltips
            const questionLabels = responses.map((r) => {
              const q = r.question || "Untitled";
              return q.length > 30 ? q.slice(0, 30) + "…" : q; // truncate for display
            });

            const scores = responses.map((r) => ({ value: r.score ?? 0 }));

            // Attach full question to each data point for tooltip
            const seriesWithTooltip = [
              {
                name: "Score",
                type: "bar",
                data: scores.map((s, i) => ({
                  ...s,
                  tooltipLabel: responses[i].question, // full question for tooltip
                })),
                itemStyle: { color: "#6fd0ef" },
                label: {
                  show: true,
                  position: "top",
                  fontSize: 12,
                  color: "#333",
                  formatter: (params) => params.value,
                },
              },
            ];

            setXAxisLabels(questionLabels);
            setSeriesData(seriesWithTooltip);
          }
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
              const feedbackKey = `feedback_${formattedFormName}`;
              const feedbackData = item[feedbackKey]?.at(0);
              const value =
                formattedFormName === "whodas"
                  ? Number(feedbackData?.[keyName.keyName] / 100).toFixed(4)
                  : feedbackData?.[keyName.keyName];
              const additionalInfo =
                formattedFormName == "phq9"
                  ? { difficultyScore: feedbackData?.difficulty_score ?? "NA" }
                  : formattedFormName == "whodas"
                  ? {
                      h1: feedbackData?.difficulty_days,
                      h2: feedbackData?.unable_days,
                      h3: feedbackData?.health_condition_days,
                    }
                  : undefined;
              return {
                ...(additionalInfo && { additionalInfo }),
                value,
              };
            }),
            markLineSeries: {
              data: [
                { type: "average", name: "Average" }, // Horizontal line at the average value
                { yAxis: 100, name: "Threshold" }, // Custom threshold line at y = 100
              ],
              lineStyle: {
                color: "red",
                type: "dashed",
              },
            },
            type: "bar",
            itemStyle: {
              color: keyName.barColor?.default || "#6fd0ef",
            },
            label: {
              show: true,
              position: "top",
              fontSize: 12,
              color: "#333",
              formatter: ({ data }) =>
                keyName?.labelFormatter
                  ? keyName?.labelFormatter(data)
                  : data?.value,
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
      console.error(error, "error");
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
        title={formName == "CONSENT" ? "Consent Form" : "Report Details"}
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
              tenant_ID={tenant_id}
              initialData={consentFormData}
              loader={loading == "consentData"}
            />
          ) : formName == "ATTENDENCE" ? (
            <AttendanceGraph
              attendanceData={attendanceData}
              loading={loading == "attendanceData"}
            />
          ) : formName == "GAS" ? (
            <BarGraph
              xAxisTitle="Questions"
              yAxisTitle="Score"
              xAxisLabels={xAxisLabels}
              seriesData={seriesData}
              loading={loading === "graphData"}
              formName={formName}
              customOptions={{
                xAxis: {
                  axisLabel: {
                    rotate: -45,
                    color: "red",
                    formatter: (value) =>
                      value.length > 50 ? value.slice(0, 50) + "…" : value,
                    interval: 0,
                    tooltip: { show: true },
                  },
                },
                tooltip: {
                  trigger: "axis",
                  formatter: (params) => {
                    const data = params[0];
                    const fullQuestion =
                      responses[data.dataIndex]?.question || data.name;
                    return `<b>${fullQuestion}</b><br/>Score: ${data.value}`;
                  },
                },
              }}
            />
          ) : (
            <BarGraph
              xAxisTitle="Date of Assessment"
              yAxisTitle={`${formName} Score`}
              xAxisLabels={xAxisLabels}
              seriesData={seriesData}
              loading={loading === "graphData"}
              formName={formName}
            />
          )}
        </div>
      </CustomModal>
    </AssessmentResultsContainer>
  );
}

export default AssessmentResults;
