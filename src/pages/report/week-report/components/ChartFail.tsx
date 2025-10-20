import React, { useEffect, useRef } from "react";
import { LineChart } from "echarts/charts";
import { GridComponent, TitleComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

// 注册 ECharts 组件
echarts.use([LineChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer]);

// 定义返回值类型
interface FailureRate {
  date: string;
  failureRate: number;
}

interface Props {
  failureRate: FailureRate[];
}

const WaveLineCard: React.FC<Props> = ({ failureRate }) => {
  const domRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);
  const xAxisData = failureRate.map((item: any) => item.date);
  const yAxisData = failureRate.map((item: any) => item.failureRate);
  const yAxisData_failure_num = failureRate.map((item: any) => item.failure);

  // 获取当前日期
  useEffect(() => {
    if (!domRef.current) return;
    // console.log(dates, hashValues)

    const chart = echarts.init(domRef.current);
    chartRef.current = chart;

    const option = {
      title: { text: "", left: "center", top: 6, textStyle: { fontSize: 14, fontWeight: 600 } },
      grid: { left: 12, right: 0, top: 10, bottom: 16, containLabel: true },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "line" },
        fontSize: 10,
        formatter: (params: any) => {
          return params
            .map((item: any) => {
              if (item.seriesName === "故障率") {
                return `${item.name || ""}<br>${item.marker}${item.seriesName}：${item.value.toFixed(2)}%`;
              } else {
                return `${item.marker}${item.seriesName}：${item.value.toFixed(0)}`;
              }
            })
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
              return `${month}/${day}`;
            }
            // 如果不是标准日期字符串，比如 "2025/08/23"
            const parts = value.split(/[-/]/);
            if (parts.length >= 3) {
              return `${parts[1]}/${parts[2]}`;
            }
            return value;
          },
        },
        data: xAxisData,
        // data: Array.from({ length: 256 }, (_, i) => i)
      },
      yAxis: [
        {
          type: "value",
          name: "故障率",
          // min: 0,
          // max: 100,
          splitNumber: 4,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { formatter: (value: number) => `${value.toFixed(0)}%` },
          splitLine: { lineStyle: { type: "dashed" } },
          // formatter: (value: number) => `${value.toFixed(2)}%`,
        },
        {
          type: "value",
          name: "故障数",
          position: "right",
          show: false,
          // min: 0,
          // max: 100,
          splitNumber: 4,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { formatter: "{value}" },
          splitLine: { lineStyle: { type: "dashed" } },
        },
      ],
      series: [
        {
          type: "line",
          name: "故障率",
          smooth: true,
          itemStyle: {
            color: "rgb(216, 70, 70)", //rgb(216, 70, 70) 点的颜色
          },
          // symbol: 'none',
          data: yAxisData,
          // data: makeWave(0),
          lineStyle: { width: 2, color: "#dc2626" }, // #dc2626
          // areaStyle: { opacity: 0.35 }
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(220, 38, 38, 0.2)" },
              { offset: 1, color: "rgba(220, 38, 38,  0)" },
            ]),
          },
        },
        {
          type: "line",
          name: "故障数",
          smooth: true,

          showSymbol: false,
          itemStyle: {
            show: false,
            color: "#fff", //rgb(216, 70, 70) 点的颜色
          },
          yAxisIndex: 1,
          // symbol: 'none',
          data: yAxisData_failure_num,
          // data: makeWave(0),
          lineStyle: { show: false, width: 2, color: "#fff" }, // #dc2626
          // areaStyle: { opacity: 0.35 }
          // areaStyle: {
          //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //     { offset: 0, color: "rgba(220, 38, 38, 0.2)" },
          //     { offset: 1, color: "rgba(220, 38, 38,  0)" },
          //   ]),
          // },
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
  }, [xAxisData, yAxisData]);

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">故障率</h3>
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
      <div ref={domRef} style={{ width: "108%", height: 255 }} />
    </>
  );
};

export default WaveLineCard;
