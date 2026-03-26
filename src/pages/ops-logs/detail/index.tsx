import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Space, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import { fetchEventOperationLogs } from "@/pages/venue/api.tsx";

const LogsDetail: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  // console.log("id》〉》", id);
  // const permission_routes = localStorage.getItem("permission_routes");
  // const is_log_visible = permission_routes?.includes(ROUTE_PATHS.logs);

  const columns: ColumnsType<any> = useMemo(
    () => [
      { title: "操作者", dataIndex: "username", key: "username", width: 120, ellipsis: true },
      { title: "IP", dataIndex: "ip", key: "ip", width: 130, ellipsis: true },
      { title: "状态", dataIndex: "response_status", key: "response_status", width: 100, ellipsis: true },
      {
        title: "事件行为",
        dataIndex: "operation_desc",
        key: "operation_desc",
        width: 220,
        ellipsis: { showTitle: false },
        render: (text: any) => (
          <Tooltip placement="topLeft" title={String(text ?? "")}>
            <span
              style={{
                display: "inline-block",
                maxWidth: "100%",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                verticalAlign: "middle",
              }}
            >
              {text ?? "-"}
            </span>
          </Tooltip>
        ),
      },
      {
        title: "场地",
        key: "venue_name",
        width: 200,
        ellipsis: { showTitle: false },
        render: (_: any, record: any) => {
          const raw = record?.request_body_detail ?? record?.request_body;
          const d =
            typeof raw === "string"
              ? (() => {
                  try {
                    return JSON.parse(raw);
                  } catch {
                    return undefined;
                  }
                })()
              : raw;
          const text = d?.venue_name ?? "-";
          return (
            <Tooltip placement="topLeft" title={String(text)}>
              <span
                style={{
                  display: "inline-block",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}
              >
                {text}
              </span>
            </Tooltip>
          );
        },
      },
      {
        title: "账户",
        key: "pool_name",
        width: 160,
        render: (_: any, record: any) => {
          const raw = record?.request_body_detail ?? record?.request_body;
          const d =
            typeof raw === "string"
              ? (() => {
                  try {
                    return JSON.parse(raw);
                  } catch {
                    return undefined;
                  }
                })()
              : raw;
          return d?.pool_name ?? "-";
        },
      },
      {
        title: "事件开始时间",
        key: "start_time",
        width: 180,
        render: (_: any, record: any) => {
          const raw = record?.request_body_detail ?? record?.request_body;
          const d =
            typeof raw === "string"
              ? (() => {
                  try {
                    return JSON.parse(raw);
                  } catch {
                    return undefined;
                  }
                })()
              : raw;
          return d?.start_time ?? "-";
        },
      },
      {
        title: "事件结束时间",
        key: "end_time",
        width: 180,
        render: (_: any, record: any) => {
          const raw = record?.request_body_detail ?? record?.request_body;
          const d =
            typeof raw === "string"
              ? (() => {
                  try {
                    return JSON.parse(raw);
                  } catch {
                    return undefined;
                  }
                })()
              : raw;
          return d?.end_time ?? "-";
        },
      },
      {
        title: "事件类型",
        key: "log_type",
        width: 100,
        render: (_: any, record: any) => {
          const raw = record?.request_body_detail ?? record?.request_body;
          const d =
            typeof raw === "string"
              ? (() => {
                  try {
                    return JSON.parse(raw);
                  } catch {
                    return undefined;
                  }
                })()
              : raw;
          return d?.log_type ?? "-";
        },
      },
      {
        title: "影响台数",
        key: "impact_count",
        width: 120,
        render: (_: any, record: any) => {
          const raw = record?.request_body_detail ?? record?.request_body;
          const d =
            typeof raw === "string"
              ? (() => {
                  try {
                    return JSON.parse(raw);
                  } catch {
                    return undefined;
                  }
                })()
              : raw;
          return typeof d?.impact_count === "number" ? d.impact_count : (d?.impact_count ?? "-");
        },
      },
      {
        title: "事件原因",
        key: "event_reason",
        width: 260,
        ellipsis: { showTitle: false },
        render: (_: any, record: any) => {
          const raw = record?.request_body_detail ?? record?.request_body;
          const d =
            typeof raw === "string"
              ? (() => {
                  try {
                    return JSON.parse(raw);
                  } catch {
                    return undefined;
                  }
                })()
              : raw;
          const text = d?.event_reason ?? "-";
          return (
            <Tooltip placement="topLeft" title={String(text)}>
              <span
                style={{
                  display: "inline-block",
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  verticalAlign: "middle",
                }}
              >
                {text}
              </span>
            </Tooltip>
          );
        },
      },
      {
        title: "是否休眠",
        key: "is_sleep",
        width: 100,
        render: (_: any, record: any) => {
          const raw = record?.request_body_detail ?? record?.request_body;
          const d =
            typeof raw === "string"
              ? (() => {
                  try {
                    return JSON.parse(raw);
                  } catch {
                    return undefined;
                  }
                })()
              : raw;
          const v = d?.is_sleep;
          if (v === 1 || v === true) return <span style={{ color: "#fa8c16" }}>已休眠</span>;
          if (v === 0 || v === false) return <span style={{ color: "#52c41a" }}>未休眠</span>;
          return "-";
        },
      },
      {
        title: "操作时间",
        dataIndex: "created_at",
        key: "created_at",
        width: 180,
        render: (text: any) => (text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-"),
      },
    ],
    [],
  );

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const res: any = await fetchEventOperationLogs(Number(id));
        const list = Array.isArray(res?.data?.list)
          ? res.data.list
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];
        setRows(list || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  return (
    <div className="mx-auto bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <Space>
          <Button type="primary" size="small" onClick={() => navigate(-1)}>
            &lt; 返回{" "}
          </Button>
          {/* <Button type="link" onClick={() => navigate(ROUTE_PATHS.logs)}>
            返回列表
          </Button> */}
        </Space>
      </div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={rows}
        rowKey={(r) => r.id ?? `${r.username}-${r.created_at}`}
        sticky
        scroll={{ y: "65vh", x: 900 }}
        pagination={false}
      />
    </div>
  );
};

export default LogsDetail;
