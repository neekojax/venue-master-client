import React from "react";
import { WEATHER_ICONS_BY_ID } from "./constants";
type Props = {
  weatherId?: number;
  size?: number;
};

export function WeatherIcon({ weatherId, size = 40 }: Props) {
  const node = weatherId ? WEATHER_ICONS_BY_ID[weatherId] : undefined;
  if (!node) return null;
  if (!React.isValidElement(node)) return null;
  const prevStyle = (node.props as { style?: React.CSSProperties }).style || {};
  return React.cloneElement(node as React.ReactElement, {
    style: { ...prevStyle, width: size, height: size, color: "initial" },
  });
}
