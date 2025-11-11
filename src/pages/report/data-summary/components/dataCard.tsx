import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import { fetchBtcMarketInfo } from "../../api";
import { formatAmount } from "@/utils/num";

export type DataCardItem = {
  dailyYield: number;
  hashRate: number;
  hashRateDiffPercent: number;
  price: string;
  priceDiffPercent: number;
  yieldDiffPercent: number;
  hashRateDate: string;
  btcPriceDate: string;
  //  "dailyYield": 496.875,
  //     "hashRate": 1159.63,
  //     "hashRateDiffPercent": -11.17,
  //     "price": "111042.13",
  //     "priceDiffPercent": 0.84,
  //     "yieldDiffPercent": -11.17
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
        // console.log(response.data);
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
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex items-stretch gap-4">
          <div className="flex-none w-55">
            <div className="text-gray-500 mb-2">全网算力（{data.hashRateDate}）</div>
            <div className="text-2xl">
              {formatAmount(data.hashRate, 2, "", false)}

              {data.hashRateDiffPercent > 0 ? (
                <span className="text-green-500 text-sm" style={{ marginLeft: "8px" }}>
                  {data.hashRateDiffPercent} %
                  {/* {formatAmount(data.hashRateDiffPercent, 2, "%", false)} 增加 */}
                </span>
              ) : (
                <span className="text-red-500 text-sm" style={{ marginLeft: "8px" }}>
                  {data.hashRateDiffPercent} %
                  {/* {formatAmount(data.hashRateDiffPercent, 2, "%", false)} 减少 */}
                </span>
              )}
            </div>
          </div>
          {/* <div className="flex-1 h-[80px] overflow-hidden">
            <ChartSuanliCard
              loading={loading}
              hashRateDiffPercent={data.hashRateDiffPercent}
              chartDate={chartDate}
            />
          </div> */}
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="text-gray-500 mb-2">全网日产出</div>
          <div className="text-2xl">
            {formatAmount(data.dailyYield, 2, "", false)}
            {data.yieldDiffPercent > 0 ? (
              <span className="text-green-500 text-sm" style={{ marginLeft: "8px" }}>
                {data.yieldDiffPercent} %{/* {formatAmount(data.hashRateDiffPercent, 2, "%", false)} 增加 */}
              </span>
            ) : (
              <span className="text-red-500 text-sm" style={{ marginLeft: "8px" }}>
                {data.yieldDiffPercent} %{/* {formatAmount(data.hashRateDiffPercent, 2, "%", false)} 减少 */}
              </span>
            )}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex  items-stretch gap-4">
          <div className="flex-none w-55">
            <div className="text-gray-500 mb-2">币价 $（{data.btcPriceDate}）</div>
            <div className="text-2xl">
              {formatAmount(data.price, 2, "", false)}

              {data.priceDiffPercent > 0 ? (
                <span className="text-green-500 text-sm" style={{ marginLeft: "6px" }}>
                  + {data.priceDiffPercent} %
                  {/* {formatAmount(data.hashRateDiffPercent, 2, "%", false)} 增加 */}
                </span>
              ) : (
                <span className="text-red-500 text-sm" style={{ marginLeft: "6px" }}>
                  {data.priceDiffPercent} %
                  {/* {formatAmount(data.hashRateDiffPercent, 2, "%", false)} 减少 */}
                </span>
              )}
            </div>
          </div>
          {/* <div className="flex-1 h-[80px] overflow-hidden">
            <ChartPriceCard
              loading={loading}
              priceDiffPercent={data.priceDiffPercent}
              chartDate={chartDate}
            />
          </div> */}
        </div>
      </div>
    </Spin>
  );
};

export default DataCardGrid;
