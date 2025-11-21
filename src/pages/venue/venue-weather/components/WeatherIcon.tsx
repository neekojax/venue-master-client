import React from "react";
import { Cloud, CloudLightning, CloudRain, CloudSnow, CloudSun, Moon, Sun } from "lucide-react";
import { WeatherCondition } from "../types/weather";

interface Props {
  condition: WeatherCondition;
  className?: string;
  isNight?: boolean;
}

export const WeatherIcon: React.FC<Props> = ({ condition, className, isNight }) => {
  // const weatherConditions = [
  //     { label: "晴天", value: "sunny" },
  //     { label: "多云", value: "cloudy" },
  //     { label: "雷暴", value: "storm" },
  // ];

  if (isNight && (condition === "sunny" || condition === "clear")) {
    return <Moon className={className} />;
  }

  switch (condition) {
    case "sunny":
    case "clear":
      return <Sun className={className} />;
    case "cloudy":
      return <Cloud className={className} />;
    case "rainy":
      return <CloudRain className={className} />;
    case "snowy":
      return <CloudSnow className={className} />;
    case "stormy":
      return <CloudLightning className={className} />;
    case "partly-cloudy":
      return <CloudSun className={className} />;
    default:
      return <Sun className={className} />;
  }
};
