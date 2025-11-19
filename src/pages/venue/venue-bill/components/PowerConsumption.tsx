import React, { useEffect, useState } from "react";
import { Pagination, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { fetchPowerConsumptionList } from "../../api";

export interface PowerConsumptionProps<T extends { key?: React.Key }> {
  // columns: ColumnsType<T>;
  data: T[];
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number, size: number) => void;
  expandable?: any;
  scrollX?: number;
  rowClassName?: string;
}

function PowerConsumption<T extends { key?: React.Key }>(props: PowerConsumptionProps<T>) {
  const {
    columns,
    data,
    currentPage,
    pageSize,
    onPageChange,
    expandable,
    scrollX = 1000,
    rowClassName = "hover:bg-gray-50 transition-colors",
  } = props;

  const start = (currentPage - 1) * pageSize;
  const end = currentPage * pageSize;
  const pagedData = data.slice(start, end);
  const total = data.length;

  const columns: ColumnsType<PowerConsumptionRecord> = [
    {
      title: "场地名称",
      dataIndex: "siteName",
      key: "siteName",
      sorter: (a, b) => a.siteName.localeCompare(b.siteName),
      fixed: "left",
      width: 350,
    },
    {
      title: "账单覆盖周期",
      dataIndex: "period",
      key: "period",
      sorter: (a, b) =>
        new Date(a.period.split(" ~ ")[0]).getTime() - new Date(b.period.split(" ~ ")[0]).getTime(),
      width: 250,
    },
    {
      title: "总功耗 (kWh)",
      dataIndex: "totalPower",
      key: "totalPower",
      sorter: (a, b) => a.totalPower - b.totalPower,
      render: (value) => <span className="font-semibold text-blue-600">{value.toLocaleString()}</span>,
      width: 150,
    },
  ];

  // 使用下划线前缀命名以符合 @typescript-eslint/no-unused-vars 的忽略规则
  const [_powerConsumptionList, setPowerConsumptionList] = useState<any[]>(Array.isArray(data) ? data : []);
  // 读取一次，避免 TS 未使用变量报错（不影响 UI）
  void _powerConsumptionList.length;

  useEffect(() => {
    fetchPowerConsumptionList().then((response: any) => {
      console.log("response", response);
      if (response && (response.code === 0 || response.code === 200)) {
        // 接口返回为对象：{ siteName1: { LatestPowerConsumption, HistoryPowerConsumption }, ... }
        // 转换为数组，便于表格等组件使用
        const arr = Object.entries(response.data || {}).map(([siteName, payload]: [string, any]) => ({
          // 保留站点名作为主键和字段
          key: siteName,
          siteName,
          // 原始结构保留，后续按需映射到具体列
          LatestPowerConsumption: payload?.LatestPowerConsumption,
          HistoryPowerConsumption: payload?.HistoryPowerConsumption,
        }));
        setPowerConsumptionList(arr);
      }
    });
  }, []);

  return (
    <>
      <Table
        columns={columns}
        dataSource={_powerConsumptionList}
        pagination={false}
        expandable={expandable}
        rowClassName={rowClassName}
        scroll={{ x: scrollX }}
      />
      <div className="p-4 flex justify-between items-center border-t border-gray-200">
        <div className="text-gray-600">
          显示第 {start + 1} 到 {Math.min(end, total)} 条记录，共 {total} 条
        </div>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          onChange={onPageChange}
          showSizeChanger
          showQuickJumper
          className="mb-0"
        />
      </div>
    </>
  );
}

export default PowerConsumption;
