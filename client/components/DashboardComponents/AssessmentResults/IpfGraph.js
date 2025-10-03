import React, { useState, useEffect } from "react";
import BarGraph from "../../CustomGraphs/BarGraph";

function IpfGraph({ ipfData, loading }) {
  const [series, setSeries] = useState([]);
  const [axisX, setAxisX] = useState([]);

  useEffect(() => {
    if (!ipfData?.length) {
      setSeries([]);
      setAxisX([]);
      return;
    }

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

    setAxisX(scaleMapping.map((s) => s.label));

    const palette = [
      "#FFA500",
      "#FF4500",
      "#1E90FF",
      "#32CD32",
      "#800080",
      "#00CED1",
      "#FFD700",
      "#8B4513",
    ];

    const newSeries = ipfData.map((rec, idx) => {
      const assessment =
        Array.isArray(rec.feedback_ipf) && rec.feedback_ipf.length > 0
          ? rec.feedback_ipf[0]
          : rec;

      const dataPoints = scaleMapping.map((scale) => {
        const raw = assessment?.[scale.key];
        const v = raw === undefined || raw === null ? 0 : Number(raw);
        return { value: Number.isNaN(v) ? 0 : v };
      });

      const labelDate =
        (assessment?.created_at ||
          rec?.created_at ||
          rec?.session_dte ||
          "")?.toString().split(" ")[0] || `#${idx + 1}`;

      return {
        name: `IPF Assessment ${idx + 1} (${labelDate})`,
        type: "bar",
        data: dataPoints,
        itemStyle: { color: palette[idx % palette.length] },
        label: {
          show: true,
          position: "top",
          fontSize: 12,
          color: "#333",
          formatter: "{c}",
        },
      };
    });

    setSeries(newSeries);
  }, [ipfData]);

  return (
    <BarGraph
      xAxisTitle="Scale"
      yAxisTitle="Score"
      xAxisLabels={axisX}
      seriesData={series}
      loading={loading}
    />
  );
}

export default IpfGraph;
