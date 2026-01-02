import React, { useMemo, useState, useEffect } from "react";
import CustomCard from "../../CustomCard";
import ReactECharts from "echarts-for-react";
import { useReferenceContext } from "../../../context/ReferenceContext";
import { useQueryData } from "../../../utils/hooks/useQueryData";
import CommonServices from "../../../services/CommonServices";

function OverallScore({ filterCounselorId }) {
  const { userObj, tokenExpired } = useReferenceContext();
  const { role_id, user_profile_id, tenant_id } = userObj || {};
  const [selectedClient, setSelectedClient] = useState({
    label: "All Clients",
    value: "allClients",
  });
  const [filteredData, setFilteredData] = useState([]);

  // Build query parameters
  const queryParams = useMemo(() => {
    if ([3, 4].includes(role_id)) {
      return {
        role_id,
        ...(role_id === 3 && { tenant_id }),
        ...(filterCounselorId && { counselor_id: filterCounselorId }),
      };
    } else {
      return {
        role_id,
        counselor_id: user_profile_id,
      };
    }
  }, [role_id, user_profile_id, tenant_id, filterCounselorId]);

  // Fetch homework stats using React Query
  const {
    data: homeworkStatsData,
    isPending: isLoading,
    error,
  } = useQueryData(
    ["homework-stats", role_id, tenant_id, filterCounselorId || user_profile_id],
    async () => {
      const response = await CommonServices.getHomeworkStats(queryParams);
      return response.data;
    },
    !tokenExpired && !!role_id
  );

  // Update filtered data when homeworkStatsData changes
  useEffect(() => {
    if (homeworkStatsData && homeworkStatsData.length > 0) {
      setFilteredData(homeworkStatsData);
      setSelectedClient({ label: "All Clients", value: "allClients" });
    }
  }, [homeworkStatsData]);

  // Create options for dropdown
  const options = useMemo(() => {
    if (!homeworkStatsData || homeworkStatsData.length === 0) {
      return [{ label: "All Clients", value: "allClients" }];
    }
    
    const clientOptions = homeworkStatsData.map((client) => ({
      label: `${client.client_first_name} ${client.client_last_name}`,
      value: client.client_id,
    }));
    
    return [{ label: "All Clients", value: "allClients" }, ...clientOptions];
  }, [homeworkStatsData]);

  // Handle client selection change
  const handleClientChange = (client) => {
    setSelectedClient(client);
    if (client.value !== "allClients") {
      const clientData = homeworkStatsData.find(
        (item) => item.client_id === client.value
      );
      if (clientData) {
        setFilteredData([clientData]);
      }
    } else {
      setFilteredData(homeworkStatsData);
    }
  };

  // Prepare chart data
  const chartOption = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        title: {
          text: "No data available",
          left: "center",
          top: "center",
        },
      };
    }

    // Extract client names and homework counts
    const clientNames = filteredData.map((client) => {
      const firstName = client.client_first_name || "";
      const lastName = client.client_last_name || "";
      // Format as "FIRSTNAME L." (e.g., "SAM R.")
      return lastName 
        ? `${firstName.toUpperCase()} ${lastName.charAt(0).toUpperCase()}.`
        : firstName.toUpperCase();
    });

    const homeworkCounts = filteredData.map(
      (client) => client.total_homework_sent
    );

    // Separate data for legend (Below 3 and 3 or Above)
    const below3Data = homeworkCounts.map((count, index) =>
      count < 3 ? count : null
    );
    const above3Data = homeworkCounts.map((count, index) =>
      count >= 3 ? count : null
    );

    return {
      title: {
        text: "Frequency of Homework Sent Out per Client with Threshold Annotations",
        left: "center",
        textStyle: {
          fontSize: 14,
          fontWeight: "normal",
        },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: function (params) {
          const dataIndex = params[0].dataIndex;
          const client = filteredData[dataIndex];
          return `
            <strong>${client.client_first_name} ${client.client_last_name}</strong><br/>
            Total Sessions: ${client.total_sessions}<br/>
            Total Homework Sent: ${client.total_homework_sent}<br/>
            Avg per Session: ${(
              client.total_homework_sent / client.total_sessions
            ).toFixed(2)}
          `;
        },
      },
      legend: {
        data: ["3 or Above", "Below 3" ],
        orient: "horizontal",
        left: "center",
        top: 30,
        itemWidth: 15,
        itemHeight: 15,
      },
      grid: {
        left: "10%",
        right: "5%",
        bottom: "15%",
        containLabel: true,
      },
      xAxis: {
        name: "Client Name",
        nameLocation: "middle",
        nameTextStyle: {
          padding: clientNames.length > 5 ? 70 : 35,
        },
        type: "category",
        data: clientNames,
        axisPointer: { type: "shadow" },
        axisLabel: {
          interval: 0,
          rotate: clientNames.length > 5 ? 30 : 0,
        },
        nameGap: 0,
      },
      yAxis: {
        type: "value",
        name: "Total Homework Assignments Sent",
        nameLocation: "middle",
        nameGap: 40,
        nameRotate: 90,
      },
      series: [
        {
          name: "Below 3",
          type: "bar",
          data: below3Data,
          itemStyle: {
            color: "#dc3545",
          },
          label: {
            show: true,
            position: "top",
            formatter: "{c}",
            fontWeight: "bold",
          },
          barWidth: "60%",
          stack: "total",
        },
        {
          name: "3 or Above",
          type: "bar",
          data: above3Data,
          itemStyle: {
            color: "#28a745",
          },
          label: {
            show: true,
            position: "top",
            formatter: "{c}",
            fontWeight: "bold",
          },
          barWidth: "60%",
          stack: "total",
        },
      ],
    };
  }, [filteredData]);

  if (isLoading) {
    return (
      <CustomCard title="Homework Statistics" >
        <div style={{ textAlign: "center", padding: "20px" }}>
          Loading...
        </div>
      </CustomCard>
    );
  }

  if (error) {
    return (
      <CustomCard title="Homework Statistics" >
        <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
          Error loading homework statistics
        </div>
      </CustomCard>
    );
  }

  return (
    <CustomCard 
      title="Homework Statistics"
      dropdown
      options={options}
      onChange={handleClientChange}
      placeholder="Select a client"
    >
      <ReactECharts
        notMerge={true}
        lazyUpdate={true}
        theme={"theme_name"}
        option={chartOption}
        style={{ height: "400px", width: "100%"}}
      />
    </CustomCard>
  );
}

export default OverallScore;
