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
import { getLast30DaysHighTemperatureImpactRate } from "@/pages/venue/api.tsx";

// 注册 ECharts 组件
echarts.use([LineChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer]);

// 定义返回值类型
interface HashRecord {
  date: string;
  highTemperatureRate: number;
}

const WaveLineCard: React.FC<{ mode?: "day" | "week"; weeklyData?: WeeklyChartPoint[] }> = ({
  mode = "day",
  weeklyData,
}) => {
  const domRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);
  const { points, loading } = useVenueTrend(
    "high-temperature",
    mode,
    weeklyData,
    getLast30DaysHighTemperatureImpactRate,
    (row: HashRecord) => ({
      date: row.date,
      value: row.highTemperatureRate,
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
        formatter: (params: any) => {
          return params
            .map((item: any) =>
              t("{{value}}<br>{{marker}}高温影响：{{value2}}%", {
                value: item.name || "",
                marker: item.marker,
                value2: item.value.toFixed(2),
              }),
            )
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
      yAxis: {
        type: "value",
        splitNumber: 4,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { formatter: "{value}", ...commonAxisLabel },
        splitLine: commonSplitLine,
      },
      series: [
        {
          type: "line",
          smooth: true,
          showSymbol: false,
          data: points.map((point) => point.value),
          itemStyle: { color: "rgb(216, 70, 70)" },
          lineStyle: { width: 2, color: "#ea580c" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(234, 88, 12, 0.2)" },
              { offset: 1, color: "rgba(234, 88, 12, 0)" },
            ]),
          },
          emphasis: { focus: "series" },
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
            <h3 style={chartTitleStyle}>{t("高温影响曲线")}</h3>
          </div>
          <span style={chartRangeBadge("#ea580c")}>{mode === "week" ? t("近10周") : t("近30日")}</span>
        </div>
      </div>
      <Spin spinning={loading}>
        <div ref={domRef} style={{ width: "100%", height: 320 }} />
      </Spin>
    </>
  );
};

export default WaveLineCard;
