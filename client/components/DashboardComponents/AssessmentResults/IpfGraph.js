import React, { useState, useEffect } from "react";
import BarGraph from "../../CustomGraphs/BarGraph";

function IpfGraph({ ipfData, loading }) {
  const [firstIpfAssessment, setFirstIpfAssessment] = useState([]);
  const [secondIpfAssessment, setSecondIpfAssessment] = useState([]);
  const [axisX, setAxisX] = useState([]);

  useEffect(() => {
    if (!ipfData?.rec?.feedback_ipf?.length) return;

    const assessments = ipfData.rec.feedback_ipf;
    const firstAssessment = assessments[0];
    const secondAssessment = assessments[1] || null;

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

    setAxisX(scaleMapping.map((scale) => scale.label));

    setFirstIpfAssessment(
      scaleMapping.map((scale) => ({ value: firstAssessment[scale.key] || 0 }))
    );

    if (secondAssessment) {
      setSecondIpfAssessment(
        scaleMapping.map((scale) => ({
          value: secondAssessment[scale.key] || 0,
        }))
      );
    }
  }, [ipfData]);

  return (
    <BarGraph
      xAxisTitle="Scale"
      yAxisTitle="Score"
      xAxisLabels={axisX}
      seriesData={[
        {
          name: `1st IPF Assessment (${
            Array.isArray(ipfData?.rec?.feedback_ipf) &&
            ipfData.rec.feedback_ipf.length > 0
              ? ipfData.rec.feedback_ipf[0].created_at?.split(" ")[0]
              : "N/A"
          })`,
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
        ...(secondIpfAssessment.length
          ? [
              {
                name: `2nd IPF Assessment (${
                  ipfData?.rec?.feedback_ipf[1]?.created_at?.split(" ")[0] ||
                  "N/A"
                })`,
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
            ]
          : []),
      ]}
      loading={loading}
    />
  );
}

export default IpfGraph;
