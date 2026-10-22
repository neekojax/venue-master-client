import { useEffect, useRef } from "react";
import echarts from "@/components/react-echarts/library";
import type { VenueStats } from "../types";

import { t } from "@/locales";

interface EffectChartProps {
  data?: VenueStats;
}

const EffectChart: React.FC<EffectChartProps> = ({ data }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current && data) {
      intChart();
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [data]);

  const intChart = () => {
    if (!chartRef.current || !data) return;

    // 销毁旧实例
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    chartInstance.current = echarts.init(chartRef.current);

    const option = {
      tooltip: {
        trigger: "item",
        formatter: function (params: any) {
          return `${params.seriesName} <br/>${params.name}: ${params.value.toFixed(2)}%`;
        },
      },
      legend: {
        top: 0,
        left: 4,
        itemGap: 10,
        itemWidth: 14,
        itemHeight: 10,
        // 图例去掉结尾的“占比/Proportion”后缀，缩短文字让 4 项一行从左到右排开
        formatter: (name: string) => name.split(t("占比")).join(""),
      },
      series: [
        {
          name: t("影响占比"),
          type: "pie",
          top: "32%",
          radius: ["70%", "100%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: "#fff",
            borderWidth: 2,
          },
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 10,
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: data.highTemperatureRate || 0, name: t("高温占比") },
            { value: data.limitImpactRate || 0, name: t("限电占比") },
            { value: data.totalFailuresRate || 0, name: t("故障率") },
            {
              value: Math.max(
                0,
                (data.impactRatio || 0) -
                  (data.limitImpactRate || 0) -
                  (data.highTemperatureRate || 0) -
                  (data.totalFailuresRate || 0),
              ),
              name: t("其他占比"),
            },
          ],
        },
      ],
    };

    chartInstance.current.setOption(option);
  };

  return <div ref={chartRef} style={{ height: 190, width: "100%" }} />;
};

export default EffectChart;
