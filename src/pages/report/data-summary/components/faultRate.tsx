import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import BarFaultData from "./BarFaultData";
import FaultRateTable from "./faultRateTable";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchMachineStat } from "@/pages/report/api.tsx";

export type MachineStat = {
  TotalFailure: number;
  TotalFailureRate: number;
  TotalNewFailure: number;
  TotalNewFailureRate: number;
  HeadDissMachineStats: FaultDetail[];
  lastestRegionFailure: FaultDetail[];
  RegionMachineStat: FaultDetail[];
};

export type FaultDetail = {
  Date: string;
  Category: string;
  TotalMachine: number;
  TotalFailure: number;
  NewFailure: number;
  NewFailureRate: number;
};

const FaultRate: React.FC<{ chartDate: string; loading?: boolean; onLoaded?: () => void }> = ({
  chartDate,
  loading,
  onLoaded,
}) => {
  // const [internalRefreshKey, setInternalRefreshKey] = useState(0);
  // const refreshKey = useState("")
  // const effectiveKey = refreshKey ?? internalRefreshKey;

  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [data, setData] = useState<MachineStat>({
    TotalFailure: 0,
    TotalFailureRate: 0,
    TotalNewFailure: 0,
    TotalNewFailureRate: 0,
    HeadDissMachineStats: [],
    lastestRegionFailure: [],
    RegionMachineStat: [],
  });

  // 获取数据
  const fetchData = async () => {
    try {
      const resp = await fetchMachineStat(chartDate, poolType);
      const response: MachineStat = resp.data;
      console.log(response);
      setData(response);
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

  // const handleRefresh = () => {
  //   fetchData();
  //   // if (onRefresh) {
  //   //   onRefresh();
  //   // } else {
  //   //   setInternalRefreshKey((k) => k + 1);
  //   // }
  // };

  return (
    <Spin spinning={!!loading}>
      <div className={`bg-white rounded-lg p-6 shadow-sm`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-lg">
            <i className="fas fa-robot text-blue-500"></i>
            <span>故障率</span>
          </div>
          {/* <button
            type="button"
            onClick={handleRefresh}
            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
          >
            刷新
          </button> */}
        </div>

        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1">
            <div className="bg-gray-50 rounded-lg p-4 h-[184px] border border-gray-100">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-gray-500">新增故障台数</div>
                    <div className="text-2xl text-gray-800">{data.TotalNewFailure}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-gray-500">新增故障率</div>
                    <div className="text-2xl text-gray-800">{data.TotalNewFailureRate}%</div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-gray-500">总故障台数</div>
                    <div className="text-2xl">{data.TotalFailure}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-gray-500">总故障率</div>
                    <div className="text-2xl">{data.TotalFailureRate}%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto mb-6">
          <FaultRateTable
            tableProps={{
              columns: [
                {
                  title: "地区",
                  dataIndex: "Category",
                },
                {
                  title: "新增故障数",
                  dataIndex: "NewFailure",
                },
                {
                  title: "新增故障率",
                  dataIndex: "NewFailureRate",
                  render: (value) => `${value.toFixed(2)}%`,
                },
                {
                  title: "总故障台数",
                  dataIndex: "TotalFailure",
                },
              ],
              dataSource: data?.RegionMachineStat ?? [],
              pagination: false,
            }}
          />
        </div>

        <div className="overflow-x-auto mb-6">
          <FaultRateTable
            tableProps={{
              columns: [
                {
                  title: "类型",
                  dataIndex: "Category",
                },
                {
                  title: "新增故障数",
                  dataIndex: "NewFailure",
                },
                {
                  title: "新增故障率",
                  dataIndex: "NewFailureRate",
                  render: (value) => `${value.toFixed(2)}%`,
                },
                {
                  title: "总故障台数",
                  dataIndex: "TotalFailure",
                },
              ],
              dataSource: data?.HeadDissMachineStats ?? [],
              pagination: false,
            }}
          />
        </div>

        <div className="mb-6">
          <BarFaultData data={data.lastestRegionFailure} />
        </div>
      </div>
    </Spin>
  );
};

export default FaultRate;
