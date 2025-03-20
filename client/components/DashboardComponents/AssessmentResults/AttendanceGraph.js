import React from "react";
import BarGraph from "../../CustomGraphs/BarGraph";

const AttendanceGraph = ({ attendanceData, loading }) => {
  // Extract data for each client
  const xAxisLabels = attendanceData.map(
    (item) =>
      `Session ${item.session_id} - Session ${Number(item.session_id) + 4}`
  );

  const totalSessionsData = attendanceData.map((item) => {
    return { value: item.feedback_attendance?.[0]?.total_sessions || 0 };
  });

  const totalAttendanceData = attendanceData.map((item) => {
    return {
      value: item.feedback_attendance?.[0]?.total_attended_sessions || 0,
    };
  });

  const totalCancelledData = attendanceData.map((item) => {
    return {
      value: item.feedback_attendance?.[0]?.total_cancelled_sessions || 0,
    };
  });

  return (
    <BarGraph
      xAxisTitle="Sessions"
      yAxisTitle="Session Count"
      xAxisLabels={xAxisLabels}
      seriesData={[
        {
          name: "Total Sessions",
          type: "bar",
          data: totalSessionsData,
          itemStyle: { color: "#0000ff" },
          label: {
            show: true,
            position: "top",
            fontSize: 12,
            color: "#333",
            formatter: "{c}",
          },
        },
        {
          name: "Attended Sessions",
          type: "bar",
          data: totalAttendanceData,
          itemStyle: { color: "#008200" },
          label: {
            show: true,
            position: "top",
            fontSize: 12,
            color: "#333",
            formatter: "{c}",
          },
        },
        {
          name: "Cancelled Sessions",
          type: "bar",
          data: totalCancelledData,
          itemStyle: { color: "#ff0000" },
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
};

export default AttendanceGraph;
