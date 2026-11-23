// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useEffect, useRef, useState } from "react";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, DatePicker, message, Spin, Tabs } from "antd";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import ImpactCard from "./components/ImpactCard";
import StatCard from "./components/StatCard";
import type { WeeklyReportSnapshot } from "./components/types";
import VenueTable from "./components/venueTable";
import { useSelector, useSettingsStore } from "@/stores";

// import { formatPercent, getIconColor, getNumberColor } from "@/utils/format.ts";
import "./report.css";

import { t } from "@/locales";
import { fetchWeeklyReport } from "@/pages/report/api.tsx";
import ChartFail from "@/pages/report/week-report/components/ChartFail";
import ChartSuanli from "@/pages/report/week-report/components/ChartSuanli";
// 扩展 weekOfYear 插件
dayjs.extend(weekOfYear);
dayjs.locale("zh-cn");

const { WeekPicker } = DatePicker;

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

  // state 存储接口返回的数组
  const [top5EffectiveRate, setTop5EffectiveRate] = useState<Top5Rate[]>([]);
  const [top5HighTempImpactRate, setTop5HighTempImpactRate] = useState<Top5Rate[]>([]);
  const [top5LimitImpactRate, setTop5LimitImpactRate] = useState<Top5Rate[]>([]);
  // const [top5FailureRate, setTop5FailureRate] = useState<Top5Rate[]>([]);
  // const [top5PendingRepairRate, setTop5PendingRepairRate] = useState<Top5Rate[]>([]);
  const [top5EffectiveRateDiff, setTop5EffectiveRateDiff] = useState<Top5Rate[]>([]);
  const [top5FailureRateDiff, setTop5FailureRateDiff] = useState<Top5Rate[]>([]);
  const [top5PendingRepairRateDiff, setTop5PendingRepairRateDiff] = useState<Top5Rate[]>([]);

  const [report, setReport] = useState<WeeklyReportSnapshot>();
  const [downloading, setDownloading] = useState(false);
  const latestRequest = useRef(0);
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
  const start =
    filterMode === "rolling" ? dayjs(selectedDate).subtract(6, "day") : selectedWeek.startOf("week");
  const startDate = start.isValid() ? start.format("YYYY-MM-DD") : "";
  const endDate = start.isValid() ? start.add(6, "day").format("YYYY-MM-DD") : "";
  const currentReport =
    report && report.poolType === poolType && report.startDate === startDate && report.endDate === endDate
      ? report
      : undefined;
  const canDownload =
    currentReport !== undefined &&
    (currentReport.summary != null ||
      currentReport.sites.length > 0 ||
      currentReport.hashEffectiveRates.length > 0 ||
      currentReport.failureRates.length > 0);

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
        <span className="text-blue-500 font-semibold">{t("第{{week}}周", { week: week })}</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-500">
          {t("{{year}}年{{month}}月第{{monthWeek}}周", { year: year, month: month, monthWeek: monthWeek })}
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
    const request = ++latestRequest.current;
    setLoading(true);
    try {
      const reportData = await fetchWeeklyReport(poolType, startDate, endDate);
      if (request !== latestRequest.current) return;
      // console.log(reportData);
      if (reportData && reportData.data) {
        setTop5EffectiveRate(reportData.data.top_5_effective_rate);
        setTop5HighTempImpactRate(reportData.data.top_5_high_temp_impact_rate);
        setTop5LimitImpactRate(reportData.data.top_5_limit_impact_rate);

        // setTop5FailureRate(reportData.data.top_5_failure_rate);
        // setTop5PendingRepairRate(reportData.data.top_5_pending_repair_rate);
        setTop5EffectiveRateDiff(reportData.data.top_5_effective_rate_diff || []);
        setTop5FailureRateDiff(reportData.data.top_5_failure_rate_diff || []);
        setTop5PendingRepairRateDiff(reportData.data.top_5_pending_repair_rate_diff || []);
        setReport({
          poolType,
          startDate,
          endDate,
          sites: reportData.data.detail ?? [],
          summary: reportData.data.summary,
          hashEffectiveRates: reportData.data.hash_effective_rate ?? [],
          failureRates: reportData.data.failure_rate ?? [],
        });
      } else {
        setReport(undefined);
      }
    } catch {
      if (request !== latestRequest.current) return;
      setReport(undefined);
      message.error(t("周报加载失败"));
    } finally {
      if (request === latestRequest.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (startDate != "" && endDate != "") {
      fetchReportData();
    } else {
      setLoading(false);
    }
    return () => {
      latestRequest.current += 1;
    };
  }, [startDate, endDate, poolType]);

  const handleReload = () => {
    fetchReportData();
  };
  const handleDownload = async () => {
    if (downloading || loading || !canDownload) return;
    setDownloading(true);
    try {
      const { downloadWeeklyReport } = await import("./export");
      await downloadWeeklyReport(currentReport);
    } catch {
      message.error(t("下载失败，请稍后重试"));
    } finally {
      setDownloading(false);
    }
  };
  const labelDate = filterMode === "rolling" ? dayjs(selectedDate) : selectedWeek;
  return (
    // <div className="min-h-[1024px] mx-auto max-w-[1440px] p-6 bg-[#FAFBFC]">

    <div className="weekReport">
      <div className="flex justify-between items-center mb-0">
        <div>
          <h1 className="text-2xl font-bold mb-2">{t("矿池周报")}</h1>
          {filterMode === "rolling" ? renderRollingLabel(startDate, endDate) : renderLabel(labelDate)}
          <p className="text-gray-500">{t("全面监控和分析矿池算力表现")}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center w-[400px] rounded-xl p-1 border border-slate-700/50 shadow-inner">
            <button
              onClick={() => setFilterMode("rolling")}
              title={t("选择日期并回溯7天")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${filterMode === "rolling" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"}`}
            >
              <Clock size={14} /> {t("滚动回溯")}
            </button>
            <button
              onClick={() => setFilterMode("calendar")}
              title={t("按日历完整周次查看")}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${filterMode === "calendar" ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:text-slate-200 hover:bg-slate-700/30"}`}
            >
              <CalendarIcon size={14} /> {t("自然周")}
            </button>

            {filterMode && filterMode === "rolling" && (
              <div className="ml-2 pr-2 border-l border-slate-200 pl-3 flex items-center gap-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  {t("日期")}
                </span>
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
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  {t("日期")}
                </span>
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
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            loading={downloading}
            disabled={loading || !canDownload}
            onClick={handleDownload}
          >
            {t("下载周报")}
          </Button>
        </div>
      </div>

      <Spin spinning={loading} tip={t("加载中...")} size="large">
        <StatCard statistics={currentReport?.summary} />
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-[4px] border border-[#F0F2F5] shadow-sm">
            <ChartSuanli hashEffectiveRate={currentReport?.hashEffectiveRates ?? []} />
          </div>
          <div className="bg-white p-4 rounded-[4px] border border-[#F0F2F5] shadow-sm">
            <ChartFail failureRate={currentReport?.failureRates ?? []} />
          </div>
          <ImpactCard title={t("场地运行排名")} data={top5EffectiveRate} onReload={handleReload} />
        </div>
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* <div className="bg-white p-4 rounded-[4px] border border-[#F0F2F5] shadow-sm">
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
          </div> */}
          <div className="bg-white">
            <Tabs
              type="card"
              size="small"
              tabBarStyle={{ borderBottom: "none", paddingTop: "10px" }}
              defaultActiveKey="fail"
              items={[
                {
                  key: "effective_diff",
                  label: t("有效率变化Top 5"),
                  children: (
                    <ImpactCard
                      title=""
                      data={top5EffectiveRateDiff}
                      onReload={handleReload}
                      border="none"
                      diff
                    />
                  ),
                },
                {
                  key: "failure_diff",
                  label: t("故障率变化Top 5"),
                  children: (
                    <ImpactCard
                      title=""
                      data={top5FailureRateDiff}
                      onReload={handleReload}
                      border="none"
                      diff
                    />
                  ),
                },
                {
                  key: "pending_diff",
                  label: t("待修率变化Top 5"),
                  children: (
                    <ImpactCard
                      title=""
                      data={top5PendingRepairRateDiff}
                      onReload={handleReload}
                      border="none"
                      diff
                    />
                  ),
                },
              ]}
            />
          </div>
          <ImpactCard title={t("高温影响率排名")} data={top5HighTempImpactRate} onReload={handleReload} />
          <ImpactCard title={t("限电影响率排名")} data={top5LimitImpactRate} onReload={handleReload} />
        </div>

        <VenueTable
          data={currentReport?.sites ?? []}
          startDate={startDate}
          endDate={endDate}
          onRequestRefresh={fetchReportData}
        />
      </Spin>
    </div>
  );
};

export default App;
