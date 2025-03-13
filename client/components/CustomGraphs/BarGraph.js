import React, { useRef, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import Spinner from "../common/Spinner";

const BarGraph = ({
  xAxisTitle,
  yAxisTitle,
  xAxisLabels,
  seriesData,
  loading,
}) => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      if (loading) {
        chartRef.current.getEchartsInstance().showLoading();
      } else {
        chartRef.current.getEchartsInstance().hideLoading();
      }
    }
  }, [loading]);

  const options = {
    legend: {
      show: true,
    },
    toolbox: {
      feature: {
        magicType: { show: true, type: ["line", "bar"] },
        saveAsImage: { show: true },
      },
    },
    grid: {
      left: "10%",
      right: "5%",
      bottom: "15%",
      containLabel: true,
    },
    xAxis: {
      name: xAxisTitle,
      nameLocation: "middle",
      nameTextStyle: {
        padding: 35,
      },
      type: "category",
      data: xAxisLabels,
      axisPointer: { type: "shadow" },
      axisLabel: {
        interval: 0,
        rotate: xAxisLabels.length > 5 ? 30 : 0,
      },
      nameGap: 0,
    },
    yAxis: {
      name: yAxisTitle,
      type: "value",
      nameLocation: "middle",
      nameGap: 40,
      nameRotate: 90,
    },
    series: [
      ...seriesData.map((data) => ({
        ...data,
        barGap: "0%",
        barCategoryGap: "40%",
      })),
    ],
  };

  return (
    <div style={{ position: "relative", width: "100%", height: "400px" }}>
      {loading ? (
        <div
          style={{
            position: "absolute",
            top: "45%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
        >
          <Spinner color="#525252" />
        </div>
      ) : seriesData[0]?.data?.length == 0 ? (
        <p
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
            top: "40%",
          }}
        >
          No Data Available
        </p>
      ) : (
        <ReactECharts
          ref={chartRef}
          notMerge={true}
          lazyUpdate={true}
          theme={"theme_name"}
          option={options}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
};

export default BarGraph;
