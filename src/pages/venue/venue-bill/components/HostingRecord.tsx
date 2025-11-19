import React from "react";
import { useEffect } from "react";
import { Pagination, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { fetchHostingRecordListAll } from "../../api";

export interface HostingRecordProps<T extends { key?: React.Key }> {
  columns: ColumnsType<T>;
  data: T[];
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number, size: number) => void;
  expandable?: any;
  scrollX?: number;
  rowClassName?: string;
}

function HostingRecord<T extends { key?: React.Key }>(props: HostingRecordProps<T>) {
  const {
    columns,
    data,
    currentPage,
    pageSize,
    onPageChange,
    expandable,
    scrollX = 1200,
    rowClassName = "hover:bg-gray-50 transition-colors",
  } = props;

  const start = (currentPage - 1) * pageSize;
  const end = currentPage * pageSize;
  const pagedData = data.slice(start, end);
  const total = data.length;

  useEffect(() => {
    fetchHostingRecordListAll().then((response: any) => {
      console.log("response", response);
    });
  }, []);

  return (
    <>
      <Table
        columns={columns}
        dataSource={pagedData}
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

export default HostingRecord;
