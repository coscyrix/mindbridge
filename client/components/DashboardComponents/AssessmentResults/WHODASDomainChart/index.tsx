import React, { useEffect, useState } from "react";
import BarGraph from "../../../CustomGraphs/BarGraph";
import {
  WHODASDomainChartProps,
  WHODASFeedback,
  WHODASRecord,
  DomainMapping,
  DataPoint,
  SeriesItem,
} from "./types";

const WHODASDomainChart: React.FC<WHODASDomainChartProps> = ({
  whodasData,
  loading,
}) => {
  const [series, setSeries] = useState<SeriesItem[]>([]);
  const [axisX, setAxisX] = useState<string[]>([]);

  useEffect(() => {
    if (!whodasData?.length) {
      setSeries([]);
      setAxisX([]);
      return;
    }

    // Domain mapping - same order as IPF scales
    const domainMapping: DomainMapping[] = [
      { key: "understanding_and_communicating", label: "Cognition" },
      { key: "getting_around", label: "Mobility" },
      { key: "self_care", label: "Self-care" },
      { key: "getting_along_with_people", label: "Getting along" },
      { key: "life_activities", label: "Life activities" },
      { key: "participation_in_society", label: "Participation" },
    ];

    setAxisX(domainMapping.map((d) => d.label));

    // Get the latest "Getting along" value based on created_at date
    const getLatestGettingAlongValue = (): number => {
      if (!whodasData || whodasData.length === 0) return 2.5;

      // Sort by created_at to get the most recent assessment
      const sortedData = [...whodasData].sort((a, b) => {
        const dateA = new Date(
          a.feedback_whodas?.[0]?.created_at ||
            a.created_at ||
            a.session_dte ||
            "0"
        );
        const dateB = new Date(
          b.feedback_whodas?.[0]?.created_at ||
            b.created_at ||
            b.session_dte ||
            "0"
        );
        return dateB.getTime() - dateA.getTime(); // Sort descending (newest first)
      });

      const latestRec = sortedData[0];
      const latestAssessment: WHODASFeedback =
        Array.isArray(latestRec.feedback_whodas) &&
        latestRec.feedback_whodas.length > 0
          ? latestRec.feedback_whodas[0]
          : (latestRec as unknown as WHODASFeedback);

      const gettingAlongKey = "getting_along_with_people";
      const raw =
        latestAssessment?.[gettingAlongKey] ||
        latestAssessment?.[
          gettingAlongKey
            .split("_")
            .map((word, i) =>
              i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
            )
            .join("")
        ];
      const value = raw === undefined || raw === null ? 2.5 : Number(raw);
      return Number.isNaN(value) ? 2.5 : Number(value.toFixed(2));
    };

    const latestGettingAlongValue = getLatestGettingAlongValue();

    // Color palette for different assessments
    const palette: string[] = [
      "#6fd0ef",
      "#FFA500",
      "#FF4500",
      "#1E90FF",
      "#32CD32",
      "#800080",
      "#00CED1",
      "#FFD700",
      "#8B4513",
      "#FF69B4",
    ];

    const newSeries: SeriesItem[] = whodasData.map((rec, idx) => {
      const assessment: WHODASFeedback =
        Array.isArray(rec.feedback_whodas) && rec.feedback_whodas.length > 0
          ? rec.feedback_whodas[0]
          : (rec as unknown as WHODASFeedback);

      const dataPoints: DataPoint[] = domainMapping.map((domain) => {
        // Handle both snake_case and camelCase
        const raw =
          assessment?.[domain.key] ||
          assessment?.[
            domain.key
              .split("_")
              .map((word, i) =>
                i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join("")
          ];
        const v = raw === undefined || raw === null ? 0 : Number(raw);
        return { value: Number.isNaN(v) ? 0 : Number(v.toFixed(2)) };
      });

      const labelDate =
        (assessment?.created_at || rec?.created_at || rec?.session_dte || "")
          ?.toString()
          .split(" ")[0] || `#${idx + 1}`;

      const seriesItem: SeriesItem = {
        name: `WHODAS Assessment ${idx + 1} (${labelDate})`,
        type: "bar",
        data: dataPoints,
        itemStyle: { color: palette[idx % palette.length] },
        label: {
          show: true,
          position: "top",
          fontSize: 12,
          color: "#333",
          formatter: (params: any) => {
            return Number(params.value).toFixed(2);
          },
        },
      };

      // Add threshold lines only to the first series
      if (idx === 0) {
        seriesItem.markLine = {
          silent: true,
          lineStyle: {
            type: "dashed",
            color: "#999",
          },
          data: [
            {
              yAxis: latestGettingAlongValue,
              name: `Borderline threshold (${Number(
                latestGettingAlongValue
              ).toFixed(2)})`,
              label: {
                show: true,
                position: "end",
                formatter: `Borderline: ${Number(
                  latestGettingAlongValue
                ).toFixed(2)}`,
              },
            },
            {
              yAxis: 3.5,
              name: "Severe threshold",
              label: {
                show: false,
              },
            },
          ],
        };
      }

      return seriesItem;
    });

    setSeries(newSeries);
  }, [whodasData]);

  return (
    <BarGraph
      xAxisTitle="WHODAS Domains"
      yAxisTitle="Average difficulty score (WHODAS 1-5)"
      xAxisLabels={axisX}
      seriesData={series}
      loading={loading}
      formName="WHODAS"
      customOptions={{
        grid: {
          top: "15%",
          bottom: "20%",
          left: "10%",
          right: "10%",
          containLabel: true,
        },
        yAxis: {
          min: 1.0,
          max: 5.0,
          interval: 0.5,
          scale: false,
          axisLabel: {
            formatter: (value: number) => {
              // Only show labels up to 5.0, hide anything above
              if (value > 5.0) return "";
              return value.toFixed(1);
            },
          },
        },
        xAxis: {
          axisLabel: {
            rotate: -45,
            interval: 0,
          },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
          },
          formatter: (params: any) => {
            // Filter out threshold lines from tooltip
            const barParams = params.filter(
              (p: any) =>
                p.seriesType === "bar" && p.seriesName?.includes("WHODAS")
            );
            if (barParams.length === 0) return "";

            let result = `<b>${barParams[0].axisValue}</b><br/>`;
            barParams.forEach((param: any) => {
              const valueNum = Number(param.value);
              const value = valueNum.toFixed(2);
              let interpretation = "";

              if (valueNum < 1.5) {
                interpretation = "None";
              } else if (valueNum >= 1.5 && valueNum < 2.5) {
                interpretation = "Mild difficulty";
              } else if (valueNum >= 2.5 && valueNum < 3.5) {
                interpretation = "Moderate difficulty";
              } else if (valueNum >= 3.5 && valueNum < 4.5) {
                interpretation = "Severe difficulty";
              } else {
                interpretation = "Extreme / cannot do";
              }

              result += `${param.seriesName}: ${value} (${interpretation})<br/>`;
            });
            return result;
          },
        },
      }}
    />
  );
};

export default WHODASDomainChart;
