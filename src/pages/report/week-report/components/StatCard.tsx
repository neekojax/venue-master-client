import React from "react";
import {
  AlertTriangle,
  BatteryLow,
  Cloud,
  LogOut,
  ShieldCheck,
  Thermometer,
  TrendingUp,
  ZapOff,
} from "lucide-react";
import { formatPercent } from "@/utils/format.ts";

const StatCard: React.FC<{ statistics: any | null }> = ({ statistics }) => {
  // Clean Stat Item for Weekly Report Panel
  const StatItem = ({ label, value, icon: Icon, color, trend, goodTrend }: any) => {
    const colorStyles: any = {
      emerald: "bg-emerald-50 text-emerald-600",
      rose: "bg-rose-50 text-rose-600",
      orange: "bg-orange-50 text-orange-600",
      amber: "bg-amber-50 text-amber-600",
      blue: "bg-blue-50 text-blue-600",
      slate: "bg-slate-100 text-slate-600",
      violet: "bg-violet-50 text-violet-600",
    };
    const theme = colorStyles[color] || colorStyles.slate;

    return (
      <div className="flex items-start gap-4">
        <div className={`w-12 h-12 rounded-2xl ${theme} flex items-center justify-center shrink-0 shadow-sm`}>
          <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-1">{label}</div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 leading-none">{value}</span>
            {trend && (
              <span className={`text-[10px] font-bold ${goodTrend ? "text-emerald-500" : "text-rose-500"}`}>
                {trend}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };
  // console.log("trend", trend);
  return (
    <div
      className="bg-white rounded-[6px] border border-slate-200 shadow-sm overflow-hidden"
      style={{ marginBottom: "16px" }}
    >
      <div className="p-6 lg:p-10 flex flex-col lg:flex-row gap-8 xl:gap-16">
        <div className="flex-1 flex flex-col justify-center items-center lg:items-start text-center lg:text-left min-w-[240px]">
          <div className="flex items-center gap-2 mb-3 text-slate-500 font-bold text-sm uppercase tracking-wider">
            <div className="p-1.5 bg-emerald-100 rounded-md">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <span>平均算力有效率</span>
          </div>
          <div className="relative inline-block">
            <span className="text-6xl xl:text-7xl font-black text-slate-900 tracking-tight leading-none">
              {Number(statistics?.TotalHashEffectiveRate ?? 0).toFixed(1)}
              <span className="text-3xl text-slate-400 ml-1 absolute top-2">%</span>
            </span>
          </div>
          <div className="mt-4 flex items-center gap-2 bg-emerald-50 border border-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-sm font-bold shadow-sm">
            <TrendingUp className="w-3.5 h-3.5" />
            {`${(statistics?.WeeklyHashEffectiveRateChange ?? 0) > 0 ? "+" : ""}${formatPercent(
              Math.abs(statistics?.WeeklyHashEffectiveRateChange ?? 0),
              1,
            )} 较上周`}
          </div>
          <p className="mt-4 text-xs text-slate-400 max-w-[200px] leading-relaxed">
            整体运行平稳，较上周效率提升显著，故障率控制在预期范围内。
          </p>
        </div>
        <div className="hidden lg:block w-px bg-slate-100 my-2"></div>
        <div className="flex-[2.5] grid grid-cols-2 md:grid-cols-3 gap-y-10 gap-x-8 xl:gap-x-12 content-center">
          <StatItem
            label="总故障率"
            value={formatPercent(statistics?.TotalFailureRate)}
            trend={
              statistics?.WeeklyFailureRateChange ? formatPercent(statistics?.WeeklyFailureRateChange) : ""
            }
            goodTrend={(statistics?.WeeklyFailureRateChange ?? 0) < 0}
            icon={AlertTriangle}
            color="rose"
          />
          <StatItem
            label="高温影响率"
            value={formatPercent(statistics?.TotalHighTemperatureImpactRate)}
            trend=""
            icon={Thermometer}
            color="orange"
          />
          <StatItem
            label="限电影响率"
            value={formatPercent(statistics?.TotalLimitImpactRate)}
            trend=""
            icon={ZapOff}
            color="amber"
          />
          <StatItem
            label="低功耗比例"
            value={formatPercent(statistics?.TotalLowPowerImpactRate)}
            trend=""
            icon={BatteryLow}
            color="blue"
          />
          <StatItem
            label="撤场比例"
            value={formatPercent(statistics?.TotalWithdrawImpactRate)}
            trend=""
            icon={LogOut}
            color="slate"
          />
          <StatItem
            label="云算力比例"
            value={formatPercent(statistics?.TotalCloudPowerRate)}
            trend=""
            icon={Cloud}
            color="violet"
          />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
