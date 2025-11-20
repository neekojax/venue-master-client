import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { CaretRightOutlined, UpOutlined } from "@ant-design/icons";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { fetchPowerConsumptionList } from "../../api";
import { exportPowerConsumptionToExcel } from "@/utils/excel";

interface PowerConsumptionRecord {
  venue_id: number;
  siteName: string;
  key: string;
  power_consumption: number;
  end_time: string;
  start_time: string;
  history: PowerConsumptionRecord[];
}

export type PowerConsumptionHandle = {
  exportToExcel: () => void;
};

interface PowerConsumptionProps {
  // 父组件用于接收场地列表
  setPowerSites?: (sites: string[]) => void;
  // 由父组件传入的筛选条件
  filterSiteName?: string;
  selectedSites?: string[];
}

const PowerConsumption = forwardRef<PowerConsumptionHandle, PowerConsumptionProps>(
  function PowerConsumption(props, ref) {
    const { setPowerSites, filterSiteName = "", selectedSites = [] } = props;

    const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);

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
        title: "总功耗 (kWh)",
        dataIndex: "power_consumption",
        key: "power_consumption",
        sorter: (a, b) => a.power_consumption - b.power_consumption,
        render: (value) => (
          <span className="font-semibold text-blue-600">{value?.toLocaleString?.() ?? value}</span>
        ),
        width: 150,
      },
    ];

    const ExtendColumns: ColumnsType<PowerConsumptionRecord> = [
      {
        title: "账单覆盖周期",
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
        title: "总功耗 (kWh)",
        dataIndex: "power_consumption",
        key: "power_consumption",
        sorter: (a, b) => a.power_consumption - b.power_consumption,
        render: (value) => (
          <span className="font-semibold text-blue-600">{value?.toLocaleString?.() ?? value}</span>
        ),
        width: 150,
      },
    ];

    // 使用下划线前缀命名以符合 @typescript-eslint/no-unused-vars 的忽略规则
    const [_powerConsumptionList, setPowerConsumptionList] = useState<any[]>([]);
    // 读取一次，避免 TS 未使用变量报错（不影响 UI）
    void _powerConsumptionList.length;

    const expandedRowRender = (record: PowerConsumptionRecord, tabType: string) => {
      if (!record.history) return null;
      const columnsToUse = tabType === "power" ? ExtendColumns : [];
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
      expandedRowRender: (record: PowerConsumptionRecord) => expandedRowRender(record, tabType),
      expandedRowKeys,
      onExpand: (expanded: boolean, record: PowerConsumptionRecord) => {
        const keys = expanded
          ? [...expandedRowKeys, record.key.toString()]
          : expandedRowKeys.filter((key) => key !== record.key);
        setExpandedRowKeys(keys);
      },
      expandIcon: ({ expanded, onExpand, record }: any) => {
        if (!record.history) return null;
        return expanded ? (
          <UpOutlined onClick={(e) => onExpand(record, e)} className="text-blue-500" />
        ) : (
          <CaretRightOutlined onClick={(e) => onExpand(record, e)} className="text-blue-500" />
        );
      },
    });

    useEffect(() => {
      fetchPowerConsumptionList().then((response: any) => {
        if (response && (response.code === 0 || response.code === 200)) {
          // 接口返回为对象：{ siteName1: { LatestPowerConsumption, HistoryPowerConsumption }, ... }
          // 转换为数组，便于表格等组件使用
          const arr = Object.entries(response.data || {}).map(([siteName, payload]: [string, any]) => ({
            key: siteName,
            siteName,
            ...payload?.LatestPowerConsumption,
            history: payload?.HistoryPowerConsumption,
          }));
          setPowerConsumptionList(arr);
          // 给父组件赋值 powerSites
          const sites = arr.map((i) => i.siteName);
          setPowerSites?.(sites);
        }
      });
    }, [setPowerSites]);

    // 结合父组件传入的筛选条件，得到最终展示数据
    const filteredData = useMemo(() => {
      let data = _powerConsumptionList;
      if (filterSiteName) {
        data = data.filter((i: any) => i.siteName?.includes?.(filterSiteName));
      }
      if (selectedSites && selectedSites.length > 0) {
        const set = new Set(selectedSites);
        data = data.filter((i: any) => set.has(i.siteName));
      }
      return data;
    }, [_powerConsumptionList, filterSiteName, selectedSites]);

    // 向父组件暴露导出函数
    useImperativeHandle(
      ref,
      () => ({
        exportToExcel: () => {
          exportPowerConsumptionToExcel(filteredData);
        },
      }),
      [filteredData],
    );

    return (
      <>
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          {/* <div className="text-blue-800 font-medium mb-1">名词释义</div> */}
          <div className="text-blue-600 text-sm">结算电量：实际产生的电力消耗量，用于计算电费的基础数据</div>
          <div className="text-blue-600 text-sm">矿池算力：连接至矿池的设备总算力，反映场地的服务能力</div>
        </div>
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ pageSize: 10 }}
          expandable={expandableConfig("power")}
          rowClassName="hover:bg-gray-50 transition-colors"
        />
      </>
    );
  },
);

export default PowerConsumption;
