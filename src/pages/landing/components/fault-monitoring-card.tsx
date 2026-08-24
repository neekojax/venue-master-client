import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { ReactEcharts } from "@/components/react-echarts";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchFailureStatistics } from "@/pages/landing/api.ts";

interface FailureData {
  total_failure_last_7_days: number;
  yesterday_new_failure: number;
  failure_rate: number;
  new_failure_rate: number;
  date_range: {
    date: string;
    failure: number;
  }[];
}

const FaultMonitoringCard = () => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [data, setData] = useState<FailureData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const beijingHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Shanghai",
      hour: "2-digit",
      hour12: false,
    })
      .formatToParts(new Date())
      .find((part) => part.type === "hour")?.value ?? "0",
  );
  const showUpdatingBadge = beijingHour < 17;

  const fetchData = async () => {
    try {
      const result = await fetchFailureStatistics(poolType);
      setData(result.data);
    } catch (error) {
      console.error("Failed to fetch failure stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [poolType]);

  const getOption = () => {
    if (!data?.date_range) return {};

    // Sort by date from oldest to newest
    const sortedData = [...data.date_range].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );

    const dates = sortedData.map((item) => item.date.slice(5)); // MM-DD
    const faults = sortedData.map((item) => item.failure);

    return {
      grid: {
        top: 20,
        left: 0,
        right: 0,
        bottom: 26,
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          show: true,
          color: "#94a3b8",
          fontSize: 11,
          margin: 12,
          formatter: (value: string) => value,
        },
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
              color: val > 5 ? "#ef4444" : "#ef4444", // Keep consistent red for faults
              borderRadius: [4, 4, 4, 4],
              opacity: val === 0 ? 0.3 : 1,
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

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
            <div className="w-24 h-6 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="flex gap-4 mb-6">
          <div className="flex-1 h-24 bg-slate-100 rounded-2xl"></div>
          <div className="flex-1 h-24 bg-slate-100 rounded-2xl"></div>
        </div>
        <div className="flex-1 bg-slate-100 rounded-xl"></div>
      </div>
    );
  }

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
            <div className="flex items-center justify-between gap-2 mb-2 text-slate-500">
              <div className="flex items-center gap-2">
                <AlertCircle size={14} />
                <span className="text-xs font-semibold uppercase">昨日总故障数</span>
              </div>
              {showUpdatingBadge ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-500">
                  <RefreshCw size={11} className="animate-spin" />
                  更新中
                </span>
              ) : null}
            </div>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold text-slate-900">{data?.total_failure_last_7_days ?? 0}</div>
              <div className="text-xs font-medium text-slate-500 mb-1">{data?.failure_rate ?? 0}%</div>
            </div>
          </div>

          <div className="flex-1 bg-red-50/50 rounded-2xl p-4 border border-red-100 flex flex-col justify-between hover:border-red-200 transition-colors">
            <div className="flex items-center justify-between gap-2 mb-2 text-red-600">
              <div className="flex items-center gap-2">
                <AlertTriangle size={14} />
                <span className="text-xs font-semibold uppercase">昨日新增故障数</span>
              </div>
              {showUpdatingBadge ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-500">
                  <RefreshCw size={11} className="animate-spin" />
                  更新中
                </span>
              ) : null}
            </div>
            <div className="flex justify-between items-end">
              <div className="text-3xl font-bold text-red-600">{data?.yesterday_new_failure ?? 0}</div>
              <div className="text-xs font-medium text-red-500 mb-1">{data?.new_failure_rate ?? 0}%</div>
            </div>
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
