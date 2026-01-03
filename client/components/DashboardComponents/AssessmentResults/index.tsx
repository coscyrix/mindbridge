import React, { useEffect, useState } from "react";
import CustomCard from "../../CustomCard";
import CustomClientDetails from "../../CustomClientDetails";
import { AssessmentResultsContainer } from "./style";
import { ASSESSMENT_DATA_COLUMNS } from "../../../utils/constants";
import { capitalizeName } from "../../../utils/constants";
import CustomModal from "../../CustomModal";
import BarGraph from "../../CustomGraphs/BarGraph";
import CommonServices from "../../../services/CommonServices";
import SmartGoals from "./SmartGoals/SmartGoals";
import IpfGraph from "./IpfGraph";
import ConsentForm from "../../Forms/PatientForms/ConsentForm";
import AttendanceGraph from "./AttendanceGraph";
import WHODASDomainChart from "./WHODASDomainChart";
import IntakeFormDetails from "./IntakeFormDetails";

interface AssessmentResultsProps {
  assessmentResultsData: any[];
  onClientClick: (row: any) => void;
}

interface KeyNameConfig {
  formName: string;
  keyName: string;
  barColor?: {
    default?: string;
    mild?: string;
    moderate?: string;
    severe?: string;
  };
  heading: string;
  targetMarkLines?: Array<{
    yAxis: number;
    name: string;
    lineStyle: { type: string };
  }>;
  labelFormatter?: (data: any) => string;
}

const AssessmentResults: React.FC<AssessmentResultsProps> = ({
  assessmentResultsData,
  onClientClick,
}) => {

  const [loading, setLoading] = useState<string | null>(
    "assessmentResultsData"
  );
  const [showReportDetails, setShowReportDetails] = useState<boolean>(false);
  const [formName, setFormName] = useState<string>("");
  const [xAxisLabels, setXAxisLabels] = useState<string[]>([]);
  const [seriesData, setSeriesData] = useState<any[]>([]);
  const [smartGoalsData, setSmartGoalsData] = useState<any[]>([]);
  const [ipfData, setIpfData] = useState<any[]>([]);
  const [consentFormData, setConsentFormData] = useState<any>({});
  const [graphDataHeading, setGraphDataHeading] = useState<string>("");
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [tenant_id, setTenant_Id] = useState<number | null>(null);
  const [whodasDomainData, setWhodasDomainData] = useState<any[]>([]);
  const [intakeFormData, setIntakeFormData] = useState<any>(null);
  const [serviceCode, setServiceCode] = useState<string | null>(null);
  const [serviceName, setServiceName] = useState<string | null>(null);
  const [currentRow, setCurrentRow] = useState<any>(null);

  const keyNameArr: KeyNameConfig[] = [
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
      labelFormatter: (data: any) => {
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
      labelFormatter: (data: any) => {
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

  const handleTreatmentTools = async (row: any) => {
    if (row.form_cde === "CONSENT") {
      setTenant_Id(row.tenant_id);
    }
    setCurrentRow(row); // Store row data for use in components
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
        : row?.form_cde == "INTAKE"
        ? setLoading("intakeData")
        : setLoading("graphData");

      setShowReportDetails(true);
      setSmartGoalsData([]);
      setIpfData([]);
      setSeriesData([]);
      setGraphDataHeading("");
      setWhodasDomainData([]);
      setIntakeFormData(null);
      setServiceCode(null);
      setServiceName(null);
      // setConsentFormData("");

      // Handle INTAKE form separately
      if (row?.form_cde === "INTAKE") {
        if (row.intake_form_id && row.counselor_profile_id) {
          try {
            const response = await CommonServices.getIntakeFormDetails({
              intake_form_id: row.intake_form_id,
              counselor_profile_id: row.counselor_profile_id,
            });
            if (response.status === 200 && response.data?.rec) {
              setIntakeFormData(response.data.rec);
              setGraphDataHeading(
                `Intake Form - ${row.client_first_name} ${row.client_last_name}`
              );
            } else {
              console.error("Failed to fetch intake form details:", response);
            }
          } catch (error) {
            console.error("Error fetching intake form details:", error);
          }
        } else {
          console.error("Missing intake_form_id or counselor_profile_id");
        }
        setLoading(null);
        return;
      }

      let payload: any;
      if (row?.form_cde === "CONSENT") {
        payload = { feedback_id: row.feedback_id };
      } else if (row?.form_cde === "SMART-GOAL") {
        // Use thrpy_req_id for SMART-GOAL to fetch all SMART goals for that therapy request
        payload = {
          form_id: row.form_id,
          thrpy_req_id: row.thrpy_req_id,
        };
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
          // Set service information for goal filtering
          // Prefer service info from feedback response, fallback to row data
          const feedbackRec = Array.isArray(data?.rec)
            ? data.rec[0]
            : data?.rec;
          setServiceCode(feedbackRec?.service_code || row.service_code || null);
          setServiceName(feedbackRec?.service_name || row.service_name || null);
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
          const gasLabels: { [key: string]: string } = {
            "-2": "Much Worse (-2)",
            "-1": "Worse (-1)",
            "0": "Expected (0)",
            "1": "Better (+1)",
            "2": "Much Better (+2)",
          };
          setGraphDataHeading(
            `Goal Attainment Scaling (GAS) - ${gasEntries[0]?.feedback_json?.goal?.replace(
              /_/g,
              " "
            )}`
          );
          const lastWeeks = gasEntries.slice(-7);
          const xLabels = lastWeeks.map((entry: any) =>
            new Date(entry.session_dte).toLocaleDateString("en-UK", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          );

          // Weekly average calculation
          const weekAverages = lastWeeks.map((entry: any) => {
            const scores =
              entry.feedback_json?.responses?.map((r: any) => r.score ?? 0) ||
              [];
            return scores.length
              ? scores.reduce((a: number, b: number) => a + b, 0) /
                  scores.length
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
                formatter: (params: any) =>
                  gasLabels[Math.round(params.value).toString()] ||
                  params.value,
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

          // Check if this is WHODAS - show domain chart instead
          const isWHODAS =
            row.form_cde === "WHODAS" ||
            row.form_cde?.toLowerCase() === "whodas";


          if (isWHODAS) {
            setWhodasDomainData(records);
            const firstName = capitalizeName(row.client_first_name);
            const lastName = capitalizeName(row.client_last_name);
            setGraphDataHeading(
              `WHODAS 2.0 Domain Scores for ${firstName} ${lastName}`
            );
            return; // Exit early, domain chart will be rendered separately
          }

          // X-Axis labels
          setXAxisLabels(records.map((item: any) => item.session_dte));

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
            data: records.map((item: any) => {
              const feedbackKey = `feedback_${formattedFormName}`;
              const feedbackData = item[feedbackKey]?.at(0);
              const value =
                formattedFormName === "whodas"
                  ? Number(
                      feedbackData?.[keyName?.keyName || ""] / 100
                    ).toFixed(4)
                  : feedbackData?.[keyName?.keyName || ""];
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
              color: keyName?.barColor?.default || "#6fd0ef",
            },
            label: {
              show: true,
              position: "top",
              fontSize: 12,
              color: "#333",
              formatter: ({ data }: any) =>
                keyName?.labelFormatter
                  ? keyName.labelFormatter(data)
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
      <CustomCard
        title="Homework And Assessment Tools Results"
        {...({} as any)}
      >
        <CustomClientDetails
          {...({
            tableData: {
              columns: ASSESSMENT_DATA_COLUMNS(
                handleTreatmentTools,
                onClientClick
              ) as any,
              data: assessmentResultsData,
            },
            fixedHeaderScrollHeight: "230px",
            loading: loading === "assessmentResultsData",
            loaderBackground: "transparent",
            itemsPerPage: Infinity,
            tableCaption: "Homework And Assessment Tools Results",
          } as any)}
        />
      </CustomCard>
      <CustomModal
        title={formName == "CONSENT" ? "Consent Form" : "Report Details"}
        isOpen={showReportDetails}
        onRequestClose={() => setShowReportDetails(false)}
        icon={null}
        customStyles={{ maxWidth: "unset" }}
        {...({} as any)}
      >
        <div>
          <h4 style={{ textAlign: "center", margin: 0 }}>{graphDataHeading}</h4>
          {formName == "SMART-GOAL" ? (
            <SmartGoals
              smartGoalsData={smartGoalsData}
              loading={loading == "smartGoalsData"}
              serviceCode={serviceCode}
              serviceName={serviceName}
              session_id={currentRow?.session_id || currentRow?.feedback?.session_id}
              client_id={currentRow?.client_id}
              feedback_id={currentRow?.feedback_id}
              onClose={() => setShowReportDetails(false)}
            />
          ) : formName == "IPF" ? (
            <IpfGraph ipfData={ipfData} loading={loading == "ipfData"} />
          ) : formName == "CONSENT" ? (
            <ConsentForm
              client_name={consentFormData?.clientName}
              consent_date={consentFormData?.date}
              consent_img={consentFormData?.img}
              tenant_ID={tenant_id?.toString() || ""}
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
                    formatter: (value: any) =>
                      String(value).length > 50
                        ? String(value).slice(0, 50) + "…"
                        : String(value),
                    tooltip: { show: true },
                  } as any,
                },
                tooltip: {
                  trigger: "axis",
                  formatter: (params: any) => {
                    const data = params[0];
                    const fullQuestion =
                      (params as any).responses?.[data.dataIndex]?.question ||
                      data.name;
                    return `<b>${fullQuestion}</b><br/>Score: ${data.value}`;
                  },
                },
              }}
            />
          ) : formName == "WHODAS" ? (
            <WHODASDomainChart
              whodasData={whodasDomainData}
              loading={loading === "graphData"}
            />
          ) : formName == "INTAKE" ? (
            <IntakeFormDetails
              intakeFormData={intakeFormData}
              loading={loading === "intakeData"}
            />
          ) : (
            <BarGraph
              xAxisTitle="Date of Assessment"
              yAxisTitle={`${formName} Score`}
              xAxisLabels={xAxisLabels}
              seriesData={seriesData}
              loading={loading === "graphData"}
              formName={formName || undefined}
            />
          )}
        </div>
      </CustomModal>
    </AssessmentResultsContainer>
  );
};

export default AssessmentResults;
