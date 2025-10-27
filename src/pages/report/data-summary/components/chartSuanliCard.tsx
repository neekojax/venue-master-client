import React, { useEffect, useRef, useState } from "react";
// import { Radio } from 'antd';
import { useParams } from "react-router-dom";
import { Spin } from "antd";
import { LineChart } from "echarts/charts";
import { GridComponent, TitleComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

import { fetchHashRateTrend } from "@/pages/report/api.tsx";

// 注册 ECharts 组件
echarts.use([LineChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer]);

// 定义返回值类型
interface HashRecord {
  date: string;
  hashRate: number;
}

interface ApiResponse {
  data: HashRecord[];
}

const ChartSuanliCard: React.FC<{ loading: any; hashRateDiffPercent?: number; chartDate: string }> = ({
  loading,
  hashRateDiffPercent,
  chartDate,
}) => {
  const domRef = useRef<HTMLDivElement | null>(null);
  const { venueId } = useParams<{ venueId: string }>();
  const chartRef = useRef<echarts.EChartsType | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [hashValues, setHashValues] = useState<number[]>([]);
  // const [dailyData, setDailyData] = useState<string[]>([]);

  // 获取数据
  const fetchData = async () => {
    try {
      const response: ApiResponse = await fetchHashRateTrend(chartDate);
      setDates(response.data.map((item) => item.date));
      setHashValues(response.data.map((item) => item.hashRate));
      // 处理响应数据
    } catch (error) {
      // 处理错误
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [venueId]);
  // 获取当前日期

  useEffect(() => {
    if (!domRef.current) return;
    // console.log(dates, hashValues)

    const chart = echarts.init(domRef.current);
    chartRef.current = chart;
    const lineColor = hashRateDiffPercent !== undefined && hashRateDiffPercent < 0 ? "#ef4444" : "#22ab94"; // # #22ab94
    console.log("hashRateDiffPercent", hashRateDiffPercent, lineColor);

    const option = {
      title: { text: "", show: false, left: "center", top: 0, textStyle: { fontSize: 12, fontWeight: 600 } },
      grid: { left: 0, right: 0, top: 0, bottom: 0, containLabel: true },
      tooltip: {
        show: false,
        trigger: "axis",
        axisPointer: { type: "line" },
        formatter: (params: any) => {
          // params 是数组，因为 trigger: "axis"
          return params
            .map((item: any) => `${item.name || ""}<br>${item.marker}全网算力：${item.value.toFixed(2)} EH/s`)
            .join("<br/>");
        },
      },
      xAxis: {
        type: "category",
        show: false,
        boundaryGap: false,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          show: true,
          formatter: (value: string) => {
            // 假设 value = "2025-08-23"
            const d = new Date(value);
            if (!isNaN(d.getTime())) {
              const month = d.getMonth() + 1;
              const day = d.getDate();
              return `${month}-${day}`;
            }
            // 如果不是标准日期字符串，比如 "2025/08/23"
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
        show: false,
        min: Math.min(...hashValues),
        // min: hashValues.length > 0 ? Math.floor(Math.min(...hashValues) - 300) : 0,
        // min: 0,
        max: Math.max(...hashValues),
        splitNumber: 4,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { formatter: "{value}", show: false },
        splitLine: { lineStyle: { type: "dashed" } },
      },
      series: [
        {
          type: "line",
          smooth: true,
          symbol: "none",
          data: hashValues,
          // data: makeWave(0),
          lineStyle: { width: 2, color: lineColor }, // #2563eb
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
  }, [dates, hashValues, hashRateDiffPercent]);

  return (
    <Spin spinning={!!loading}>
      <div ref={domRef} style={{ width: "100%", height: 80 }} />
    </Spin>
  );
};

export default ChartSuanliCard;
