import React, { useEffect, useRef } from "react";
import { ReactEcharts } from "../react-echarts";
import { cn } from "@/utils";

// 饼图数据项接口
export interface PieDataItem {
  value: number;
  name: string;
  itemStyle?: {
    color?: string;
  };
}

// 饼图组件属性接口
export interface PieChartProps {
  data: PieDataItem[];
  title?: string;
  radius?: [string, string];
  className?: string;
  style?: React.CSSProperties;
  theme?: string;
  showLegend?: boolean;
  legendPosition?: "top" | "bottom" | "left" | "right";
  showTooltip?: boolean;
  showLabel?: boolean;
  labelPosition?: "outside" | "inside" | "center";
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  onChartClick?: (params: any) => void;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  title,
  radius = ["40%", "70%"],
  className,
  style,
  theme = "light",
  showLegend = true,
  legendPosition = "top",
  showTooltip = true,
  showLabel = false,
  labelPosition = "outside",
  borderRadius = 10,
  borderColor = "#fff",
  borderWidth = 2,
  onChartClick,
}) => {
  const chartRef = useRef<any>(null);

  // 构建ECharts配置选项
  const option = {
    title: title
      ? {
          text: title,
          left: "center",
          top: "5%",
        }
      : undefined,
    tooltip: showTooltip
      ? {
          trigger: "item",
          formatter: "{a} <br/>{b}: {c} ({d}%)",
        }
      : undefined,
    legend: showLegend
      ? {
          [legendPosition]: legendPosition === "top" || legendPosition === "bottom" ? "5%" : "center",
          orient: legendPosition === "left" || legendPosition === "right" ? "vertical" : "horizontal",
        }
      : undefined,
    series: [
      {
        name: title || "Data",
        type: "pie",
        radius,
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius,
          borderColor,
          borderWidth,
        },
        label: {
          show: showLabel,
          position: labelPosition,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: showLabel && labelPosition === "outside",
        },
        data,
      },
    ],
  };

  // 处理图表点击事件
  useEffect(() => {
    if (chartRef.current && onChartClick) {
      const chartInstance = chartRef.current.getEChartInstance();
      if (chartInstance) {
        chartInstance.on("click", onChartClick);
        return () => {
          chartInstance.off("click", onChartClick);
        };
      }
    }
  }, [onChartClick]);

  return (
    <ReactEcharts
      ref={chartRef}
      option={option}
      theme={theme}
      className={cn("w-full h-full", className)}
      style={style}
    />
  );
};

export default PieChart;
