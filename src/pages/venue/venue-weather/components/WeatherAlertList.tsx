import React from "react";
import { WeatherAlert } from "../types";

interface Props {
  alerts: WeatherAlert[];
  onSelectSites?: (ids: number[]) => void;
  onSelectVenue?: (id: number) => void;
}

const WeatherAlertList: React.FC<Props> = ({ alerts, onSelectSites, onSelectVenue }) => {
  const formatTime = (timeStr: string) => {
    // 2026-01-16 06:00:00 -> 01/16 06:00
    if (!timeStr) return "";
    const parts = timeStr.split(" ");
    const dateParts = parts[0].split("-");
    const timeParts = parts[1].split(":");
    return `${dateParts[1]}/${dateParts[2]} ${timeParts[0]}:${timeParts[1]}`;
  };
  const getBadgeStyle = (alert: WeatherAlert) => {
    const text = (alert.description + alert.type).toLowerCase();
    if (text.includes("warning") || text.includes("预警")) return "bg-red-100 text-red-700";
    return "bg-yellow-100 text-yellow-700";
  };
  const getTypeBadgeStyle = (type?: string) => {
    const t = String(type || "");
    if (t.includes("红")) return "bg-red-100 text-red-700";
    if (t.includes("橙")) return "bg-orange-100 text-orange-700";
    if (t.includes("黄")) return "bg-yellow-100 text-yellow-700";
    if (t.includes("蓝")) return "bg-blue-100 text-blue-700";
    if (t.toLowerCase().includes("warning") || t.includes("预警")) return "bg-red-100 text-red-700";
    return "bg-orange-100 text-orange-700";
  };

  const getSeverityColor = (alert: WeatherAlert) => {
    const text = (alert.description + alert.type).toLowerCase();
    if (
      text.includes("red") ||
      text.includes("warning") ||
      text.includes("红色") ||
      text.includes("预警") ||
      text.includes("雪")
    )
      return "border-l-red-500 bg-red-50/10";
    if (
      text.includes("orange") ||
      text.includes("watch") ||
      text.includes("雨") ||
      text.includes("rain") ||
      text.includes("橙色")
    )
      return "border-l-orange-500 bg-orange-50/10";
    return "border-l-yellow-400 bg-yellow-50/10";
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[500px] overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-white flex-shrink-0">
        <div>
          <h3 className="font-black text-gray-800 flex items-center text-sm tracking-wide">
            <i className="fas fa-tower-broadcast text-red-500 mr-2 animate-pulse"></i>
            气象预警中心
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5 font-medium">WEATHER WARNING CENTER</p>
        </div>
        <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-bold shadow-sm shadow-red-200">
          {alerts.length} Active
        </span>
      </div>

      <div className="overflow-y-auto flex-1 custom-scrollbar flex-1 overflow-y-auto p-2 space-y-3 custom-scrollbar bg-gray-50/50">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
            <i className="fas fa-shield-check text-4xl mb-4 opacity-20"></i>
            <span className="text-xs font-medium">当前所有场地气象状态良好</span>
          </div>
        ) : (
          <div>
            {alerts.map((alert) => (
              <div
                key={alert.id}
                style={{ cursor: "pointer", marginBottom: "10px" }}
                className={`relative bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group overflow-hidden border-l-4 ${getSeverityColor(alert).split(" ")[0]}`}
                onClick={() => {
                  if ((alert as any).venue_id) {
                    const vid = Number((alert as any).venue_id);
                    if (!Number.isNaN(vid) && vid > 0) {
                      onSelectSites?.([vid]);
                      onSelectVenue?.(vid);
                    }
                  }
                }}
              >
                <div className="p-4">
                  <div
                    className={`absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:${getSeverityColor(alert).split(" ")[0]} transition-colors`}
                  ></div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-black text-gray-800 text-sm leading-tight pr-2">
                      {/* {alert.type} */}
                      <span
                        className={`inline-flex items-center  font-black px-2 py-2 rounded ${getTypeBadgeStyle(
                          alert.type,
                        )}`}
                      >
                        {alert.type || "常规预警"}
                      </span>
                    </h4>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.5 rounded border border-transparent ${getBadgeStyle(alert)}`}
                    >
                      {alert.timezone}
                    </span>
                  </div>
                  {/* <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-600 group-hover:text-red-600 transition-colors truncate pr-2">
                    {alert.summary || "预警信息"}
                  </span>
                </div> */}

                  <p className="text-xs text-gray-600 mb-3 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                    {alert.description}
                  </p>
                  <div className="flex flex-wrap gap-y-2 text-[10px] text-gray-400 font-medium pt-3 border-t border-dashed border-gray-100">
                    <div className="flex items-center w-full sm:w-auto mr-4">
                      <i className="far fa-clock mr-1.5 text-gray-400"></i>
                      <span>
                        {formatTime(alert.start_time)} - {formatTime(alert.end_time)}
                      </span>
                    </div>
                    <div className="flex items-center mr-4">
                      <i className="fas fa-location-dot mr-1.5 text-gray-400"></i>
                      <span className="truncate max-w-[250px]">{alert.venue_name}</span>
                    </div>
                    {/* <div className="flex items-center">
                      <i className="fas fa-building-columns mr-1.5 text-gray-400"></i>
                      <span className="truncate max-w-[80px]">{alert.source}</span>
                    </div> */}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t bg-gray-50 flex justify-center flex-shrink-0">
        {/* <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center transition-colors">
          查看全部历史记录 <i className="fas fa-arrow-right ml-1"></i>
        </button> */}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f9fafb;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default WeatherAlertList;
