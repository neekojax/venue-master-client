import React from "react";

interface WeatherDetailData {
  date: string;
  day_period: string;
  weather: string;
  min_temperature: number;
  max_temperature: number;
  humidity: number;
  precipitation: number;
  wind_speed: number;
}

interface WeatherDetailProps {
  item: WeatherDetailData | { day?: WeatherDetailData; night?: WeatherDetailData; date?: string };
  venueId?: number;
  idx?: number;
  darkMode?: boolean;
}

const weatherConditions = [
  { label: "晴天", value: "sunny" },
  { label: "多云", value: "cloudy" },
  { label: "雷暴", value: "storm" },
];

const normalizeCondition = (w: string): string => {
  // console.log('w', w);
  if (!w) return "sunny";
  const s = w.toLowerCase();
  if (w.includes("雷") || s.includes("storm")) return "storm";
  if (w.includes("云") || s.includes("cloud")) return "cloudy";
  if (w.includes("雨") || w.includes("暴雨") || s.includes("rain")) return "rain";
  if (w.includes("阴")) return "yin";
  return "sunny";
};

const WeatherDetail: React.FC<WeatherDetailProps> = ({ item }) => {
  // 支持两种形态：单条天气记录（含 day_period）或按日期分组的对象（含 day/night）
  const isGrouped =
    typeof (item as any)?.day !== "undefined" ||
    typeof (item as any)?.night !== "undefined" ||
    typeof (item as any)?.date !== "undefined";
  const date = isGrouped
    ? ((item as any)?.date ?? (item as WeatherDetailData)?.date)
    : (item as WeatherDetailData)?.date;
  const day = isGrouped
    ? ((item as any)?.day as WeatherDetailData | undefined)
    : (item as WeatherDetailData)?.day_period === "白天"
      ? (item as WeatherDetailData)
      : undefined;
  const night = isGrouped
    ? ((item as any)?.night as WeatherDetailData | undefined)
    : (item as WeatherDetailData)?.day_period === "夜间"
      ? (item as WeatherDetailData)
      : undefined;

  const defaultDay: WeatherDetailData = {
    date: date ?? "",
    day_period: "白天",
    weather: "-",
    min_temperature: 0,
    max_temperature: 0,
    humidity: 0,
    precipitation: 0,
    wind_speed: 0,
  };
  const defaultNight: WeatherDetailData = {
    date: date ?? "",
    day_period: "夜间",
    weather: "-",
    min_temperature: 0,
    max_temperature: 0,
    humidity: 0,
    precipitation: 0,
    wind_speed: 0,
  };

  const dayData = day ?? defaultDay;
  const nightData = night ?? defaultNight;

  return (
    <div className=" flex flex-col md:flex-row items-start md:items-center">
      {/* 天气详情 */}
      <div className="mb-4 md:mb-0">
        <div className="flex flex-col gap-2">
          {/* 日期信息 */}
          <div className="md:mb-0">
            <div className="text-xs text-gray-600">
              {date}
              <span className="text-gray-400">
                {" "}
                {new Date(date).toLocaleDateString("zh-CN", { weekday: "short" })}
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {/* 白天天气（紧凑） */}
            <div>
              <h3 className="text-xs text-gray-500 dark:text-gray-400 mb-1">白天</h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center">
                  {(dayData.weather || "").includes("晴") && (
                    <span className="text-lg mr-1" role="img" aria-label="sunny">
                      ☀️
                    </span>
                  )}
                  {(dayData.weather || "").includes("多云") && (
                    <span className="text-lg mr-1" role="img" aria-label="cloudy">
                      🌤
                    </span>
                  )}
                  {(dayData.weather || "").includes("阴") && (
                    <span className="text-lg mr-1 text-gray-400" role="img" aria-label="rainy">
                      ☁️
                    </span>
                  )}
                  {/* (dayData.weather || "").includes("多云") || (dayData.weather || "").includes("阴") */}

                  {((dayData.weather || "").includes("大雨") || (dayData.weather || "").includes("暴雨")) && (
                    <span className="text-lg mr-1" role="img" aria-label="rainy">
                      ⛈️
                    </span>
                  )}
                  {(dayData.weather || "").includes("小雨") && (
                    <span className="text-lg mr-1" role="img" aria-label="rainy">
                      🌧
                    </span>
                  )}

                  {/* <i
                                        className={`fas ${(dayData.weather || "").includes("雨")
                                            ? "fa-cloud-rain"
                                            : (dayData.weather || "").includes("多云") || (dayData.weather || "").includes("阴")
                                                ? "fa-cloud"
                                                : (dayData.weather || "").includes("晴")
                                                    ? "fa-sun"
                                                    : "fa-cloud"
                                            } text-lg mr-1`}
                                        style={{
                                            color: (dayData.weather || "").includes("雨")
                                                ? "#409EFF"
                                                : (dayData.weather || "").includes("多云") || (dayData.weather || "").includes("阴")
                                                    ? "#555"
                                                    : (dayData.weather || "").includes("晴")
                                                        ? "orange"
                                                        : "gray",
                                        }}
                                    ></i> */}
                  <span className="text-sm capitalize">
                    {weatherConditions.find((c) => c.value === normalizeCondition(dayData.weather))?.label ??
                      dayData.weather ??
                      "-"}
                  </span>
                </div>
                <div className="text-sm font-semibold">
                  {dayData.min_temperature}~{dayData.max_temperature}°C
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>湿度: {dayData.humidity}%</span>
                  <span>|</span>
                  <span>风速: {Number(dayData.wind_speed).toFixed(0)} km/h</span>
                  <span>|</span>
                  <span>
                    降水: {dayData.precipitation > 0 ? `${dayData.precipitation.toFixed(2)}mm` : "无"}
                  </span>
                </div>
              </div>
            </div>

            {/* 夜间天气（紧凑） */}
            <div>
              <h3 className="text-xs text-gray-500 dark:text-gray-400 mb-1">夜间</h3>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center">
                  {(nightData.weather || "").includes("晴") && (
                    <span className="text-lg mr-1" role="img" aria-label="sunny">
                      🌙
                    </span>
                  )}
                  {(nightData.weather || "").includes("多云") && (
                    <span className="text-lg mr-1" role="img" aria-label="cloudy">
                      ☁️
                    </span>
                  )}
                  {(nightData.weather || "").includes("阴") && (
                    <span
                      className="text-lg mr-1 text-gray-400"
                      role="img"
                      aria-label="cloudy"
                      style={{ color: "#000" }}
                    >
                      ☁️
                    </span>
                  )}

                  {/* (dayData.weather || "").includes("多云") || (dayData.weather || "").includes("阴") */}
                  {((nightData.weather || "").includes("大雨") ||
                    (nightData.weather || "").includes("暴雨")) && (
                    <span className="text-lg mr-1" role="img" aria-label="rainy">
                      ⛈️
                    </span>
                  )}
                  {(nightData.weather || "").includes("小雨") && (
                    <span className="text-lg mr-1" role="img" aria-label="rainy">
                      🌧
                    </span>
                  )}
                  {/* <i
                                        className={`fas ${(nightData.weather || "").includes("雨")
                                            ? "fa-cloud-rain"
                                            : (nightData.weather || "").includes("多云") ||
                                                (nightData.weather || "").includes("阴")
                                                ? "fa-cloud"
                                                : (nightData.weather || "").includes("晴")
                                                    ? "fa-moon"
                                                    : "fa-cloud"
                                            } text-lg mr-1`}
                                        style={{
                                            color: (nightData.weather || "").includes("雨")
                                                ? "#409EFF"
                                                : (nightData.weather || "").includes("多云") ||
                                                    (nightData.weather || "").includes("阴")
                                                    ? "#555"
                                                    : (nightData.weather || "").includes("晴")
                                                        ? "blue"
                                                        : "gray",
                                        }}
                                    ></i> */}
                  <span className="text-sm capitalize">
                    {weatherConditions.find((c) => c.value === normalizeCondition(nightData.weather))
                      ?.label ??
                      nightData.weather ??
                      "-"}
                  </span>
                </div>
                <div className="text-sm font-semibold">
                  {nightData.min_temperature}~{nightData.max_temperature}°C
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
                  <span>湿度: {Math.max(0, nightData.humidity ?? 0)}%</span>
                  <span>|</span>
                  <span>风速: {parseFloat(Number(nightData.wind_speed).toFixed(0))} km/h</span>
                  <span>|</span>
                  <span>
                    降水:{" "}
                    {nightData.precipitation > 0
                      ? `${Math.min(10, nightData.precipitation ?? 0).toFixed(2)}mm`
                      : "无"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherDetail;
