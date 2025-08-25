import React, { useEffect, useRef, useState } from "react";
// import { Radio } from 'antd';
import { useParams } from "react-router-dom";
import { LineChart } from "echarts/charts";
import { GridComponent, TitleComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

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

const WaveLineCard: React.FC = () => {
  const domRef = useRef<HTMLDivElement | null>(null);
  const { venueId } = useParams<{ venueId: string }>();
  const chartRef = useRef<echarts.EChartsType | null>(null);
  const [dates, setDates] = useState<string[]>([]);
  const [hashValues, setHashValues] = useState<number[]>([]);
  // const [dailyData, setDailyData] = useState<string[]>([]);

  // 获取数据
  const fetchData = async () => {
    try {
      const response: ApiResponse = await getLast30DaysHighTemperatureImpactRate(Number(venueId));

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
  }, [venueId]);
  // 获取当前日期

  useEffect(() => {
    if (!domRef.current) return;
    // console.log(dates, hashValues)

    const chart = echarts.init(domRef.current);
    chartRef.current = chart;

    const option = {
      title: { text: "", left: "center", top: 6, textStyle: { fontSize: 14, fontWeight: 600 } },
      grid: { left: 12, right: 12, top: 10, bottom: 16, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "line" },
        formatter: (params: any) => {
          // params 是数组，因为 trigger: "axis"
          return params
            .map((item: any) => `${item.name || ""}<br>${item.marker}高温影响：${item.value.toFixed(2)}%`)
            .join("<br/>");
        },
      },
      xAxis: {
        type: "category",
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
        // min: 0,
        // max: 100,
        splitNumber: 4,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { formatter: "{value}" },
        splitLine: { lineStyle: { type: "dashed" } },
      },
      series: [
        {
          type: "line",
          smooth: true,
          // symbol: 'none',
          data: hashValues,
          itemStyle: {
            color: "rgb(216, 70, 70)", //rgb(216, 70, 70) 点的颜色
          },
          // data: makeWave(0),
          lineStyle: { width: 2, color: "#ea580c" }, // #ea580c
          // areaStyle: { opacity: 0.35 }
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(234, 88, 12, 0.2)" },
              { offset: 1, color: "rgba(234, 88, 12, 0)" },
            ]),
          },
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
        <h3 className="text-lg font-semibold">高温影响曲线</h3>
        {/* <Radio.Group
                    value={chart.period}
                    onChange={(e) => {
                        const newCharts = [...charts];
                        newCharts[index].period = e.target.value;
                        setCharts(newCharts);
                    }}
                    size="small"
                >
                    <Radio.Button value="day">日</Radio.Button>
                    <Radio.Button value="month">月</Radio.Button>
                </Radio.Group> */}
      </div>
      <div ref={domRef} style={{ width: "100%", height: 320 }} />
    </>
  );
};

export default WaveLineCard;
