import React, { useState, useEffect } from "react";
import BarGraph from "../../CustomGraphs/BarGraph";

function IpfGraph({ ipfData, loading }) {
  const [firstIpfAssessment, setFirstIpfAssessment] = useState([]);
  const [secondIpfAssessment, setSecondIpfAssessment] = useState([]);
  const [axisX, setAxisX] = useState([]);

  useEffect(() => {
    if (ipfData?.length >= 2) {
      const firstAssessment = ipfData[0]?.feedback_ipf?.[0] || {};
      const secondAssessment = ipfData[1]?.feedback_ipf?.[0] || {};

      const scaleMapping = [
        { key: "romantic_scale_score", label: "Romantic Scale" },
        { key: "family_scale_score", label: "Family Scale" },
        { key: "work_scale_score", label: "Work Scale" },
        {
          key: "friendships_socializing_scale_score",
          label: "Friendships & Socializing Scale",
        },
        { key: "parenting_scale_score", label: "Parenting Scale" },
        { key: "education_scale_score", label: "Education Scale" },
        { key: "self_care_scale", label: "Self-Care Scale" },
      ];

      const xLabels = scaleMapping.map((scale) => scale.label);
      const firstData = scaleMapping.map(
        (scale) => firstAssessment[scale.key] ?? 0
      );
      const secondData = scaleMapping.map(
        (scale) => secondAssessment[scale.key] ?? 0
      );

      setAxisX(xLabels);
      setFirstIpfAssessment(firstData);
      setSecondIpfAssessment(secondData);
    }
  }, [ipfData]);

  return (
    <BarGraph
      xAxisTitle="Scale"
      yAxisTitle="Score"
      xAxisLabels={axisX}
      seriesData={[
        {
          name: `1st IPF Assessment (${ipfData[0]?.session_dte || "N/A"})`,
          type: "bar",
          data: firstIpfAssessment,
          itemStyle: { color: "#FFA500" },
          label: {
            show: true,
            position: "top",
            fontSize: 12,
            color: "#333",
            formatter: "{c}",
          },
        },
        {
          name: `2nd IPF Assessment (${ipfData[1]?.session_dte || "N/A"})`,
          type: "bar",
          data: secondIpfAssessment,
          itemStyle: { color: "#FF4500" },
          label: {
            show: true,
            position: "top",
            fontSize: 12,
            color: "#333",
            formatter: "{c}",
          },
        },
      ]}
      loading={loading}
    />
  );
}

export default IpfGraph;
