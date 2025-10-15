import React from "react";

export type ChartPanel = {
  title: string;
  id: string;
  heightClass?: string;
};

type ChartDashboardProps = {
  panels?: ChartPanel[]; // 默认包含算力趋势与单价趋势
  cols?: 1 | 2 | 3 | 4 | 5 | 6; // 默认 2 列
  gapClass?: string; // 默认 gap-6
  className?: string; // 额外样式
};

const ChartDashboard: React.FC<ChartDashboardProps> = () => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <div className="text-gray-500 mb-2">算力趋势</div>
        <div id="powerTrend" className="h-64"></div>
      </div>
      <div>
        <div className="text-gray-500 mb-2">单价趋势</div>
        <div id="priceTrend" className="h-64"></div>
      </div>
    </div>
  );
};

export default ChartDashboard;
