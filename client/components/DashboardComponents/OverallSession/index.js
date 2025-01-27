import React, { useEffect, useState } from "react";
import CustomCard from "../../CustomCard";
import ReactECharts from "echarts-for-react";
import { GRAPH_DATA } from "../../../utils/constants";
import useWindowResize from "../../../utils/hooks/useWindowResize";
function OverallSession() {
  const [selectedClient, setSelectedClient] = useState({
    label: "All Clients",
    value: "allClients",
  });


  const { pageSize } = useWindowResize();

  const isSmallScreen = pageSize.width <= 576;

  const [axisX, setAxisX] = useState(GRAPH_DATA.X_AXIS_DATA);
  const [totalSessionsData, setTotalSessionsData] = useState(
    GRAPH_DATA.TOTAL_SESSIONS_DATA
  );
  const [totalAttendanceData, setTotalAttendanceData] = useState(
    GRAPH_DATA.TOTAL_ATTENDANCE_DATA
  );
  const [totalCancelledData, setTotalCancelledData] = useState(
    GRAPH_DATA.TOTAL_CANCELLED_DATA
  );

  const options = [
    { label: "All Clients", value: "allClients" },
    ...new Set(GRAPH_DATA.X_AXIS_DATA),
  ];

  const handleClientChange = (client) => {

    setSelectedClient(client);
    const clientIndex = GRAPH_DATA.X_AXIS_DATA.findIndex((item) => {
      return item?.value === client?.value;
    });
   

    if (clientIndex !== -1) {
      setAxisX([client]);
      setTotalSessionsData([GRAPH_DATA.TOTAL_SESSIONS_DATA[clientIndex]]);
      setTotalAttendanceData([GRAPH_DATA.TOTAL_ATTENDANCE_DATA[clientIndex]]);
      setTotalCancelledData([GRAPH_DATA.TOTAL_CANCELLED_DATA[clientIndex]]);
    }
    else {
      setAxisX(GRAPH_DATA.X_AXIS_DATA);
      setTotalSessionsData(GRAPH_DATA.TOTAL_SESSIONS_DATA);
      setTotalAttendanceData(GRAPH_DATA.TOTAL_ATTENDANCE_DATA);
      setTotalCancelledData(GRAPH_DATA.TOTAL_CANCELLED_DATA);
    }
  };

  return (
    <CustomCard
      title="Overall Session"
      dropdown
      options={options}
      value={selectedClient?.value}
      onChange={handleClientChange}
    >
      <ReactECharts
        notMerge={true}
        lazyUpdate={true}
        theme={"theme_name"}
        option={{
          tooltip: {
            trigger: "axis",
            axisPointer: {
              type: "cross",
              crossStyle: {
                color: "#999",
              },
            },
          },
          toolbox: {
            feature: {
              magicType: { show: true, type: ["line", "bar"] },
              saveAsImage: { show: true },
            },
          },
          legend: {
            data: ["Sessions", "Attendance", "Cancellations"],
            orient: "horizontal",
            left: "center",
            bottom: "0%",
            icon: "circle",
          },
          grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true,
            bottom: "15%",
          },
          xAxis: {
            type: "category",
            data: axisX,
            axisPointer: {
              type: "shadow",
            },
            axisLabel: {
              interval: 0, // Show all labels
              rotate:
                (selectedClient.value == "allClients" && 45) ||
                (selectedClient == "allClients" && 45), // Rotate labels 45 degrees for readability
            },
          },
          yAxis: {
            type: "value",
          },
          series: [
            {
              name: "Sessions",
              type: "bar",
              data: totalSessionsData,
            },
            {
              name: "Attendance",
              type: "bar",
              data: totalAttendanceData,
            },
            {
              name: "Cancellations",
              type: "bar",
              data: totalCancelledData,
            },
          ],
        }}
      />
    </CustomCard>
  );
}

export default OverallSession;
