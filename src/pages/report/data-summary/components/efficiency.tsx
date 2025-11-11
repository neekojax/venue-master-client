import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Spin } from "antd";
import BarEfficiencyData from "./BarEfficiencyData";
import EfficiencyBase from "./efficiencyBase";
import EfficiencyTable from "./efficiencyTable";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchEfficiencyStat } from "@/pages/report/api.tsx";

export type EfficiencyDetail = {
  Date: string;
  Category: string;
  EffectivePower: number;
  Efficiency: number;
  DailyOutput: number;
  CumulativeOutput: number;
  TheoreticalHashrate: number;
};

export type EfficiencyStat = {
  cumulativeOutput: number;
  dailyOutput: number;
  hashEffective: number;
  totalHash: number;
  headDissPowerStats: EfficiencyDetail[];
  lastestRegionEfficiency: EfficiencyDetail[];
  mtdOutput: number;
  networkHashRate: number;
  regionPowerStat: EfficiencyDetail[];
};

const Efficiency: React.FC<{ chartDate: string; loading?: boolean; onLoaded?: () => void }> = ({
  chartDate,
  loading,
  onLoaded,
}) => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [data, setData] = useState<EfficiencyStat>({
    cumulativeOutput: 0,
    dailyOutput: 0,
    hashEffective: 0,
    headDissPowerStats: [],
    lastestRegionEfficiency: [],
    mtdOutput: 0,
    totalHash: 0,
    networkHashRate: 0,
    regionPowerStat: [],
  });

  // 获取数据
  const fetchData = async () => {
    try {
      const resp = await fetchEfficiencyStat(chartDate, poolType);
      const response: EfficiencyStat = resp.data;
      console.log(response);
      setData(response);
      // setDates(response.data.map((item) => item.date).reverse());
      // setHashValues(response.data.map((item) => item.openPrice).reverse());

      // 处理响应数据
    } catch (error) {
      // 处理错误
      console.log(error);
    } finally {
      onLoaded?.();
    }
  };

  useEffect(() => {
    fetchData();
  }, [chartDate, poolType]);

  return (
    <Spin spinning={!!loading}>
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-lg">
            <i className="fas fa-tachometer-alt text-blue-500"></i>
            <span>CANGO - 效率</span>
          </div>
          <div className="text-sm text-gray-400">
            <Link to="/report/data-summary/list" className="text-blue-500 hover:underline">
              查看更多
            </Link>
          </div>
        </div>
        <EfficiencyBase data={data} />
        <div className="overflow-x-auto mb-6">
          <EfficiencyTable
            tableProps={{
              columns: [
                {
                  title: "地区",
                  dataIndex: "Category",
                  key: "Category",
                },
                {
                  title: "有效算力",
                  dataIndex: "EffectivePower",
                  key: "EffectivePower",
                  render: (value) => `${value.toFixed(2)} EH/s`,
                },
                {
                  title: "有效率",
                  dataIndex: "Efficiency",
                  key: "Efficiency",
                  render: (value) => `${value.toFixed(2)}%`,
                },
                {
                  title: "日产出",
                  dataIndex: "DailyOutput",
                  key: "DailyOutput",
                  render: (value) => `${value.toFixed(2)}`,
                },
                {
                  title: "累计产出",
                  dataIndex: "CumulativeOutput",
                  key: "CumulativeOutput",
                  render: (value) => `${value.toFixed(2)}`,
                },
              ],
              dataSource: data.regionPowerStat,
              pagination: false,
            }}
          />
        </div>
        <div className="overflow-x-auto mb-6">
          <EfficiencyTable
            tableProps={{
              columns: [
                {
                  title: "类型",
                  dataIndex: "Category",
                  key: "Category",
                },
                {
                  title: "有效算力",
                  dataIndex: "EffectivePower",
                  key: "EffectivePower",
                  render: (value) => `${value.toFixed(2)} EH/s`,
                },
                {
                  title: "有效率",
                  dataIndex: "Efficiency",
                  key: "Efficiency",
                  render: (value) => `${value.toFixed(2)}%`,
                },
                {
                  title: "日产出",
                  dataIndex: "DailyOutput",
                  key: "DailyOutput",
                  render: (value) => `${value.toFixed(2)}`,
                },
                {
                  title: "累计产出",
                  dataIndex: "CumulativeOutput",
                  key: "CumulativeOutput",
                  render: (value) => `${value.toFixed(2)}`,
                },
              ],
              dataSource: data.headDissPowerStats,
              pagination: false,
            }}
          />
        </div>
        <div className="mb-1">
          <BarEfficiencyData data={data.lastestRegionEfficiency} />
        </div>
      </div>
    </Spin>
  );
};

export default Efficiency;
