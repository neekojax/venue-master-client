import { useEffect, useState } from "react";
import { useSelector, useSettingsStore } from "@/stores";
import { formatAmount } from "@/utils/num";

import { fetchMtdProfitStat } from "@/pages/report/api";

export type MtdProfitStat = {
  // 新增累计与预估字段
  accumulatedHostingFee: number;
  accumulatedIncomeUSD: number;
  accumulatedMaintenanceFee: number;
  accumulatedNetIncome: number;
  // 兼容新的预估字段命名
  estimatedHostingFee: number;
  estimatedIncomeUSD: number;
  estimatedMaintenanceFee: number;
  estimatedNetIncome: number;
  dateRange: string;
};
const MonthData = ({ date }: { date: string }) => {
  const [data, setData] = useState<MtdProfitStat>({
    // 新增累计与预估字段初始化
    accumulatedHostingFee: 0,
    accumulatedIncomeUSD: 0,
    accumulatedMaintenanceFee: 0,
    accumulatedNetIncome: 0,

    estimatedHostingFee: 0,
    estimatedIncomeUSD: 0,
    estimatedMaintenanceFee: 0,
    estimatedNetIncome: 0,
    dateRange: "",
  });
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const fetchData = async () => {
    const resp = await fetchMtdProfitStat(date, poolType);
    // console.log("resp.data", resp.data)
    if (resp.data) {
      setData(resp.data);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  return (
    <div className=" rounded-lg">
      <div className="text-lg font-medium mb-4 flex items-center gap-2">
        <i className="fas fa-calendar text-blue-500"></i>
        <span>全月情况（{data.dateRange}）</span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <div className="text-gray-500 mb-2">MTD产出价值</div>
          <div className="text-2xl">{formatAmount(data.accumulatedIncomeUSD, 0, "", false)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-2">MTD托管费</div>
          <div className="text-2xl">{formatAmount(data.accumulatedHostingFee, 0, "", false)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-2">MTD运维费</div>
          <div className="text-2xl">{formatAmount(data.accumulatedMaintenanceFee, 0, "", false)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-2">MTD净收益</div>
          <div className="text-2xl">{formatAmount(data.accumulatedNetIncome, 0, "", false)}</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div>
          <div className="text-gray-500 mb-2">预估全月产出</div>
          <div className="text-2xl">{formatAmount(data.estimatedIncomeUSD, 0, "", false)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-2">预估全月托管费</div>
          <div className="text-2xl"> {formatAmount(data.estimatedHostingFee, 0, "", false)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-2">预估全月运维费</div>
          <div className="text-2xl"> {formatAmount(data.estimatedMaintenanceFee, 0, "", false)}</div>
        </div>
        <div>
          <div className="text-gray-500 mb-2">预估全月净收益</div>
          <div className="text-2xl">{formatAmount(data.estimatedNetIncome, 0, "", false)}</div>
        </div>
      </div>
    </div>
  );
};

export default MonthData;
