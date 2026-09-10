import React from "react";
import { Progress } from "antd";
import type { ProgressProps } from "antd/es/progress";

export type LocationCardProps = {
  location: {
    name: string;
    temperature: number;
    humidity: number;
    dew_point: number | null;
    last_update: string;
    status: string;
  };
  getTemperatureColor: (temp: number) => ProgressProps["strokeColor"];
  getHumidityColor: (humidity: number) => ProgressProps["strokeColor"];
};

const LocationCard: React.FC<LocationCardProps> = ({ location, getTemperatureColor, getHumidityColor }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-100">
        {location.name}
      </h3>
      {/* 温度信息 */}
      <div className="mb-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 flex items-center">
            <i className="fas fa-thermometer-half mr-2 text-red-500"></i>
            温度
          </span>
          {location.temperature === 0 && location.humidity === 0 && (
            <span
              className="animate-pulse ring-2 ring-red-500 ring-offset-1 shadow-sm"
              style={{
                backgroundColor: "#f5222d",
                color: "#fff",
                borderRadius: 2,
                padding: "0 4px",
                fontSize: 8,
                marginRight: 4,
              }}
            >
              设备异常，请检查设备
            </span>
          )}

          {location.status === "fault" && (
            <>
              <span
                className="animate-pulse ring-2 ring-red-500 ring-offset-1 shadow-sm"
                style={{
                  backgroundColor: "#f5222d",
                  color: "#fff",
                  borderRadius: 2,
                  padding: "0 4px",
                  fontSize: 8,
                  marginRight: 4,
                }}
              >
                设备异常，请检查设备<br></br>
                最后更新时间：{location.last_update}
              </span>
            </>
          )}

          <span className="font-medium text-gray-800">{location.temperature}°C</span>
        </div>
        <Progress
          percent={((location.temperature - 0) / 45) * 100}
          strokeColor={getTemperatureColor(location.temperature)}
          showInfo={false}
          size="small"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0°C</span>
          <span>45°C</span>
        </div>
      </div>
      {/* 湿度信息 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600 flex items-center">
            <i className="fas fa-tint mr-2 text-blue-500"></i>
            湿度
          </span>
          {/* {location.humidity === 0 && (
            <span
              className="animate-pulse ring-2 ring-red-500 ring-offset-1 shadow-sm"
              style={{
                backgroundColor: "#f5222d",
                color: "#fff",
                borderRadius: 2,
                padding: "0 4px",
                fontSize: 8,
                marginRight: 4,
              }}
            >
              设备异常，请检查设备
            </span>
          )} */}
          <span className="font-medium text-gray-800">{location.humidity}%</span>
        </div>
        <Progress
          percent={location.humidity}
          strokeColor={getHumidityColor(location.humidity)}
          showInfo={false}
          size="small"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>0%</span>
          <span>100%</span>
        </div>
      </div>
      <div className="flex justify-between items-center gap-2 mt-5 pt-4 border-t border-gray-100">
        <span className="text-gray-600">凝露值</span>
        <span className="font-medium text-gray-800 whitespace-nowrap">
          {location.dew_point == null ? "--" : `${location.dew_point.toFixed(1)} ℃`}
        </span>
      </div>
    </div>
  );
};

export default LocationCard;
