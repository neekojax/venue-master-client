import React, { useEffect, useMemo, useRef, useState } from "react";
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
  Edit2,
  FileText,
  Filter,
  LayoutList,
  PieChart,
  Plus,
  Search,
  Server,
  Thermometer,
  Trash2,
  Upload,
  Wifi,
  Zap,
} from "lucide-react";
import { EventImpactRecord, EventType } from "./types";

// --- Constants & Config ---

const EVENT_CONFIG: Record<EventType, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  power_limit: { label: "限电", color: "#f59e0b", bg: "bg-amber-50", icon: <Zap size={14} /> }, // Amber
  high_temp: { label: "高温", color: "#ef4444", bg: "bg-red-50", icon: <Thermometer size={14} /> }, // Red
  power_outage: { label: "电力", color: "#8b5cf6", bg: "bg-purple-50", icon: <AlertTriangle size={14} /> }, // Purple
  device_failure: { label: "设备故障", color: "#6b7280", bg: "bg-gray-50", icon: <Server size={14} /> }, // Gray
  network: { label: "网络", color: "#3b82f6", bg: "bg-blue-50", icon: <Wifi size={14} /> }, // Blue
  extreme_weather: {
    label: "极端天气",
    color: "#10b981",
    bg: "bg-emerald-50",
    icon: <CloudRain size={14} />,
  }, // Emerald
};

const EVENT_TYPES = Object.keys(EVENT_CONFIG) as EventType[];

const MOCK_SITES = [
  "AllRise-HF01-SC-US",
  "Atlas-HF02-ND-US",
  "Bitmain-S19-Group-A",
  "Oman-Datacenter-01",
  "Ethiopia-Site-A",
  "Paraguay-Hydro-01",
  "Texas-Solar-Farm-02",
  "Kazakhstan-Grid-B",
  "Canada-Hydro-Quebec",
  "Sweden-Wind-Farm-01",
  "Norway-Hydro-04",
  "Iceland-Geo-01",
  "Dubai-Solar-Park",
  "Argentina-Hydro-02",
  "Bhutan-Hydro-01",
];

const MOCK_CAUSES = [
  "断路器跳闸",
  "电厂线路问题",
  "高温价保停机",
  "光纤挖断",
  "变压器过载",
  "例行停电检修",
  "暴风雨天气",
  "冷却系统故障",
];

// Generate Mock Data for 30 days
const generateMockEvents = (): EventImpactRecord[] => {
  const records: EventImpactRecord[] = [];
  const now = new Date();

  // Ensure we have data for "today" and recent days for all sites to make the table look populated
  for (let i = 0; i < 60; i++) {
    const date = new Date(now.getTime() - i * 86400000); // Past 60 days
    const dateStr = date.toISOString().split("T")[0];

    MOCK_SITES.forEach((site) => {
      // Randomly decide if an event happened
      if (Math.random() > 0.3) {
        const type = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)];
        // Generate some realistic small percentages, occasionally a large one
        const isMajor = Math.random() > 0.9;
        const lossPct = isMajor ? Math.random() * 5 + 3 : Math.random() * 2;

        records.push({
          id: `evt-${site}-${i}`,
          date: dateStr,
          siteName: site,
          eventType: type,
          lossHashrate: Math.floor(lossPct * 20), // Rough calc
          lossPercent: parseFloat(lossPct.toFixed(2)),
          durationHours: Math.floor(Math.random() * 24),
        });
      }
    });
  }
  return records;
};

// --- Charts Components ---

const StackedBarChart: React.FC<{
  data: { label: string; values: Record<EventType, number> }[];
  mode: "daily" | "monthly";
}> = ({ data, mode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltipData, setTooltipData] = useState<{
    x: number;
    y: number;
    label: string;
    type: EventType;
    value: number;
  } | null>(null);

  const height = 250;
  const width = 800;
  const paddingX = 40;
  const paddingY = 30;

  if (data.length === 0)
    return <div className="h-full flex items-center justify-center text-gray-400">暂无数据</div>;

  // Calculate Max Y for scale
  const totals = data.map((d) => (Object.values(d.values) as number[]).reduce((a, b) => a + b, 0));
  const maxTotal = Math.max(...totals) * 1.1 || 10;

  const barWidth = Math.min(((width - paddingX * 2) / data.length) * 0.6, 50);

  const getX = (index: number) =>
    paddingX +
    index * ((width - paddingX * 2) / data.length) +
    ((width - paddingX * 2) / data.length - barWidth) / 2;
  const getY = (val: number) => height - paddingY - (val / maxTotal) * (height - paddingY * 2);

  return (
    <div ref={containerRef} className="w-full h-full relative group">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        {/* Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => (
          <g key={i}>
            <line
              x1={paddingX}
              y1={getY(maxTotal * tick)}
              x2={width}
              y2={getY(maxTotal * tick)}
              stroke="#f3f4f6"
              strokeDasharray="4 4"
            />
            <text
              x={paddingX - 10}
              y={getY(maxTotal * tick) + 4}
              textAnchor="end"
              fontSize="10"
              fill="#9ca3af"
            >
              {(maxTotal * tick).toFixed(0)}
            </text>
          </g>
        ))}

        {data.map((item, i) => {
          let currentY = height - paddingY;
          return (
            <g key={i}>
              {Object.entries(item.values).map(([type, val]) => {
                const v = val as number;
                if (v <= 0) return null;
                const barH = (v / maxTotal) * (height - paddingY * 2);
                const y = currentY - barH;
                currentY = y;
                return (
                  <rect
                    key={type}
                    x={getX(i)}
                    y={y}
                    width={barWidth}
                    height={barH}
                    fill={EVENT_CONFIG[type as EventType].color}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                    onMouseMove={(e) => {
                      if (containerRef.current) {
                        const rect = containerRef.current.getBoundingClientRect();
                        setTooltipData({
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                          label: item.label,
                          type: type as EventType,
                          value: v,
                        });
                      }
                    }}
                    onMouseLeave={() => setTooltipData(null)}
                  />
                );
              })}
              <text
                x={getX(i) + barWidth / 2}
                y={height - 5}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
                className="select-none"
                transform={
                  mode === "daily" ? `rotate(-15, ${getX(i) + barWidth / 2}, ${height - 5})` : undefined
                }
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>

      {tooltipData && (
        <div
          className="absolute z-50 bg-gray-900/95 backdrop-blur-sm text-white text-xs rounded-lg shadow-xl p-3 pointer-events-none border border-white/10"
          style={{
            left: tooltipData.x,
            top: tooltipData.y,
            transform: "translate(-50%, -100%) translateY(-10px)", // Center horizontally above cursor
            minWidth: "150px",
          }}
        >
          <div className="font-bold text-gray-200 mb-1 border-b border-white/20 pb-1">
            {tooltipData.label}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: EVENT_CONFIG[tooltipData.type].color }}
              ></div>
              <span className="text-gray-300">{EVENT_CONFIG[tooltipData.type].label}</span>
            </div>
            <span className="font-mono font-bold">
              {tooltipData.value.toFixed(2)}
              {mode === "daily" ? "%" : " PH/s"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

const SimplePieChart: React.FC<{ data: { type: EventType; value: number }[] }> = ({ data }) => {
  const size = 160;
  const center = size / 2;
  const radius = size / 2 - 10;
  const total = data.reduce((acc, cur) => acc + cur.value, 0);

  if (total === 0) return <div className="h-full flex items-center justify-center text-gray-400">无数据</div>;

  let currentAngle = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, i) => {
          const angle = (item.value / total) * 360;
          const x1 = center + radius * Math.cos((Math.PI * currentAngle) / 180);
          const y1 = center + radius * Math.sin((Math.PI * currentAngle) / 180);
          const x2 = center + radius * Math.cos((Math.PI * (currentAngle + angle)) / 180);
          const y2 = center + radius * Math.sin((Math.PI * (currentAngle + angle)) / 180);

          const largeArc = angle > 180 ? 1 : 0;

          // Fix for single item (360 degrees)
          const d =
            data.length === 1
              ? `M ${center},${center - radius} A ${radius},${radius} 0 1,1 ${center},${center + radius} A ${radius},${radius} 0 1,1 ${center},${center - radius}`
              : `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

          currentAngle += angle;

          return (
            <path key={item.type} d={d} fill={EVENT_CONFIG[item.type].color} stroke="white" strokeWidth="2" />
          );
        })}
      </svg>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.type} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: EVENT_CONFIG[item.type].color }}
            ></div>
            <span className="text-gray-600 w-20">{EVENT_CONFIG[item.type].label}</span>
            <span className="font-mono font-medium">{((item.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Analysis View (Original Content) ---

const AnalysisView: React.FC = () => {
  const [data, setData] = useState<EventImpactRecord[]>(generateMockEvents());
  const [viewMode, setViewMode] = useState<"daily" | "monthly">("daily");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [selectedSite, setSelectedSite] = useState<string>("all");
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    // Record<SiteName, { values: Record<EventType, pct>, totalLossHashrate: number }>
    const sitesMap: Record<string, { values: Record<EventType, number>; totalLossHashrate: number }> = {};

    MOCK_SITES.forEach((site) => {
      if (selectedSite === "all" || selectedSite === site) {
        sitesMap[site] = {
          values: {
            power_limit: 0,
            high_temp: 0,
            power_outage: 0,
            device_failure: 0,
            network: 0,
            extreme_weather: 0,
          },
          totalLossHashrate: 0,
        };
      }
    });

    filteredRecords.forEach((r) => {
      if (sitesMap[r.siteName]) {
        sitesMap[r.siteName].values[r.eventType] += r.lossPercent;
        sitesMap[r.siteName].totalLossHashrate += r.lossHashrate;
      }
    });

    return Object.entries(sitesMap).map(([siteName, data]) => ({
      siteName,
      values: data.values,
      totalLossHashrate: data.totalLossHashrate,
    }));
  }, [filteredRecords, selectedSite]);

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

  const chartData = useMemo(() => {
    if (viewMode === "daily") {
      return pivotData.map((p) => ({
        label: p.siteName.split("-")[0],
        values: { ...p.values },
      }));
    } else {
      const dailyGroup: Record<string, Record<EventType, number>> = {};
      filteredRecords.forEach((r) => {
        const day = r.date.slice(5);
        if (!dailyGroup[day]) {
          dailyGroup[day] = {
            power_limit: 0,
            high_temp: 0,
            power_outage: 0,
            device_failure: 0,
            network: 0,
            extreme_weather: 0,
          };
        }
        dailyGroup[day][r.eventType] += r.lossHashrate;
      });
      return Object.keys(dailyGroup)
        .sort()
        .map((day) => ({
          label: day,
          values: dailyGroup[day],
        }));
    }
  }, [viewMode, pivotData, filteredRecords]);

  const pieData = useMemo(() => {
    const totalByEvent: Record<EventType, number> = {
      power_limit: 0,
      high_temp: 0,
      power_outage: 0,
      device_failure: 0,
      network: 0,
      extreme_weather: 0,
    };
    filteredRecords.forEach((r) => {
      totalByEvent[r.eventType] += r.lossHashrate;
    });
    return (Object.keys(totalByEvent) as EventType[])
      .map((key) => ({
        type: key,
        value: totalByEvent[key],
      }))
      .sort((a, b) => b.value - a.value);
  }, [filteredRecords]);

  const totalLoss = filteredRecords.reduce((acc, r) => acc + r.lossHashrate, 0);

  const handleExport = () => {
    const headers = ["场地名称", "影响算力 (T)", ...EVENT_TYPES.map((t) => EVENT_CONFIG[t].label)];
    const csvRows = sortedPivotData.map((row) => {
      const vals = EVENT_TYPES.map((t) => row.values[t].toFixed(2) + "%");
      return [row.siteName, row.totalLossHashrate, ...vals].join(",");
    });

    const csvContent = [headers.join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `事件影响_${viewMode}_${viewMode === "daily" ? selectedDate : selectedMonth}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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

  return (
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
            <div className="text-2xl font-bold text-gray-900 font-mono">{totalLoss}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 font-medium uppercase mb-1">主要影响类别</div>
            <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {pieData.length > 0 ? (
                <>
                  <div className="p-1 rounded bg-gray-100">{EVENT_CONFIG[pieData[0].type].icon}</div>
                  {EVENT_CONFIG[pieData[0].type].label}
                </>
              ) : (
                "-"
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 font-medium uppercase mb-1">受影响场地数</div>
            <div className="text-2xl font-bold text-gray-900 font-mono">
              {pivotData.filter((p) => (Object.values(p.values) as number[]).some((v) => v > 0)).length}
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="text-xs text-gray-500 font-medium uppercase mb-1">记录条数</div>
            <div className="text-2xl font-bold text-gray-900 font-mono">{filteredRecords.length}</div>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
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
                    className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider w-64 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("siteName")}
                  >
                    <div className="flex items-center gap-1">
                      场地名称
                      {renderSortIcon("siteName")}
                    </div>
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("totalLossHashrate")}
                  >
                    <div className="flex items-center justify-end gap-1">
                      影响算力 (T)
                      {renderSortIcon("totalLossHashrate")}
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
                    <td className="px-4 py-4 text-sm text-right font-mono text-gray-700 border-r border-gray-100">
                      {row.totalLossHashrate}
                    </td>
                    {EVENT_TYPES.map((type) => {
                      const val = row.values[type];
                      return (
                        <td
                          key={type}
                          className={`px-4 py-4 text-sm text-right font-mono border-b border-gray-50 ${getCellClass(val)}`}
                        >
                          {val.toFixed(2)}%
                        </td>
                      );
                    })}
                  </tr>
                ))}
                {paginatedData.length === 0 && (
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
                显示 <span className="font-medium text-gray-900">{(currentPage - 1) * itemsPerPage + 1}</span>{" "}
                到{" "}
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[320px]">
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
              <SimplePieChart data={pieData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Event Logs View (New Content) ---

export default AnalysisView;
