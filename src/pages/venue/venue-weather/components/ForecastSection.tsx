import React, { useState } from "react";
import { WEATHER_ICONS, WEATHER_NIGNT_ICONS } from "../constants";
import { ForecastDay } from "../types";

interface Props {
  forecastDays: ForecastDay[];
  forecastNight: ForecastDay[];
}

const ForecastSection: React.FC<Props> = ({ forecastDays, forecastNight }) => {
  const [viewMode, setViewMode] = useState<"day" | "night">("day");

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-bold text-gray-800 flex items-center uppercase tracking-wider">
            <i className="far fa-calendar-days mr-2 text-blue-500"></i>
            未来天气预报
          </h3>

          <div className="flex bg-gray-200/50 p-1 rounded-lg border border-gray-200 backdrop-blur-sm">
            {(() => {
              const base =
                "flex items-center space-x-2 px-4 py-1 text-[10px] font-bold rounded-md transition-all duration-300 ";
              const dayBtnClass =
                base +
                (viewMode === "day"
                  ? "bg-white text-orange-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700");
              const nightBtnClass =
                base +
                (viewMode === "night"
                  ? "bg-[#1a1c2e] text-indigo-300 shadow-sm"
                  : "text-gray-500 hover:text-gray-700");
              return (
                <>
                  <button onClick={() => setViewMode("day")} className={dayBtnClass}>
                    <i className="fas fa-sun"></i>
                    <span>白天</span>
                  </button>
                  <button onClick={() => setViewMode("night")} className={nightBtnClass}>
                    <i className="fas fa-moon"></i>
                    <span>夜晚</span>
                  </button>
                </>
              );
            })()}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
            ACCUWEATHER DATA STREAM
          </span>
        </div>
      </div>

      {viewMode === "day" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {forecastDays.map((day, idx) => {
            // console.log("day》〉》", day);
            const isNight = false;
            const weatherDesc = isNight && day.weather === "晴" ? "" : day.weather;
            const dateParts = day.date.split("-");
            const displayDate = `${dateParts[1]} / ${dateParts[2]}`;

            return (
              <div
                key={`${day.date}-${idx}`}
                className={`relative rounded-2xl border bg-white border-gray-100 shadow-sm transition-all duration-300 group flex flex-col cursor-default hover:shadow-md`}
              >
                <div className="px-4 pt-4 flex justify-between items-start">
                  <span className="text-[11px] font-bold text-gray-400">{displayDate}</span>
                  <i
                    className={`fas ${isNight ? "fa-moon text-indigo-300" : "fa-sun text-orange-200"} text-[10px]`}
                  ></i>
                </div>

                <div className="py-2 flex flex-col items-center">
                  <div className="text-4xl mb-2 transform transition-transform duration-500 group-hover:scale-110">
                    {isNight && day.weather === "晴" ? (
                      <i className="fas fa-moon text-indigo-400"></i>
                    ) : (
                      WEATHER_ICONS[day.weather] || <i className="fas fa-cloud text-gray-300"></i>
                    )}
                  </div>
                  <span className="text-[12px] font-black text-gray-800">{weatherDesc}</span>
                </div>

                <div className="px-4 pb-4 mt-4 space-y-4">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-400 font-medium">温度区间</span>
                    <span className="font-black text-gray-900">
                      {day.temp_min}° - {day.temp_max}°
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-400 font-medium">湿度 (L/A/H)</span>
                      <span className="font-bold text-gray-700">
                        {day.humidity_min}/{day.humidity_avg}/{day.humidity_max}%
                      </span>
                    </div>
                    <div className="h-[3px] w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${day.humidity_avg}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-400 font-medium">风力详情</span>
                      <span className="font-bold text-gray-700">{day.wind_direction}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-400">平均: {day.wind_speed} km/h</span>
                      <span className="text-orange-500 font-black">阵风: {day.wind_gust_speed}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto px-4 py-3 border-t border-gray-50 flex justify-between items-center bg-blue-50/10">
                  <div className="flex items-center text-[11px] font-bold text-blue-500">
                    <i className="fas fa-cloud-rain mr-2 opacity-70"></i>
                    降水量
                  </div>
                  <span className="text-[11px] font-black text-blue-600">{day.precipitation} mm</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {viewMode === "night" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {forecastNight.map((day, idx) => {
            const isNight = viewMode === "night";
            const weatherDesc = isNight && day.weather === "晴" ? "月朗星稀" : day.weather;
            const dateParts = day.date.split("-");
            const displayDate = `${dateParts[1]} / ${dateParts[2]}`;

            return (
              <div
                key={`${day.date}-${idx}`}
                className={`relative rounded-2xl border bg-white border-gray-100 shadow-sm transition-all duration-300 group flex flex-col cursor-default hover:shadow-md`}
              >
                {/* Card Header: Date & Small Icon */}
                <div className="px-4 pt-4 flex justify-between items-start">
                  <span className="text-[11px] font-bold text-gray-400">{displayDate}</span>
                  <i
                    className={`fas ${isNight ? "fa-moon text-indigo-300" : "fa-sun text-orange-200"} text-[10px]`}
                  ></i>
                </div>

                {/* Weather Visual */}
                <div className="py-2 flex flex-col items-center">
                  <div className="text-4xl mb-2 transform  text-indigo-400 transition-transform duration-500 group-hover:scale-110">
                    {isNight && day.weather === "晴" ? (
                      <i className="fas fa-moon text-indigo-400"></i>
                    ) : (
                      WEATHER_NIGNT_ICONS[day.weather] || <i className="fas fa-cloud text-indigo-400"></i>
                    )}
                  </div>
                  <span className="text-[12px] font-black text-gray-800">{weatherDesc}</span>
                </div>

                {/* Data Rows */}
                <div className="px-4 pb-4 mt-4 space-y-4">
                  {/* Temperature */}
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-gray-400 font-medium">温度区间</span>
                    <span className="font-black text-gray-900">
                      {day.temp_min}° - {day.temp_max}°
                    </span>
                  </div>

                  {/* Humidity with Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-400 font-medium">湿度 (L/A/H)</span>
                      <span className="font-bold text-gray-700">
                        {day.humidity_min}/{day.humidity_avg}/{day.humidity_max}%
                      </span>
                    </div>
                    <div className="h-[3px] w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${day.humidity_avg}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Wind Details */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-400 font-medium">风力详情</span>
                      <span className="font-bold text-gray-700">{day.wind_direction}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-gray-400">平均: {day.wind_speed} km/h</span>
                      <span className="text-orange-500 font-black">阵风: {day.wind_gust_speed}</span>
                    </div>
                  </div>
                </div>

                {/* Precipitation Footer */}
                <div className="mt-auto px-4 py-3 border-t border-gray-50 flex justify-between items-center bg-blue-50/10">
                  <div className="flex items-center text-[11px] font-bold text-blue-500">
                    <i className="fas fa-cloud-rain mr-2 opacity-70"></i>
                    降水量
                  </div>
                  <span className="text-[11px] font-black text-blue-600">{day.precipitation} mm</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ForecastSection;
