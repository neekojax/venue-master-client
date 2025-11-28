import React, { useEffect, useMemo, useRef, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { CheckOutlined, CloseOutlined, FilterOutlined } from "@ant-design/icons";
import { Button, Input, Switch, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { DailyData, DataItem } from "./types";
import { formatDivide1000 } from "@/utils/format";

// 统一从共享类型导入，避免与其他组件定义不一致

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

  const allColumnKeys = useMemo(
    () => columns.map((c: any) => String(c.key)).filter((k) => k !== "venue_name"),
    [columns],
  );
  // const columnOptions = useMemo(
  //   () =>
  //     columns
  //       .filter((c: any) => c.key !== "venue_name")
  //       .map((c: any) => ({
  //         value: String(c.key),
  //         label: typeof c.title === "string" ? c.title : String(c.title),
  //       })),
  //   [columns],
  // );
  const [selectedColumnKeys, setSelectedColumnKeys] = useState<string[]>(() => {
    const saved = localStorage.getItem("weekReportSelectedColumns");
    if (saved) {
      try {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) return arr as string[];
      } catch (e) {
        // 解析失败则忽略并使用默认列集合
        console.warn("Failed to parse weekReportSelectedColumns from localStorage:", e);
      }
    }
    return allColumnKeys;
  });

  useEffect(() => {
    localStorage.setItem("weekReportSelectedColumns", JSON.stringify(selectedColumnKeys));
  }, [selectedColumnKeys]);

  const displayedColumns = useMemo(
    () => columns.filter((c: any) => c.key === "venue_name" || selectedColumnKeys.includes(String(c.key))),
    [columns, selectedColumnKeys],
  );

  // 自定义列选择下拉以及排序标签逻辑
  const ALL_COLUMNS = useMemo(
    () =>
      columns
        .filter((c: any) => c.key !== "venue_name")
        .map((c: any) => ({
          key: String(c.key),
          label: typeof c.title === "string" ? c.title : String(c.title),
        })),
    [columns],
  );
  const [showColumnSelector, setShowColumnSelector] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const sortedColumnLabel = useMemo(() => {
    if (!sortField) return null;
    const found = ALL_COLUMNS.find((c) => c.key === sortField);
    return found?.label ?? sortField;
  }, [ALL_COLUMNS, sortField]);

  const toggleColumn = (key: string) => {
    setSelectedColumnKeys((prev) => {
      const set = new Set(prev);
      if (set.has(key)) {
        set.delete(key);
      } else {
        set.add(key);
      }
      return Array.from(set);
    });
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!showColumnSelector) return;
      const el = dropdownRef.current;
      if (el && !el.contains(e.target as Node)) {
        setShowColumnSelector(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showColumnSelector]);
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
          <span>
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
            <div className="relative" ref={dropdownRef as any}>
              <div
                style={{ borderRadius: "4px" }}
                className="flex items-center border border-gray-300 bg-white overflow-hidden text-sm h-[24px] hover:border-blue-500 transition-colors cursor-pointer pr-3 pl-1 shadow-sm"
                onClick={() => setShowColumnSelector(!showColumnSelector)}
              >
                {/* Active Sort Tag / Filter Chip */}
                {sortedColumnLabel && (
                  <div
                    className="flex items-center bg-gray-100 text-gray-700 px-2 py-0.5 mr-2 rounded text-xs whitespace-nowrap"
                    style={{ fontSize: "12px" }}
                  >
                    {sortedColumnLabel}
                    <CloseOutlined
                      className="ml-1 cursor-pointer text-gray-400 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSortField(null);
                      }}
                    />
                  </div>
                )}

                <div
                  style={{ width: "100px" }}
                  className={`text-gray-600 flex items-center gap-2 select-none ${!sortedColumnLabel ? "pl-2" : ""}`}
                >
                  <span className="text-sm" style={{ fontSize: "12px" }}>
                    已选{selectedColumnKeys.length}列
                  </span>
                </div>

                {/* Vertical Divider */}
                <div className="h-4 w-px bg-gray-300 mx-3"></div>

                {/* Filter Icon */}
                <FilterOutlined className="text-gray-400" />
              </div>

              {/* Dropdown Menu */}
              {showColumnSelector && (
                <div className="absolute right-0 top-full mt-1 w-60 bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-1 max-h-96 overflow-y-auto">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 border-b border-gray-100 bg-gray-50">
                    显示列
                  </div>
                  {ALL_COLUMNS.map((col) => (
                    <div
                      key={col.key}
                      className="px-4 py-2 flex items-center justify-between hover:bg-gray-50 cursor-pointer text-sm text-gray-700 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColumn(col.key);
                      }}
                    >
                      <span>{col.label}</span>
                      {selectedColumnKeys.includes(col.key) && <CheckOutlined className="text-green-500" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

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
        columns={displayedColumns}
        tableLayout="fixed"
        dataSource={filteredData}
        rowKey="venue_id" // ⚠ 关键：Table 用 venue_id 作为唯一 key
        scroll={{ x: 1500 }}
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
                width: 120,
              },
              {
                title: "理论算力 (PH/s)",
                dataIndex: "TheoreticalPower",
                key: "TheoreticalPower",
                align: "center",
                width: 150,
                render: (value: number) => value?.toFixed(3),
              },
              {
                title: "实际算力 (PH/s)",
                dataIndex: "Power24h",
                key: "Power24h",
                align: "center",
                width: 150,
                render: (value: number) => formatDivide1000(value),
              },
              {
                title: "算力有效率",
                dataIndex: "HashEffectiveRate",
                key: "HashEffectiveRate",
                align: "center",
                width: 220,
                sorter: (a, b) => a.HashEffectiveRate - b.HashEffectiveRate,
                render: (value: number) => (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: `${value}%` }} />
                    </div>
                    <span style={{ width: "80px", color: value >= 90 ? "green" : "red", fontSize: "12px" }}>
                      {value}%
                    </span>
                  </div>
                ),
              },
              {
                title: "净有效率",
                dataIndex: "ForecastHashEfficiency",
                key: "ForecastHashEfficiency",
                align: "center",
                width: 120,
                render: (value: number) => value?.toFixed(2) + "%",
                sorter: (a, b) => a.ForecastHashEfficiency - b.ForecastHashEfficiency,
              },
              {
                title: "故障数",
                dataIndex: "Failure",
                key: "Failure",
                align: "center",
                width: 120,
                render: (value: number) => value?.toFixed(2) + "%",
                sorter: (a, b) => a.Failure - b.Failure,
              },

              {
                title: "故障率",
                dataIndex: "FailureRate",
                key: "FailureRate",
                align: "center",
                width: 150,
                sorter: (a, b) => a.FailureRate - b.FailureRate,
                render: (value: number) => (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-red-500 h-2 rounded-full" style={{ width: `${value}%` }} />
                    </div>
                    <span style={{ width: "80px", fontSize: "12px" }}>{value}%</span>
                  </div>
                ),
              },
              {
                title: "待修率",
                dataIndex: "PendingRepairRate",
                key: "PendingRepairRate",
                align: "center",
                width: 120,
                sorter: (a, b) => a.PendingRepairRate - b.PendingRepairRate,
                render: (value) => <span className="text-orange-500">{value}%</span>,
              },

              {
                title: "净故障率",
                dataIndex: "NetFailureRate",
                key: "NetFailureRate",
                align: "center",
                width: 150,
                sorter: (a, b) => a.NetFailureRate - b.NetFailureRate,
                render: (value) => <span className="text-red-500">{value}%</span>,
              },
              {
                title: "报废数",
                dataIndex: "Scrap",
                key: "Scrap",
                align: "center",
                width: 120,

                sorter: (a, b) => a.Scrap - b.Scrap,
              },
              {
                title: "高温影响率",
                dataIndex: "HighTemperatureImpactRate",
                key: "HighTemperatureImpactRate",
                align: "center",
                width: 150,
                sorter: (a, b) => a.HighTemperatureImpactRate - b.HighTemperatureImpactRate,
                render: (value) => <span className="text-orange-500">{value}%</span>,
              },
              {
                title: "限电影响率",
                dataIndex: "LimitImpactRate",
                key: "LimitImpactRate",
                align: "center",
                width: 150,
                sorter: (a, b) => a.LimitImpactRate - b.LimitImpactRate,
                render: (value) => <span className="text-yellow-500">{value}%</span>,
              },
              {
                title: "上架数量",
                dataIndex: "Shelved",
                key: "Shelved",
                align: "center",
                width: 120,
                sorter: (a, b) => a.Shelved - b.Shelved,
              },
              {
                title: "下架数量",
                dataIndex: "Unshelved",
                key: "Unshelved",
                align: "center",
                width: 120,
                sorter: (a, b) => a.Unshelved - b.Unshelved,
              },
            ];
            // 同步主表列选择，对应隐藏/显示内层明细列
            const dailyToMainKeyMap: Record<string, string> = {
              TheoreticalPower: "average_thermal_power",
              Power24h: "average_power_24h",
              HashEffectiveRate: "average_hash_effective_rate",
              ForecastHashEfficiency: "forecast_hash_efficiency",
              Failure: "average_failure",
              FailureRate: "average_failure_rate",
              PendingRepairRate: "average_pending_repair_rate",
              HighTemperatureImpactRate: "average_high_temperature_impact_rate",
              LimitImpactRate: "average_limit_impact_rate",
              NetFailureRate: "average_net_failure_rate",
              Scrap: "average_scrap",
              Shelved: "week_shelved",
              Unshelved: "week_unshelved",
            };
            const filteredDailyColumns: ColumnsType<DailyData> = dailyColumns.filter((c: any) => {
              if (c.key === "Date") return true; // 始终显示日期
              const mapped = dailyToMainKeyMap[String(c.key)] || "";
              return selectedColumnKeys.includes(mapped);
            });
            return (
              <div className="p-4 bg-[#FAFBFC]">
                <Table
                  columns={filteredDailyColumns}
                  dataSource={record.daily_items}
                  pagination={false}
                  size="small"
                  className="custom-inner-table"
                  scroll={{ x: 1500 }}
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
