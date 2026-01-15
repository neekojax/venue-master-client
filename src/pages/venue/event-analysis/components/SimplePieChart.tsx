import React from "react";
import { AlertTriangle, CloudRain, LayoutList, Server, Thermometer, Wifi, Zap } from "lucide-react";
import { EventType } from "./types";

const SimplePieChart: React.FC<{ data: { type: EventType; value: number }[] }> = ({ data }) => {
  if (data && data.length === 0)
    return <div className="h-full flex items-center justify-center text-gray-400">无数据</div>;
  const size = 160;
  const center = size / 2;
  const radius = size / 2 - 10;
  const total = data && Array.isArray(data) ? data.reduce((acc, cur) => acc + cur.value, 0) : 0;

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

  if (total === 0) return <div className="h-full flex items-center justify-center text-gray-400">无数据</div>;

  let currentAngle = 0;

  return (
    <div className="flex items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, _: number) => {
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
            <path
              key={item.type}
              d={d}
              fill={EVENT_CONFIG[item.type]?.color || "transparent"}
              stroke="white"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.type} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: EVENT_CONFIG[item.type]?.color || "transparent" }}
            ></div>
            <span className="text-gray-600 w-20">{EVENT_CONFIG[item.type]?.label || item.type}</span>
            <span className="font-mono font-medium">{((item.value / total) * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimplePieChart;
