import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarOutlined, CloudOutlined, EnvironmentOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { Segmented, Select, Tag } from "antd";
import BasicDataChart from "./components/BasicDataChart";
import BusinessReport from "./components/Business";
import ChartFail from "./components/ChartFail";
import ChartHighTemperatureImpact from "./components/ChartHighTemperatureImpact";
import ChartLimitImpact from "./components/ChartLimitImpact";
import ChartSuanli from "./components/ChartSuanli";
import {
  mapWeeklyCurvePoints,
  mapWeeklyReportItemsToRows,
  normalizeWeeklyReportResponse,
  type VenueWeeklyReportResponse,
  type WeeklyChartPoint,
  type WeeklyReportRow,
} from "./components/weeklyMock";
import type { VenueStats } from "./types";
import { useSelector, useSettingsStore } from "@/stores";

import "./index.css";

import ChartFee from "@/pages/custody-statistics/statisticsDetail/components/chartFee";
import { getRecent10WeeksWeeklyReport, getVenueBasicInfo, getVenueDailyStat } from "@/pages/venue/api.tsx";
import { useVenueList } from "@/pages/venue/hook/hook";

interface SubAccount {
  pool_id: number;
  pool_name: string;
  pool_link: string;
  status: number;
}

interface VenueData {
  venue_name: string;
  address: string;
  sub_accounts: SubAccount[];
  humidity: number;
  temperature: number;
}
// import { Button, Table } from "antd";

const VenueDetail: React.FC = () => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const params = useParams<{ venueId: string }>();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VenueStats | null>(null);
  const venueId = params.venueId!;
  const navigate = useNavigate();
  const [basicInfo, setBasicInfo] = useState<VenueData | null>(null);
  const [curveMode, setCurveMode] = useState<"day" | "week">("day");
  const [weeklyReport, setWeeklyReport] = useState<VenueWeeklyReportResponse | null>(null);
  // 周报数据按需懒加载：进入页面不拉取，切到周视图时才请求
  const weeklyLoadedRef = useRef(false);

  // 获取场地列表数据
  const { data: venueListData } = useVenueList(poolType);

  // 获取数据
  const fetchData = async () => {
    try {
      const response = await getVenueBasicInfo(poolType, Number(venueId));
      // console.log(response)
      setBasicInfo(response.data);
      // 处理响应数据
    } catch (error) {
      // 处理错误
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 获取数据
  const fetchDailyStat = async () => {
    try {
      const response = await getVenueDailyStat(poolType, Number(venueId), formattedDate);
      if (response.data) {
        // console.log("response.data", response.data);
        setStats(response.data);
        // 不在这里直接调用 initChart，而是通过 useEffect 监听 stats 变化
      }
      // 处理响应数据
    } catch (error) {
      // 处理错误
      console.log("error", error);
    }
  };

  const fetchWeeklyStat = async () => {
    // 已加载则跳过，避免重复请求；失败时放开以便重试
    if (weeklyLoadedRef.current) return;
    weeklyLoadedRef.current = true;
    try {
      const response = await getRecent10WeeksWeeklyReport(poolType, Number(venueId));
      setWeeklyReport(normalizeWeeklyReportResponse(response.data));
    } catch (error) {
      console.log("weekly error", error);
      setWeeklyReport(null);
      weeklyLoadedRef.current = false;
    }
  };

  useEffect(() => {
    setLoading(true);
    // 切换场地时重置周报懒加载状态，清掉上一场地的陈旧数据
    weeklyLoadedRef.current = false;
    setWeeklyReport(null);
    fetchData();
    fetchDailyStat();
  }, [venueId]);

  // 切到「运行趋势分析」周维度时按需拉取周报数据
  useEffect(() => {
    if (curveMode === "week") {
      fetchWeeklyStat();
    }
  }, [curveMode]);

  const yesterday = new Date(Date.now() - 864e5);
  const formattedDate = yesterday.toISOString().split("T")[0];
  const weeklyEffectiveRateData: WeeklyChartPoint[] = weeklyReport
    ? mapWeeklyCurvePoints(weeklyReport.hashEffectiveRateCurve || [])
    : [];
  const weeklyFailureRateData: WeeklyChartPoint[] = weeklyReport
    ? mapWeeklyCurvePoints(
        weeklyReport.failureRateCurve || [],
        (weeklyReport.list || []).map((item) => item.averageFailureRate),
      )
    : [];
  const weeklyHighTemperatureData: WeeklyChartPoint[] = weeklyReport
    ? mapWeeklyCurvePoints(weeklyReport.highTemperatureImpactRateCurve || [])
    : [];
  const weeklyLimitImpactData: WeeklyChartPoint[] = weeklyReport
    ? mapWeeklyCurvePoints(weeklyReport.limitImpactRateCurve || [])
    : [];
  const weeklyRows: WeeklyReportRow[] = weeklyReport
    ? mapWeeklyReportItemsToRows(weeklyReport.list || [])
    : [];

  return (
    <div className=" mx-auto  min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-3 sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{basicInfo?.venue_name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="px-2 py-1 bg-gray-100 rounded-md">
                矿工号:{" "}
                {basicInfo?.sub_accounts?.map((item, index) => (
                  <span key={item.pool_id}>
                    <a href={item.pool_link} target="_blank" rel="noreferrer">
                      {item.pool_name}
                    </a>
                    {index !== basicInfo.sub_accounts.length - 1 && " "}
                  </span>
                ))}
              </span>
            </div>
          </div>
          <div>
            {localStorage.getItem("user_access_level") != "special" && (
              <Select
                placeholder="选择场地"
                style={{ width: 200 }}
                value={venueId}
                showSearch
                filterOption={(input, option) =>
                  String(option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                onChange={(value) => {
                  navigate(`/venue/detail/${value}`);
                }}
                options={
                  venueListData?.data?.map((venue: any) => ({
                    label: venue.venue_name,
                    value: venue.id.toString(),
                  })) || []
                }
              />
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <EnvironmentOutlined className="text-primary" />
              <span className="text-gray-600">{basicInfo?.address || "--"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-primary" />
              <span className="text-gray-600">{formattedDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CloudOutlined className="text-primary" />
              <span className="text-gray-600">当前温度: {basicInfo?.temperature + " ℃" || "--"}</span>
            </div>
            <div className="flex items-center gap-2">
              <ThunderboltOutlined className="text-primary" />
              <span className="text-gray-600">当前湿度: {basicInfo?.humidity + " %" || "--"}</span>
            </div>
          </div>
        </div>
      </header>
      {stats && <BasicDataChart stats={stats} loading={loading} />}
      {/* 图表区域 */}
      {localStorage.getItem("user_access_level") != "special" && <ChartFee />}

      <div className="venue-trend-header flex items-center justify-between mb-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="venue-trend-accent" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">运行趋势分析</h2>
            <p className="text-sm text-slate-500 mt-1">从日维度与周维度观察场地运行稳定性与影响因素</p>
          </div>
          {curveMode === "week" ? <Tag color="processing">周维度预览</Tag> : null}
        </div>
        <Segmented
          className="venue-trend-segmented"
          value={curveMode}
          onChange={(value) => setCurveMode(value as "day" | "week")}
          options={[
            { label: "日", value: "day" },
            { label: "周", value: "week" },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="venue-trend-card venue-trend-card-blue bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <ChartSuanli mode={curveMode} weeklyData={weeklyEffectiveRateData}></ChartSuanli>
        </div>

        <div className="venue-trend-card venue-trend-card-red bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <ChartFail mode={curveMode} weeklyData={weeklyFailureRateData}></ChartFail>
        </div>

        <div className="venue-trend-card venue-trend-card-orange bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <ChartHighTemperatureImpact
            mode={curveMode}
            weeklyData={weeklyHighTemperatureData}
          ></ChartHighTemperatureImpact>
        </div>

        <div className="venue-trend-card venue-trend-card-violet bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <ChartLimitImpact mode={curveMode} weeklyData={weeklyLimitImpactData}></ChartLimitImpact>
        </div>
      </div>

      {/* 数据表格 */}
      <BusinessReport
        venueName={basicInfo?.venue_name || ""}
        weeklyRows={weeklyRows}
        onRequireWeekly={fetchWeeklyStat}
      ></BusinessReport>
    </div>
  );
};

export default VenueDetail;
