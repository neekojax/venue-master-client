import React from "react";
import { CloudRain, Droplets, Thermometer, Wind } from "lucide-react";
import { WeatherCondition, WeatherData } from "../types/weather";
import { WeatherIcon } from "./WeatherIcon";

interface Props {
  label: string;
  data: WeatherData;
  isNight?: boolean;
}

export const DayNightRow: React.FC<Props> = ({ label, data, isNight }) => {
  // const { t } = useTranslation();
  const normalizeCondition = (w: string): WeatherCondition => {
    // console.log('w', w);
    if (!w) return "sunny";
    const s = w.toLowerCase();
    if (w.includes("雷") || s.includes("storm")) return "stormy";
    if (w.includes("云") || s.includes("cloud")) return "cloudy";
    if (w.includes("雨") || w.includes("暴雨") || s.includes("rain")) return "rainy";
    if (w.includes("雪") || s.includes("snow")) return "snowy";
    if (w.includes("阴")) return "cloudy";
    return "sunny";
  };
  // const weatherConditions = [
  //     { label: "晴天", value: "sunny" },
  //     { label: "多云", value: "cloudy" },
  //     { label: "雷暴", value: "storm" },
  // ];
  return (
    <div
      className={`flex flex-col sm:flex-row items-center sm:items-start justify-between sm:gap-6 p-3 rounded-lg ${isNight ? "bg-indigo-900 text-indigo-50" : "bg-sky-100 text-slate-800"}`}
    >
      <div className="flex flex-col items-center sm:items-start gap-1 mb-2 sm:mb-0 sm:flex-none sm:shrink-0">
        <div className="flex items-center gap-1">
          <WeatherIcon condition={normalizeCondition(data.weather)} isNight={isNight} className="w-6 h-6" />
          {/* <span className="font-medium text-xs">{data.weather.replace("（白天）", "").replace("（夜间）", "")}</span> */}
        </div>
        <span style={{ fontSize: "0.75rem", fontWeight: "bold" }}>
          <span>{label} &nbsp;</span>
          {data.weather.replace("（白天）", "").replace("（夜间）", "")}
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-4 text-sm w-full sm:w-auto sm:ml-6 sm:justify-items-end text-right ml-auto">
        <div className="flex flex-col items-center ">
          <Thermometer className="w-4 h-4 mb-1 opacity-70" />
          <span
            className="whitespace-nowrap"
            style={{ fontSize: "0.75rem", fontWeight: "bold", marginTop: "7px" }}
          >
            {data.min_temperature.toFixed(2)}° ~ {data.max_temperature.toFixed(2)}°
          </span>
        </div>
        <div className="flex flex-col items-center">
          <Droplets className="w-4 h-4 mb-1 opacity-70" />
          <span style={{ fontSize: "0.75rem", fontWeight: "bold", marginTop: "7px" }}>{data.humidity}%</span>
        </div>
        <div className="flex flex-col items-center">
          <Wind className="w-4 h-4 mb-1 opacity-70" />
          <span style={{ fontSize: "0.75rem", fontWeight: "bold", marginTop: "7px" }}>
            {data.wind_speed.toFixed(0)} km/h
          </span>
        </div>
        <div className="flex flex-col items-center">
          <CloudRain className="w-4 h-4 mb-1 opacity-70" />
          <span style={{ fontSize: "0.75rem", fontWeight: "bold", marginTop: "7px" }}>
            {Number.isInteger(data.precipitation)
              ? data.precipitation
              : Number(data.precipitation).toFixed(1)}{" "}
            mm
          </span>
        </div>
      </div>
    </div>
  );
};
