// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { DollarCircleOutlined } from "@ant-design/icons";
import * as echarts from "echarts";

import { fetchDailyBtcPrice } from "@/pages/custody-statistics/api";

const PriceApp: React.FC = () => {
  const btcChartRef = useRef<HTMLDivElement>(null);
  const [btcPrices, setBtcPrices] = useState<number[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  // Generate mock data for the last 180 days
  // 获取路由参数
  const { venueId } = useParams<{ venueId: string }>();
  const parsedVenueId = parseInt(venueId || "0", 10);
  const isInvalidVenueId = isNaN(parsedVenueId);

  const fetchBtcPriceHistory = useCallback(async () => {
    const res = await fetchDailyBtcPrice({ venueId: parsedVenueId });
    const payload: any = res;
    if (payload && (payload.code === 0 || payload.success === true) && payload.data) {
      const arr = payload.data || [];
      return arr;
    }
    return null;
  }, [parsedVenueId]);

  useEffect(() => {
    if (isInvalidVenueId) {
      setMonths([]);
      setBtcPrices([]);
      return;
    }
    fetchBtcPriceHistory().then((respData) => {
      if (respData) {
        const monthsArr = respData.map((item: any) => item.date);
        const pricesArr = respData.map((item: any) => Number(item.price));
        setMonths(monthsArr);
        setBtcPrices(pricesArr);
      } else {
        setMonths([]);
        setBtcPrices([]);
      }
    });
  }, [fetchBtcPriceHistory, isInvalidVenueId]);

  useEffect(() => {
    if (btcChartRef.current) {
      const btcChart = echarts.init(btcChartRef.current);
      btcChart.setOption({
        title: {
          text: "BTC单价趋势（USD）",
          textStyle: {
            fontSize: 16,
            fontWeight: "bold",
            color: "#1890ff",
          },
          left: "center",
        },
        tooltip: {
          trigger: "axis",
        },
        xAxis: {
          type: "category",
          data: months,
          boundaryGap: false,
          axisLabel: {
            formatter: (value: string) => {
              const m = /^(\d{4})[-/](\d{2})[-/](\d{2})/.exec(value);
              if (m) return `${m[2]}/${m[3]}`;
              const d = new Date(value);
              if (!isNaN(d.getTime())) {
                const mm = String(d.getMonth() + 1).padStart(2, "0");
                const dd = String(d.getDate()).padStart(2, "0");
                return `${mm}/${dd}`;
              }
              const parts = value.split(" ")[0].split("-");
              if (parts.length >= 3) return `${parts[1]}/${parts[2]}`;
              return value;
            },
          },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: "${value}",
          },
        },
        series: [
          {
            data: btcPrices,
            type: "line",
            smooth: true,
            itemStyle: { color: "#1890ff" },
            areaStyle: { color: "rgba(24, 144, 255, 0.1)" },
            showSymbol: false, // Hide symbols for better performance with many data points
          },
        ],
        grid: {
          left: "0%",
          right: "0%",
          bottom: "5%",
          containLabel: true,
        },
        animation: false,
      });
      return () => {
        btcChart.dispose();
      };
    }
  }, [months, btcPrices]);
  return (
    <>
      {/* BTC Price Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-10 transition-all hover:shadow-lg">
        <div className="flex items-center mb-4">
          <DollarCircleOutlined className="text-blue-500 text-xl mr-2" />
          <h2 className="text-lg font-semibold text-gray-700">BTC价格走势</h2>
        </div>
        <div ref={btcChartRef} className="w-full h-80"></div>
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="bg-blue-50 rounded-lg px-4 py-2">
            <span className="text-blue-800 font-medium">最高价:</span>
            <span className="text-blue-600 ml-1">${Math.max(...btcPrices).toLocaleString()}</span>
          </div>
          <div className="bg-blue-50 rounded-lg px-4 py-2">
            <span className="text-blue-800 font-medium">最低价:</span>
            <span className="text-blue-600 ml-1">${Math.min(...btcPrices).toLocaleString()}</span>
          </div>
        </div>
      </div>
      {/* Footer Spacer */}
      <div className="h-16"></div>
    </>
  );
};
export default PriceApp;

// import React, { useEffect, useRef } from "react";
// import { LineChart } from "echarts/charts";
// import { GridComponent, TitleComponent, TooltipComponent } from "echarts/components";
// import * as echarts from "echarts/core";
// import { CanvasRenderer } from "echarts/renderers";

// // 注册 ECharts 组件
// echarts.use([LineChart, GridComponent, TooltipComponent, TitleComponent, CanvasRenderer]);

// // 定义返回值类型
// interface HashEffectiveRateItem {
//     date: string;
//     effectiveRate: number;
// }

// interface Props {
//     hashEffectiveRate: HashEffectiveRateItem[];
// }

// const WaveLineCard: React.FC<Props> = ({ hashEffectiveRate }) => {
//     const domRef = useRef<HTMLDivElement | null>(null);
//     const chartRef = useRef<echarts.EChartsType | null>(null);
//     const xAxisData = hashEffectiveRate.map((item: any) => item.date);
//     const yAxisData = hashEffectiveRate.map((item: any) => item.effectiveRate);

//     // 获取当前日期

//     useEffect(() => {
//         if (!domRef.current) return;
//         // console.log(dates, hashValues)

//         const chart = echarts.init(domRef.current);
//         chartRef.current = chart;

//         const option = {
//             title: { text: "", left: "center", top: 6, textStyle: { fontSize: 14, fontWeight: 600 } },
//             grid: { left: 12, right: 12, top: 10, bottom: 16, containLabel: true },
//             tooltip: {
//                 trigger: "axis",
//                 axisPointer: { type: "line" },
//                 formatter: (params: any) => {
//                     // params 是数组，因为 trigger: "axis"
//                     return params
//                         .map((item: any) => `${item.name || ""}<br>${item.marker}算力有效率：${item.value.toFixed(2)}%`)
//                         .join("<br/>");
//                 },
//             },
//             xAxis: {
//                 type: "category",
//                 boundaryGap: false,
//                 axisTick: { show: false },
//                 axisLine: { show: false },
//                 axisLabel: {
//                     show: true,
//                     formatter: (value: string) => {
//                         // 假设 value = "2025-08-23"
//                         const d = new Date(value);
//                         if (!isNaN(d.getTime())) {
//                             const month = d.getMonth() + 1;
//                             const day = d.getDate();
//                             return `${month}-${day}`;
//                         }
//                         // 如果不是标准日期字符串，比如 "2025/08/23"
//                         const parts = value.split(/[-/]/);
//                         if (parts.length >= 3) {
//                             return `${parts[1]}-${parts[2]}`;
//                         }
//                         return value;
//                     },
//                 },
//                 data: xAxisData,
//                 // data: Array.from({ length: 256 }, (_, i) => i)
//             },
//             yAxis: {
//                 type: "value",
//                 // min: 0,
//                 // max: 100,
//                 splitNumber: 4,
//                 axisLine: { show: false },
//                 axisTick: { show: false },
//                 axisLabel: { formatter: "{value}" },
//                 splitLine: { lineStyle: { type: "dashed" } },
//             },
//             series: [
//                 {
//                     type: "line",
//                     smooth: true,
//                     // symbol: 'none',
//                     data: yAxisData,
//                     // data: makeWave(0),
//                     lineStyle: { width: 2, color: "#2563eb" }, // #2563eb
//                     // areaStyle: { opacity: 0.35 }
//                     areaStyle: {
//                         color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
//                             { offset: 0, color: "rgba(37, 99, 235, 0.2)" },
//                             { offset: 1, color: "rgba(37, 99, 235, 0)" },
//                         ]),
//                     },
//                 },
//             ],
//         };

//         chart.setOption(option);

//         // 自适应：优先使用 ResizeObserver，其次监听窗口
//         const observer = new ResizeObserver(() => {
//             chartRef.current?.resize();
//         });
//         observer.observe(domRef.current);

//         return () => {
//             observer.disconnect();
//             chartRef.current?.dispose();
//             chartRef.current = null;
//         };
//     }, [xAxisData, yAxisData]);

//     return (
//         <>
//             <div className="flex justify-between items-center mb-4">
//                 <h3 className="text-lg font-semibold">价格有效率</h3>
//                 {/* <Radio.Group
//                     value={chart.period}
//                     onChange={(e) => {
//                         const newCharts = [...charts];
//                         newCharts[index].period = e.target.value;
//                         setCharts(newCharts);
//                     }}
//                     size="small"
//                 >
//                     <Radio.Button value="day">日</Radio.Button>
//                     <Radio.Button value="month">月</Radio.Button>
//                 </Radio.Group> */}
//             </div>
//             <div ref={domRef} style={{ width: "100%", height: 255 }} />
//         </>
//     );
// };

// export default WaveLineCard;
