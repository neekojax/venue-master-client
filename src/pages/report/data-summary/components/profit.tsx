import { useEffect, useState } from "react";
import { fetchProfitStat } from "../../api";
import MonthData from "./monthData";
import ProfitTable from "./profitTable";
import { useSelector, useSettingsStore } from "@/stores";
import { formatAmount } from "@/utils/num";

export type Financials = {
  category: string;
  income_usd: number;
  income_btc: number;
  hosting_fee: number;
  maintenance_fee: number;
  per_coin_cost: number;
};

export type ProfitStat = {
  dailyIncomeUSD: number;
  accumulatedDepreciationPerCoinCost: number;
  accumulatedHostingFee: number;
  accumulatedIncomeUSD: number;
  accumulatedMaintenanceFee: number;
  accumulatedPerCoinCost: number;
  dailyHeadDissFinancialsArray: Financials[];
  accumulatedRegionFinancials: Financials[];
  accumulatedHeadDissFinancials: Financials[];
  dailyRegionFinancials: Financials[];
};

const Profit: React.FC<{ chartDate: string }> = ({ chartDate }) => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [profitStat, setProfitStat] = useState<ProfitStat>({
    dailyIncomeUSD: 0,
    accumulatedDepreciationPerCoinCost: 0,
    accumulatedHostingFee: 0,
    accumulatedIncomeUSD: 0,
    accumulatedMaintenanceFee: 0,
    accumulatedPerCoinCost: 0,
    dailyHeadDissFinancialsArray: [],
    accumulatedRegionFinancials: [],
    accumulatedHeadDissFinancials: [],
    dailyRegionFinancials: [],
  });

  const fetchProfitStatData = async () => {
    if (!chartDate) {
      return;
    }
    const data = await fetchProfitStat(chartDate, poolType);
    console.log(data);
    setProfitStat(data.data);
  };

  useEffect(() => {
    if (!chartDate) {
      return;
    }
    fetchProfitStatData();
  }, [chartDate]);

  return (
    <div className="col-span-2 bg-white rounded-lg p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-lg">
          <i className="fas fa-chart-pie text-blue-500"></i>
          <span>利润 - 预估 (单位: $)</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="text-gray-500 mb-2">日产出价值</div>
          <div className="text-2xl">$ {formatAmount(profitStat.dailyIncomeUSD, 2, "", false)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="text-gray-500 mb-2">累计产出价值</div>
          <div className="text-2xl">$ {formatAmount(profitStat.accumulatedIncomeUSD, 2, "", false)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="text-gray-500 mb-2">累计单币成本</div>
          <div className="text-2xl">$ {formatAmount(profitStat.accumulatedPerCoinCost, 2, "", false)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="text-gray-500 mb-2">累计托管费</div>
          <div className="text-2xl">$ {formatAmount(profitStat.accumulatedHostingFee, 2, "", false)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="text-gray-500 mb-2">累计单币成本-含折旧</div>
          <div className="text-2xl">
            $ {formatAmount(profitStat.accumulatedDepreciationPerCoinCost, 2, "", false)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
          <div className="text-gray-500 mb-2">累计运维费</div>
          <div className="text-2xl">$ {formatAmount(profitStat.accumulatedMaintenanceFee, 2, "", false)}</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="overflow-x-auto border-gray-200 pb-6">
            <ProfitTable
              tableProps={{
                columns: [
                  {
                    title: "地区",
                    dataIndex: "category",
                  },
                  {
                    title: "日产出价值",
                    dataIndex: "income_usd",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                  {
                    title: "日托管费",
                    dataIndex: "hosting_fee",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                  {
                    title: "日运维费",
                    dataIndex: "maintenance_fee",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                  {
                    title: "日单币成本",
                    dataIndex: "per_coin_cost",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                ],
                dataSource: profitStat?.dailyRegionFinancials ?? [],
                pagination: false,
              }}
            />
          </div>
          {/* <div className="overflow-x-auto pt-4">
            <ProfitTable
              tableProps={{
                columns: [
                  {
                    title: "类型",
                    dataIndex: "category",
                  },
                  {
                    title: "日产出价值",
                    dataIndex: "income_usd",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                  {
                    title: "日托管费",
                    dataIndex: "hosting_fee",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                  {
                    title: "日运维费",
                    dataIndex: "maintenance_fee",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                  {
                    title: "日单币成本",
                    dataIndex: "per_coin_cost",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                ],
                dataSource: profitStat?.dailyHeadDissFinancialsArray ?? [],
                pagination: false,
              }}
            />
          </div> */}
        </div>
        <div className="space-y-6">
          <div>
            <div className="overflow-x-auto  border-gray-200 pb-6">
              <ProfitTable
                tableProps={{
                  columns: [
                    {
                      title: "地区",
                      dataIndex: "category",
                    },
                    {
                      title: "累计产出价值",
                      dataIndex: "income_usd",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                    {
                      title: "累计托管费",
                      dataIndex: "hosting_fee",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                    {
                      title: "累计运维费",
                      dataIndex: "maintenance_fee",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                    {
                      title: "累计单币成本",
                      dataIndex: "per_coin_cost",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                  ],
                  dataSource: profitStat?.accumulatedRegionFinancials ?? [],
                  pagination: false,
                }}
              />
            </div>
          </div>
          {/* <div>
            <div className="overflow-x-auto pt-4">
              <ProfitTable
                tableProps={{
                  columns: [
                    {
                      title: "类型",
                      dataIndex: "category",
                    },
                    {
                      title: "累计产出价值",
                      dataIndex: "income_usd",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                    {
                      title: "累计托管费",
                      dataIndex: "hosting_fee",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                    {
                      title: "累计运维费",
                      dataIndex: "maintenance_fee",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                    {
                      title: "累计单币成本",
                      dataIndex: "per_coin_cost",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                  ],
                  dataSource: profitStat?.accumulatedHeadDissFinancials ?? [],
                  pagination: false,
                }}
              />
            </div>
          </div> */}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* <div className="overflow-x-auto border-gray-200 pb-6">
            <ProfitTable
              tableProps={{
                columns: [
                  {
                    title: "地区",
                    dataIndex: "category",
                  },
                  {
                    title: "日产出价值",
                    dataIndex: "income_usd",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                  {
                    title: "日托管费",
                    dataIndex: "hosting_fee",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                  {
                    title: "日运维费",
                    dataIndex: "maintenance_fee",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                  {
                    title: "日单币成本",
                    dataIndex: "per_coin_cost",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                ],
                dataSource: profitStat?.dailyRegionFinancials ?? [],
                pagination: false,
              }}
            />
          </div> */}
          <div className="overflow-x-auto pt-4">
            <ProfitTable
              tableProps={{
                columns: [
                  {
                    title: "类型",
                    dataIndex: "category",
                  },
                  {
                    title: "日产出价值",
                    dataIndex: "income_usd",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                  {
                    title: "日托管费",
                    dataIndex: "hosting_fee",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                  {
                    title: "日运维费",
                    dataIndex: "maintenance_fee",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                  {
                    title: "日单币成本",
                    dataIndex: "per_coin_cost",
                    render: (value) => `${formatAmount(value, 2, "", false)}`,
                  },
                ],
                dataSource: profitStat?.dailyHeadDissFinancialsArray ?? [],
                pagination: false,
              }}
            />
          </div>
        </div>
        <div className="space-y-6">
          {/* <div>
            <div className="overflow-x-auto  border-gray-200 pb-6">
              <ProfitTable
                tableProps={{
                  columns: [
                    {
                      title: "地区",
                      dataIndex: "category",
                    },
                    {
                      title: "累计产出价值",
                      dataIndex: "income_usd",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                    {
                      title: "累计托管费",
                      dataIndex: "hosting_fee",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                    {
                      title: "累计运维费",
                      dataIndex: "maintenance_fee",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                    {
                      title: "累计单币成本",
                      dataIndex: "per_coin_cost",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                  ],
                  dataSource: profitStat?.accumulatedRegionFinancials ?? [],
                  pagination: false,
                }}
              />
            </div>
          </div> */}
          <div>
            <div className="overflow-x-auto pt-4">
              <ProfitTable
                tableProps={{
                  columns: [
                    {
                      title: "类型",
                      dataIndex: "category",
                    },
                    {
                      title: "累计产出价值",
                      dataIndex: "income_usd",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                    {
                      title: "累计托管费",
                      dataIndex: "hosting_fee",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                    {
                      title: "累计运维费",
                      dataIndex: "maintenance_fee",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                    {
                      title: "累计单币成本",
                      dataIndex: "per_coin_cost",
                      render: (value) => `${formatAmount(value, 2, "", false)}`,
                    },
                  ],
                  dataSource: profitStat?.accumulatedHeadDissFinancials ?? [],
                  pagination: false,
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <MonthData date={chartDate} />
      {/* <div className="bg-gray-50 rounded-lg p-4 mt-6 border border-gray-100">
        <div className="text-lg font-medium mb-4 flex items-center gap-2">
          <i className="fas fa-calendar text-blue-500"></i>
          <span>全月情况（8-1～8-31）</span>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <div className="text-gray-500 mb-2">MTD产出价值</div>
            <div className="text-2xl">272,330.00</div>
          </div>
          <div>
            <div className="text-gray-500 mb-2">MTD托管费</div>
            <div className="text-2xl">54,470.00</div>
          </div>
          <div>
            <div className="text-gray-500 mb-2">MTD运维费</div>
            <div className="text-2xl">27,235.00</div>
          </div>
          <div>
            <div className="text-gray-500 mb-2">MTD净收益</div>
            <div className="text-2xl">190,625.00</div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div>
            <div className="text-gray-500 mb-2">预估全月产出</div>
            <div className="text-2xl">816,990.00</div>
          </div>
          <div>
            <div className="text-gray-500 mb-2">预估全月托管费</div>
            <div className="text-2xl">163,410.00</div>
          </div>
          <div>
            <div className="text-gray-500 mb-2">预估全月运维费</div>
            <div className="text-2xl">81,705.00</div>
          </div>
          <div>
            <div className="text-gray-500 mb-2">预估全月净收益</div>
            <div className="text-2xl">571,875.00</div>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Profit;
