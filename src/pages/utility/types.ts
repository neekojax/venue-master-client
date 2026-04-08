// Import React to provide the React namespace for types like ReactNode
import React from "react";

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: NavItem[];
}

export interface UtilityTool {
  id: string;
  name: string;
  icon: string | React.ReactNode;
  url: string;
  description: string;
}

export interface ChartDataPoint {
  date: string;
  value: number;
}
