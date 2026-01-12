import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { CaretRightOutlined, UpOutlined } from "@ant-design/icons";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { fetchHostingRecordListAll } from "../../api";
import { exportHostingRecordToExcel } from "@/utils/excel";

interface HostingRecord {
  venue_id: number;
  siteName: string;
  key: string;
  hosting_price: number;
  maintenance_price: number;
  end_time: string;
  start_time: string;
  min_hosting_price: number;
  history: HostingRecord[];
}

export type HostingRecordHandle = {
  exportToExcel: () => void;
};

interface HostingRecordProps {
  // 父组件用于接收场地列表
  setServiceSites?: (sites: string[]) => void;
  // 由父组件传入的筛选条件
  filterSiteName?: string;
  selectedSites?: string[];
}

const HostingRecord = forwardRef<HostingRecordHandle, HostingRecordProps>(function HostingRecord(props, ref) {
  const { setServiceSites, filterSiteName = "", selectedSites = [] } = props;

  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

  const columns: ColumnsType<HostingRecord> = [
    {
      title: "场地名称",
      dataIndex: "siteName",
      key: "siteName",
      sorter: (a, b) => a.siteName.localeCompare(b.siteName),
      fixed: "left",
      width: 350,
    },
    {
      title: "托管单价周期",
      dataIndex: "start_time",
      key: "start_time",
      width: 250,
      render: (value) => <>{value} ~</>,
    },
    {
      title: "托管最低单价",
      dataIndex: "min_hosting_price",
      key: "min_hosting_price",
      sorter: (a, b) => a.min_hosting_price - b.min_hosting_price,
      render: (value) => <span className="font-semibold text-green-600">$ {value}</span>,
      width: 180,
    },
    {
      title: "托管单价",
      dataIndex: "hosting_price",
      key: "hosting_price",
      sorter: (a, b) => a.hosting_price - b.hosting_price,
      render: (value) => <span className="font-semibold text-green-600">$ {value}</span>,
      width: 180,
    },
    {
      title: "运维单价",
      dataIndex: "maintenance_price",
      key: "maintenance_price",
      sorter: (a, b) => a.maintenance_price - b.maintenance_price,
      render: (value) => <span className="font-semibold text-purple-600">$ {value}</span>,
      width: 180,
    },
  ];

  const ExtendColumns: ColumnsType<HostingRecord> = [
    {
      title: "托管单价周期",
      dataIndex: "start_time",
      key: "start_time",
      width: 250,
      render: (value, record) => (
        <>
          {value} ~ {record.end_time}
        </>
      ),
    },
    {
      title: "托管单价",
      dataIndex: "hosting_price",
      key: "hosting_price",
      sorter: (a, b) => a.hosting_price - b.hosting_price,
      render: (value) => <span className="font-semibold text-green-600">$ {value}</span>,
      width: 180,
    },
    {
      title: "托管最低单价",
      dataIndex: "min_hosting_price",
      key: "min_hosting_price",
      sorter: (a, b) => a.min_hosting_price - b.min_hosting_price,
      render: (value) => <span className="font-semibold text-green-600">$ {value}</span>,
      width: 180,
    },
    {
      title: "运维单价",
      dataIndex: "maintenance_price",
      key: "maintenance_price",
      sorter: (a, b) => a.maintenance_price - b.maintenance_price,
      render: (value) => <span className="font-semibold text-purple-600">$ {value}</span>,
      width: 180,
    },
  ];

  // 使用下划线前缀命名以符合 @typescript-eslint/no-unused-vars 的忽略规则
  const [_hostingRecordList, setHostingRecordList] = useState<any[]>([]);
  // 读取一次，避免 TS 未使用变量报错（不影响 UI）
  void _hostingRecordList.length;

  const expandedRowRender = (record: HostingRecord, tabType: string) => {
    if (!record.history) return null;
    const columnsToUse = tabType === "hosting" ? ExtendColumns : [];
    return (
      <Table
        columns={columnsToUse}
        dataSource={record.history}
        pagination={false}
        rowKey="key"
        className="ml-8"
        size="small"
      />
    );
  };

  const expandableConfig = (tabType: string) => ({
    expandedRowRender: (record: HostingRecord) => expandedRowRender(record, tabType),
    expandedRowKeys,
    onExpand: (expanded: boolean, record: HostingRecord) => {
      const keys = expanded
        ? [...expandedRowKeys, record.key.toString()]
        : expandedRowKeys.filter((key) => key !== record.key);
      setExpandedRowKeys(keys);
    },
    expandIcon: ({ expanded, onExpand, record }: any) => {
      if (!record.history || record.history.length === 0) return null;
      return expanded ? (
        <UpOutlined onClick={(e) => onExpand(record, e)} className="text-blue-500" />
      ) : (
        <CaretRightOutlined onClick={(e) => onExpand(record, e)} className="text-blue-500" />
      );
    },
  });

  useEffect(() => {
    fetchHostingRecordListAll().then((response: any) => {
      if (response && (response.code === 0 || response.code === 200)) {
        // 接口返回为对象：{ siteName1: { LatestHostingRecord, HistoryHostingRecord }, ... }
        // 转换为数组，便于表格组件使用
        const arr = Object.entries(response.data || {}).map(([siteName, payload]: [string, any]) => ({
          key: siteName,
          siteName,
          ...payload?.LatestHostingRecord,
          history: payload?.HistoryHostingRecord,
        }));
        setHostingRecordList(arr);
        // 给父组件赋值 serviceSites
        const sites = arr.map((i) => i.siteName);
        setServiceSites?.(sites);
      }
    });
  }, [setServiceSites]);

  // 结合父组件传入的筛选条件，得到最终展示数据
  const filteredData = useMemo(() => {
    let data = _hostingRecordList;
    if (filterSiteName) {
      data = data.filter((i: any) => i.siteName?.includes?.(filterSiteName));
    }
    if (selectedSites && selectedSites.length > 0) {
      const set = new Set(selectedSites);
      data = data.filter((i: any) => set.has(i.siteName));
    }
    return data;
  }, [_hostingRecordList, filterSiteName, selectedSites]);

  // 向父组件暴露导出函数
  useImperativeHandle(
    ref,
    () => ({
      exportToExcel: () => {
        exportHostingRecordToExcel(filteredData);
      },
    }),
    [filteredData],
  );

  return (
    <>
      <div className="mb-4 p-4 bg-green-50 rounded-lg">
        <div className="text-green-800 font-medium mb-1">托管运维单价说明</div>
        <div className="text-green-600 text-sm">
          此页展示单价为合同约定的正常托管单价及运维单价，因在线率不达标或电费比不达标等原因而导致的电费折扣未计入
        </div>
      </div>
      <Table
        columns={columns}
        dataSource={filteredData}
        pagination={{ pageSize: 10 }}
        expandable={expandableConfig("hosting")}
        rowClassName="hover:bg-gray-50 transition-colors"
      />
    </>
  );
});

export default HostingRecord;
