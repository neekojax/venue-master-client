import React, { useEffect, useRef } from "react";
import { Spin } from "antd";
import { LineChart } from "echarts/charts";
import { GridComponent, TitleComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import {
  chartRangeBadge,
  chartTitleStyle,
  commonAxisLabel,
  commonAxisLine,
  commonGrid,
  commonSplitLine,
  commonTooltip,
} from "./chartTheme";
import { useVenueTrend } from "./useVenueTrend";
import type { WeeklyChartPoint } from "./weeklyMock";

import { t } from "@/locales";
import { getLast30DaysFailureRate } from "@/pages/venue/api.tsx";

// 注册 ECharts 组件
echarts.use([LineChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer]);

// 定义返回值类型
interface HashRecord {
  date: string;
  dayMachineFailRate: number;
  totalMachineFail: number;
}

const WaveLineCard: React.FC<{ mode?: "day" | "week"; weeklyData?: WeeklyChartPoint[] }> = ({
  mode = "day",
  weeklyData,
}) => {
  const domRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);
  const { points, loading } = useVenueTrend(
    "failure",
    mode,
    weeklyData,
    getLast30DaysFailureRate,
    (row: HashRecord) => ({
      date: row.date,
      value: row.dayMachineFailRate,
      auxValue: row.totalMachineFail,
    }),
  );

  useEffect(() => {
    if (!domRef.current) return;

    const chart = echarts.init(domRef.current);
    chartRef.current = chart;

    const option = {
      grid: commonGrid,
      tooltip: {
        trigger: "axis",
        ...commonTooltip,
        textStyle: { color: "#0f172a", fontSize: 12 },
        formatter: (params: any) => {
          return params
            .map((item: any) => {
              if (item.seriesName === "故障数") {
                return `${item.name || ""}<br>${item.marker}${item.seriesName}：${item.value.toFixed(0)}`;
              } else {
                return `${item.marker}${item.seriesName}：${item.value.toFixed(2)}%`;
              }
            })
            .join("<br/>");
        },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        axisTick: { show: false },
        axisLine: commonAxisLine,
        axisLabel: {
          show: true,
          ...commonAxisLabel,
          formatter: (value: string) => {
            if (mode === "week") {
              const week = points.find((item) => item.date === value)?.weekNo;
              return week ? t("第{{week}}周", { week: week }) : value;
            }
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
              const month = d.getMonth() + 1;
              const day = d.getDate();
              return `${month}-${day}`;
            }
            const parts = value.split(/[-/]/);
            if (parts.length >= 3) {
              return `${parts[1]}-${parts[2]}`;
            }
            return value;
          },
        },
        data: points.map((point) => point.date),
        // data: Array.from({ length: 256 }, (_, i) => i)
      },
      yAxis: [
        {
          type: "value",
          name: mode === "week" ? t("故障数") : t("故障率"),
          splitNumber: 4,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { formatter: "{value}", ...commonAxisLabel },
          splitLine: commonSplitLine,
          nameTextStyle: { color: "#94a3b8", fontSize: 11, padding: [0, 0, 0, 6] },
        },
        {
          type: "value",
          min: 0,
          name: t("故障数"),
          splitNumber: 4,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { formatter: "{value}", color: "#94a3b8", fontSize: 11 },
          nameTextStyle: { color: "#94a3b8", fontSize: 11, padding: [0, 6, 0, 0] },
        },
      ],
      series: [
        {
          type: "line",
          smooth: true,
          name: mode === "week" ? t("故障数") : t("故障率"),
          yAxisIndex: 0,
          itemStyle: { color: "rgb(216, 70, 70)" },
          showSymbol: false,
          data: points.map((point) => point.value),
          lineStyle: { width: 2, color: "#dc2626" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(220, 38, 38, 0.2)" },
              { offset: 1, color: "rgba(220, 38, 38,  0)" },
            ]),
          },
          emphasis: { focus: "series" },
        },
        {
          type: "line",
          smooth: true,
          name: mode === "week" ? t("故障率") : t("故障数"),
          yAxisIndex: 1,
          itemStyle: {
            color: "rgb(241, 235, 235)", //rgb(216, 70, 70) 点的颜色
          },
          symbol: "none",
          data: points.map((point) => point.auxValue ?? 0),
          lineStyle: { width: 0, color: "#dc2626" },
        },
      ],
    };

    chart.setOption(option);

    // 自适应：优先使用 ResizeObserver，其次监听窗口
    const observer = new ResizeObserver(() => {
      chartRef.current?.resize();
    });
    observer.observe(domRef.current);

    return () => {
      observer.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
    };
  }, [mode, points]);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 style={chartTitleStyle}>{t("故障率变化曲线")}</h3>
          </div>
          <span style={chartRangeBadge("#dc2626")}>{mode === "week" ? t("近10周") : t("近30日")}</span>
        </div>
      </div>
      <Spin spinning={loading}>
        <div ref={domRef} style={{ width: "100%", height: 320 }} />
      </Spin>
    </>
  );
};

export default WaveLineCard;
