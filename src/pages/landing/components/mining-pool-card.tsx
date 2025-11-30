import React, { useEffect, useState } from "react";
import { Activity, Info, TrendingDown, TrendingUp } from "lucide-react";

import { fetchTotalLastHashStatus, fetchTotalRealTimeStatus } from "@/pages/mining/api.tsx";

interface MetricRowProps {
  label: string;
  value: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  highlight?: boolean;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, trend, trendValue, highlight }) => (
  <div className="flex justify-between items-center py-2.5 border-b border-slate-50 last:border-0">
    <span className="text-sm text-slate-500 font-medium">{label}</span>
    <div className="flex items-center gap-3">
      <span className={`text-sm font-bold ${highlight ? "text-slate-900" : "text-slate-700"}`}>{value}</span>
      {trend && (
        <span
          className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
            trend === "up"
              ? "bg-green-100 text-green-700"
              : trend === "down"
                ? "bg-red-100 text-red-700"
                : "bg-slate-100 text-slate-600"
          }`}
        >
          {trend === "up" ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {trendValue}
        </span>
      )}
    </div>
  </div>
);

interface MiningPoolCardProps {
  poolType: string;
}

const MiningPoolCard: React.FC<MiningPoolCardProps> = ({ poolType }) => {
  const [realTimeStatus, setRealTimeStatus] = useState<any>(null);
  const [lastHashStatus, setLastHashStatus] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchData = async (poolType: string) => {
    try {
      const realTimeStatusResult = await fetchTotalRealTimeStatus(poolType);
      setRealTimeStatus(realTimeStatusResult.data);

      const lastHashStatusResult = await fetchTotalLastHashStatus(poolType);
      setLastHashStatus(lastHashStatusResult.data);
    } catch (err) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(poolType);
  }, [poolType]);

  const getEfficiencyStatus = (efficiency: number) => {
    if (!efficiency && efficiency !== 0) return { text: "数据加载中", color: "text-slate-400" };
    if (efficiency >= 90) return { text: "运行状态良好", color: "text-green-600" };
    if (efficiency >= 80) return { text: "运行状态一般", color: "text-yellow-600" };
    return { text: "运行状态较差", color: "text-red-600" };
  };

  const efficiencyValue = Number(realTimeStatus?.realTimeHashEfficiency) || 0;
  const status = getEfficiencyStatus(efficiencyValue);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
            <div className="w-24 h-6 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-20 bg-slate-100 rounded-xl"></div>
          <div className="h-20 bg-slate-100 rounded-xl"></div>
        </div>
        <div className="h-24 bg-slate-100 rounded-xl mb-6"></div>
        <div className="space-y-4 flex-1">
          <div className="h-6 bg-slate-100 rounded w-full"></div>
          <div className="h-6 bg-slate-100 rounded w-full"></div>
          <div className="h-6 bg-slate-100 rounded w-full"></div>
          <div className="h-6 bg-slate-100 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl ring-1 ring-blue-100/50">
            <Activity size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">效率</h2>
          </div>
        </div>
        <button className="text-slate-400 hover:text-blue-600 transition-colors">
          <Info size={18} />
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors group">
          <div className="text-xs text-slate-500 mb-1.5 font-semibold uppercase tracking-wider group-hover:text-blue-600 transition-colors">
            实时总算力
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {realTimeStatus?.totalCurrentHashRate}{" "}
            <span className="text-sm font-normal text-slate-500">PH/s</span>
          </div>
        </div>
        <div className="bg-slate-50/80 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors group">
          <div className="text-xs text-slate-500 mb-1.5 font-semibold uppercase tracking-wider group-hover:text-blue-600 transition-colors">
            理论算力
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {realTimeStatus?.totalTheoreticalHashrate}{" "}
            <span className="text-sm font-normal text-slate-500">PH/s</span>
          </div>
        </div>
      </div>

      {/* Main Compliance Circle */}
      <div className="flex items-center gap-6 mb-6 bg-gradient-to-r from-blue-50 to-white p-4 rounded-2xl border border-blue-100">
        <div className="relative w-16 h-16 flex-shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-blue-100"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              className={`${efficiencyValue >= 90 ? "text-blue-600" : efficiencyValue >= 80 ? "text-yellow-500" : "text-red-500"} drop-shadow-sm transition-colors duration-300`}
              strokeDasharray={`${efficiencyValue}, 100`}
              strokeLinecap="round"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
          </svg>
          <div
            className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${efficiencyValue >= 90 ? "text-blue-700" : efficiencyValue >= 80 ? "text-yellow-600" : "text-red-600"}`}
          >
            {efficiencyValue}%
          </div>
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900">实时算力达成率</div>
          <div className={`text-xs mt-0.5 font-medium ${status.color}`}>{status.text}</div>
        </div>
      </div>

      {/* Detailed List */}
      <div className="flex-1 flex flex-col justify-center">
        <MetricRow
          label="昨天算力达成率"
          value={`${lastHashStatus?.last24HourEfficiency}%`}
          trend={lastHashStatus?.last24HourEfficiencyDiff > 0 ? "up" : "down"}
          trendValue={`${Math.abs(lastHashStatus?.last24HourEfficiencyDiff || 0).toFixed(2)}%`}
        />
        <MetricRow
          label="近一周平均算力达成率"
          value={`${lastHashStatus?.lastWeekEfficiency}%`}
          trend={lastHashStatus?.lastWeekEfficiencyDiff > 0 ? "up" : "down"}
          trendValue={`${Math.abs(lastHashStatus?.lastWeekEfficiencyDiff || 0).toFixed(2)}%`}
        />
        <MetricRow
          label={`${lastHashStatus?.lastMonth}月算力达成率`}
          value={`${lastHashStatus?.lastMonthEfficiency}%`}
          highlight
        />
        <MetricRow
          label={`${lastHashStatus?.last2Month}月算力达成率`}
          value={`${lastHashStatus?.last2MonthEfficiency}%`}
        />
      </div>
    </div>
  );
};

export default MiningPoolCard;
