import React, { useState } from "react";
import { WEATHER_ICONS } from "../constants";
import { Period, VenueWeather } from "../types";

interface Props {
  data: VenueWeather;
}

const WeatherCard: React.FC<Props> = ({ data }) => {
  const [displayPeriod, setDisplayPeriod] = useState<Period>(data.period);

  const getPeriodLabel = (p: Period) => {
    switch (p) {
      case Period.REALTIME:
        return "实时";
      case Period.DAY:
        return "白天";
      case Period.NIGHT:
        return "夜间";
      default:
        return "";
    }
  };

  const isNight = displayPeriod === Period.NIGHT;

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-300 ${isNight ? "bg-slate-50 border-indigo-100" : ""}`}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${isNight ? "bg-indigo-600 text-white" : "bg-blue-100 text-blue-700"}`}
            >
              {getPeriodLabel(displayPeriod)}
            </span>

            {/* Day/Night Toggle Switch */}
            <div className="flex bg-gray-100 p-0.5 rounded-md border border-gray-200">
              <button
                onClick={() => setDisplayPeriod(Period.DAY)}
                className={`w-6 h-5 flex items-center justify-center rounded transition-all ${displayPeriod === Period.DAY ? "bg-white shadow-sm text-yellow-500" : "text-gray-400"}`}
                title="查看白天"
              >
                <i className="fas fa-sun text-[10px]"></i>
              </button>
              <button
                onClick={() => setDisplayPeriod(Period.NIGHT)}
                className={`w-6 h-5 flex items-center justify-center rounded transition-all ${displayPeriod === Period.NIGHT ? "bg-indigo-600 shadow-sm text-white" : "text-gray-400"}`}
                title="查看夜间"
              >
                <i className="fas fa-moon text-[10px]"></i>
              </button>
            </div>
          </div>

          <h3 className={`font-bold text-lg ${isNight ? "text-indigo-900" : "text-gray-800"}`}>
            {isNight && data.weather_description === "晴" ? "月朗星稀" : data.weather_description || "未知"}
          </h3>
          <p className="text-[10px] text-gray-400 flex items-center mt-1 uppercase font-mono">
            <i className="far fa-calendar-alt mr-1"></i> {data.date.split(" ")[0]}
          </p>
        </div>
        <div className={`text-4xl transition-transform duration-500 ${isNight ? "rotate-[360deg]" : ""}`}>
          {isNight && data.weather_description === "晴" ? (
            <i className="fas fa-moon text-indigo-400"></i>
          ) : (
            WEATHER_ICONS[data.weather_description] || <i className="fas fa-cloud text-gray-300"></i>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className={`${isNight ? "bg-indigo-100/50" : "bg-gray-50"} rounded-xl p-3 transition-colors`}>
          <p
            className={`text-[9px] font-bold uppercase tracking-widest ${isNight ? "text-indigo-400" : "text-gray-400"}`}
          >
            {isNight ? "夜间温" : "白天温"}
          </p>
          <p className={`text-xl font-black ${isNight ? "text-indigo-800" : "text-gray-800"}`}>
            {isNight ? data.temperature_min?.toFixed(1) : data.temperature_max?.toFixed(1)}°C
          </p>
          <div className="mt-1 flex items-center text-[9px] text-gray-500 font-medium">
            <i
              className={`fas ${isNight ? "fa-arrow-down text-blue-400" : "fa-arrow-up text-orange-400"} mr-1`}
            ></i>
            <span>趋势稳定</span>
          </div>
        </div>
        <div className={`${isNight ? "bg-indigo-100/50" : "bg-gray-50"} rounded-xl p-3 transition-colors`}>
          <p
            className={`text-[9px] font-bold uppercase tracking-widest ${isNight ? "text-indigo-400" : "text-gray-400"}`}
          >
            {isNight ? "体感湿度" : "平均湿度"}
          </p>
          <p className={`text-xl font-black ${isNight ? "text-indigo-800" : "text-gray-800"}`}>
            {isNight ? data.humidity_min || data.humidity : data.humidity_max || data.humidity}%
          </p>
          <p className="text-[9px] text-gray-400 mt-1 truncate">ID: {data.venue_id}</p>
        </div>
      </div>

      <div
        className={`space-y-2 text-[11px] border-t pt-3 ${isNight ? "border-indigo-100 text-indigo-700/70" : "border-gray-50 text-gray-500"}`}
      >
        <div className="flex justify-between items-center">
          <span className="opacity-60">风力级别</span>
          <span className="font-bold">
            {data.wind_speed} km/h • {data.wind_direction}
          </span>
        </div>
        <div className="flex justify-between items-center">
          <span className="opacity-60">降水概率</span>
          <span className="font-bold">{data.precipitation > 0 ? `${data.precipitation}mm` : "无降水"}</span>
        </div>
      </div>

      {data.alert_text && (
        <div
          className={`mt-4 p-2.5 rounded-lg border flex items-start space-x-2 animate-pulse ${isNight ? "bg-red-900/10 border-red-200/50" : "bg-red-50 border-red-100"}`}
        >
          <i className="fas fa-triangle-exclamation text-red-500 mt-1 text-xs"></i>
          <div className="min-w-0">
            <p className="text-[10px] font-black text-red-700 leading-tight truncate uppercase">
              {data.alert_category || "气象警报"}
            </p>
            <p className="text-[9px] text-red-600 line-clamp-1 mt-0.5">{data.alert_text}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeatherCard;
