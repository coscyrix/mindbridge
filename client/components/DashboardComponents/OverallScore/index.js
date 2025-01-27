import React from "react";
import CustomCard from "../../CustomCard";
import ReactECharts from "echarts-for-react";

function OverallScore() {
  return (
    <CustomCard title="Overall Score" dropdown>
      <ReactECharts
        notMerge={true}
        lazyUpdate={true}
        theme={"theme_name"}
        option={{
          tooltip: {
            trigger: "item",
          },
          legend: {
            orient: "horizontal",
            left: "center",
            bottom: "0",
            icon: "circle",
          },
          series: [
            {
              name: "Access From",
              type: "pie",
              radius: "50%",
              data: [
                { value: 1048, name: "Target" },
                { value: 735, name: "Response" },
              ],
              emphasis: {
                itemStyle: {
                  shadowBlur: 10,
                  shadowOffsetX: 0,
                  shadowColor: "rgba(0, 0, 0, 0.5)",
                },
              },
            },
          ],
        }}
      />
    </CustomCard>
  );
}

export default OverallScore;
