import React from "react";
import { WEATHER_ICONS } from "../constants";
import { VenueWeather } from "../types";

interface Props {
  data: VenueWeather;
}

const WeatherHero: React.FC<Props> = ({ data }) => {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
      <div className="absolute top-[-20px] right-[-20px] text-[160px] opacity-10 rotate-12">
        {WEATHER_ICONS[data.weather_condition] || <i className="fas fa-cloud"></i>}
      </div>

      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold tracking-wider uppercase">
              {data.data_source} • 实时监测
            </span>
            <div className="flex items-center space-x-2 bg-black/10 px-2 py-1 rounded text-[10px] font-mono border border-white/10">
              <i className="fas fa-globe-asia opacity-70"></i>
              <span>{data.timezone}</span>
            </div>
          </div>
          <span className="text-blue-100 text-xs flex items-center">
            <i className="far fa-clock mr-1"></i> 最后更新: {data.date}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:space-x-12 space-y-6 md:space-y-0">
          <div className="flex items-center space-x-6">
            <div className="text-7xl font-light">
              {data.temperature?.toFixed(1)}
              <span className="text-4xl opacity-70">°C</span>
            </div>
            <div className="h-16 w-[1px] bg-white/20"></div>
            <div>
              <div className="text-4xl">
                {WEATHER_ICONS[data.weather_condition] || <i className="fas fa-cloud"></i>}
              </div>
              <div className="text-xl font-medium mt-1">{data.weather_condition}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4 flex-1 border-t md:border-t-0 md:border-l border-white/10 pt-6 md:pt-0 md:pl-12">
            <div>
              <p className="text-blue-200 text-[10px] font-bold uppercase mb-1">当前湿度</p>
              <p className="text-xl font-semibold">{data.humidity}%</p>
              <p className="text-[10px] text-blue-100/70 mt-1">实时环境状态</p>
            </div>
            <div>
              <p className="text-blue-200 text-[10px] font-bold uppercase mb-1">平均风速</p>
              <p className="text-xl font-semibold">
                {data.wind_speed} <span className="text-xs opacity-70">km/h</span>
              </p>
              <p className="text-[10px] opacity-60 uppercase">{data.wind_direction}</p>
            </div>
            <div>
              <p className="text-blue-200 text-[10px] font-bold uppercase mb-1">阵风风速</p>
              <p className="text-xl font-semibold">
                {data.wind_gust_speed} <span className="text-xs opacity-70">km/h</span>
              </p>
              {/* <p className="text-[10px] text-blue-100/70 mt-1">瞬时最大</p> */}
            </div>
            <div>
              <p className="text-blue-200 text-[10px] font-bold uppercase mb-1">降水量</p>
              <p className="text-xl font-semibold">
                {data.precipitation} <span className="text-xs opacity-70">mm</span>
              </p>
              {/* <p className="text-[10px] text-blue-100/70 mt-1">当日累计</p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherHero;
