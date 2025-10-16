// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { LineChartOutlined } from "@ant-design/icons";
import * as echarts from "echarts";

import { fetchCustodyFeeRatioHistory } from "@/pages/custody-statistics/api";

const FeeApp: React.FC = () => {
  // const btcChartRef = useRef<HTMLDivElement>(null);
  const feeChartRef = useRef<HTMLDivElement>(null);
  const [feeRatios, setFeeRatios] = useState<number[]>([]);
  const [months, setMonths] = useState<string[]>([]);

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
        const monthsArr = respData.map((item: any) => item.date);
        const ratiosArr = respData.map((item: any) => Number(item.hosting_ratio));
        setMonths(monthsArr);
        setFeeRatios(ratiosArr);
      } else {
        setMonths([]);
        setFeeRatios([]);
      }
    });
  }, [fetchFeeRatioHistory, isInvalidVenueId]);

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
        yAxis: {
          type: "value",
          min: 50,
          // max: 2,
          // interval: 0.2,
          axisLabel: {
            formatter: "{value}%",
          },
        },
        series: [
          {
            name: "托管费比例",
            data: feeRatios,
            type: "line",
            smooth: true,
            itemStyle: { color: "#52c41a" },
            areaStyle: { color: "rgba(82, 196, 26, 0.1)" },
            showSymbol: false,
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
        feeChart.dispose();
      };
    }
  }, [months, feeRatios]);
  return (
    <>
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
      <div className="h-16"></div>
    </>
  );
};
export default FeeApp;
