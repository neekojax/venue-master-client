import React from "react";
// import { Spin } from "antd";
import ChartPrice from "./chartPrice";
import ChartSuanli from "./chartSuanli";

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
  loading?: boolean;
  onLoaded?: () => void;
};

const ChartDashboard: React.FC<ChartDashboardProps & { chartDate: string }> = ({ chartDate, loading }) => {
  return (
    <>
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-gray-500 mb-2">全网算力(EH/s)</div>
          <ChartSuanli loading={loading} chartDate={chartDate} />
          {/* <div id="powerTrend" className="h-64"></div> */}
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-gray-500 mb-2">币价趋势（USD）</div>
          <ChartPrice loading={loading} chartDate={chartDate} />
          {/* <div id="priceTrend" className="h-64"></div> */}
        </div>
      </div>
    </>
  );
};

export default ChartDashboard;
