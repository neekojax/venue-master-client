import React, { useEffect, useMemo, useState } from "react";
import { Spin } from "antd";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CloudRain,
  Download,
  LayoutList,
  PieChart,
  Server,
  Thermometer,
  Wifi,
  Zap,
} from "lucide-react";
import SimplePieChart from "./SimplePieChart";
import StackedBarChart from "./StackedBarChart";
import {
  CauseShareData,
  dailyEventImpact,
  EventImpactRecord,
  EventType,
  SiteData,
  StatisticsData,
} from "./types";
import { useSelector, useSettingsStore } from "@/stores"; // 根据实际路径调整
import { formatThousands } from "@/utils/format";

import { fetchEventImpactDaily } from "@/pages/venue/api";

const EVENT_CONFIG: Record<EventType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  limit: { label: "限电", color: "#f59e0b", bg: "bg-amber-50", icon: <Zap size={14} /> }, // Amber
  high_temperature: { label: "高温", color: "#ef4444", bg: "bg-red-50", icon: <Thermometer size={14} /> }, // Red
  power: { label: "电力", color: "#8b5cf6", bg: "bg-purple-50", icon: <AlertTriangle size={14} /> }, // Purple
  device_failure: { label: "设备故障", color: "#6b7280", bg: "bg-gray-50", icon: <Server size={14} /> }, // Gray
  network: { label: "网络", color: "#3b82f6", bg: "bg-blue-50", icon: <Wifi size={14} /> }, // Blue
  extreme_weather: {
    label: "极端天气",
    color: "#10b981",
    bg: "bg-emerald-50",
    icon: <CloudRain size={14} />,
  }, // Emerald
};

const EVENT_CONFIG_NAME = (type: string) => {
  if (type === "限电") {
    return <Zap size={14} className="bg-amber-50" />;
  }
  if (type === "高温") {
    return <Thermometer size={14} className="bg-red-50" />;
  }
  if (type === "电力") {
    return <AlertTriangle size={14} className="bg-yellow-50" />;
  }
  if (type === "设备故障") {
    return <Server size={14} className="bg-gray-50" />;
  }
  if (type === "网络") {
    return <Wifi size={14} className="bg-blue-50" />;
  }
  if (type === "极端天气") {
    return <CloudRain size={14} className="bg-emerald-50" />;
  }
  return type;
};

const EVENT_TYPES = Object.keys(EVENT_CONFIG) as EventType[];

// --- Analysis View (Original Content) ---

const AnalysisView: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<EventImpactRecord[]>([]);
  const [venues, setVenues] = useState<SiteData[]>([]);
  const [dailyData, setDailyData] = useState<dailyEventImpact[]>([]);
  const [statistics, setStatistics] = useState<StatisticsData>({} as StatisticsData);
  const [causeShare, setCauseShare] = useState<any[]>([]);
  const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily");

  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return yesterday.toISOString().slice(0, 10);
  });
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return today.toISOString().slice(0, 7);
  });
  const [selectedSite] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  // Fetch real daily impact data and replace current dataset
  useEffect(() => {
    setCurrentPage(1);
    setCauseShare([] as CauseShareData[]);
    setStatistics({} as StatisticsData);
    setDailyData([]);
    setData([]);
    const searchDate = viewMode === "daily" ? selectedDate : selectedMonth;
    setLoading(true);
    fetchEventImpactDaily(viewMode, poolType, searchDate)
      .then((res) => {
        // console.log("res >>", res);
        const { data: resp } = res as { data: any };
        const { venue_stats, statistics, cause_share, daily_stats } = resp || {};
        const causeShareData = cause_share.map((item: any) => ({
          type: item.type as EventType,
          value: item.share || 0,
        }));
        setVenues(venue_stats || []);
        setCauseShare(causeShareData);
        setDailyData(daily_stats || []);
        const normalized: EventImpactRecord[] = [];
        (venue_stats || []).forEach((s: any) => {
          const typeMap: Record<string, EventType> = {
            limit: "limit",
            high_temperature: "high_temperature",
            power: "power",
            device_failure: "device_failure",
            network: "network",
            extreme_weather: "extreme_weather",
          };

          Object.entries(typeMap).forEach(([key, eventType]) => {
            const rate = s[`${key}_rate`] || 0;
            const hashrate = s[`${key}_hashrate`] || 0;
            if (rate > 0 || hashrate > 0) {
              normalized.push({
                id: `${s.venue_id}-${eventType}`,
                date: searchDate,
                siteName: s.venue_name,
                eventType: eventType,
                lossHashrate: hashrate,
                lossPercent: rate,
                durationHours: 0,
              });
            } else {
              normalized.push({
                id: `${s.venue_id}-${eventType}`,
                date: searchDate,
                siteName: s.venue_name,
                eventType: eventType,
                lossHashrate: 0,
                lossPercent: 0,
                durationHours: 0,
              });
            }
          });
        });
        // console.log("normalized >>", normalized);

        setData(normalized);
        setStatistics(statistics || ({} as StatisticsData));
      })
      .catch((err) => {
        console.error("Fetch failed", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [viewMode, selectedDate, selectedMonth, poolType]);

  // --- Filtering & Aggregation Logic ---
  const filteredRecords = useMemo(() => {
    return data.filter((r) => {
      const matchSite = selectedSite === "all" || r.siteName === selectedSite;
      let matchDate = false;
      if (viewMode === "daily") {
        matchDate = r.date === selectedDate;
      } else {
        matchDate = r.date.startsWith(selectedMonth);
      }
      return matchSite && matchDate;
    });
  }, [data, selectedSite, viewMode, selectedDate, selectedMonth]);

  const pivotData = useMemo(() => {
    const sitesMap: Record<string, { values: Record<EventType, number>; totalLossHashrate: number }> = {};
    filteredRecords.forEach((r) => {
      if (!sitesMap[r.siteName]) {
        sitesMap[r.siteName] = {
          values: {
            limit: 0,
            high_temperature: 0,
            power: 0,
            device_failure: 0,
            network: 0,
            extreme_weather: 0,
          },
          totalLossHashrate: 0,
        };
      }
      sitesMap[r.siteName].values[r.eventType] += r.lossPercent;
      sitesMap[r.siteName].totalLossHashrate += r.lossHashrate;
    });

    return Object.entries(sitesMap).map(([siteName, data]) => ({
      siteName,
      values: data.values,
      totalLossHashrate: data.totalLossHashrate,
    }));
  }, [filteredRecords, selectedSite, viewMode]);

  const sortedPivotData = useMemo(() => {
    const d = [...pivotData];
    if (sortConfig) {
      d.sort((a, b) => {
        if (sortConfig.key === "siteName") {
          return sortConfig.direction === "asc"
            ? a.siteName.localeCompare(b.siteName)
            : b.siteName.localeCompare(a.siteName);
        } else if (sortConfig.key === "totalLossHashrate") {
          return sortConfig.direction === "asc"
            ? a.totalLossHashrate - b.totalLossHashrate
            : b.totalLossHashrate - a.totalLossHashrate;
        } else {
          const valA = a.values[sortConfig.key as EventType] || 0;
          const valB = b.values[sortConfig.key as EventType] || 0;
          return sortConfig.direction === "asc" ? valA - valB : valB - valA;
        }
      });
    }
    return d;
  }, [pivotData, sortConfig]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSite, viewMode, selectedDate, selectedMonth]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedPivotData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedPivotData, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedPivotData.length / itemsPerPage);

  const chartData: any = useMemo(() => {
    if (viewMode === "daily") {
      const filteredPivotData = pivotData
        .map((p) => {
          const allValuesAreZero = Object.values(p.values).every((val) => val === 0);
          if (allValuesAreZero) {
            return null;
          }
          return {
            label: p.siteName,
            values: { ...p.values },
          };
        })
        .filter(Boolean) as { label: string; values: Record<EventType, number> }[];

      // Sort by sum of all values descending
      filteredPivotData.sort((a, b) => {
        const sumA = Object.values(a.values).reduce((acc, v) => acc + (typeof v === "number" ? v : 0), 0);
        const sumB = Object.values(b.values).reduce((acc, v) => acc + (typeof v === "number" ? v : 0), 0);
        return sumB - sumA;
      });

      return filteredPivotData;
    } else {
      const dailyGroup: Record<string, Record<EventType, number>> = {};
      dailyData.forEach((r) => {
        const day = r.date.slice(5);
        if (!dailyGroup[day]) {
          dailyGroup[day] = {
            limit: 0,
            high_temperature: 0,
            power: 0,
            device_failure: 0,
            network: 0,
            extreme_weather: 0,
          };
        }
        dailyGroup[day] = {
          limit: r.limit_rate,
          high_temperature: r.high_temperature_rate,
          power: r.power_rate,
          device_failure: r.device_failure_rate,
          network: r.network_rate,
          extreme_weather: r.extreme_weather_rate,
        };
      });
      return Object.keys(dailyGroup)
        .sort()
        .map((day) => ({
          label: day,
          values: dailyGroup[day],
        }));
    }
  }, [viewMode, pivotData, filteredRecords, dailyData]);

  const handleSort = (key: string) => {
    let direction: "asc" | "desc" = "desc";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "desc") {
      direction = "asc";
    }
    setSortConfig({ key, direction });
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const getCellClass = (val: number) => {
    if (val <= 0) return "text-gray-300";
    // Style for > 1% impact: Pink bg, Red text
    if (val > 1) return "bg-red-100 text-red-900 font-bold";
    return "text-gray-900";
  };

  const renderSortIcon = (key: string) => {
    if (sortConfig?.key !== key) {
      return (
        <div className="flex flex-col opacity-20 ml-1">
          <ChevronUp size={10} />
          <ChevronDown size={10} />
        </div>
      );
    }
    return sortConfig.direction === "asc" ? (
      <div className="flex flex-col ml-1">
        <ChevronUp size={10} className="text-blue-600" />
        <ChevronDown size={10} className="opacity-20" />
      </div>
    ) : (
      <div className="flex flex-col ml-1">
        <ChevronUp size={10} className="opacity-20" />
        <ChevronDown size={10} className="text-blue-600" />
      </div>
    );
  };

  const handleExport = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("事件影响分析");

    const headers = [
      "场地名称",
      "限电影响算力 (T)",
      "限电影响算力 (%)",
      "高温影响算力 (T)",
      "高温影响算力 (%)",
      "电力影响算力 (T)",
      "电力影响占比 (%)",
      "设备故障影响算力 (T)",
      "设备故障影响占比 (%)",
      "网络影响算力 (T)",
      "网络影响占比 (%)",
      "极端天气影响算力 (T)",
      "极端天气影响占比 (%)",
    ];

    worksheet.addRow(headers);

    const data = venues.map((row) => ({
      venue_name: row.venue_name,
      limit_hashrate: row.limit_hashrate || 0,
      limit_rate: row.limit_rate.toFixed(2) + "%",
      high_temperature_hashrate: row?.high_temperature_hashrate || 0,
      high_temperature_rate: row.high_temperature_rate + "%",
      power_hashrate: row.power_hashrate || 0,
      power_rate: row.power_rate.toFixed(2) + "%",
      device_failure_hashrate: row.device_failure_hashrate || 0,
      device_failure_rate: row.device_failure_rate.toFixed(2) + "%",
      network_hashrate: row.network_hashrate || 0,
      network_rate: row.network_rate.toFixed(2) + "%",
      extreme_weather_hashrate: row.extreme_weather_hashrate || 0,
      extreme_weather_rate: row.extreme_weather_rate.toFixed(2) + "%",
    }));

    data.forEach((row, rIdx) => {
      const newRow = worksheet.addRow(Object.values(row));
      // Apply conditional styling for limit_rate column
      const limitRateColIndex = headers.indexOf("限电影响算力 (%)") + 1; // ExcelJS is 1-indexed
      if (limitRateColIndex > 0) {
        const originalLimitRate = venues[rIdx].limit_rate;
        if (originalLimitRate > 1) {
          const cell = newRow.getCell(limitRateColIndex);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFC7CE" }, // Light red background
          };
          cell.font = {
            bold: true,
          };
        }
      }
      const highTemperatureRateColIndex = headers.indexOf("高温影响算力 (%)") + 1; // ExcelJS is 1-indexed
      if (highTemperatureRateColIndex > 0) {
        const originalHighTemperatureRate = venues[rIdx].high_temperature_rate;
        if (originalHighTemperatureRate > 1) {
          const cell = newRow.getCell(highTemperatureRateColIndex);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFC7CE" }, // Light red background
          };
          cell.font = {
            bold: true,
          };
        }
      }
      const powerRateColIndex = headers.indexOf("电力影响占比 (%)") + 1; // ExcelJS is 1-indexed
      if (powerRateColIndex > 0) {
        const originalPowerRate = venues[rIdx].power_rate;
        if (originalPowerRate > 1) {
          const cell = newRow.getCell(powerRateColIndex);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFC7CE" }, // Light red background
          };
          cell.font = {
            bold: true,
          };
        }
      }
      const deviceFailureRateColIndex = headers.indexOf("设备故障影响占比 (%)") + 1; // ExcelJS is 1-indexed
      if (deviceFailureRateColIndex > 0) {
        const originalDeviceFailureRate = venues[rIdx].device_failure_rate;
        if (originalDeviceFailureRate > 1) {
          const cell = newRow.getCell(deviceFailureRateColIndex);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFC7CE" }, // Light red background
          };
          cell.font = {
            bold: true,
          };
        }
      }
      const networkRateColIndex = headers.indexOf("网络影响占比 (%)") + 1; // ExcelJS is 1-indexed
      if (networkRateColIndex > 0) {
        const originalNetworkRate = venues[rIdx].network_rate;
        if (originalNetworkRate > 1) {
          const cell = newRow.getCell(networkRateColIndex);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFC7CE" }, // Light red background
          };
          cell.font = {
            bold: true,
          };
        }
      }
      const extremeWeatherRateColIndex = headers.indexOf("极端天气影响占比 (%)") + 1; // ExcelJS is 1-indexed
      if (extremeWeatherRateColIndex > 0) {
        const originalExtremeWeatherRate = venues[rIdx].extreme_weather_rate;
        if (originalExtremeWeatherRate > 1) {
          const cell = newRow.getCell(extremeWeatherRateColIndex);
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFC7CE" }, // Light red background
          };
          cell.font = {
            bold: true,
          };
        }
      }
    });

    // Adjust column widths using getColumn to avoid undefined columns
    headers.forEach((header, i) => {
      const column = worksheet.getColumn(i + 1);
      let maxLength = header.length;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const cellValue = cell.value ? String(cell.value) : "";
        maxLength = Math.max(maxLength, cellValue.length);
      });
      column.width = Math.max(10, maxLength + 2); // Add padding and minimum width
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `事件影响_${viewMode}_${viewMode === "daily" ? selectedDate : selectedMonth}.xlsx`;
    saveAs(new Blob([buffer]), fileName);
  };

  return (
    <Spin spinning={loading} tip="加载中...">
      <div className="flex flex-col h-full bg-gray-50 overflow-hidden">
        {/* Header Controls for Analysis */}
        <div className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between shrink-0 z-20 gap-4 bg-white border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-gray-100 p-1 rounded-lg flex items-center text-sm font-medium">
              <button
                onClick={() => setViewMode("daily")}
                className={`px-3 py-1.5 rounded-md transition-all ${viewMode === "daily" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                日维度
              </button>
              <button
                onClick={() => setViewMode("monthly")}
                className={`px-3 py-1.5 rounded-md transition-all ${viewMode === "monthly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                月维度
              </button>
            </div>

            <div className="h-6 w-px bg-gray-300 mx-1 hidden md:block"></div>
            <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 py-1.5 shadow-sm hover:border-blue-400 transition-colors">
              <Calendar size={16} className="text-gray-400" />
              {viewMode === "daily" ? (
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer font-mono font-medium"
                />
              ) : (
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer font-mono font-medium"
                />
              )}
            </div>
          </div>

          <button
            onClick={handleExport}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Download size={16} />
            <span className="hidden sm:inline">导出表格</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-xs text-gray-500 font-medium uppercase mb-1">筛选范围总损失 (PH/s)</div>
              <div className="text-2xl font-bold text-gray-900 font-mono">
                {formatThousands(statistics.total_loss_hashrate)}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-xs text-gray-500 font-medium uppercase mb-1">主要影响类别</div>
              <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <>
                  <div className="p-1 rounded bg-gray-100">
                    {EVENT_CONFIG_NAME(statistics.main_impact_category)}
                  </div>
                  {statistics.main_impact_category}
                </>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-xs text-gray-500 font-medium uppercase mb-1">受影响场地数</div>
              <div className="text-2xl font-bold text-gray-900 font-mono">
                {statistics.affected_venue_count}
                {/* {pivotData.filter((p) => (Object.values(p.values) as number[]).some((v) => v > 0)).length} */}
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="text-xs text-gray-500 font-medium uppercase mb-1">记录条数</div>
              <div className="text-2xl font-bold text-gray-900 font-mono">
                {formatThousands(statistics.record_count)}
              </div>
            </div>
          </div>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[420px]">
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-500" />
                {viewMode === "daily" ? "各场地影响对比" : "月度趋势分析"}
              </h3>
              <div className="flex-1 min-h-0">
                <StackedBarChart data={chartData} mode={viewMode} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <PieChart size={16} className="text-purple-500" />
                损失原因占比
              </h3>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <SimplePieChart data={causeShare} />
              </div>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="py-4 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 p-1.5 rounded text-blue-600">
                  <LayoutList size={16} />
                </div>
                <h3 className="font-bold text-gray-800">各场地事件影响分布表</h3>
              </div>
              <div className="text-xs text-gray-400">单位: 影响比例 (%)</div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-[250px] overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleSort("siteName")}
                    >
                      <div className="flex items-center gap-1">
                        场地名称
                        {renderSortIcon("siteName")}
                      </div>
                    </th>

                    {EVENT_TYPES.map((type) => (
                      <th
                        key={type}
                        className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => handleSort(type)}
                      >
                        <div className="flex items-center justify-end gap-1">
                          {EVENT_CONFIG[type].label}
                          {renderSortIcon(type)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paginatedData.map((row) => (
                    <tr key={row.siteName} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 truncate border-r border-gray-100 bg-white sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        {row.siteName}
                      </td>
                      {/* <td className="px-4 py-4 text-sm text-right font-mono text-gray-700 border-r border-gray-100">
                      {row.totalLossHashrate.toFixed(2)}
                    </td> */}
                      {EVENT_TYPES.map((type) => {
                        const val = row.values[type];
                        return (
                          <td
                            key={type}
                            className={`px-4 py-4 text-sm text-right font-mono border-b border-gray-50 ${getCellClass(val)}`}
                          >
                            {val > 0 ? val.toFixed(2) : "0.00"}%
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {data.length === 0 && (
                    <tr>
                      <td colSpan={EVENT_TYPES.length + 2} className="px-6 py-10 text-center text-gray-500">
                        暂无数据
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {sortedPivotData.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
                <div className="text-sm text-gray-500">
                  显示{" "}
                  <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span> 到{" "}
                  <span className="font-medium text-gray-900">
                    {Math.min(currentPage * itemsPerPage, sortedPivotData.length)}
                  </span>{" "}
                  条，共 <span className="font-medium text-gray-900">{sortedPivotData.length}</span> 条
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">每页:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 p-1 pr-6 cursor-pointer shadow-sm outline-none"
                    >
                      <option value={5}>5 条</option>
                      <option value={10}>10 条</option>
                      <option value={20}>20 条</option>
                    </select>
                  </div>

                  <div className="flex rounded-md shadow-sm">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="relative inline-flex items-center border-t border-b border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 min-w-[3rem] justify-center">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || totalPages === 0}
                      className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Spin>
  );
};

export default AnalysisView;
