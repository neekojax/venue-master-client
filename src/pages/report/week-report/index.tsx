// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useEffect, useState } from "react";
import { ReloadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Spin } from "antd";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import ImpactCard from "./components/ImpactCard";
import StatCard from "./components/StatCard";
import VenueTable from "./components/venueTable";
import { useSelector, useSettingsStore } from "@/stores";
import { formatPercent, getIconColor, getNumberColor } from "@/utils/format.ts";

import "./report.css";

import { fetchWeeklyReport } from "@/pages/report/api.tsx";
import ChartFail from "@/pages/report/week-report/components/ChartFail";
import ChartSuanli from "@/pages/report/week-report/components/ChartSuanli";
// 扩展 weekOfYear 插件
dayjs.extend(weekOfYear);

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
  const lastWeek = dayjs().subtract(1, "week").startOf("week");
  const [selectedWeek, setSelectedWeek] = useState<dayjs.Dayjs>(lastWeek);

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
  const stats = [
    {
      title: "总算力有效率",
      value: formatPercent(statistics?.TotalHashEffectiveRate),
      icon: "chart-line",
      iconColor: getIconColor("总算力有效率"),
      trend: (statistics?.WeeklyHashEffectiveRateChange ?? 0) > 0 ? "up" : "down",
      trendValue: formatPercent(statistics?.WeeklyHashEffectiveRateChange),
      trendText: "较上周",
      trendColor: getNumberColor(Math.abs(statistics?.WeeklyHashEffectiveRateChange ?? 0)),
    },
    {
      title: "总故障率",
      value: formatPercent(statistics?.TotalFailureRate),
      icon: "exclamation-triangle",
      iconColor: getIconColor("总故障率"),
      trend: (statistics?.WeeklyFailureRateChange ?? 0) > 0 ? "up" : "down",
      trendValue: formatPercent(statistics?.WeeklyFailureRateChange),
      trendText: "较上周",
      trendColor: getNumberColor(statistics?.WeeklyFailureRateChange ?? 0),
    },
    {
      title: "高温影响率",
      value: formatPercent(statistics?.TotalHighTemperatureImpactRate),
      icon: "temperature-high",
      iconColor: getIconColor("高温影响率"),
      trend: (statistics?.WeeklyHighTemperatureImpactRateChange ?? 0) > 0 ? "up" : "down",
      trendValue: formatPercent(Math.abs(statistics?.WeeklyHighTemperatureImpactRateChange ?? 0)),
      trendText: "较上周",
      trendColor: getNumberColor(statistics?.WeeklyHighTemperatureImpactRateChange ?? 0),
    },
    {
      title: "限电影响率",
      value: formatPercent(statistics?.TotalLimitImpactRate),
      icon: "bolt",
      iconColor: getIconColor("限电影响率"),
      trend: (statistics?.WeeklyLimitImpactRateChange ?? 0) > 0 ? "up" : "down",
      trendValue: formatPercent(Math.abs(statistics?.WeeklyLimitImpactRateChange ?? 0)),
      trendText: "较上周",
      trendColor: getNumberColor(statistics?.WeeklyLimitImpactRateChange ?? 0),
    },
  ];
  // 初始化开始和结束时间
  useEffect(() => {
    const startOfWeek = selectedWeek.startOf("week"); // 周日
    const endOfWeek = selectedWeek.endOf("week"); // 周六
    setStartDate(startOfWeek.format("YYYY-MM-DD"));
    setEndDate(endOfWeek.format("YYYY-MM-DD"));
    // renderLabel(selectedWeek);
    onWeekChange(selectedWeek);
    renderLabel(selectedWeek);
  }, [selectedWeek]);

  // 禁止选择未结束的周（本周及未来）
  // 禁止选择本周及未来的周（未结束的周）
  const disabledDate = (current: dayjs.Dayjs) => {
    const endOfCurrentWeek = current.endOf("week"); // 周六 23:59:59
    return endOfCurrentWeek.isAfter(dayjs()); // 如果周六还没到，则禁用
  };
  const renderLabel = (date: dayjs.Dayjs | null) => {
    if (!date) return null;

    const year = date.year(); // 年份
    const month = date.month() + 1; // 月份 1-12
    const week = date.week(); // ISO 周数（全年第几周）

    // 计算月份第几周
    const firstDayOfMonth = date.startOf("month"); // 本月第一天
    const monthWeek = date.week() - firstDayOfMonth.week() + 1;

    const sunday = date.startOf("week"); // 本周周日
    const saturday = sunday.add(6, "day"); // 本周周六

    return (
      <div className="flex items-center gap-2">
        <span className="text-blue-500 font-semibold">第{week}周</span>
        <span className="text-gray-400">|</span>
        <span className="text-gray-500">
          {year}年{month}月第{monthWeek}周
        </span>
        <span className="text-gray-500">
          {sunday.format("YYYY-MM-DD")}~~{saturday.format("YYYY-MM-DD")}
        </span>
      </div>
    );
  };

  const onWeekChange = (date: dayjs.Dayjs | null) => {
    if (date) setSelectedWeek(date);
  };
  const fetchReportData = async () => {
    setLoading(true);
    try {
      const reportData = await fetchWeeklyReport(poolType, startDate, endDate);
      console.log(reportData);
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

  useEffect(() => {
    onWeekChange(lastWeek); // ✅ 初始化时触发
  }, []);

  const handleReload = () => {
    fetchReportData();
  };
  return (
    // <div className="min-h-[1024px] mx-auto max-w-[1440px] p-6 bg-[#FAFBFC]">

    <div style={{ color: "#000" }}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">矿池周报</h1>
          {renderLabel(selectedWeek)}
          <p className="text-gray-500">全面监控和分析矿池算力表现</p>
        </div>
        <div className="flex items-center gap-4">
          <WeekPicker
            value={selectedWeek}
            onChange={onWeekChange}
            format="YYYY-wo"
            disabledDate={disabledDate}
          />
          <Button
            onClick={handleReload}
            type="primary"
            icon={<ReloadOutlined />}
            className="!rounded-button whitespace-nowrap"
          >
            刷新
          </Button>
        </div>
      </div>
      <Spin spinning={loading} tip="加载中..." size="large">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => (
            <StatCard key={i} {...s} />
          ))}
        </div>
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

        <VenueTable data={data} />
      </Spin>
    </div>
  );
};
export default App;
