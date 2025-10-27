import React from "react";
import { Link } from "react-router-dom";
import { Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import SitePerformanceCard from "./SitePerformanceCard";

interface DailyData {
  Date: string; // 日期
  VenueName: string; // 场馆名称
  TheoreticalPower: number; // 理论算力
  HostedMachine: number; // 托管机器数量
  Power24h: number; // 24小时算力
  HashEffectiveRate: number; // 算力有效率（%）
  HighTemperatureImpactPower: number; // 高温影响算力
  HighTemperatureImpactRate: number; // 高温影响率（%）
  LimitImpactPower: number; // 限电影响算力
  LimitImpactRate: number; // 限电影响率（%）
  Failure: number; // 故障数量
  FailureRate: number; // 故障率（%）
  PendingRepair: number;
  PendingRepairRate: number; // 待维修率（%）
}
interface DataItem {
  venue_id: number; // 场馆 ID
  venue_name: string; // 场馆名称
  collection: number;
  average_thermal_power: number; // 平均理论算力
  average_power_24h: number; // 平均24小时算力
  average_hash_effective_rate: number; // 平均算力有效率（%）
  average_failure_rate: number; // 平均故障率（%）
  average_high_temperature_impact_rate: number; // 平均高温影响率（%）
  average_limit_impact_rate: number; // 平均限电影响率（%）
  average_pending_repair_rate: number; // 平均待维修率（%）
  hash_effective_diff_rate: number; // 算力有效率差异（%）
  daily_items: DailyData[];
}

interface VenueTableProps {
  data: DataItem[];
}

const VenuePage: React.FC<VenueTableProps> = ({ data }) => {
  const columns: ColumnsType<DataItem> = [
    {
      title: "场地名称",
      dataIndex: "venue_name",
      key: "venue_name",
      align: "left",
      width: 250,
      sorter: (a: DataItem, b: DataItem) => a.venue_name.localeCompare(b.venue_name),
      // defaultSortOrder: "ascend", // ✅ 默认升序
      render: (text: string, record: { venue_name?: any; venue_id?: any }) => {
        const isSpecialVenue = text === "Arct-HF01-J XP-AR-US" || text === "ARCT Technologies-HF02-AR-US";
        return (
          <Tooltip title={text} placement="top" style={{ color: "white" }}>
            <div
              style={{
                width: "100%",
                overflow: "hidden",
                color: isSpecialVenue ? "red" : "#333", // 特殊场地字体颜色为红色
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontWeight: isSpecialVenue ? "bold" : "normal", // 加粗特殊场地
              }}
            >
              {isSpecialVenue && (
                <Tag color="red" style={{ marginLeft: 2 }}>
                  补充
                </Tag>
              )}

              <Link to={`/venue/detail/${record.venue_id}`} className="text-blue-500 hover:underline">
                {text}
              </Link>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "理论算力 (PH/s)",
      dataIndex: "average_thermal_power",
      key: "average_thermal_power",
      align: "center",
      render: (value: number) => value?.toFixed(3),
    },
    {
      title: "实际算力 (PH/s)",
      dataIndex: "average_power_24h",
      key: "average_power_24h",
      align: "center",
      render: (value: number) => value?.toFixed(3),
    },
    {
      title: "算力有效率",
      dataIndex: "average_hash_effective_rate",
      key: "average_hash_effective_rate",
      align: "center",
      sorter: (a, b) => a.average_hash_effective_rate - b.average_hash_effective_rate,
      render: (value: number, record: { hash_effective_diff_rate?: number }) => {
        const diff = record?.hash_effective_diff_rate ?? 0;
        const isIncrease = diff > 0;
        const barColor = isIncrease ? "bg-green-500" : diff < 0 ? "bg-red-500" : "bg-gray-400";
        const indicatorColor = isIncrease ? "text-green-600" : diff < 0 ? "text-red-600" : "text-gray-500";
        const arrow = isIncrease ? "↑ " : diff < 0 ? "↓ " : "→ ";
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className={`${barColor} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
            </div>
            <span>{value}%</span>
            <span className={`${indicatorColor} text-xs ml-1`}>
              {arrow}
              {Math.abs(diff).toFixed(2)}%
            </span>
          </div>
        );
      },
    },
    {
      title: "故障率",
      dataIndex: "average_failure_rate",
      key: "average_failure_rate",
      align: "center",
      sorter: (a, b) => a.average_failure_rate - b.average_failure_rate,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${value}%` }}></div>
          </div>
          <span>{value}%</span>
        </div>
      ),
    },
    {
      title: "待修率",
      dataIndex: "average_pending_repair_rate",
      key: "average_pending_repair_rate",
      align: "center",
      sorter: (a, b) => a.average_pending_repair_rate - b.average_pending_repair_rate,
      render: (value) => <span className="text-orange-500">{value}%</span>,
    },
    {
      title: "高温影响率",
      dataIndex: "average_high_temperature_impact_rate",
      key: "average_high_temperature_impact_rate",
      align: "center",
      sorter: (a, b) => a.average_high_temperature_impact_rate - b.average_high_temperature_impact_rate,
      render: (value) => <span className="text-orange-500">{value}%</span>,
    },
    {
      title: "限电影响率",
      dataIndex: "average_limit_impact_rate",
      key: "average_limit_impact_rate",
      align: "center",
      sorter: (a, b) => a.average_limit_impact_rate - b.average_limit_impact_rate,
      render: (value) => <span className="text-yellow-500">{value}%</span>,
    },
  ];

  return (
    <SitePerformanceCard
      columns={columns}
      data={data}
      onSearch={(val) => console.log("搜索:", val)}
      // onFilterAll={() => console.log("全部场地")}
      // onFilterTop={() => console.log("Top 5")}
      // onFilterBottom={() => console.log("Bottom 5")}
    />
  );
};

export default VenuePage;
