import React, { useRef, useState } from "react";
import { AlertTriangle, CloudRain, LayoutList, Server, Thermometer, Wifi, Zap } from "lucide-react";
import { EventType } from "./types";

const StackedBarChart: React.FC<{
  data: { label: string; values: Record<EventType, number> }[];
  mode: "daily" | "monthly";
}> = ({ data, mode }) => {
  // console.log("StackedBarChart>>data", data);
  const containerRef = useRef<HTMLDivElement>(null);
  const EVENT_CONFIG: Record<EventType, { label: string; color: string; bg: string; icon: React.ReactNode }> =
    {
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
      // low_power: { label: "低功耗", color: "#f4b359ff", bg: "bg-red-300", icon: <LayoutList size={14} /> }, // Red
      maintenance: {
        label: "日常维护",
        color: "#f4b092ff",
        bg: "bg-red-100",
        icon: <LayoutList size={14} />,
      }, // Blue
      // other: { label: "其他", color: "#a2f492ff", bg: "bg-green-100", icon: <LayoutList size={14} /> }, // Blue
      low_power: { label: "低功耗", color: "#a2f492ff", bg: "bg-green-50", icon: <Zap size={14} /> }, // Green
      other: { label: "其他", color: "#cdcecdff", bg: "bg-gray-100", icon: <LayoutList size={14} /> }, // Green
    };

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

  // Calculate Max Y for scale
  const totals = data.map((d) => (Object.values(d.values) as number[]).reduce((a, b) => a + b, 0));
  const maxTotal = Math.max(...totals) * 1.1 || 10;

  const barWidth = Math.min(((width - paddingX * 2) / data.length) * 0.6, 50);

  const getX = (index: number) =>
    paddingX +
    index * ((width - paddingX * 2) / data.length) +
    ((width - paddingX * 2) / data.length - barWidth) / 2;
  const getY = (val: number) => height - paddingY - (val / maxTotal) * (height - paddingY * 2);

  if (data.length === 0)
    return <div className="h-full flex items-center justify-center text-gray-400"> 暂无数据 </div>;

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
          // console.log("item.values", item.values);
          const allValuesAreZero = Object.values(item.values).every((val) => val === 0);
          if (allValuesAreZero) return null;
          return (
            <g key={i}>
              {item.values &&
                Object.entries(item.values).map(([type, val]) => {
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
                fontSize="6"
                fill="#6b7280"
                className="select-none"
                transform={
                  mode === "daily" ? `rotate(0, ${getX(i) + barWidth / 2}, ${height - 5})` : undefined
                }
              >
                {item.label.length > 6 ? item.label.substring(0, 6) + "..." : item.label}
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
              >
                {" "}
              </div>
              <span className="text-gray-300"> {EVENT_CONFIG[tooltipData.type].label} </span>
            </div>
            <span className="font-mono font-bold">
              {tooltipData.value > 0 ? tooltipData.value.toFixed(0) : tooltipData.value.toFixed(2)} %
              {/* {mode === "daily" ? "%" : " %"} */}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StackedBarChart;
