import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
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
import type { WeeklyChartPoint } from "./weeklyMock";
import { useSelector, useSettingsStore } from "@/stores";

import { getLast30DaysHighTemperatureImpactRate } from "@/pages/venue/api.tsx";

// 注册 ECharts 组件
echarts.use([LineChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer]);

// 定义返回值类型
interface HashRecord {
  date: string;
  highTemperatureRate: number;
}

interface ApiResponse {
  data: HashRecord[];
}

const WaveLineCard: React.FC<{ mode?: "day" | "week"; weeklyData?: WeeklyChartPoint[] }> = ({
  mode = "day",
  weeklyData = [],
}) => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const domRef = useRef<HTMLDivElement | null>(null);
  const { venueId } = useParams<{ venueId: string }>();
  const chartRef = useRef<echarts.EChartsType | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [hashValues, setHashValues] = useState<number[]>([]);
  // const [dailyData, setDailyData] = useState<string[]>([]);

  // 获取数据
  const fetchData = async () => {
    if (mode === "week") {
      setDates(weeklyData.map((item) => item.date));
      setHashValues(weeklyData.map((item) => item.value));
      return;
    }
    try {
      const response: ApiResponse = await getLast30DaysHighTemperatureImpactRate(poolType, Number(venueId));

      setDates(response.data.map((item) => item.date).reverse());
      setHashValues(response.data.map((item) => item.highTemperatureRate).reverse());

      // 处理响应数据
    } catch (error) {
      // 处理错误
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [venueId, mode, weeklyData]);
  // 获取当前日期

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
            .map((item: any) => `${item.name || ""}<br>${item.marker}高温影响：${item.value.toFixed(2)}%`)
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
              const week = weeklyData.find((item) => item.date === value)?.weekNo;
              return week ? `第${week}周` : value;
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
        data: dates,
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
          data: hashValues,
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
  }, [dates, hashValues]);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div>
            <h3 style={chartTitleStyle}>高温影响曲线</h3>
          </div>
          <span style={chartRangeBadge("#ea580c")}>{mode === "week" ? "近10周" : "近30日"}</span>
        </div>
      </div>
      <div ref={domRef} style={{ width: "100%", height: 320 }} />
    </>
  );
};

export default WaveLineCard;
