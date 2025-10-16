// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import ChartFee from "./components/chartFee";
import ChartPrice from "./components/chartPrice";

const App: React.FC = () => {
  const btcChartRef = useRef<HTMLDivElement>(null);
  const feeChartRef = useRef<HTMLDivElement>(null);
  // Generate mock data for the last 180 days
  const generateMockData = () => {
    const days = 180;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const months = [];
    const btcPrices = [];
    const feeRatios = [];
    let baseBtcPrice = 30000;
    let baseFeeRatio = 0.85;
    for (let i = 0; i < days; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      months.push(currentDate.toISOString().split("T")[0]); // YYYY-MM-DD format
      // Generate BTC price with some random fluctuation
      const btcChange = (Math.random() - 0.5) * 1000;
      baseBtcPrice = Math.max(1000, baseBtcPrice + btcChange);
      btcPrices.push(Math.round(baseBtcPrice));
      // Generate fee ratio with smaller fluctuations
      const feeChange = (Math.random() - 0.5) * 0.05;
      baseFeeRatio = Math.max(0.1, Math.min(2.0, baseFeeRatio + feeChange));
      feeRatios.push(parseFloat(baseFeeRatio.toFixed(2)));
    }
    return { months, btcPrices, feeRatios };
  };
  const { months, btcPrices, feeRatios } = generateMockData();
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
          axisLabel: {
            // Show only every 30th label to avoid clutter
            formatter: (value: string, index: number) => {
              if (index % 30 === 0) {
                return value;
              }
              return "";
            },
          },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: "${value}",
          },
        },
        dataZoom: [
          {
            type: "inside",
            start: 50,
            end: 100,
          },
          {
            type: "slider",
            start: 50,
            end: 100,
            bottom: 10,
          },
        ],
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
          left: "5%",
          right: "5%",
          bottom: "25%",
          containLabel: true,
        },
        animation: false,
      });
      return () => {
        btcChart.dispose();
      };
    }
  }, [months, btcPrices]);

  useEffect(() => {
    if (feeChartRef.current) {
      const feeChart = echarts.init(feeChartRef.current);
      feeChart.setOption({
        title: {
          text: "托管费比例趋势（%）",
          textStyle: {
            fontSize: 16,
            fontWeight: "bold",
            color: "#52c41a",
          },
          left: "center",
        },
        tooltip: {
          trigger: "axis",
          formatter: (params: any) => {
            const param = params[0];
            return `${param.name}<br/>${param.seriesName}: ${param.value}%`;
          },
        },
        xAxis: {
          type: "category",
          data: months,
          axisLabel: {
            // Show only every 30th label to avoid clutter
            formatter: (value: string, index: number) => {
              if (index % 30 === 0) {
                return value;
              }
              return "";
            },
          },
        },
        yAxis: {
          type: "value",
          axisLabel: {
            formatter: "{value}%",
          },
        },
        dataZoom: [
          {
            type: "inside",
            start: 50,
            end: 100,
          },
          {
            type: "slider",
            start: 50,
            end: 100,
            bottom: 10,
          },
        ],
        series: [
          {
            name: "托管费比例",
            data: feeRatios,
            type: "line",
            smooth: true,
            itemStyle: { color: "#52c41a" },
            areaStyle: { color: "rgba(82, 196, 26, 0.1)" },
            showSymbol: false, // Hide symbols for better performance with many data points
          },
        ],
        grid: {
          left: "5%",
          right: "5%",
          bottom: "25%",
          containLabel: true,
        },
        animation: false,
      });
      return () => {
        feeChart.dispose();
      };
    }
  }, [months, feeRatios]);
  return (
    <div className="min-h-screen" style={{ margin: "0 auto" }}>
      {/* Header Section */}
      <div className="text-center mb-12 mt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">BTC价格与托管费比例趋势分析</h1>
        <p className="text-gray-500">最近半年数据</p>
        {/* <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-2">场地名标签</span> */}
      </div>
      {/* Custody Fee Chart */}
      <ChartFee />
      {/* BTC Price Chart */}
      <ChartPrice />
      {/* Footer Spacer */}
      <div className="h-16"></div>
    </div>
  );
};
export default App;
