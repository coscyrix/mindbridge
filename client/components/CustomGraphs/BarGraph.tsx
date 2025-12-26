import React, { useRef, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import Spinner from "../common/Spinner";
import { DIFFICULT_DAYS_OBJ, DIFFICULY_SCORE_ARR } from "../../utils/constants";
import { EChartsOption } from "echarts";

interface BarGraphProps {
  xAxisTitle: string;
  yAxisTitle: string;
  xAxisLabels: string[];
  seriesData: any[];
  loading: boolean;
  formName?: string;
  customOptions?: Partial<EChartsOption>;
}

const BarGraph: React.FC<BarGraphProps> = ({
  xAxisTitle,
  yAxisTitle,
  xAxisLabels,
  seriesData,
  loading,
  formName,
  customOptions = {},
}) => {
  const chartRef = useRef<ReactECharts>(null);
  
  const getTooltipConfig = (formName?: string) => {
    if (formName === "PHQ-9") {
      return {
        trigger: "item" as const,
        axisPointer: { type: "shadow" as const },
        formatter: (params: any) => {
          const { data } = params;
          const difficultyValue = DIFFICULY_SCORE_ARR?.find(
            (diff) => diff.value == data?.additionalInfo?.difficultyScore
          );
          return `
            <div style="display: flex; align-items: start; max-width: 310px;">
              ${
                difficultyValue?.icon || ""
              }<span style="white-space:pre-wrap;"> <b>${
            difficultyValue?.label || "N/A"
          }</b> to do work, take care of things at home, or get along with other people?</span>
            </div>
          `;
        },
      };
    } else if (formName === "WHODAS") {
      return {
        trigger: "item" as const,
        axisPointer: { type: "shadow" as const },
        formatter: (params: any) => {
          const { data } = params;
          const daysObj = DIFFICULT_DAYS_OBJ;
          return `
            <div style="display: flex; flex-direction:column; gap:5px; max-width:500px; width:100%;">
              <div>${
                daysObj?.h1Icon
              }<span style="white-space:pre-wrap;">H1: Overall, in the past 30 days, how many days were these difficulties present? =</span> <b>${
            data?.additionalInfo.h1 || "N/A"
          }</b></div>
              <div>${
                daysObj?.h2Icon
              }<span style="white-space:pre-wrap;">H2: In the past 30 days, for how many days were you totally unable to carry out your usual activities or work because of any health condition? =</span> <b>${
            data?.additionalInfo.h2 || "N/A"
          }</b></div>
              <div>${
                daysObj?.h3Icon
              }<span style="white-space:pre-wrap;">H3: In the past 30 days, not counting the days that you were totally unable, for how many days did you cut back or reduce your usual activities or work because of any health condition? =</span> <b>${
            data?.additionalInfo.h3 || "N/A"
          }</b></div>
            </div>
          `;
        },
      };
    }
    return { show: false };
  };

  useEffect(() => {
    if (chartRef.current) {
      if (loading) {
        chartRef.current.getEchartsInstance().showLoading();
      } else {
        chartRef.current.getEchartsInstance().hideLoading();
      }
    }
  }, [loading]);

  const baseOptions: EChartsOption = {
    tooltip: getTooltipConfig(formName) as any,
    legend: {
      show: true,
    },
    toolbox: {
      feature: {
        magicType: {
          show: true,
          type: ["line", "bar"],
          option: {
            bar: { series: seriesData.filter((s) => s.type === "bar") },
          },
        },
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
        padding: xAxisLabels.length > 5 ? 70 : 35,
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
    series: seriesData.map((data) => {
      return {
        ...data,
        barGap: "0%",
        barCategoryGap: "40%",
        data: data.data.map((item: any, index: number) => ({
          ...item,
        })),
      };
    }),
  };

  // Deep merge customOptions with baseOptions
  const deepMerge = (target: any, source: any): any => {
    const output = { ...target };
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach((key) => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    return output;
  };

  const isObject = (item: any): boolean => {
    return item && typeof item === "object" && !Array.isArray(item);
  };

  const options = deepMerge(baseOptions, customOptions);

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

