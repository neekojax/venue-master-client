import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  Droplets,
  Filter,
  Search,
  Thermometer,
} from "lucide-react";
import { DeviceEnvironmentHistory, VenueEnvironmentHistoryResp } from "./components/types";

import { fetchVenueEnvironmentHistory } from "@/pages/venue/api";

// --- Data is now fetched from API: fetchVenueEnvironmentHistory ---

// --- Curve Smoothing Helper (Advanced Cubic Bezier) ---
const getSmoothPath = (points: { x: number; y: number }[]) => {
  if (points.length === 0) return "";
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

  // Helper to calculate control points
  const getControlPoint = (
    current: { x: number; y: number },
    previous: { x: number; y: number },
    next: { x: number; y: number },
    reverse: boolean = false,
  ) => {
    // When 'current' is the first or last point of the array
    // 'previous' or 'next' don't exist. Replace with 'current'
    const p = previous || current;
    const n = next || current;

    // Properties of the opposed-line
    const lengthX = n.x - p.x;
    const lengthY = n.y - p.y;

    // Smoothing factor (0.15 - 0.2 is usually good for time series)
    const smoothing = 0.15;

    const angle = Math.atan2(lengthY, lengthX) + (reverse ? Math.PI : 0);
    const length = Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)) * smoothing;

    return {
      x: current.x + Math.cos(angle) * length,
      y: current.y + Math.sin(angle) * length,
    };
  };

  // Start path
  let d = `M ${points[0].x},${points[0].y}`;

  // Loop over points to calculate bezier curves
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1]; // Previous point (undefined for i=0)
    const p1 = points[i]; // Current point
    const p2 = points[i + 1]; // Next point
    const p3 = points[i + 2]; // Next next point (undefined for last step)

    const cp1 = getControlPoint(p1, p0, p2);
    const cp2 = getControlPoint(p2, p1, p3, true);

    d += ` C ${cp1.x},${cp1.y} ${cp2.x},${cp2.y} ${p2.x},${p2.y}`;
  }

  return d;
};

// --- MultiLine Chart Component ---
interface LineChartProps {
  devices: DeviceEnvironmentHistory[];
  visibleDeviceIds: string[];
  dataKey: "temperature" | "humidity";
  unit: string;
  colors: string[];
}

const MultiLineChart: React.FC<LineChartProps> = ({ devices, visibleDeviceIds, dataKey, unit, colors }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [mouseX, setMouseX] = useState<number>(0);

  const height = 300;
  const width = 800; // Internal coordinate system width
  const paddingX = 40;
  const paddingY = 30;

  // Filter devices based on visibility
  const activeDevices = devices.filter((d) => visibleDeviceIds.includes(d.device_id));

  // Determine Scale based on VISIBLE data
  const allValues = activeDevices.flatMap((d) => d.history.map((h) => h[dataKey]));

  // Default range if no data is visible
  let minVal = allValues.length > 0 ? Math.min(...allValues) : 0;
  let maxVal = allValues.length > 0 ? Math.max(...allValues) : 100;

  const range = maxVal - minVal || 1;
  // Add 10% padding
  minVal = minVal - range * 0.1;
  maxVal = maxVal + range * 0.1;
  const scaledRange = maxVal - minVal || 1; // avoid divide by zero

  const timePoints = devices[0]?.history || [];
  const dataLength = timePoints.length;

  const getX = (index: number) => paddingX + (index * (width - paddingX * 2)) / (dataLength - 1);
  const getY = (value: number) =>
    height - paddingY - ((value - minVal) / scaledRange) * (height - paddingY * 2);

  // Interaction Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || dataLength === 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left; // Mouse X relative to container

    // Scale clientX to SVG coordinate width
    const svgX = (clientX / rect.width) * width;

    // Inverse calculate index from X
    const chartWidth = width - paddingX * 2;
    const rawIndex = ((svgX - paddingX) / chartWidth) * (dataLength - 1);
    const index = Math.round(Math.max(0, Math.min(dataLength - 1, rawIndex)));

    setHoverIndex(index);
    setMouseX(clientX); // Store actual pixel position for tooltip
  };

  const handleMouseLeave = () => {
    setHoverIndex(null);
  };

  return (
    <div
      className="w-full h-full relative group cursor-crosshair"
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full overflow-visible"
        preserveAspectRatio="none"
      >
        {/* Y Axis Grid Lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((tick, i) => {
          const yVal = minVal + scaledRange * tick;
          const yPos = getY(yVal);
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={yPos}
                x2={width}
                y2={yPos}
                stroke="#f3f4f6"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text x={paddingX - 10} y={yPos + 4} textAnchor="end" fontSize="10" fill="#9ca3af">
                {yVal.toFixed(1)}
              </text>
            </g>
          );
        })}

        {/* X Axis Labels (Show roughly 6 labels) */}
        {timePoints.map((pt, i) => {
          const step = Math.floor(dataLength / 6);
          if (i % step !== 0) return null;
          const timeLabel = pt.datetime.split(" ")[1]; // HH:mm
          return (
            <text key={i} x={getX(i)} y={height - 5} textAnchor="middle" fontSize="10" fill="#9ca3af">
              {timeLabel}
            </text>
          );
        })}

        {/* Lines */}
        {devices.map((device, idx) => {
          // If not visible, don't render line
          if (!visibleDeviceIds.includes(device.device_id)) return null;

          const points = device.history.map((h, i) => ({ x: getX(i), y: getY(h[dataKey]) }));
          const pathD = getSmoothPath(points); // Use smooth path
          const color = colors[idx % colors.length];

          return (
            <g key={device.device_id}>
              <path
                d={pathD}
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="transition-all duration-300"
              />
            </g>
          );
        })}

        {/* Hover Crosshair & Dots */}
        {hoverIndex !== null && hoverIndex >= 0 && hoverIndex < dataLength && (
          <g>
            {/* Vertical Line */}
            <line
              x1={getX(hoverIndex)}
              y1={paddingY}
              x2={getX(hoverIndex)}
              y2={height - paddingY}
              stroke="#9ca3af"
              strokeWidth="1"
              strokeDasharray="4 2"
            />
            {/* Dots for active lines */}
            {activeDevices.map((device) => {
              const deviceIdx = devices.findIndex((d) => d.device_id === device.device_id);
              const color = colors[deviceIdx % colors.length];
              const val = device.history[hoverIndex][dataKey];
              return (
                <circle
                  key={device.device_id}
                  cx={getX(hoverIndex)}
                  cy={getY(val)}
                  r="4"
                  fill="white"
                  stroke={color}
                  strokeWidth="2"
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* Floating Tooltip */}
      {hoverIndex !== null && hoverIndex >= 0 && hoverIndex < dataLength && (
        <div
          className="absolute z-20 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-lg shadow-xl p-3 pointer-events-none transition-all duration-75 border border-white/10"
          style={{
            top: 20,
            left: mouseX > containerRef.current!.offsetWidth / 2 ? mouseX - 260 : mouseX + 20, // Flip side if too far right
            width: "240px",
          }}
        >
          <div className="font-bold text-gray-200 mb-2 border-b border-white/20 pb-1">
            {timePoints[hoverIndex].datetime}
          </div>
          <div className="space-y-1.5">
            {devices.map((device, idx) => {
              const isVisible = visibleDeviceIds.includes(device.device_id);
              if (!isVisible) return null; // Only show tooltip for visible lines

              const val = device.history[hoverIndex][dataKey];
              const color = colors[idx % colors.length];

              return (
                <div key={device.device_id} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0 shadow-[0_0_4px_currentColor]"
                      style={{ color: color, backgroundColor: color }}
                    ></div>
                    <span className="truncate max-w-[140px] text-gray-300">{device.location}</span>
                  </div>
                  <span className="font-mono font-bold">
                    {val.toFixed(1)} {unit}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Component ---

// interface Props {
//     onBack: () => void;
// }

const VenueEnvironmentHistory: React.FC = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(yesterday);
  const [endDate, setEndDate] = useState(today);
  const [activeTab, setActiveTab] = useState<string>("all"); // 'all' or device_id

  // Data State (fetched from API)
  const [data, setData] = useState<VenueEnvironmentHistoryResp | null>(null);

  useEffect(() => {
    if (!venueId) return;
    if (!startDate || !endDate) return;
    if (startDate > endDate) return;
    setQuerying(true);
    setData(null);
    resetHistoryView();
    fetchVenueEnvironmentHistory(Number(venueId), startDate, endDate)
      .then((res) => {
        const { data: resp } = res as { data: VenueEnvironmentHistoryResp };
        if (resp) {
          setData(resp);
          setVisibleDeviceIds(resp.devices.map((d) => d.device_id));
        }
      })
      .finally(() => setQuerying(false));
  }, [venueId, startDate, endDate]);

  // Visibility State for Charts
  // Initialize with all IDs visible
  const [visibleDeviceIds, setVisibleDeviceIds] = useState<string[]>([]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [jumpPage, setJumpPage] = useState("");
  const [querying, setQuerying] = useState(false);

  // Reset pagination when active tab changes
  useEffect(() => {
    setCurrentPage(1);
    setJumpPage("");
  }, [activeTab]);

  const toggleDeviceVisibility = (deviceId: string) => {
    setVisibleDeviceIds((prev) => {
      if (prev.includes(deviceId)) {
        return prev.filter((id) => id !== deviceId);
      } else {
        return [...prev, deviceId];
      }
    });
  };

  const CHART_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"];

  // Prepare Filtered Data for Table and Export
  const allFilteredRows = useMemo(() => {
    if (!data)
      return [] as Array<{
        datetime: string;
        device_name: string;
        device_id: string;
        temperature: number;
        humidity: number;
      }>;
    return data.devices
      .filter((d) => activeTab === "all" || d.device_id === activeTab)
      .flatMap((d) => d.history.map((h) => ({ ...h, device_name: d.location, device_id: d.device_id })))
      .sort((a, b) => new Date(b.datetime).getTime() - new Date(a.datetime).getTime());
  }, [data, activeTab]);

  // Calculate Pagination
  const totalItems = allFilteredRows.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentRows = allFilteredRows.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleJumpToPage = () => {
    const p = parseInt(jumpPage);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      setCurrentPage(p);
      setJumpPage("");
    }
  };

  // Reset history view when date changes
  const resetHistoryView = () => {
    setData(null);
    setVisibleDeviceIds([]);
    setActiveTab("all");
    setCurrentPage(1);
    setJumpPage("");
  };

  // Manual query trigger
  const handleQuery = () => {
    if (!venueId) return;
    if (!startDate || !endDate) return;
    if (startDate > endDate) return;
    setQuerying(true);
    resetHistoryView();
    fetchVenueEnvironmentHistory(Number(venueId), startDate, endDate)
      .then((res) => {
        const { data: resp } = res as { data: VenueEnvironmentHistoryResp };
        if (resp) {
          setData(resp);
          setVisibleDeviceIds(resp.devices.map((d) => d.device_id));
        }
      })
      .finally(() => setQuerying(false));
  };

  // Export to CSV Function
  const handleExport = () => {
    // 2. Prepare CSV Content using allFilteredRows
    const headers = ["时间", "位置", "设备ID", "温度(C)", "湿度(%)"];
    const csvRows = [
      headers.join(","),
      ...allFilteredRows.map((row) =>
        [
          row.datetime,
          `"${row.device_name}"`, // Quote strings that might contain commas
          row.device_id,
          row.temperature,
          row.humidity,
        ].join(","),
      ),
    ];
    const csvContent = csvRows.join("\n");

    // 3. Trigger Download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${data?.venue_name ?? ""}_环境数据_${new Date().toISOString().slice(0, 10)}.csv`,
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 overflow-hidden relative">
      {/* Page Header (Fixed) */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0 shadow-sm z-40 relative">
        <div className="flex items-center gap-4">
          <button
            // onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{data?.venue_name ?? ""} 环境历史记录</h1>
            <div className="text-xs text-gray-500 mt-0.5">Venue ID: {venueId ?? data?.venue_id}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Date Range Picker (Fixed Styling) */}
          <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm hover:border-gray-300 transition-colors">
            <Calendar size={16} className="text-gray-400" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                resetHistoryView();
              }}
              className="bg-transparent text-sm text-gray-700 outline-none w-28 border-none p-0 focus:ring-0 cursor-pointer font-medium font-mono"
            />
            <span className="text-gray-400">-</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                resetHistoryView();
              }}
              className="bg-transparent text-sm text-gray-700 outline-none w-28 border-none p-0 focus:ring-0 cursor-pointer font-medium font-mono"
            />
          </div>

          <button
            onClick={handleQuery}
            disabled={querying}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Search size={16} />
            <span className="hidden md:inline">查询</span>
          </button>
          <button
            onClick={handleExport}
            className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
          >
            <Download size={16} />
            <span className="hidden md:inline">导出数据</span>
          </button>
        </div>
      </div>

      {/* Loading Overlay */}
      {querying && (
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-sm text-gray-700">正在加载数据...</div>
          </div>
        </div>
      )}

      {/* Main Scroll Content */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Temperature Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="p-1.5 bg-red-50 text-red-500 rounded-md">
                  <Thermometer size={18} />
                </div>
                <h2 className="font-bold text-gray-800">温度趋势 (°C)</h2>
              </div>

              {/* Legend / Filter */}
              <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                {(data?.devices ?? []).map((d, i) => {
                  const isVisible = visibleDeviceIds.includes(d.device_id);
                  const color = CHART_COLORS[i % CHART_COLORS.length];
                  return (
                    <button
                      key={d.device_id}
                      onClick={() => toggleDeviceVisibility(d.device_id)}
                      className={`
                         flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 flex-shrink-0
                         ${
                           isVisible
                             ? "bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50"
                             : "bg-gray-50 border-transparent text-gray-400 opacity-60 hover:opacity-80"
                         }
                       `}
                    >
                      <div
                        className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${isVisible ? "shadow-[0_0_2px_currentColor]" : ""}`}
                        style={{ backgroundColor: isVisible ? color : "#9ca3af", color: color }}
                      ></div>
                      <span className="truncate max-w-[120px]">{d.location}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 min-h-0">
              <MultiLineChart
                devices={data?.devices ?? []}
                visibleDeviceIds={visibleDeviceIds}
                dataKey="temperature"
                unit="°C"
                colors={CHART_COLORS}
              />
            </div>
          </div>

          {/* Humidity Chart */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-[400px]">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="p-1.5 bg-blue-50 text-blue-500 rounded-md">
                  <Droplets size={18} />
                </div>
                <h2 className="font-bold text-gray-800">湿度趋势 (%)</h2>
              </div>

              {/* Legend / Filter */}
              <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                {(data?.devices ?? []).map((d, i) => {
                  const isVisible = visibleDeviceIds.includes(d.device_id);
                  const color = CHART_COLORS[i % CHART_COLORS.length];
                  return (
                    <button
                      key={d.device_id}
                      onClick={() => toggleDeviceVisibility(d.device_id)}
                      className={`
                         flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-all duration-200 flex-shrink-0
                         ${
                           isVisible
                             ? "bg-white border-gray-200 text-gray-700 shadow-sm hover:bg-gray-50"
                             : "bg-gray-50 border-transparent text-gray-400 opacity-60 hover:opacity-80"
                         }
                       `}
                    >
                      <div
                        className={`w-2 h-2 rounded-full transition-colors flex-shrink-0 ${isVisible ? "shadow-[0_0_2px_currentColor]" : ""}`}
                        style={{ backgroundColor: isVisible ? color : "#9ca3af", color: color }}
                      ></div>
                      <span className="truncate max-w-[120px]">{d.location}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chart Area */}
            <div className="flex-1 min-h-0">
              <MultiLineChart
                devices={data?.devices ?? []}
                visibleDeviceIds={visibleDeviceIds}
                dataKey="humidity"
                unit="%"
                colors={CHART_COLORS}
              />
            </div>
          </div>
        </div>

        {/* Data List Section */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col relative overflow-visible">
          {/* Sticky Section Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 bg-white rounded-t-xl h-[64px] shadow-sm">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <Filter size={18} className="text-gray-400" />
              历史数据明细
            </h2>
            <div className="flex bg-gray-100 p-1 rounded-lg overflow-x-auto no-scrollbar border border-gray-200">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shadow-sm ${activeTab === "all" ? "bg-white text-blue-600 shadow ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700 shadow-none bg-transparent"}`}
              >
                全部设备
              </button>
              {(data?.devices ?? []).map((d) => (
                <button
                  key={d.device_id}
                  onClick={() => setActiveTab(d.device_id)}
                  className={`px-4 py-1.5 text-xs font-medium rounded-md transition-all whitespace-nowrap shadow-sm ${activeTab === d.device_id ? "bg-white text-blue-600 shadow ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700 shadow-none bg-transparent"}`}
                >
                  {d.location}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="">
            <table className="min-w-full divide-y divide-gray-200 relative">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 text-nowrap sticky top-[64px] z-20 shadow-sm border-b border-gray-200">
                    时间
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 text-nowrap sticky top-[64px] z-20 shadow-sm border-b border-gray-200">
                    位置 / 设备ID
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 text-nowrap sticky top-[64px] z-20 shadow-sm border-b border-gray-200">
                    温度 (°C)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 text-nowrap sticky top-[64px] z-20 shadow-sm border-b border-gray-200">
                    湿度 (%)
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 text-nowrap sticky top-[64px] z-20 shadow-sm border-b border-gray-200">
                    状态
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRows.map((row, idx) => (
                  <tr
                    key={`${row.device_id}-${idx}`}
                    className="hover:bg-blue-50/30 transition-colors duration-150"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                      {row.datetime}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="font-medium">{row.device_name}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{row.device_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono">
                      <span
                        className={`${row.temperature > 35 ? "text-red-600 font-bold" : "text-gray-900"}`}
                      >
                        {row.temperature.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-mono text-gray-900">
                      {row.humidity.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {row.temperature > 40 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10">
                          <AlertOctagon size={12} className="fill-red-500 text-white" /> 高温告警
                        </span>
                      ) : row.temperature > 35 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 ring-1 ring-inset ring-yellow-600/20">
                          <AlertTriangle size={12} className="fill-yellow-500 text-white" /> 关注
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20">
                          <CheckCircle2 size={12} className="fill-green-500 text-white" /> 正常
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {currentRows.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 bg-gray-50/50">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Search size={32} className="text-gray-300" />
                        <p>暂无符合条件的数据</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Left: Info & Page Size */}
            <div className="flex items-center gap-4 text-sm text-gray-700">
              <span>
                显示第{" "}
                <span className="font-mono font-medium">
                  {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
                </span>{" "}
                -{" "}
                <span className="font-mono font-medium">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{" "}
                条，共 <span className="font-mono font-medium">{totalItems}</span> 条
              </span>

              <div className="flex items-center gap-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-1 pl-2 pr-6 h-8 leading-tight cursor-pointer shadow-sm"
                >
                  <option value={20}>20 条/页</option>
                  <option value={50}>50 条/页</option>
                  <option value={100}>100 条/页</option>
                </select>
              </div>
            </div>

            {/* Right: Navigation & Jump */}
            <div className="flex items-center gap-4">
              {/* Jump to Page */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">前往</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleJumpToPage();
                    }
                  }}
                  placeholder={currentPage.toString()}
                  className="w-12 border border-gray-300 rounded-md py-1 px-1 text-center text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-8 shadow-sm font-mono"
                />
                <span className="text-gray-500">页</span>
              </div>

              <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>

              {/* Previous / Next */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ChevronLeft size={16} />
                </button>

                <span className="text-sm text-gray-700 font-medium px-2 min-w-[3rem] text-center font-mono">
                  {currentPage} / {totalPages || 1}
                </span>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="p-1.5 rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenueEnvironmentHistory;
