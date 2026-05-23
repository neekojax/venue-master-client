import { useEffect, useMemo, useState } from "react";
import { DownloadOutlined, SearchOutlined, WarningOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  FAULT_SUMMARY,
  FAULT_TYPE_COLOR,
  type FaultMinerRecord,
  type FaultType,
  MOCK_FAULT_MINERS,
} from "./mockData";
import useAuthRedirect from "@/hooks/useAuthRedirect";

import FarmSiteList from "@/pages/farm-monitor/components/FarmSiteList";
import { useBoundSites } from "@/pages/farm-monitor/hook";
import type { BoundSiteItem } from "@/pages/farm-monitor/types";
import { mapBoundSiteToFarmSite } from "@/pages/farm-monitor/utils";

interface SearchFormValues {
  agent?: string;
  ip?: string;
  mac?: string;
  serial?: string;
}

const SUMMARY_CARDS = [
  { key: "total", label: "故障矿机总数", value: FAULT_SUMMARY.total, color: "#ff4d4f", bg: "#fff1f0" },
  {
    key: "zeroHashrate",
    label: "零算力",
    value: FAULT_SUMMARY.zeroHashrate,
    color: "#ff4d4f",
    bg: "#fff1f0",
  },
  { key: "lowHashrate", label: "低算力", value: FAULT_SUMMARY.lowHashrate, color: "#fa8c16", bg: "#fff7e6" },
  { key: "offline", label: "离线", value: FAULT_SUMMARY.offline, color: "#8c8c8c", bg: "#fafafa" },
  { key: "highTemp", label: "高温", value: FAULT_SUMMARY.highTemp, color: "#eb2f96", bg: "#fff0f6" },
];

export default function FaultMachineMonitorPage() {
  useAuthRedirect();

  const [form] = Form.useForm<SearchFormValues>();
  const [filters, setFilters] = useState<SearchFormValues>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: boundSitesRes, isLoading: isSitesLoading } = useBoundSites();

  const farmSites = useMemo(() => {
    const list: BoundSiteItem[] = boundSitesRes?.data?.list ?? [];
    return list.map(mapBoundSiteToFarmSite);
  }, [boundSitesRes]);

  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  useEffect(() => {
    if (farmSites.length === 0) return;
    setSelectedFarmId((prev) => {
      if (prev && farmSites.some((s) => s.id === prev)) return prev;
      return farmSites[0].id;
    });
  }, [farmSites]);

  const selectedFarm = useMemo(
    () => farmSites.find((s) => s.id === selectedFarmId) ?? null,
    [farmSites, selectedFarmId],
  );

  const filteredMiners = useMemo(() => {
    return MOCK_FAULT_MINERS.filter((row) => {
      if (selectedFarm && row.farm !== selectedFarm.name) return false;
      if (filters.agent && !row.agent.toLowerCase().includes(filters.agent.toLowerCase())) return false;
      if (filters.ip && !row.ip.includes(filters.ip)) return false;
      if (filters.mac && !row.mac.toLowerCase().includes(filters.mac.toLowerCase())) return false;
      if (filters.serial && !row.serial.toLowerCase().includes(filters.serial.toLowerCase())) return false;
      return true;
    });
  }, [filters, selectedFarm]);

  const columns: ColumnsType<FaultMinerRecord> = [
    { title: "ID", dataIndex: "id", key: "id", width: 64 },
    { title: "矿场", dataIndex: "farm", key: "farm", width: 130, ellipsis: true },
    {
      title: "故障类型",
      dataIndex: "faultType",
      key: "faultType",
      width: 100,
      render: (type: FaultType) => <Tag color={FAULT_TYPE_COLOR[type]}>{type}</Tag>,
    },
    { title: "IP 地址", dataIndex: "ip", key: "ip", width: 120 },
    { title: "MAC 地址", dataIndex: "mac", key: "mac", width: 140 },
    { title: "序列号", dataIndex: "serial", key: "serial", width: 110 },
    {
      title: "算力",
      dataIndex: "hashrate",
      key: "hashrate",
      width: 100,
      render: (v: number) => `${v} TH/s`,
    },
    {
      title: "理论算力",
      dataIndex: "theoreticalHashrate",
      key: "theoreticalHashrate",
      width: 100,
      render: (v: number) => `${v}.0 TH/s`,
    },
    { title: "机型", dataIndex: "model", key: "model", width: 150, ellipsis: true },
    { title: "故障时长", dataIndex: "faultDuration", key: "faultDuration", width: 110 },
    { title: "最后在线", dataIndex: "lastOnline", key: "lastOnline", width: 140 },
  ];

  return (
    <div className="min-h-full bg-[#f5f5f5] -m-4 p-4">
      <div className="flex gap-4 items-start mb-4">
        <div className="flex-1 min-w-0">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {SUMMARY_CARDS.map((card) => (
              <div
                key={card.key}
                className="bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3"
              >
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                  style={{ backgroundColor: card.bg, color: card.color }}
                >
                  <WarningOutlined style={{ fontSize: 20 }} />
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-xs text-gray-500">{card.label}</div>
                  <div className="text-2xl font-semibold text-gray-800">{card.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <FarmSiteList
          sites={farmSites}
          selectedId={selectedFarmId}
          loading={isSitesLoading}
          onSelect={(id) => {
            setSelectedFarmId(id);
            setPage(1);
          }}
        />
      </div>

      <Card
        className="mb-4 border-gray-200"
        title={
          <span className="flex items-center gap-2 text-base font-semibold">
            <SearchOutlined className="text-blue-500" />
            故障机筛选
          </span>
        }
        styles={{ body: { paddingBottom: 8 } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={(v) => {
            setFilters(v);
            setPage(1);
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-0">
            <Form.Item name="agent" label="Agent">
              <Input allowClear placeholder="Agent" />
            </Form.Item>
            <Form.Item name="ip" label="IP 地址">
              <Input allowClear placeholder="IP 地址" />
            </Form.Item>
            <Form.Item name="mac" label="MAC 地址">
              <Input allowClear placeholder="MAC 地址" />
            </Form.Item>
            <Form.Item name="serial" label="序列号">
              <Input allowClear placeholder="序列号" />
            </Form.Item>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <Button
              onClick={() => {
                form.resetFields();
                setFilters({});
                setPage(1);
              }}
            >
              重置
            </Button>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
          </div>
        </Form>
      </Card>

      <Card
        className="border-gray-200"
        title={<span className="text-base font-semibold">故障矿机列表</span>}
        extra={<Button icon={<DownloadOutlined />}>导出数据</Button>}
      >
        <Table<FaultMinerRecord>
          rowKey="id"
          columns={columns}
          dataSource={filteredMiners}
          size="middle"
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize,
            defaultPageSize: 10,
            pageSizeOptions: [10, 20, 50, 100],
            total: filteredMiners.length,
            showSizeChanger: true,
            showTotal: (total, range) => `Showing ${range[0]} to ${range[1]} of ${total} entries`,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps || 10);
            },
          }}
        />
      </Card>
    </div>
  );
}
