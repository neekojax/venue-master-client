import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import DOMPurify from "dompurify";

import "react-quill/dist/quill.snow.css";

// 仅在展示端保留有限的样式属性，避免丢失常见格式（颜色/背景/对齐/字号）
const sanitizeHTML = (html?: string) =>
  DOMPurify.sanitize(html || "", {
    USE_PROFILES: { html: true },
    // 扩展允许的属性以支持图片、视频等常见内容
    ALLOWED_ATTR: [
      "class",
      "style",
      "href",
      "target",
      "rel",
      "align",
      "src",
      "alt",
      "title",
      "width",
      "height",
      "controls",
      "frameborder",
      "allow",
      "allowfullscreen",
      "referrerpolicy",
    ],
    // 扩展允许的标签，尽量覆盖常见富文本场景
    ALLOWED_TAGS: [
      "p",
      "br",
      "span",
      "strong",
      "em",
      "u",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "h1",
      "h2",
      "h3",
      "div",
      "img",
      "video",
      "sub",
      "sup",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
    ],
  });

// 将后端可能存储的 HTML 实体（如 &lt;br/&gt;）还原为真实标签
// const decodeHTML = (html?: string) => {
//   if (!html) return "";
//   console.log("html11", html);
//   const el = document.createElement("textarea");
//   el.innerHTML = html;
//   return el.value;
// };

// const decodeHTML = (html?: string) => html || "";
const decodeHTML = (html?: string) => {
  if (!html) return "";
  const el = document.createElement("textarea");
  el.innerHTML = html;
  return el.value;
};

import { Link } from "react-router-dom";
import { EditOutlined } from "@ant-design/icons";
import { Button, Form, message, Modal, Tag, Tooltip } from "antd";
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

const OVERCLOCK_TEXT_COLOR = "#1677ff";

function renderOverclockMetric(
  primary: number,
  secondary: number,
  isOverclocked: number,
  digits: number,
  suffix = "",
) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f6f6f6",
          padding: "2px 10px",
          borderRadius: "8px",
          minWidth: "96px",
          fontWeight: "bold",
          fontSize: "12px",
        }}
      >
        {Number(primary ?? 0).toFixed(digits)}
        {suffix}
      </div>
      {isOverclocked === 1 ? (
        <div
          style={{
            border: `1px solid ${OVERCLOCK_TEXT_COLOR}`,
            color: OVERCLOCK_TEXT_COLOR,
            backgroundColor: "#f0f8ff",
            padding: "1px 10px",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: "bold",
            whiteSpace: "nowrap",
          }}
        >
          {Number(secondary ?? 0).toFixed(digits)}
          {suffix}
        </div>
      ) : null}
    </div>
  );
}

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "align",
  "link",
  "image",
  "color",
  "background",
];

// 富文本编辑器（React-Quill）：保留格式、支持常用工具栏与行高设置
const SimpleRichEditor: React.FC<{
  value?: string; // HTML 字符串
  onChange?: (val: string) => void; // 返回 HTML 字符串
  placeholder?: string;
  refreshKey?: string | number; // 用于强制刷新组件
}> = ({ value = "", onChange, placeholder, refreshKey }) => {
  // console.log("value >> SimpleRichEditor", value);
  const quillRef = React.useRef<ReactQuill | null>(null);

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ color: [] }, { background: [] }],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ align: [] }],
      ["blockquote", "link", "image"],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  // 当外部传入的 HTML 发生变化时，使用 Quill 的 dangerouslyPasteHTML 进行导入，避免格式丢失
  React.useEffect(() => {
    const incoming = value || "";
    const quillInstance: any = (quillRef.current as any)?.getEditor?.() || (quillRef.current as any)?.editor;
    if (!quillInstance) return;
    try {
      const currentHTML = quillInstance?.root?.innerHTML || "";
      // 仅当传入值包含 HTML 且与当前内容不一致时粘贴，减少不必要覆盖
      if (incoming && incoming.includes("<") && incoming !== currentHTML) {
        quillInstance.clipboard.dangerouslyPasteHTML(incoming);
      }
    } catch (e) {
      // 兜底：不抛错影响页面，保持受控 value 渲染
      console.warn("Quill dangerouslyPasteHTML failed:", e);
    }
  }, [value, refreshKey]);

  return (
    <div>
      <ReactQuill
        key={refreshKey}
        ref={quillRef}
        theme="snow"
        value={value || ""}
        placeholder={placeholder || "请输入内容"}
        modules={modules}
        onChange={(html) => {
          onChange?.(html);
        }}
        formats={formats}
      />
    </div>
  );
};

const VenuePage: React.FC<VenueTableProps> = ({ data, startDate, endDate, onRequestRefresh }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DataItem | null>(null);
  const [form] = Form.useForm();

  // const formatDatePlusOne = (date?: string) => {
  //   if (!date) return "-";
  //   return dayjs(date).add(1, "day").format("YYYY-MM-DD");
  // };

  // const [editorRefreshKey, setEditorRefreshKey] = useState(0);

  const openEditModal = (record: DataItem) => {
    setEditingRecord(record);
    setIsModalOpen(true);
    // setEditorRefreshKey((k) => k + 1); // 触发编辑器强制刷新
    // 表单初始值改由 Form.initialValues 控制，避免未挂载时调用 setFieldsValue 警告
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

  useEffect(() => {
    if (editingRecord) {
      // console.log("editingRecord>>222", editingRecord.event_reason);
      form.setFieldsValue({
        event_reason: decodeHTML(editingRecord.event_reason || ""),
        follow_up: decodeHTML(editingRecord.follow_up || ""),
        progress: decodeHTML(editingRecord.progress || ""),
      });
      // 刷新组件状态
    }
  }, [editingRecord]);

  const columns: ColumnsType<DataItem> = [
    {
      title: "场地名称",
      dataIndex: "venue_name",
      key: "venue_name",
      align: "left",
      width: 250,
      fixed: "left",
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
      title: (
        <span>
          理论算力 (PH/s)
          <span style={{ marginLeft: 4 }}>/ 变频</span>
        </span>
      ),
      dataIndex: "average_thermal_power",
      key: "average_thermal_power",
      align: "center",
      width: 220,
      render: (_value: number, record: DataItem) =>
        renderOverclockMetric(
          record.average_thermal_power,
          Number(record.average_overclock_theoretical_power ?? 0),
          Number(record.IsOverclocked ?? record.isOverclocked ?? record.is_overclocked ?? 0),
          3,
        ),
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
      title: "产出效率(BTC/EH)",
      dataIndex: "output_efficiency",
      key: "output_efficiency",
      align: "center",
      width: 150,
      render: (value: number) => value?.toFixed(4),
    },
    {
      title: (
        <span>
          算力有效率
          <span style={{ marginLeft: 4 }}>/ 变频</span>
        </span>
      ),
      dataIndex: "average_hash_effective_rate",
      key: "average_hash_effective_rate",
      align: "center",
      width: 300,
      sorter: (a, b) => a.average_hash_effective_rate - b.average_hash_effective_rate,
      render: (value: number, record: DataItem & { hash_effective_diff_rate?: number }) => {
        const diff = record?.hash_effective_diff_rate ?? 0;
        const isIncrease = diff > 0;
        const barColor = isIncrease ? "bg-green-500" : diff < 0 ? "bg-red-500" : "bg-gray-400";
        const indicatorColor = isIncrease ? "text-green-600" : diff < 0 ? "text-red-600" : "text-gray-500";
        const arrow = isIncrease ? "↑ " : diff < 0 ? "↓ " : "→ ";
        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`${barColor} h-2 rounded-full`}
                style={{ width: `${Math.min(value, 100)}%` }}
              ></div>
            </div>
            <span>
              {renderOverclockMetric(
                value,
                Number(record.average_overclock_hash_effective_rate ?? 0),
                Number(record.IsOverclocked ?? record.isOverclocked ?? record.is_overclocked ?? 0),
                2,
                "%",
              )}
            </span>
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
      width: 250,
      dataIndex: "average_failure_rate",
      key: "average_failure_rate",
      align: "center",
      sorter: (a, b) => a.average_failure_rate - b.average_failure_rate,
      render: (value: number | undefined, record: any) => {
        const diff = record?.failure_rate_diff_rate ?? 0;
        const isIncrease = diff > 0;
        const barColor = isIncrease ? "bg-green-500" : diff < 0 ? "bg-red-500" : "bg-gray-400";
        const indicatorColor = isIncrease ? "text-green-600" : diff < 0 ? "text-red-600" : "text-gray-500";
        const arrow = isIncrease ? "↑ " : diff < 0 ? "↓ " : "→ ";

        return (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`${barColor} h-2 rounded-full`}
                style={{ width: `${Math.min(value ?? 0, 100)}%` }}
              ></div>
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
      title: "待修率",
      width: 150,
      dataIndex: "average_pending_repair_rate",
      key: "average_pending_repair_rate",
      align: "center",
      sorter: (a, b) => a.average_pending_repair_rate - b.average_pending_repair_rate,
      render: (value: number | undefined, record: any) => {
        const diff = record?.pending_repair_rate_diff_rate ?? 0;
        const isIncrease = diff > 0;
        // const barColor = isIncrease ? "bg-green-500" : diff < 0 ? "bg-red-500" : "bg-gray-400";
        const indicatorColor = isIncrease ? "text-green-600" : diff < 0 ? "text-red-600" : "text-gray-500";
        const arrow = isIncrease ? "↑ " : diff < 0 ? "↓ " : "→ ";
        return (
          <div className="flex items-center gap-2">
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
      render: (value) => <span>{value}%</span>,
    },
    {
      title: "限电影响率",
      width: 150,
      dataIndex: "average_limit_impact_rate",
      key: "average_limit_impact_rate",
      align: "center",
      sorter: (a, b) => a.average_limit_impact_rate - b.average_limit_impact_rate,
      render: (value) => <span>{value}%</span>,
    },
    {
      title: "低功耗影响率",
      width: 150,
      dataIndex: "average_low_power_impact_rate",
      key: "average_low_power_impact_rate",
      align: "center",
      sorter: (a, b) => (a.average_low_power_impact_rate ?? 0) - (b.average_low_power_impact_rate ?? 0),
      render: (value) => <span>{value}%</span>,
    },
    {
      title: "撤场比例",
      width: 150,
      dataIndex: "average_withdraw_impact_rate",
      key: "average_withdraw_impact_rate",
      align: "center",
      sorter: (a, b) => (a.average_withdraw_impact_rate ?? 0) - (b.average_withdraw_impact_rate ?? 0),
      render: (value) => <span>{value}%</span>,
    },
    {
      title: "云算力比例",
      width: 150,
      dataIndex: "average_cloud_power_rate",
      key: "average_cloud_power_rate",
      align: "center",
      sorter: (a, b) => (a.average_cloud_power_rate ?? 0) - (b.average_cloud_power_rate ?? 0),
      render: (value) => <span>{value}%</span>,
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
      render: (text: string | undefined) => {
        const safe = sanitizeHTML(decodeHTML(text));
        if (!safe) return <span>-</span>;
        return (
          <Tooltip
            title={
              <div
                className="text-[12px] content-html"
                style={{
                  width: 200,
                  whiteSpace: "normal",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
                dangerouslySetInnerHTML={{ __html: safe }}
              />
            }
            placement="top"
          >
            <div
              className="text-[12px] content-html"
              style={{
                display: "inline-block",
                width: 200,
                whiteSpace: "normal",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                verticalAlign: "middle",
                textAlign: "left",
              }}
              dangerouslySetInnerHTML={{ __html: safe }}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "跟进事项",
      width: 200,
      dataIndex: "follow_up",
      key: "follow_up",
      align: "left",
      render: (text: string | undefined) => {
        const safe = sanitizeHTML(decodeHTML(text));
        if (!safe) return <span>-</span>;
        return (
          <Tooltip
            title={
              <div
                className="text-[12px] content-html"
                style={{
                  width: 200,
                  whiteSpace: "normal",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
                dangerouslySetInnerHTML={{ __html: safe }}
              />
            }
            placement="top"
          >
            <div
              className="text-[12px] content-html"
              style={{
                display: "inline-block",
                width: 200,
                whiteSpace: "normal",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                verticalAlign: "middle",
                textAlign: "left",
              }}
              dangerouslySetInnerHTML={{ __html: safe }}
            />
          </Tooltip>
        );
      },
    },
    {
      title: "处理进度",
      width: 150,
      dataIndex: "progress",
      key: "progress",
      align: "left",
      render: (text: string | undefined) => {
        const safe = sanitizeHTML(decodeHTML(text));
        if (!safe) return <span>-</span>;
        return (
          <Tooltip
            title={
              <div
                className="text-[12px] content-html"
                style={{
                  width: 200,
                  whiteSpace: "normal",
                  overflowWrap: "anywhere",
                  wordBreak: "break-word",
                }}
                dangerouslySetInnerHTML={{ __html: safe }}
              />
            }
            placement="top"
          >
            <div
              className="text-[12px] content-html"
              style={{
                display: "inline-block",
                width: 200,
                whiteSpace: "normal",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                verticalAlign: "middle",
                textAlign: "left",
              }}
              dangerouslySetInnerHTML={{ __html: safe }}
            />
          </Tooltip>
        );
      },
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
        <Form form={form} layout="vertical" key={editingRecord?.venue_id ?? "form"}>
          <Form.Item name="event_reason" label="事件原因">
            <SimpleRichEditor
              value={form.getFieldValue("event_reason")}
              onChange={(html) => form.setFieldValue("event_reason", html)}
              placeholder="请输入事件原因"
              refreshKey={`event_reason_${editingRecord?.venue_id ?? "form"}`}
            />
          </Form.Item>
          <Form.Item name="progress" label="处理进度">
            <SimpleRichEditor
              value={form.getFieldValue("progress")}
              onChange={(html) => form.setFieldValue("progress", html)}
              placeholder="请输入处理进度"
              refreshKey={`progress_${editingRecord?.venue_id ?? "form"}`}
            />
          </Form.Item>
          <Form.Item name="follow_up" label="跟进事项">
            <SimpleRichEditor
              value={form.getFieldValue("follow_up")}
              onChange={(html) => form.setFieldValue("follow_up", html)}
              placeholder="请输入跟进事项"
              refreshKey={`follow_up_${editingRecord?.venue_id ?? "form"}`}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default VenuePage;
