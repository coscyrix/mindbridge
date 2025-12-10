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
function AssessmentResults({ assessmentResultsData, onClientClick }) {
  const [loading, setLoading] = useState("assessmentResultsData");
  const [showReportDetails, setShowReportDetails] = useState(false);
  const [formName, setFormName] = useState("");
  const [xAxisLabels, setXAxisLabels] = useState([]);
  const [seriesData, setSeriesData] = useState([]);
  const [smartGoalsData, setSmartGoalsData] = useState([]);
  const [ipfData, setIpfData] = useState([]);
  const [consentFormData, setConsentFormData] = useState({});
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
        : row?.form_cde == "SESSION SUM REPORT"
        ? setLoading("attendanceData")
        : row?.form_cde == "GAS"
        ? setLoading("graphData")
        : setLoading("graphData");

      setShowReportDetails(true);
      setSmartGoalsData([]);
      setIpfData([]);
      setSeriesData([]);
      setGraphDataHeading("");
      // setConsentFormData("");
      let payload;
      if (row?.form_cde === "CONSENT") {
        payload = { feedback_id: row.feedback_id };
      } else {
        payload = {
          form_id: row.form_id,
          client_id: row.client_id,
        };
      }
      const response = await CommonServices.getFeedbackFormDetails(payload);
      if (response.status === 200) {
        const { data } = response;
        if (row.form_cde == "SMART-GOAL") {
          setSmartGoalsData(data);
          setGraphDataHeading("Smart Goal Assessment Results");
        } else if (row.form_cde == "IPF") {
          const ipfEntries = Array.isArray(response?.data?.rec)
            ? response.data.rec
            : [response.data.rec];

          setIpfData(ipfEntries);
          setGraphDataHeading("IPF Assessment Comparison");
        } else if (row.form_cde == "CONSENT") {
          const consentDetails =
            response?.data?.rec?.feedback_consent?.[0] || {};

          const newConsentData = {
            clientName: `${row.client_first_name} ${row.client_last_name}`,
            date: consentDetails?.created_at || null,
            img: consentDetails?.imgBase64 || null,
          };
          setConsentFormData(newConsentData);
          setTenant_Id(row.tenant_id);
        } else if (row.form_cde == "SESSION SUM REPORT") {
          setAttendanceData(data);
          setGraphDataHeading(
            `Attendence Details of ${row.client_first_name} ${row.client_last_name}`
          );
        } else if (row.form_cde === "GAS") {
          const gasEntries = Array.isArray(response?.data?.rec)
            ? response.data.rec
            : [response.data.rec];

          if (!gasEntries.length) return;
          const gasLabels = {
            "-2": "Much Worse (-2)",
            "-1": "Worse (-1)",
            0: "Expected (0)",
            1: "Better (+1)",
            2: "Much Better (+2)",
          };
          setGraphDataHeading(
            `Goal Attainment Scaling (GAS) - ${gasEntries[0]?.feedback_json?.goal?.replace(
              /_/g,
              " "
            )}`
          );
          const lastWeeks = gasEntries.slice(-7);
          const xLabels = lastWeeks.map((entry) =>
            new Date(entry.session_dte).toLocaleDateString("en-UK", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          );

          // Weekly average calculation
          const weekAverages = lastWeeks.map((entry) => {
            const scores =
              entry.feedback_json?.responses?.map((r) => r.score ?? 0) || [];
            return scores.length
              ? scores.reduce((a, b) => a + b, 0) / scores.length
              : 0;
          });

          // Chart series
          const seriesWithTooltip = [
            {
              name: "Client Progress",
              type: "line",
              smooth: true,
              data: weekAverages.map((avg, i) => ({
                value: Number(avg.toFixed(2)),
                tooltipLabel: xLabels[i],
              })),
              lineStyle: { color: "#007bff", width: 2 },
              itemStyle: { color: "#007bff" },
              label: {
                show: true,
                position: "top",
                fontSize: 12,
                color: "#333",
                formatter: (params) =>
                  gasLabels[Math.round(params.value)] || params.value,
              },
            },
            {
              name: "Expected Goal",
              type: "line",
              data: Array(lastWeeks.length).fill(0),
              lineStyle: { color: "gray", type: "dashed" },
              symbol: "none",
            },
          ];

          // Set state for chart
          setXAxisLabels(xLabels);
          setSeriesData(seriesWithTooltip);
        } else {
          // Normalize rec into an array
          const records = Array.isArray(response?.data?.rec)
            ? response.data.rec
            : [response.data.rec];

          // X-Axis labels
          setXAxisLabels(records.map((item) => item.session_dte));

          // Format form name
          const formattedFormName =
            row.form_cde === "GAD-7"
              ? "gad"
              : row.form_cde.replace(/-(\d+)/g, "$1").toLowerCase();

          const keyName = keyNameArr.find(
            (formObj) => formObj.formName == formattedFormName
          );

          // Graph heading
          setGraphDataHeading(
            keyName?.formName == "pcl5" || keyName?.formName == "phq9"
              ? `${keyName?.heading} ${row.client_first_name} ${row.client_last_name}`
              : keyName?.heading
          );

          // Main chart series
          const mainSeries = {
            name: "Scores",
            data: records.map((item) => {
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
                { type: "average", name: "Average" }, // Horizontal line
                { yAxis: 100, name: "Threshold" }, // Threshold line
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

          // Extra target lines if configured
          const markLineSeries = keyName?.targetMarkLines
            ? keyName.targetMarkLines.map((line) => ({
                name: line.name,
                type: "line",
                data: [],
                markLine: {
                  silent: true,
                  data: [{ yAxis: line.yAxis }],
                  lineStyle: line.lineStyle,
                },
              }))
            : [];

          // Push to chart series
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
            columns: ASSESSMENT_DATA_COLUMNS(handleTreatmentTools, onClientClick),
            data: assessmentResultsData,
          }}
          fixedHeaderScrollHeight="230px"
          loading={loading === "assessmentResultsData"}
          loaderBackground="transparent"
          itemsPerPage={Infinity}
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
              client_name={consentFormData?.clientName}
              consent_date={consentFormData?.date}
              consent_img={consentFormData?.img}
              tenant_ID={tenant_id}
              initialData={consentFormData}
              loader={loading == "consentData"}
            />
          ) : formName == "SESSION SUM REPORT" ? (
            <AttendanceGraph
              attendanceData={attendanceData}
              loading={loading == "attendanceData"}
            />
          ) : formName == "GAS" ? (
            <BarGraph
              xAxisTitle="Period"
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
