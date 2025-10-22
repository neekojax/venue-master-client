import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import { fetchBtcMarketInfo } from "../../api";
import ChartPriceCard from "./chartPriceCard";
// import ChartPrice from "./chartPrice";
import ChartSuanliCard from "./chartSuanliCard";

export type DataCardItem = {
  dailyYield: number;
  hashRate: number;
  price: string;
};

const DataCardGrid: React.FC<{ chartDate: string; loading?: boolean; onLoaded?: () => void }> = ({
  chartDate,
  loading,
  onLoaded,
}) => {
  const colsClass = "grid-cols-3";
  const [data, setData] = useState<DataCardItem>({} as DataCardItem);

  useEffect(() => {
    // setLoading(true);
    fetchBtcMarketInfo(chartDate)
      .then((response) => {
        console.log(response.data);
        setData(response.data);
        onLoaded?.();
      })
      .catch((error) => {
        console.log(error);
        onLoaded?.();
      });
  }, [chartDate, onLoaded]);
  return (
    <Spin spinning={loading}>
      <div className={["grid", colsClass, "gap-4", "mb-6"].join(" ").trim()}>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-gray-500 mb-2">算力 EH/s</div>
            <div className="text-2xl">{data.hashRate}</div>
          </div>
          <ChartSuanliCard loading={loading} chartDate={chartDate} />
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="text-gray-500 mb-2">全网日产出</div>
          <div className="text-2xl">{data.dailyYield}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-center justify-between">
          <div>
            <div className="text-gray-500 mb-2">单价 $</div>
            <div className="text-2xl">{data.price}</div>
          </div>
          <ChartPriceCard loading={loading} chartDate={chartDate} />
        </div>
      </div>
    </Spin>
  );
};

export default DataCardGrid;
