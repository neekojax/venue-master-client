import React from "react";
import { VenueWeather } from "../types";

interface Props {
  forecasts: VenueWeather[];
}

const ForecastAlerts: React.FC<Props> = ({ forecasts }) => {
  // Filter only those days that actually have alert text
  const alertDays = forecasts.filter((f) => f.alert_text);

  if (alertDays.length === 0) return null;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-gray-800 flex items-center uppercase tracking-wider">
          <i className="fas fa-triangle-exclamation mr-2 text-orange-500"></i>
          预报时段气象预警记录
        </h3>
        <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
          共 {alertDays.length} 条记录
        </span>
      </div>

      {/* Scrollable Container - Height set to show ~2 items (approx 285px) */}
      <div className="max-h-[285px] overflow-y-auto pr-2 space-y-3 custom-alert-scrollbar">
        {alertDays.map((day) => (
          <div
            key={`alert-${day.id}`}
            className="bg-white rounded-xl border border-orange-100 shadow-sm overflow-hidden flex flex-col md:flex-row hover:border-orange-200 transition-colors"
          >
            {/* Severity Side Bar */}
            <div
              className={`w-full md:w-1.5 flex-shrink-0 ${
                day.alert_severity > 7
                  ? "bg-red-500"
                  : day.alert_severity > 4
                    ? "bg-orange-500"
                    : "bg-yellow-400"
              }`}
            ></div>

            <div className="p-4 flex-1 flex flex-col md:flex-row md:items-center gap-4">
              {/* Category and Date */}
              <div className="md:w-44 flex-shrink-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                      day.alert_severity > 7 ? "bg-red-100 text-red-700" : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {day.alert_category || "常规预警"}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400">LV.{day.alert_severity}</span>
                </div>
                <p className="text-xs font-bold text-gray-800">{day.date}</p>
                <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                  {day.alert_effective_date ? day.alert_effective_date.split(" ")[1] : "00:00:00"} -{" "}
                  {day.alert_end_date ? day.alert_end_date.split(" ")[1] : "23:59:59"}
                </p>
              </div>

              {/* Alert Content */}
              <div className="flex-1">
                <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">{day.alert_text}</p>
              </div>

              {/* Action */}
              <div className="md:w-24 flex-shrink-0 flex justify-end">
                <a
                  href={day.alert_link || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-blue-600 hover:text-blue-800 flex items-center bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors border border-blue-100/50"
                >
                  详情 <i className="fas fa-chevron-right ml-1.5 text-[8px]"></i>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .custom-alert-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-alert-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-alert-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-alert-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default ForecastAlerts;
