import React, { useState, useEffect } from "react";
import CustomCard from "../../CustomCard";
import BarGraph from "../../CustomGraphs/BarGraph";

function OverallSession({ overallSessionsData }) {
  const [selectedClient, setSelectedClient] = useState({
    label: "All Clients",
    value: "allClients",
  });
  const [loading, setLoading] = useState(true);
  const [axisX, setAxisX] = useState([]);
  const [initialAxisX, setInitialAxisX] = useState([]);
  const [totalSessionsData, setTotalSessionsData] = useState([]);
  const [totalAttendanceData, setTotalAttendanceData] = useState([]);
  const [totalCancelledData, setTotalCancelledData] = useState([]);

  useEffect(() => {
    setLoading(true);
    if (overallSessionsData?.length > 0) {
      const X_AXIS_DATA = overallSessionsData.map((clientInfo) => ({
        label: `${clientInfo.client_first_name} ${clientInfo.client_last_name}`,
        value: clientInfo.client_id,
      }));

      setInitialAxisX(X_AXIS_DATA);
      setAxisX(X_AXIS_DATA);
      setTotalSessionsData(
        overallSessionsData.map((s) => {
          return { value: s.total_session_count };
        })
      );
      setTotalAttendanceData(
        overallSessionsData.map((s) => {
          return { value: s.show_session_count };
        })
      );
      setTotalCancelledData(
        overallSessionsData.map((s) => {
          return { value: s.no_show_session_count };
        })
      );
    }
    setLoading(false);
  }, [overallSessionsData]);

  const options = [
    { label: "All Clients", value: "allClients" },
    ...initialAxisX,
  ];

  const handleClientChange = (client) => {
    setSelectedClient(client);
    if (client.value !== "allClients") {
      const clientData = overallSessionsData.find(
        (item) => item.client_id === client.value
      );
      console.log(clientData, "clientData");
      if (clientData) {
        setAxisX([client]);
        setTotalSessionsData([{ value: clientData.total_session_count }]);
        setTotalAttendanceData([{ value: clientData.show_session_count }]);
        setTotalCancelledData([{ value: clientData.no_show_session_count }]);
      }
    } else {
      setAxisX(
        overallSessionsData.map((s) => ({
          label: `${s.client_first_name} ${s.client_last_name}`,
          value: s.client_id,
        }))
      );
      setTotalSessionsData(
        overallSessionsData.map((s) => {
          return { value: s.total_session_count };
        })
      );
      setTotalAttendanceData(
        overallSessionsData.map((s) => {
          return { value: s.show_session_count };
        })
      );
      setTotalCancelledData(
        overallSessionsData.map((s) => {
          return { value: s.no_show_session_count };
        })
      );
    }
  };

  return (
    <CustomCard
      title="Overall Session"
      dropdown
      options={options}
      onChange={handleClientChange}
      placeholder="Select a client"
    >
      <BarGraph
        xAxisTitle="Client Name"
        yAxisTitle="Session Count"
        xAxisLabels={axisX.map((item) => {
          const nameParts = item?.label?.split(" ");
          return nameParts.length > 1
            ? `${nameParts[0].toUpperCase()} ${nameParts[1]
                .charAt(0)
                .toUpperCase()}.`
            : nameParts[0];
        })}
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
            name: "Show",
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
            name: "No Show",
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
    </CustomCard>
  );
}

export default OverallSession;
