import { useEffect, useRef } from "react";
import * as echarts from "echarts";

export type FaultDetail = {
  Date: string;
  Category: string;
  TotalMachine: number;
  TotalFailure: number;
  NewFailure: number;
  NewFailureRate: number;
};
const BarFaultData = ({ data }: { data: FaultDetail[] }) => {
  const domRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<echarts.EChartsType | null>(null);

  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }
    if (!domRef.current) return;
    // 数据倒序
    const newData = data.reverse();

    const uniqueCategories = Array.from(new Set(newData.map((item) => item.Category)));
    const uniqueDates = Array.from(new Set(newData.map((item) => item.Date)));
    const colorPalette = ["#4B96FF", "#50E3C2", "#7C4DFF", "#F59E0B", "#10B981", "#EF4444"];

    const series = uniqueDates.map((date, idx) => {
      const seriesData = uniqueCategories.map((cat) => {
        const record = newData.find((d) => d.Date === date && d.Category === cat);
        return record ? record.NewFailureRate : null;
      });
      return {
        name: date,
        data: seriesData,
        type: "bar",
        barWidth: "20%",
        itemStyle: {
          color: colorPalette[idx % colorPalette.length],
        },
      };
    });

    const chart = echarts.init(domRef.current);
    chartRef.current = chart;
    //效率柱状图
    const efficiencyOption = {
      animation: false,
      grid: {
        top: 30,
        right: 20,
        bottom: 60,
        left: 50,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
        },
        formatter: (params: any) => {
          const category = params[0].axisValue;
          const values = params.map((item: any) => `${item.seriesName}: ${item.value.toFixed(2)}%`);
          return `${category}<br>${values.join("<br>")}`;
        },
      },
      xAxis: {
        type: "category",
        data: uniqueCategories,
        axisLabel: {
          color: "#1f2937",
          fontSize: 12,
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          color: "#1f2937",
          fontSize: 12,
          formatter: "{value}%",
        },
      },
      legend: {
        data: uniqueDates,

        textStyle: {
          color: "#1f2937",
        },
        top: 0,
        padding: [0, 0, 10, 0],
      },
      series,
    };
    chart.setOption(efficiencyOption);
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
  }, [data]);

  return (
    <>
      <div className="text-gray-500 mb-2">近三天新增故障率</div>
      <div ref={domRef} id="efficiency" className="h-64"></div>
    </>
  );
};

export default BarFaultData;
