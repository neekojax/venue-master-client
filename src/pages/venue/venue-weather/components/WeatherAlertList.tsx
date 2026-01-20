import React from "react";
import { WeatherAlert } from "../types";

interface Props {
  alerts: WeatherAlert[];
}

const WeatherAlertList: React.FC<Props> = ({ alerts }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[420px]">
      <div className="px-5 py-4 border-b flex justify-between items-center bg-red-50/30 flex-shrink-0">
        <h3 className="font-bold text-gray-800 flex items-center text-sm">
          <i className="fas fa-triangle-exclamation text-red-500 mr-2"></i>
          气象预警中心
        </h3>
        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold font-mono">
          {alerts.length} ALERTS
        </span>
      </div>

      <div className="overflow-y-auto flex-1 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8">
            <i className="fas fa-shield-check text-4xl mb-4 opacity-20"></i>
            <span className="text-xs font-medium">当前所有场地气象状态良好</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group relative"
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-red-500 transition-colors"></div>

                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-gray-800 group-hover:text-red-600 transition-colors truncate pr-2">
                    {alert.description}
                  </span>
                  <span
                    className={`text-[9px] px-1.5 py-0.5 rounded font-black flex-shrink-0 ${
                      alert.description.includes("红色")
                        ? "bg-red-600 text-white"
                        : alert.description.includes("橙色")
                          ? "bg-orange-500 text-white"
                          : "bg-yellow-400 text-white"
                    }`}
                  >
                    {alert.description.includes("红色")
                      ? "LEVEL 1"
                      : alert.description.includes("橙色")
                        ? "LEVEL 2"
                        : "LEVEL 3"}
                  </span>
                </div>

                <p className="text-[11px] text-gray-500 mb-3 leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">
                  {alert.summary}
                </p>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center text-[10px] text-gray-400 font-medium bg-gray-100 px-1.5 py-0.5 rounded">
                    <i className="fas fa-location-dot mr-1 text-[8px]"></i>
                    <span className="truncate max-w-[120px]">{alert.affected_area}</span>
                  </div>
                  <div className="text-[9px] text-gray-400 font-mono italic">
                    {alert.start_time.split(" ")[0].split("-").slice(1).join("/")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-2 border-t bg-gray-50 flex justify-center flex-shrink-0">
        <button className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center transition-colors">
          查看全部历史记录 <i className="fas fa-arrow-right ml-1"></i>
        </button>
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
