import { useEffect, useMemo, useState } from "react";
import {
  DownloadOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Form, Input, message, Select, Table, Tooltip } from "antd";
import type { FormInstance } from "antd/es/form";
import type { TablePaginationConfig } from "antd/es/table";
import dayjs from "dayjs";
import { fetchTaskSnapshotExport } from "../api";
import {
  buildSnapshotTableColumns,
  loadSnapshotColumnConfigs,
  saveSnapshotColumnConfigs,
  type SnapshotColumnConfig,
} from "../snapshotTableColumns";
import type { TaskSnapshotItem, TaskSnapshotQueryParams } from "../types";
import { buildTaskSnapshotExportParams, downloadExcelBlobResponse } from "../utils";
import ColumnSettingsPopover from "./ColumnSettingsPopover";

export interface MinerSnapshotSearchValues {
  minerCode?: string;
  fullType?: string;
  ip?: string;
  macAddress?: string;
  controlBoardSN?: string;
  zeroHashrate?: string;
  hashrateFault?: string;
}

const BOOL_FILTER_OPTIONS = [
  { label: "是", value: "true" },
  { label: "否", value: "false" },
];

interface MinerSnapshotPanelProps {
  form: FormInstance<MinerSnapshotSearchValues>;
  fullTypeOptions: string[];
  minerCodeOptions: string[];
  snapshotList: TaskSnapshotItem[];
  snapshotTotal: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  latestTaskId?: string;
  siteCode?: string;
  exportFilters: TaskSnapshotQueryParams;
  onSearch: (values: MinerSnapshotSearchValues) => void;
  onReset: () => void;
  onRefresh: () => void;
  onPageChange: (page: number, pageSize: number) => void;
}

export default function MinerSnapshotPanel({
  form,
  fullTypeOptions,
  minerCodeOptions,
  snapshotList,
  snapshotTotal,
  page,
  pageSize,
  loading = false,
  latestTaskId,
  siteCode,
  exportFilters,
  onSearch,
  onReset,
  onRefresh,
  onPageChange,
}: MinerSnapshotPanelProps) {
  const [filterExpanded, setFilterExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [columnConfigs, setColumnConfigs] = useState<SnapshotColumnConfig[]>(() =>
    loadSnapshotColumnConfigs(),
  );

  const fullscreenTargetId = "miner-snapshot-panel-fullscreen";

  useEffect(() => {
    const onFullscreenChange = () => {
      const el = document.getElementById(fullscreenTargetId);
      setIsFullscreen(document.fullscreenElement === el);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const handleColumnConfigsChange = (configs: SnapshotColumnConfig[]) => {
    setColumnConfigs(configs);
    saveSnapshotColumnConfigs(configs);
  };

  const { columns, scrollX } = useMemo(
    () => buildSnapshotTableColumns(columnConfigs, page, pageSize, siteCode),
    [columnConfigs, page, pageSize, siteCode],
  );

  const pagination: TablePaginationConfig = {
    current: page,
    pageSize,
    total: snapshotTotal,
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50, 100, 200, 500],
    showTotal: (total) => `共 ${total} 条记录`,
    locale: { items_per_page: "条/页" },
    onChange: onPageChange,
  };

  const handleExport = async () => {
    if (!latestTaskId) {
      message.warning("暂无已完成探测任务，无法导出");
      return;
    }
    if (exporting) return;
    setExporting(true);
    try {
      const params = buildTaskSnapshotExportParams(exportFilters);
      const res = await fetchTaskSnapshotExport(latestTaskId, params);
      downloadExcelBlobResponse(
        res,
        `task_snapshots_${latestTaskId}_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`,
      );
      message.success("导出成功");
    } catch {
      message.error("导出失败，请稍后重试");
    } finally {
      setExporting(false);
    }
  };

  const handleFullscreen = () => {
    const el = document.getElementById(fullscreenTargetId);
    if (!el) return;
    if (document.fullscreenElement === el) {
      void document.exitFullscreen?.();
      return;
    }
    void el.requestFullscreen?.();
  };

  return (
    <div className="w-full min-w-0 max-w-full bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      <div
        id={fullscreenTargetId}
        className="bg-white min-w-0 [&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:h-screen [&:fullscreen]:overflow-auto [&:fullscreen]:p-0"
      >
        <div className="px-5 pt-4 pb-3 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-800 m-0">矿机信息管理</h2>
        </div>
        {filterExpanded ? (
          <div className="px-5 py-4 border-b border-gray-200 filter-form miner-snapshot-filter bg-white">
            <Form
              form={form}
              layout="horizontal"
              labelAlign="left"
              colon={false}
              onFinish={onSearch}
              labelCol={{ flex: "0 0 96px" }}
              wrapperCol={{ flex: "1 1 0" }}
              className="[&_.ant-form-item]:!mb-0 [&_.ant-form-item-label>label]:!font-semibold [&_.ant-form-item-label>label]:!text-gray-800"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 items-end">
                <Form.Item name="fullType" label="机型" className="!mb-0 min-w-0">
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="请选择"
                    options={fullTypeOptions.map((value) => ({ label: value, value }))}
                  />
                </Form.Item>
                <Form.Item name="minerCode" label="矿工号" className="!mb-0 min-w-0">
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="请选择"
                    options={minerCodeOptions.map((value) => ({ label: value, value }))}
                  />
                </Form.Item>
                <Form.Item name="zeroHashrate" label="零算力" className="!mb-0 min-w-0">
                  <Select allowClear placeholder="请选择" options={BOOL_FILTER_OPTIONS} />
                </Form.Item>
                <Form.Item name="hashrateFault" label="低算力" className="!mb-0 min-w-0">
                  <Select allowClear placeholder="请选择" options={BOOL_FILTER_OPTIONS} />
                </Form.Item>
                <Form.Item name="ip" label="矿机IP地址" className="!mb-0 min-w-0">
                  <Input allowClear placeholder="请输入矿机IP地址" />
                </Form.Item>
                <Form.Item name="macAddress" label="矿机MAC地址" className="!mb-0 min-w-0">
                  <Input allowClear placeholder="请输入矿机MAC地址" />
                </Form.Item>
                <Form.Item name="controlBoardSN" label="矿机序列号" className="!mb-0 min-w-0">
                  <Input allowClear placeholder="请输入矿机序列号" />
                </Form.Item>
                <div className="flex min-w-0 justify-end gap-2 pb-0.5 md:col-span-2 lg:col-span-1">
                  <Button onClick={onReset}>重置</Button>
                  <Button type="primary" htmlType="submit">
                    搜索
                  </Button>
                </div>
              </div>
            </Form>
          </div>
        ) : null}

        <div className="longdataTable w-full min-w-0 overflow-x-auto bg-white">
          <div className="flex justify-end items-center gap-1 border-b border-gray-100 px-4 py-2">
            <Tooltip title={filterExpanded ? "收起筛选" : "展开筛选"}>
              <Button
                type="text"
                shape="circle"
                icon={<SearchOutlined className={filterExpanded ? "text-[#1677ff]" : "text-gray-500"} />}
                className={filterExpanded ? "!bg-[#e6f4ff]" : undefined}
                onClick={() => setFilterExpanded((v) => !v)}
              />
            </Tooltip>
            <Tooltip title="导出">
              <Button
                type="text"
                shape="circle"
                icon={<DownloadOutlined />}
                loading={exporting}
                disabled={exporting || !latestTaskId}
                onClick={() => void handleExport()}
              />
            </Tooltip>
            <Tooltip title="刷新">
              <Button
                type="text"
                shape="circle"
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
              />
            </Tooltip>
            <Tooltip title={isFullscreen ? "退出全屏" : "全屏"}>
              <Button
                type="text"
                shape="circle"
                icon={isFullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
                onClick={handleFullscreen}
              />
            </Tooltip>
            <ColumnSettingsPopover value={columnConfigs} onChange={handleColumnConfigsChange} />
          </div>

          <div className="px-4 pb-4">
            <Table<TaskSnapshotItem>
              rowKey="id"
              columns={columns}
              dataSource={snapshotList}
              loading={loading}
              size="middle"
              bordered={false}
              scroll={{ x: scrollX }}
              locale={{
                emptyText: latestTaskId ? "暂无矿机快照数据" : "暂无已完成探测任务",
              }}
              pagination={pagination}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
