import React, { useEffect, useMemo, useRef, useState } from "react";

export type RegionFaultItem = {
  region: string;
  newFaultCount: number;
  newFaultRate: number; // 单位：百分比，例如 0.18 表示 0.18%
  totalFaultCount: number;
};

export type TypeFaultItem = {
  type: string;
  newFaultCount: number;
  newFaultRate: number; // 单位：百分比，例如 0.18 表示 0.18%
  totalFaultCount: number;
};

export type FaultRateProps = {
  title?: string;
  summary?: {
    newFaultUnits: number;
    newFaultRate: number | string; // 支持字符串 "0.18%" 或数字 0.18
    totalFaultUnits: number;
    totalFaultRate: number | string; // 支持字符串 "1.2%" 或数字 1.2
  };
  regionData?: RegionFaultItem[];
  typeData?: TypeFaultItem[];
  chartId?: string; // 默认 "faultRate"
  onInitChart?: (el: HTMLDivElement) => void; // 可选图表初始化回调
  className?: string;
  style?: React.CSSProperties;
  refreshKey?: number | string; // 外部控制刷新变量
  onRefresh?: () => void; // 点击刷新按钮时的回调
};

const FaultRate: React.FC<FaultRateProps> = ({
  title = "故障率",
  summary,
  regionData,
  typeData,
  chartId = "faultRate",
  onInitChart,
  className = "",
  style,
  refreshKey,
  onRefresh,
}) => {
  const [internalRefreshKey, setInternalRefreshKey] = useState(0);
  const effectiveKey = refreshKey ?? internalRefreshKey;

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      setInternalRefreshKey((k) => k + 1);
    }
  };

  // 为示例数据生成一次随机值，避免每次渲染都变化
  const defaultRegionData = useMemo<RegionFaultItem[]>(() => {
    const regions = ["北美", "阿曼", "埃塞俄比亚", "巴拉圭"];
    return regions.map((region) => ({
      region,
      newFaultCount: Math.floor(Math.random() * 10),
      newFaultRate: +(Math.random() * 0.5).toFixed(2),
      totalFaultCount: Math.floor(Math.random() * 20),
    }));
  }, [effectiveKey]);

  const defaultTypeData = useMemo<TypeFaultItem[]>(() => {
    return ["风冷", "水冷"].map((type) => ({
      type,
      newFaultCount: Math.floor(Math.random() * 10),
      newFaultRate: +(Math.random() * 0.5).toFixed(2),
      totalFaultCount: Math.floor(Math.random() * 20),
    }));
  }, [effectiveKey]);

  const s = summary ?? {
    newFaultUnits: 12,
    newFaultRate: 0.18,
    totalFaultUnits: 45,
    totalFaultRate: 1.2,
  };

  const chartRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (chartRef.current && onInitChart) {
      onInitChart(chartRef.current);
    }
  }, [onInitChart, effectiveKey]);

  const regions = regionData ?? defaultRegionData;
  const types = typeData ?? defaultTypeData;

  const formatRate = (rate: number | string) => {
    if (typeof rate === "string") return rate;
    return `${rate}%`;
  };

  return (
    <div className={`bg-white rounded-lg p-6 shadow-sm ${className}`} style={style}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-lg">
          <i className="fas fa-robot text-blue-500"></i>
          <span>{title}</span>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50"
        >
          刷新
        </button>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4 h-[184px] border border-gray-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-gray-500">新增故障台数</div>
                  <div className="text-2xl text-gray-800">{s.newFaultUnits}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-gray-500">新增故障率</div>
                  <div className="text-2xl text-gray-800">{formatRate(s.newFaultRate)}</div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-gray-500">总故障台数</div>
                  <div className="text-2xl">{s.totalFaultUnits}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-gray-500">总故障率</div>
                  <div className="text-2xl">{formatRate(s.totalFaultRate)}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left w-[20%]">地区</th>
              <th className="p-3 text-left w-[25%]">新增故障数</th>
              <th className="p-3 text-left w-[25%]">新增故障率</th>
              <th className="p-3 text-left w-[30%]">总故障台数</th>
            </tr>
          </thead>
          <tbody>
            {regions.map((item) => (
              <tr key={item.region} className="border-b border-gray-200">
                <td className="p-3">{item.region}</td>
                <td className="p-3">{item.newFaultCount}</td>
                <td className="p-3">{`${item.newFaultRate}%`}</td>
                <td className="p-3">{item.totalFaultCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="overflow-x-auto mb-6">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left w-[20%]">类型</th>
              <th className="p-3 text-left w-[25%]">新增故障数</th>
              <th className="p-3 text-left w-[25%]">新增故障率</th>
              <th className="p-3 text-left w-[30%]">总故障台数</th>
            </tr>
          </thead>
          <tbody>
            {types.map((item) => (
              <tr key={item.type} className="border-b border-gray-200">
                <td className="p-3">{item.type}</td>
                <td className="p-3">{item.newFaultCount}</td>
                <td className="p-3">{`${item.newFaultRate}%`}</td>
                <td className="p-3">{item.totalFaultCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mb-6">
        <div className="text-gray-500 mb-2">近三天新增故障率</div>
        <div id={chartId} ref={chartRef} className="h-64"></div>
      </div>
    </div>
  );
};

export default FaultRate;
