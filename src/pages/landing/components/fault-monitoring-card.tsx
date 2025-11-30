import React, { useEffect, useRef } from "react";
import * as echarts from "echarts";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { ReactEcharts } from "@/components/react-echarts";

const FaultMonitoringCard = () => {
  // Mock data for 7 days
  const generateFaultData = () => {
    const data = [];
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const faultNum = Math.floor(Math.random() * 6) + 2;

      data.push({
        date: date.toISOString().split("T")[0].slice(5), // MM-DD
        faultNum: faultNum,
      });
    }
    return data;
  };

  const data = generateFaultData();

  const getOption = () => {
    const dates = data.map((item) => item.date);
    const faults = data.map((item) => item.faultNum);

    return {
      grid: {
        top: 20,
        left: 0,
        right: 0,
        bottom: 0,
        containLabel: false,
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false }, // Recharts example didn't show x-axis labels in the chart area
      },
      yAxis: {
        type: "value",
        splitLine: { show: false },
        axisLabel: { show: false },
      },
      series: [
        {
          data: faults.map((val) => ({
            value: val,
            itemStyle: {
              color: val > 5 ? "#ef4444" : "#cbd5e1",
              borderRadius: [4, 4, 4, 4],
            },
            label: {
              show: true,
              position: "top",
              color: "#64748b",
              fontSize: 11,
              fontWeight: 600,
            },
          })),
          type: "bar",
          barWidth: 24,
          animationDuration: 1000,
        },
      ],
    };
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-red-50 rounded-xl ring-1 ring-red-100/50">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">故障监控</h2>
            <p className="text-xs text-slate-400">系统健康与警报</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col h-full">
        {/* Stats */}
        <div className="flex gap-4 mb-6">
          <div className="flex-1 bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-slate-500">
              <AlertCircle size={14} />
              <span className="text-xs font-semibold uppercase">今日总故障数</span>
            </div>
            <div className="text-3xl font-bold text-slate-900">12</div>
          </div>

          <div className="flex-1 bg-red-50/50 rounded-2xl p-4 border border-red-100 flex flex-col justify-between hover:border-red-200 transition-colors">
            <div className="flex items-center gap-2 mb-2 text-red-600">
              <AlertTriangle size={14} />
              <span className="text-xs font-semibold uppercase">今日新增故障数</span>
            </div>
            <div className="text-3xl font-bold text-red-600">3</div>
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 min-h-[120px] flex flex-col justify-end">
          <div className="text-xs text-slate-400 mb-2 text-right">最近7日故障曲线</div>
          <div className="w-full h-full min-h-[100px]">
            <ReactEcharts option={getOption()} style={{ height: "100%", width: "100%" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaultMonitoringCard;
