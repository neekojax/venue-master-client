// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useEffect, useState } from "react";
import { DatePicker, Spin } from "antd";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import ImpactCard from "./components/ImpactCard";
import StatCard from "./components/StatCard";
import VenueTable from "./components/venueTable";
import { useSelector, useSettingsStore } from "@/stores";

// import { formatPercent, getIconColor, getNumberColor } from "@/utils/format.ts";
import "./report.css";

import { fetchWeeklyReport } from "@/pages/report/api.tsx";
import ChartFail from "@/pages/report/week-report/components/ChartFail";
import ChartSuanli from "@/pages/report/week-report/components/ChartSuanli";
// 扩展 weekOfYear 插件
dayjs.extend(weekOfYear);
dayjs.locale("zh-cn");

const { WeekPicker } = DatePicker;

interface StatisticData {
  TotalHashEffectiveRate: number;
  TotalFailureRate: number;
  TotalHighTemperatureImpactRate: number;
  TotalLimitImpactRate: number;
  WeeklyFailureRateChange: number;
  WeeklyHashEffectiveRateChange: number;
  WeeklyHighTemperatureImpactRateChange: number;
  WeeklyLimitImpactRateChange: number;
}

interface HashEffectiveRateItem {
  date: string;
  effectiveRate: number;
}

interface FailureRate {
  date: string;
  failureRate: number;
}
interface Top5Rate {
  venue_name: string;
  rate: number;
}

const App: React.FC = () => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [loading, setLoading] = useState(true);
  // 默认选中上周
  // 默认上周
  // const lastWeek = dayjs().subtract(1, "week").startOf("week");;
  // const lastWeek = dayjs().subtract(1, "week").startOf("week");
  // const [selectedWeek, setSelectedWeek] = useState<dayjs.Dayjs>(lastWeek);
  // Date Filter State
  type FilterMode = "rolling" | "calendar";
  const [filterMode, setFilterMode] = useState<FilterMode>("calendar");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statistics, setStatistics] = useState<StatisticData | null>(null); // 初始化为对象
  // state 存储接口返回的数组
  const [hashEffectiveRate, setHashEffectiveRate] = useState<HashEffectiveRateItem[]>([]);
  const [failureRate, setFailureRate] = useState<FailureRate[]>([]);
  const [top5EffectiveRate, setTop5EffectiveRate] = useState<Top5Rate[]>([]);
  const [top5HighTempImpactRate, setTop5HighTempImpactRate] = useState<Top5Rate[]>([]);
  const [top5LimitImpactRate, setTop5LimitImpactRate] = useState<Top5Rate[]>([]);
  const [data, setData] = useState<any[]>([]); // 数据状态
  // const stats = [
  //   {
  //     title: "总算力有效率",
  //     value: formatPercent(statistics?.TotalHashEffectiveRate),
  //     icon: "chart-line",
  //     iconColor: getIconColor("总算力有效率"),
  //     trend: (statistics?.WeeklyHashEffectiveRateChange ?? 0) > 0 ? "up" : "down",
  //     trendValue: formatPercent(statistics?.WeeklyHashEffectiveRateChange),
  //     trendText: "较上周",
  //     trendColor: getNumberColor(Math.abs(statistics?.WeeklyHashEffectiveRateChange ?? 0)),
  //   },
  //   {
  //     title: "总故障率",
  //     value: formatPercent(statistics?.TotalFailureRate),
  //     icon: "exclamation-triangle",
  //     iconColor: getIconColor("总故障率"),
  //     trend: (statistics?.WeeklyFailureRateChange ?? 0) > 0 ? "up" : "down",
  //     trendValue: formatPercent(statistics?.WeeklyFailureRateChange),
  //     trendText: "较上周",
  //     trendColor: getNumberColor(statistics?.WeeklyFailureRateChange ?? 0),
  //   },
  //   {
  //     title: "高温影响率",
  //     value: formatPercent(statistics?.TotalHighTemperatureImpactRate),
  //     icon: "temperature-high",
  //     iconColor: getIconColor("高温影响率"),
  //     trend: (statistics?.WeeklyHighTemperatureImpactRateChange ?? 0) > 0 ? "up" : "down",
  //     trendValue: formatPercent(Math.abs(statistics?.WeeklyHighTemperatureImpactRateChange ?? 0)),
  //     trendText: "较上周",
  //     trendColor: getNumberColor(statistics?.WeeklyHighTemperatureImpactRateChange ?? 0),
  //   },
  //   {
  //     title: "限电影响率",
  //     value: formatPercent(statistics?.TotalLimitImpactRate),
  //     icon: "bolt",
  //     iconColor: getIconColor("限电影响率"),
  //     trend: (statistics?.WeeklyLimitImpactRateChange ?? 0) > 0 ? "up" : "down",
  //     trendValue: formatPercent(Math.abs(statistics?.WeeklyLimitImpactRateChange ?? 0)),
  //     trendText: "较上周",
  //     trendColor: getNumberColor(statistics?.WeeklyLimitImpactRateChange ?? 0),
  //   },
  // ];
  // 初始化开始和结束时间

  const lastWeek = dayjs().subtract(1, "week").startOf("week");
  const [selectedWeek, setSelectedWeek] = useState<dayjs.Dayjs>(lastWeek);
  useEffect(() => {
    if (filterMode !== "rolling") return;
    const end = dayjs(selectedDate);
    const start = end.subtract(6, "day");
    setStartDate(start.format("YYYY-MM-DD"));
    setEndDate(end.format("YYYY-MM-DD"));
  }, [filterMode, selectedDate]);

  useEffect(() => {
    if (filterMode !== "calendar") return;
    const monday = selectedWeek.startOf("week"); // 周一
    const sunday = monday.add(6, "day"); // 周日
    setStartDate(monday.format("YYYY-MM-DD"));
    setEndDate(sunday.format("YYYY-MM-DD"));
  }, [filterMode, selectedWeek]);

  // 禁止选择未结束的周（本周及未来）
  const disabledDate = (current: dayjs.Dayjs) => {
    const monday = current.startOf("week"); // 周一
    const sunday = monday.add(6, "day"); // 周日 23:59:59
    return sunday.isAfter(dayjs()); // 如果本周日还没到，则禁用
  };

  const renderLabel = (date: dayjs.Dayjs | null) => {
    if (!date) return null;

    const year = date.year();
    const month = date.month() + 1;
    const week = date.week();

    const firstDayOfMonth = date.startOf("month");
    const monthWeek = date.week() - firstDayOfMonth.week() + 1;

    const monday = date.startOf("week"); // 周一
    const sunday = monday.add(6, "day"); // 周日

    return (
      <div className="flex items-center gap-2">
        <span className="text-blue-500 font-semibold">第{week}周</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-500">
          {year}年{month}月第{monthWeek}周
        </span>
        <span className="text-gray-500">
          {monday.format("YYYY-MM-DD")}~~{sunday.format("YYYY-MM-DD")}
        </span>
      </div>
    );
  };

  const renderRollingLabel = (start: string, end: string) => {
    if (!start && !end) return null;
    return (
      <div className="flex items-center gap-2">
        <span className="text-gray-500">
          {start}~~{end}
        </span>
      </div>
    );
  };

  const onWeekChange = (date: dayjs.Dayjs | null) => {
    if (date) setSelectedWeek(date);
  };

  useEffect(() => {
    onWeekChange(lastWeek); // ✅ 初始化时触发
  }, []);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      const reportData = await fetchWeeklyReport(poolType, startDate, endDate);
      // console.log(reportData);
      if (reportData && reportData.data) {
        setStatistics(reportData.data.summary);
        setHashEffectiveRate(reportData.data.hash_effective_rate);
        setFailureRate(reportData.data.failure_rate);
        setTop5EffectiveRate(reportData.data.top_5_effective_rate);
        setTop5HighTempImpactRate(reportData.data.top_5_high_temp_impact_rate);
        setTop5LimitImpactRate(reportData.data.top_5_limit_impact_rate);
        setData(reportData.data.detail);
        setLoading(false);
      }
    } catch (error) {
      console.error("获取日报数据失败:", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (startDate != "" && endDate != "") {
      fetchReportData();
    }
  }, [startDate, endDate, poolType]);

  const handleReload = () => {
    fetchReportData();
  };
  const labelDate = filterMode === "rolling" ? dayjs(selectedDate) : selectedWeek;
  return (
    // <div className="min-h-[1024px] mx-auto max-w-[1440px] p-6 bg-[#FAFBFC]">

    <div className="weekReport">
      <div className="flex justify-between items-center mb-0">
        <div>
          <h1 className="text-2xl font-bold mb-2">矿池周报</h1>
          {filterMode === "rolling" ? renderRollingLabel(startDate, endDate) : renderLabel(labelDate)}
          <p className="text-gray-500">全面监控和分析矿池算力表现</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center w-[400px] rounded-xl p-1 border border-slate-700/50 shadow-inner">
            <button
              onClick={() => setFilterMode("rolling")}
              title="选择日期并回溯7天"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${filterMode === "rolling" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"}`}
            >
              <Clock size={14} /> 滚动回溯
            </button>
            <button
              onClick={() => setFilterMode("calendar")}
              title="按日历完整周次查看"
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${filterMode === "calendar" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"}`}
            >
              <CalendarIcon size={14} /> 自然周
            </button>

            {filterMode && filterMode === "rolling" && (
              <div className="ml-2 pr-2 border-l border-slate-200 pl-3 flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">日期</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className=" rounded px-2 py-1 text-xs text-blue-400 outline-none cursor-pointer  border border-slate-200 hover:border-blue-500/50 transition-colors"
                />
              </div>
            )}
            {filterMode && filterMode === "calendar" && (
              <div className="ml-2 pr-2 border-l border-slate-200 pl-3 flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">日期</span>
                <WeekPicker
                  size="small"
                  value={selectedWeek}
                  onChange={onWeekChange}
                  format="YYYY-wo"
                  disabledDate={disabledDate}
                />
                {/* <Button
                  onClick={handleReload}
                  type="primary"
                  size="middle"
                  icon={<ReloadOutlined />}
                  className="!rounded-button whitespace-nowrap"
                >
                  刷新
                </Button> */}
              </div>
            )}
          </div>
        </div>
      </div>

      <Spin spinning={loading} tip="加载中..." size="large">
        <StatCard statistics={statistics} />
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-[4px] border border-[#F0F2F5] shadow-sm">
            <ChartSuanli hashEffectiveRate={hashEffectiveRate} />
          </div>
          <div className="bg-white p-4 rounded-[4px] border border-[#F0F2F5] shadow-sm">
            <ChartFail failureRate={failureRate} />
          </div>
          <ImpactCard title="场地运行排名" data={top5EffectiveRate} onReload={handleReload} />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-[4px] border border-[#F0F2F5] shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-bold">本周预警事件</h3>
              <span className="text-green-500">0 个未处理</span>
            </div>
            <div className="space-y-4">
              {[
                { type: "高温预警", count: 0, icon: "temperature-high", color: "orange" },
                { type: "算力异常", count: 0, icon: "exclamation-circle", color: "red" },
              ].map((alert) => (
                <div key={alert.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <i className={`fas fa-${alert.icon} text-${alert.color}-500 text-xl mr-3`}></i>
                    <span className="font-medium">{alert.type}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-semibold mr-2">{alert.count}</span>
                    <span className="text-gray-500">个</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <ImpactCard title="高温影响率排名" data={top5HighTempImpactRate} onReload={handleReload} />
          <ImpactCard title="限电影响率排名" data={top5LimitImpactRate} onReload={handleReload} />
        </div>

        <VenueTable data={data} startDate={startDate} endDate={endDate} onRequestRefresh={fetchReportData} />
      </Spin>
    </div>
  );
};
export default App;
