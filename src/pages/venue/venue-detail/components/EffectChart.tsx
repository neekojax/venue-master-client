import { useEffect, useRef } from "react";
import echarts from "@/components/react-echarts/library";
import type { VenueStats } from "../types";

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
        top: "0%",
        left: "center",
      },
      series: [
        {
          name: "影响占比",
          type: "pie",
          top: "20%",
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
            { value: data.highTemperatureRate || 0, name: "高温占比" },
            { value: data.limitImpactRate || 0, name: "限电占比" },
            { value: data.totalFailuresRate || 0, name: "故障率" },
            {
              value: Math.max(
                0,
                (data.impactRatio || 0) -
                  (data.limitImpactRate || 0) -
                  (data.highTemperatureRate || 0) -
                  (data.totalFailuresRate || 0),
              ),
              name: "其他占比",
            },
          ],
        },
      ],
    };

    chartInstance.current.setOption(option);
  };

  return <div ref={chartRef} style={{ height: 173, width: "100%" }} />;
};

export default EffectChart;
