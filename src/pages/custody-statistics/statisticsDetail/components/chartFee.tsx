// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { LineChartOutlined } from "@ant-design/icons";
import * as echarts from "echarts";

import { fetchCustodyFeeRatioHistory } from "@/pages/custody-statistics/api";

const FeeApp: React.FC<{ onVenueNameChange?: (name: string) => void }> = ({ onVenueNameChange }) => {
  // const btcChartRef = useRef<HTMLDivElement>(null);
  const feeChartRef = useRef<HTMLDivElement>(null);
  const [feeRatios, setFeeRatios] = useState<number[]>([]);
  const [powerConsumptions, setPowerConsumptions] = useState<number[]>([]);
  const [months, setMonths] = useState<string[]>([]);
  const nameSetRef = useRef(false);

  // 获取路由参数
  const { venueId } = useParams<{ venueId: string }>();
  const parsedVenueId = parseInt(venueId || "0", 10);
  const isInvalidVenueId = isNaN(parsedVenueId);

  const fetchFeeRatioHistory = useCallback(async () => {
    const res = await fetchCustodyFeeRatioHistory({ venueId: parsedVenueId });
    const payload: any = res;
    if (payload && (payload.code === 0 || payload.success === true) && payload.data) {
      const key = String(parsedVenueId);
      const arr = payload.data[key] || [];
      return arr;
    }
    return null;
  }, [parsedVenueId]);

  useEffect(() => {
    if (isInvalidVenueId) {
      setMonths([]);
      setFeeRatios([]);
      return;
    }
    fetchFeeRatioHistory().then((respData) => {
      if (respData) {
        const validItems = respData.filter((item: any) => {
          const ratio = Number(item.hosting_ratio);
          return (
            Number.isFinite(ratio) && ratio !== 0 && typeof item.date === "string" && item.date.trim() !== ""
          );
        });
        const monthsArr = validItems.map((item: any) => item.date);
        const ratiosArr = validItems.map((item: any) => Number(item.hosting_ratio));
        const powerConsumptionsArr = validItems.map((item: any) => Number(item.power_consumption));

        const venueNameFromData = validItems.find((item: any) => !!item.venue_name)?.venue_name;
        if (venueNameFromData && onVenueNameChange && !nameSetRef.current) {
          onVenueNameChange(venueNameFromData);
          nameSetRef.current = true;
        }

        setMonths(monthsArr);
        setFeeRatios(ratiosArr);
        setPowerConsumptions(powerConsumptionsArr);
      } else {
        setMonths([]);
        setFeeRatios([]);
        setPowerConsumptions([]);
      }
    });
  }, [fetchFeeRatioHistory, isInvalidVenueId, onVenueNameChange]);

  useEffect(() => {
    if (feeChartRef.current) {
      const feeChart = echarts.init(feeChartRef.current);
      const renderChart = () => {
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
          visualMap: {
            show: false,
            dimension: 1, // 取 y 值进行判断
            top: 50,
            right: 10,
            pieces: [
              {
                gt: 0,
                lte: 50,
                color: "#fff",
              },
              {
                gt: 50,
                lte: 90,
                color: "#52c41a",
              },
              {
                gt: 90,
                lte: 150,
                color: "#FD0100",
              },
            ],
            outOfRange: {
              color: "#999",
            },
          },
          tooltip: {
            trigger: "axis",
            formatter: (params: any) => {
              const param = params[0];
              const param1 = params[1];
              return `${param.name}<br/>${param.seriesName}: ${param.value}%<br/>${param1.seriesName}: ${param1.value}`;
            },
          },
          xAxis: {
            type: "category",
            boundaryGap: false,
            data: months,
            axisLabel: {
              formatter: (value: string) => {
                const m = /^(\d{4})[-/](\d{2})[-/](\d{2})/.exec(value);
                if (m) return `${m[2]}-${m[3]}`;
                const d = new Date(value);
                if (!isNaN(d.getTime())) {
                  const mm = String(d.getMonth() + 1).padStart(2, "0");
                  const dd = String(d.getDate()).padStart(2, "0");
                  return `${mm}-${dd}`;
                }
                const parts = value.split(" ")[0].split("-");
                if (parts.length >= 3) return `${parts[1]}-${parts[2]}`;
                return value;
              },
            },
          },
          yAxis: [
            {
              type: "value",
              min: 50,
              axisLabel: {
                formatter: "{value}%",
              },
            },
            {
              type: "value",
              min: 0,
              show: false,
              axisLabel: {
                formatter: "{value} kW",
              },
            },
          ],

          // series: [
          //   {
          //     name: "托管费比例 ≤ 90",
          //     type: "line",
          //     smooth: true,
          //     showSymbol: false,
          //     data: feeRatios.map((v, i) => (v <= 90 ? v : null)), // 只显示 <= 90 的点
          //     lineStyle: {
          //       color: '#52c41a', // 绿色线
          //       width: 3,
          //     },
          //     areaStyle: {
          //       color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //         { offset: 0, color: 'rgba(82, 196, 26, 0.3)' },
          //         { offset: 1, color: 'rgba(82, 196, 26, 0)' },
          //       ]),
          //     },
          //   },
          //   {
          //     name: "托管费比例 > 90",
          //     type: "line",
          //     smooth: true,
          //     showSymbol: false,
          //     data: feeRatios.map((v, i) => (v > 90 ? v : null)), // 只显示 > 90 的点
          //     lineStyle: {
          //       color: '#ff4d4f', // 红色线
          //       width: 3,
          //     },
          //     areaStyle: {
          //       color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          //         { offset: 0, color: 'rgba(255, 77, 79, 0.3)' },
          //         { offset: 1, color: 'rgba(255, 77, 79, 0)' },
          //       ]),
          //     },
          //   },
          // ],

          series: [
            {
              name: "托管费比例",
              data: feeRatios,
              type: "line",
              smooth: true,
              yAxisIndex: 0,
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: "rgba(82, 196, 26, 0.3)" },
                  { offset: 1, color: "rgba(82, 196, 26, 0)" },
                ]),
              },
              showSymbol: false,
            },
            {
              name: "功耗",
              data: powerConsumptions,
              type: "line",
              smooth: true,
              show: false,
              lineStyle: {
                color: "#52c41a", // 绿色线
                width: 0,
              },
              yAxisIndex: 1,
              // areaStyle: {
              //   color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              //     { offset: 0, color: 'rgba(255, 77, 79, 0.3)' },
              //     { offset: 1, color: 'rgba(255, 77, 79, 0)' },
              //   ]),
              // },
              showSymbol: false,
            },
          ],
          grid: {
            left: "5%",
            right: "5%",
            bottom: "10%",
            containLabel: true,
          },
          animation: false,
        });
      };
      renderChart();
      // 👇 添加监听窗口尺寸变化事件，图表自适应
      const handleResize = () => {
        feeChart.resize();
      };
      window.addEventListener("resize", handleResize);
      return () => {
        feeChart.dispose();
      };
    }
  }, [months, feeRatios]);
  return (
    <div style={{ marginBottom: 24 }}>
      {/* Custody Fee Chart */}
      <div className="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
        <div className="flex items-center mb-4">
          <LineChartOutlined className="text-green-500 text-xl mr-2" />
          <h2 className="text-lg font-semibold text-gray-700">托管费比例变化</h2>
        </div>
        <div ref={feeChartRef} className="w-full h-80"></div>
        <div className="mt-4 flex flex-wrap gap-2">
          <div className="bg-green-50 rounded-lg px-4 py-2">
            <span className="text-green-800 font-medium">最高费率:</span>
            <span className="text-green-600 ml-1">{Math.max(...feeRatios)}%</span>
          </div>
          <div className="bg-green-50 rounded-lg px-4 py-2">
            <span className="text-green-800 font-medium">最低费率:</span>
            <span className="text-green-600 ml-1">{Math.min(...feeRatios)}%</span>
          </div>
          <div className="bg-green-50 rounded-lg px-4 py-2">
            <span className="text-green-800 font-medium">最新费率:</span>
            <span className="text-green-600 ml-1">{feeRatios[feeRatios.length - 1]}%</span>
          </div>
        </div>
      </div>
      {/* Footer Spacer */}
    </div>
  );
};
export default FeeApp;
