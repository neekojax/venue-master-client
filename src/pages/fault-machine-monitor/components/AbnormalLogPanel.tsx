import { useEffect, useMemo, useState } from "react";
import {
  DownloadOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, DatePicker, Form, Input, message, Select, Table, Tag, Tooltip } from "antd";
import type { FormInstance } from "antd/es/form";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import dayjs from "dayjs";
import { fetchAbnormalLogsExport } from "../api";
import { FAULT_CODE_COLOR, FAULT_CODES, type FaultCode } from "../constants";
import type { AbnormalLogFilters, AbnormalLogRecord } from "../types";

import { downloadExcelBlobResponse } from "@/pages/farm-monitor/utils";

const { RangePicker } = DatePicker;

export interface AbnormalLogSearchValues {
  code?: FaultCode;
  siteCode?: string;
  ip?: string;
  mac?: string;
  controlBoardSN?: string;
  logTimeRange?: [dayjs.Dayjs, dayjs.Dayjs];
}

interface SiteOption {
  id: string;
  name: string;
}

interface AbnormalLogPanelProps {
  form: FormInstance<AbnormalLogSearchValues>;
  siteOptions: SiteOption[];
  exportFilters: AbnormalLogFilters;
  venueType: string;
  logs: AbnormalLogRecord[];
  total: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  onSearch: (values: AbnormalLogSearchValues) => void;
  onReset: () => void;
  onRefresh: () => void;
  onPageChange: (page: number, pageSize: number) => void;
  title?: string;
}

export default function AbnormalLogPanel({
  form,
  siteOptions,
  exportFilters,
  venueType,
  logs,
  total,
  page,
  pageSize,
  loading = false,
  onSearch,
  onReset,
  onRefresh,
  onPageChange,
  title = "故障机信息管理",
}: AbnormalLogPanelProps) {
  const [filterExpanded, setFilterExpanded] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const fullscreenTargetId = "abnormal-log-panel-fullscreen";

  useEffect(() => {
    const onFullscreenChange = () => {
      const el = document.getElementById(fullscreenTargetId);
      setIsFullscreen(document.fullscreenElement === el);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const columns: ColumnsType<AbnormalLogRecord> = useMemo(
    () => [
      {
        title: "序号",
        key: "index",
        width: 64,
        fixed: "left",
        render: (_v, _r, index) => (page - 1) * pageSize + index + 1,
      },
      { title: "场地", dataIndex: "siteName", key: "siteName", width: 220, ellipsis: true },
      {
        title: "代理编码",
        dataIndex: "agentCode",
        key: "agentCode",
        width: 130,
        ellipsis: true,
        onCell: () => ({ className: "whitespace-nowrap" }),
      },
      { title: "机器IP", dataIndex: "ip", key: "ip", width: 130 },
      {
        title: "MAC地址",
        dataIndex: "mac",
        key: "mac",
        width: 150,
        render: (mac: string) => <span className="text-[#1677ff]">{mac}</span>,
      },
      {
        title: "控制板序列号",
        dataIndex: "controlBoardSN",
        key: "controlBoardSN",
        width: 150,
        ellipsis: true,
      },
      {
        title: "故障编码",
        dataIndex: "code",
        key: "code",
        width: 96,
        render: (code: FaultCode) => <Tag color={FAULT_CODE_COLOR[code]}>{code}</Tag>,
      },
      { title: "故障说明", dataIndex: "explanation", key: "explanation", width: 200, ellipsis: true },
      { title: "日志时间", dataIndex: "logTime", key: "logTime", width: 170 },
      { title: "采集时间", dataIndex: "collectTime", key: "collectTime", width: 170 },
      { title: "创建时间", dataIndex: "createdAt", key: "createdAt", width: 170 },
    ],
    [page, pageSize],
  );

  const pagination: TablePaginationConfig = {
    current: page,
    pageSize,
    total,
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50, 100, 200],
    showTotal: (t) => `共 ${t} 条记录`,
    locale: { items_per_page: "条/页" },
    onChange: onPageChange,
  };

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const res = await fetchAbnormalLogsExport(venueType, exportFilters);
      downloadExcelBlobResponse(res, `abnormal_logs_${dayjs().format("YYYYMMDD_HHmmss")}.xlsx`);
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
        className="bg-white min-w-0 [&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:h-screen [&:fullscreen]:overflow-auto"
      >
        <div className="px-5 pt-4 pb-3 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold text-gray-800 m-0">{title}</h2>
        </div>

        {filterExpanded ? (
          <div className="px-5 py-4 border-b border-gray-200 filter-form bg-white">
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
                <Form.Item name="siteCode" label="场地" className="!mb-0 min-w-0">
                  <Select
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    placeholder="全部"
                    options={siteOptions.map((s) => ({ label: s.name, value: s.id }))}
                  />
                </Form.Item>
                <Form.Item name="code" label="故障编码" className="!mb-0 min-w-0">
                  <Select
                    allowClear
                    placeholder="全部"
                    options={FAULT_CODES.map((c) => ({ label: c, value: c }))}
                  />
                </Form.Item>
                <Form.Item name="ip" label="机器IP" className="!mb-0 min-w-0">
                  <Input allowClear placeholder="请输入机器IP" />
                </Form.Item>
                <Form.Item name="mac" label="MAC地址" className="!mb-0 min-w-0">
                  <Input allowClear placeholder="请输入MAC地址" />
                </Form.Item>
                <Form.Item name="controlBoardSN" label="控制板序列号" className="!mb-0 min-w-0">
                  <Input allowClear placeholder="请输入控制板序列号" />
                </Form.Item>
                <Form.Item name="logTimeRange" label="日志时间" className="!mb-0 min-w-0 md:col-span-2">
                  <RangePicker showTime className="w-full" placeholder={["开始时间", "结束时间"]} />
                </Form.Item>
                <div className="flex min-w-0 justify-end gap-2 pb-0.5">
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
                disabled={exporting}
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
          </div>

          <div className="px-4 pb-4">
            <Table<AbnormalLogRecord>
              rowKey="id"
              columns={columns}
              dataSource={logs}
              loading={loading}
              size="middle"
              bordered={false}
              scroll={{ x: 1380 }}
              locale={{ emptyText: "暂无故障日志" }}
              pagination={pagination}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
