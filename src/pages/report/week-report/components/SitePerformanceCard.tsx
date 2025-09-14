import React, { useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Table } from "antd";
import type { ColumnsType } from "antd/es/table";

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
}
interface DataItem {
  venue_id: number; // 场馆 ID
  venue_name: string; // 场馆名称
  average_thermal_power: number; // 平均理论算力
  average_power_24h: number; // 平均24小时算力
  average_hash_effective_rate: number; // 平均算力有效率（%）
  average_failure_rate: number; // 平均故障率（%）
  average_high_temperature_impact_rate: number; // 平均高温影响率（%）
  average_limit_impact_rate: number; // 平均限电影响率（%）
  daily_items: DailyData[];
}

interface SitePerformanceCardProps {
  title?: string;
  columns: ColumnsType<DataItem>;
  data: DataItem[];
  onSearch?: (value: string) => void;
  onFilterAll?: () => void;
  onFilterTop?: () => void;
  onFilterBottom?: () => void;
}

const SitePerformanceCard: React.FC<SitePerformanceCardProps> = ({
  title = "场地算力表现",
  columns,
  data,
  onSearch,
  onFilterAll,
  onFilterTop,
  onFilterBottom,
}) => {
  // 过滤后的数据

  const [searchText, setSearchText] = useState("");
  const filteredData = data.filter((item) => {
    const matchesSearchText = item.venue_name.includes(searchText);

    // const isValidDateRange = Array.isArray(dateRange) && dateRange.length === 2;
    // const matchesDateRange =
    //   isValidDateRange && dateRange[0] && dateRange[1]
    //     ? dayjs(log.log_date).isBetween(dateRange[0], dateRange[1], null, "[]")
    //     : true;

    // console.log(log.start_time, log.end_time)
    // const hasDuration = log.start_time && log.end_time;
    // const matchesDuration =
    //   selectedDurationType === "valid" ? hasDuration : selectedDurationType === "empty" ? !hasDuration : true;

    return matchesSearchText;
  });
  return (
    <div className="bg-white p-4 rounded-[4px] border border-[#F0F2F5] shadow-sm">
      {/* 标题 + 操作栏 */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-lg font-bold">{title}</div>
        <div className="flex items-center gap-4">
          <Input
            placeholder="搜索场地..."
            prefix={<SearchOutlined className="text-gray-400" />}
            className="!rounded-button"
            onPressEnter={(e) => onSearch?.((e.target as HTMLInputElement).value)}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)} // 更新搜索文本
          />
          <Button type="primary" className="!rounded-button whitespace-nowrap" onClick={onFilterAll}>
            全部场地
          </Button>
          <Button className="!rounded-button whitespace-nowrap" onClick={onFilterTop}>
            有效率 Top 5
          </Button>
          <Button className="!rounded-button whitespace-nowrap" onClick={onFilterBottom}>
            有效率 Bottom 5
          </Button>
        </div>
      </div>

      {/* 主表格 */}
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{
          total: data.length,
          pageSize: 10,
          showTotal: (total) => `共 ${total} 个场地`,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        className="w-full"
        expandable={{
          expandedRowRender: (record) => {
            const dailyColumns: ColumnsType<DailyData> = [
              {
                title: "日期",
                dataIndex: "Date",
                key: "Date",
                align: "center",
              },
              {
                title: "理论算力 (PH/s)",
                dataIndex: "TheoreticalPower",
                key: "TheoreticalPower",
                align: "center",
                render: (value: number) => value?.toFixed(3),
              },
              {
                title: "实际算力 (PH/s)",
                dataIndex: "Power24h",
                key: "Power24h",
                align: "center",
                render: (value: number) => value?.toFixed(3),
              },
              {
                title: "算力有效率",
                dataIndex: "HashEffectiveRate",
                key: "HashEffectiveRate",
                align: "center",
                sorter: (a, b) => a.HashEffectiveRate - b.HashEffectiveRate,
                render: (value: number) => (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${value}%` }} />
                    </div>
                    <span>{value}%</span>
                  </div>
                ),
              },
              {
                title: "故障率",
                dataIndex: "FailureRate",
                key: "FailureRate",
                align: "center",
                sorter: (a, b) => a.FailureRate - b.FailureRate,
                render: (value: number) => (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${value}%` }} />
                    </div>
                    <span>{value}%</span>
                  </div>
                ),
              },
              {
                title: "高温影响率",
                dataIndex: "HighTemperatureImpactRate",
                key: "HighTemperatureImpactRate",
                align: "center",
                sorter: (a, b) => a.HighTemperatureImpactRate - b.HighTemperatureImpactRate,
                render: (value) => <span className="text-orange-500">{value}%</span>,
              },
              {
                title: "限电影响率",
                dataIndex: "LimitImpactRate",
                key: "LimitImpactRate",
                align: "center",
                sorter: (a, b) => a.LimitImpactRate - b.LimitImpactRate,
                render: (value) => <span className="text-yellow-500">{value}%</span>,
              },
            ];
            return (
              <div className="p-4 bg-[#FAFBFC]">
                <Table columns={dailyColumns} dataSource={record.daily_items} pagination={false} />
              </div>
            );
          },
        }}
      />
    </div>
  );
};

export default SitePerformanceCard;
