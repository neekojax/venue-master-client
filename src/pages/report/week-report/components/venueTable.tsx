import React, { useState } from "react";
import { Link } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";
import { Button, Form, Input, message, Modal, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import SitePerformanceCard from "./SitePerformanceCard";
import type { DataItem } from "./types";

import { fetchWeekEvent } from "@/pages/report/api.tsx";

// 统一使用共享类型，避免与其他组件的定义不一致

interface VenueTableProps {
  data: DataItem[];
  startDate?: string;
  endDate?: string;
  onRequestRefresh?: () => void; // 通知主界面刷新数据
}

const VenuePage: React.FC<VenueTableProps> = ({ data, startDate, endDate, onRequestRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataItem | null>(null);
  const [form] = Form.useForm();

  // const formatDatePlusOne = (date?: string) => {
  //   if (!date) return "-";
  //   return dayjs(date).add(1, "day").format("YYYY-MM-DD");
  // };

  const openEditModal = (record: DataItem) => {
    setEditingRecord(record);
    setIsModalOpen(true);
    // 初始化表单为当前记录值
    form.setFieldsValue({
      event_reason: record.event_reason ?? "",
      follow_up: record.follow_up ?? "",
      progress: record.progress ?? "",
    });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditingRecord(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!editingRecord) return;
      setSubmitting(true);
      const payload = {
        venue_id: editingRecord.venue_id,
        start_date: startDate,
        end_date: endDate,
        event_reason: values.event_reason,
        follow_up: values.follow_up,
        progress: values.progress,
      };
      await fetchWeekEvent(payload);
      message.success("周报事件已更新");
      setSubmitting(false);
      handleCancel();
      // 刷新数据
      if (onRequestRefresh) {
        onRequestRefresh();
      }
    } catch (err) {
      setSubmitting(false);
      // 表单校验或接口异常
      if ((err as any)?.errorFields) return; // 校验错误不提示
      message.error("提交失败，请稍后重试");
    }
  };

  const columns: ColumnsType<DataItem> = [
    {
      title: "场地名称",
      dataIndex: "venue_name",
      key: "venue_name",
      align: "left",
      width: 250,
      sorter: (a: DataItem, b: DataItem) => a.venue_name.localeCompare(b.venue_name),
      // defaultSortOrder: "ascend", // ✅ 默认升序
      render: (text: string, record: { venue_name?: any; venue_id?: any }) => {
        const isSpecialVenue = text === "Arct-HF01-J XP-AR-US" || text === "ARCT Technologies-HF02-AR-US";
        return (
          <Tooltip title={text} placement="top" style={{ color: "white" }}>
            <div
              style={{
                width: "100%",
                overflow: "hidden",
                color: isSpecialVenue ? "red" : "#333", // 特殊场地字体颜色为红色
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontWeight: isSpecialVenue ? "bold" : "normal", // 加粗特殊场地
              }}
            >
              {isSpecialVenue && (
                <Tag color="red" style={{ marginLeft: 2 }}>
                  补充
                </Tag>
              )}

              <Link to={`/venue/detail/${record.venue_id}`} className="text-blue-500 hover:underline">
                {text}
              </Link>
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "理论算力 (PH/s)",
      dataIndex: "average_thermal_power",
      key: "average_thermal_power",
      align: "center",
      width: 150,
      render: (value: number) => value?.toFixed(3),
    },
    {
      title: "实际算力 (PH/s)",
      dataIndex: "average_power_24h",
      key: "average_power_24h",
      align: "center",
      width: 150,
      render: (value: number) => value?.toFixed(3),
    },
    {
      title: "算力有效率",
      dataIndex: "average_hash_effective_rate",
      key: "average_hash_effective_rate",
      align: "center",
      width: 250,
      sorter: (a, b) => a.average_hash_effective_rate - b.average_hash_effective_rate,
      render: (value: number, record: { hash_effective_diff_rate?: number }) => {
        const diff = record?.hash_effective_diff_rate ?? 0;
        const isIncrease = diff > 0;
        const barColor = isIncrease ? "bg-green-500" : diff < 0 ? "bg-red-500" : "bg-gray-400";
        const indicatorColor = isIncrease ? "text-green-600" : diff < 0 ? "text-red-600" : "text-gray-500";
        const arrow = isIncrease ? "↑ " : diff < 0 ? "↓ " : "→ ";
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div className={`${barColor} h-2 rounded-full`} style={{ width: `${value}%` }}></div>
            </div>
            <span>{value}%</span>
            <span className={`${indicatorColor} text-xs ml-1`}>
              {arrow}
              {Math.abs(diff).toFixed(2)}%
            </span>
          </div>
        );
      },
    },
    {
      title: "净有效率",
      dataIndex: "forecast_hash_efficiency",
      key: "forecast_hash_efficiency",
      align: "center",
      width: 150,
      render: (value: number) => value?.toFixed(2) + "%",
      sorter: (a, b) => a.forecast_hash_efficiency - b.forecast_hash_efficiency,
    },
    // 新增字段展示
    {
      title: "故障数",
      width: 120,
      dataIndex: "average_failure",
      key: "average_failure",
      align: "center",
      render: (value: number | undefined) => value ?? 0,
    },
    {
      title: "故障率",
      width: 150,
      dataIndex: "average_failure_rate",
      key: "average_failure_rate",
      align: "center",
      sorter: (a, b) => a.average_failure_rate - b.average_failure_rate,
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-red-500 h-2 rounded-full" style={{ width: `${value}%` }}></div>
          </div>
          <span>{value}%</span>
        </div>
      ),
    },
    {
      title: "待修率",
      width: 150,
      dataIndex: "average_pending_repair_rate",
      key: "average_pending_repair_rate",
      align: "center",
      sorter: (a, b) => a.average_pending_repair_rate - b.average_pending_repair_rate,
      render: (value) => <span className="text-orange-500">{value}%</span>,
    },
    {
      title: "净故障率",
      width: 150,
      dataIndex: "average_net_failure_rate",
      key: "average_net_failure_rate",
      align: "center",
      render: (value: number | undefined) => (value == null ? "-" : `${value.toFixed(2)}%`),
      sorter: (a, b) => (a.average_net_failure_rate ?? 0) - (b.average_net_failure_rate ?? 0),
    },

    // {
    //   title: "待维修数",
    //   width: 130,
    //   dataIndex: "average_pending_repair",
    //   key: "average_pending_repair",
    //   align: "center",
    //   render: (value: number | undefined) => (value ?? 0),
    // },
    {
      title: "报废数",
      width: 120,
      dataIndex: "average_scrap",
      key: "average_scrap",
      align: "center",
      render: (value: number | undefined) => value ?? 0,
    },
    {
      title: "高温影响率",
      width: 150,
      dataIndex: "average_high_temperature_impact_rate",
      key: "average_high_temperature_impact_rate",
      align: "center",
      sorter: (a, b) => a.average_high_temperature_impact_rate - b.average_high_temperature_impact_rate,
      render: (value) => <span className="text-orange-500">{value}%</span>,
    },
    {
      title: "限电影响率",
      width: 150,
      dataIndex: "average_limit_impact_rate",
      key: "average_limit_impact_rate",
      align: "center",
      sorter: (a, b) => a.average_limit_impact_rate - b.average_limit_impact_rate,
      render: (value) => <span className="text-yellow-500">{value}%</span>,
    },

    {
      title: "本周上架",
      width: 120,
      dataIndex: "week_shelved",
      key: "week_shelved",
      align: "center",
      render: (value: number | undefined) => value ?? 0,
    },
    {
      title: "本周下架",
      width: 120,
      dataIndex: "week_unshelved",
      key: "week_unshelved",
      align: "center",
      render: (value: number | undefined) => value ?? 0,
    },
    {
      title: "关机币价",
      width: 150,
      dataIndex: "shutdown_price",
      key: "shutdown_price",
      align: "center",
      render: (value: number | undefined) => (value == null ? "-" : `${value.toFixed(2)}`),
    },
    {
      title: "事件原因",
      width: 200,
      dataIndex: "event_reason",
      key: "event_reason",
      align: "left",
      render: (text: string | undefined) => (
        <Tooltip title={text ?? ""} placement="top">
          <span
            style={{
              display: "inline-block",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text ?? "-"}
          </span>
        </Tooltip>
      ),
    },

    {
      title: "跟进事项",
      width: 200,
      dataIndex: "follow_up",
      key: "follow_up",
      align: "left",
      render: (text: string | undefined) => (
        <Tooltip title={text ?? ""} placement="top">
          <span
            style={{
              display: "inline-block",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text ?? "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "处理进度",
      width: 150,
      dataIndex: "progress",
      key: "progress",
      align: "center",
      render: (text: string | undefined) => (
        <Tooltip title={text ?? ""} placement="top">
          <span
            style={{
              display: "inline-block",
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {text ?? "-"}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "操作",
      width: 150,
      dataIndex: "operation",
      key: "operation",
      align: "center",
      render: (_: any, record: DataItem) => (
        <Tooltip title="编辑">
          <Button type="text" icon={<EditOutlined />} onClick={() => openEditModal(record)} />
        </Tooltip>
      ),
    },
  ];

  return (
    <>
      <SitePerformanceCard columns={columns} data={data} onSearch={(val) => console.log("搜索:", val)} />
      <Modal
        title="编辑周报事件"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button size="small" key="cancel" onClick={handleCancel}>
            取消
          </Button>,
          <Button size="small" key="submit" type="primary" loading={submitting} onClick={handleSubmit}>
            提交
          </Button>,
        ]}
        destroyOnClose
        maskClosable={!submitting}
      >
        <div className="mb-3 text-sm text-gray-500">
          <div>场地ID：{editingRecord?.venue_id ?? "-"}</div>
          <div>开始日期：{startDate}</div>
          <div>结束日期：{endDate}</div>
        </div>
        <Form form={form} layout="vertical">
          <Form.Item name="event_reason" label="事件原因">
            <Input.TextArea rows={2} placeholder="请输入事件原因" style={{ fontSize: "12px" }} />
          </Form.Item>
          <Form.Item name="progress" label="处理进度">
            <Input.TextArea rows={3} placeholder="请输入处理进度" style={{ fontSize: "12px" }} />
          </Form.Item>
          <Form.Item name="follow_up" label="跟进事项">
            <Input.TextArea rows={3} placeholder="请输入跟进事项" style={{ fontSize: "12px" }} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default VenuePage;
