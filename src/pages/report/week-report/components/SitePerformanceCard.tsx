import React, { useEffect, useMemo, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Input, Switch, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { formatDivide1000 } from "@/utils/format";

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
  collection: number; // 是否收藏
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
  // onFilterAll?: () => void;
  // onFilterTop?: () => void;
  // onFilterBottom?: () => void;
}

const SitePerformanceCard: React.FC<SitePerformanceCardProps> = ({
  title = "场地算力表现",
  columns,
  data,
  onSearch,
  // onFilterAll,
  // onFilterTop,
  // onFilterBottom,
}) => {
  // 过滤后的数据
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [searchText, setSearchText] = useState(""); // 根据标题搜索
  const [selected, setSelected] = useState("all");
  const [showCollectionOnly, setShowCollectionOnly] = useState(() => {
    // 初始化时从 localStorage 取值
    return localStorage.getItem("showCollectionOnly") === "true";
  });
  // 当值变化时写入 localStorage
  useEffect(() => {
    localStorage.setItem("showCollectionOnly", String(showCollectionOnly));
  }, [showCollectionOnly]);

  // 1. 定义分页 state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const filteredData = useMemo(() => {
    // 先做搜索过滤
    let result = data.filter((item) => item.venue_name.toLowerCase().includes(searchText.toLowerCase()));

    // 如果只显示 collection 数据
    if (showCollectionOnly) {
      result = result.filter((item) => item.collection);
    }

    // 按有效率排序
    const sorted = [...result].sort((a, b) => b.average_hash_effective_rate - a.average_hash_effective_rate);

    if (selected == "top5") {
      return sorted.slice(0, 5); // Top5
    } else if (selected == "bottom5") {
      return sorted.slice(-5); // Bottom5
    } else {
      // return result; // 全部
      // 默认按场地名字母排序
      return [...result].sort((a, b) => a.venue_name.localeCompare(b.venue_name));
    }
  }, [data, searchText, selected, showCollectionOnly]);

  // 3️⃣ 排序
  // filtered = filtered.sort((a, b) => a.siteName.localeCompare(b.siteName));

  return (
    <div className="bg-white p-4 rounded-[4px] border border-[#F0F2F5] shadow-sm">
      {/* 标题 + 操作栏 */}
      <div className="items-center mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <div className="flex items-center gap-4  justify-between">
          <div></div>
          <span style={{ display: "none" }}>
            <Switch size="small" checked={showCollectionOnly} onChange={setShowCollectionOnly} />
            {"  "}
            <span style={{ marginRight: "10px" }}>我的自选</span>
          </span>

          <div className="flex items-center gap-4">
            <Input
              size="small"
              placeholder="搜索场地..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="!rounded-button"
              onPressEnter={(e) => onSearch?.((e.target as HTMLInputElement).value)}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)} // 更新搜索文本
            />
            {/* <Button type="primary" className="!rounded-button whitespace-nowrap" onClick={onFilterAll}>
            全部场地
          </Button>
          <Button className="!rounded-button whitespace-nowrap" onClick={onFilterTop}>
            有效率 Top 5
          </Button>
          <Button className="!rounded-button whitespace-nowrap" onClick={onFilterBottom}>
            有效率 Bottom 5
          </Button> */}
            <Button
              size="small"
              type={selected === "all" ? "primary" : "default"}
              onClick={() => setSelected("all")}
            >
              全部场地
            </Button>
            <Button
              size="small"
              type={selected === "top5" ? "primary" : "default"}
              onClick={() => setSelected("top5")}
            >
              有效率 Top 5
            </Button>
            <Button
              size="small"
              type={selected === "bottom5" ? "primary" : "default"}
              onClick={() => setSelected("bottom5")}
            >
              有效率 Bottom 5
            </Button>
            {/* <Segmented
            size="middle"
            options={[
              { label: "全部", value: "all" },
              { label: "Top5", value: "top5" },
              { label: "Bottom5", value: "bottom5" },
            ]}
            value={selected}
            onChange={(val) => setSelected(val)}
          /> */}
          </div>
        </div>
      </div>

      {/* 主表格 */}
      <Table
        columns={columns}
        tableLayout="fixed"
        dataSource={filteredData}
        rowKey="venue_id" // ⚠ 关键：Table 用 venue_id 作为唯一 key
        pagination={{
          ...pagination,
          total: filteredData.length,
          // pageSize: 10,
          showTotal: (total) => `共 ${total} 个场地`,
          showSizeChanger: true,
          showQuickJumper: true,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
          },
        }}
        className="custom-table w-full"
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
                render: (value: number) => formatDivide1000(value),
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
                <Table
                  columns={dailyColumns}
                  dataSource={record.daily_items}
                  pagination={false}
                  size="small"
                  // rowClassName={(_, index) => (index % 2 === 0 ? "bg-gray-50" : "bg-white")} // ✅ 斑马纹
                  className="custom-inner-table"
                />
              </div>
            );
          },
          expandedRowKeys, // 受控展开行
          onExpand: (expanded, record) => {
            setExpandedRowKeys(expanded ? [record.venue_id] : []); // 只展开当前行
          },
        }}
      />
    </div>
  );
};

export default SitePerformanceCard;
