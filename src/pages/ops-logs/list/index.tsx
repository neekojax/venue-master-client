import React, { useEffect, useMemo, useState } from "react";
import { Button, Input, Select, Space, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchGet } from "@/helper/fetchHelper.ts";
import { useVenueList } from "@/pages/venue/hook/hook.ts";

const LogsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [dataSource, setDataSource] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [username, setUsername] = useState<string>("");
  const [selectedVenueName, setSelectedVenueName] = useState<string | undefined>(undefined);

  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const { data: venueList } = useVenueList(poolType);
  const siteOptions = useMemo(
    () =>
      Array.from(new Set((venueList?.data || []).map((v: any) => v.venue_name))).map((name) => ({
        label: name,
        value: name,
      })),
    [venueList],
  );

  const columns: ColumnsType<any> = useMemo(() => {
    // const getDetail = (record: any) => {
    //   const raw = record?.request_body_detail ?? record?.request_body;
    //   if (!raw) return undefined;
    //   if (typeof raw === "object" && raw !== null) return raw;
    //   if (typeof raw === "string") {
    //     try {
    //       return JSON.parse(raw);
    //     } catch {
    //       return undefined;
    //     }
    //   }
    //   return undefined;
    // };
    return [
      { title: "用户", dataIndex: "username", key: "username", width: 80, ellipsis: true },
      // { title: "状态", dataIndex: "response_status", key: "response_status", width: 100, ellipsis: true },
      {
        title: "操作类型",
        dataIndex: "operation_type",
        key: "operation_type",
        width: 80,
        ellipsis: { showTitle: false },
        render: (text: any) => {
          const t = String(text ?? "").toLowerCase();
          const color =
            t === "delete" ? "red" : t === "update" ? "blue" : t === "create" ? "green" : "default";
          return <Tag color={color}>{text ?? "-"}</Tag>;
        },
      },
      {
        title: "操作描述",
        dataIndex: "operation_desc",
        key: "operation_desc",
        width: 120,
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
        title: "操作状态",
        dataIndex: "response_status",
        key: "response_status",
        width: 80,
        render: (text: any) => (
          <Tag color={text === 200 ? "green" : "red"}>{text === 200 ? "成功" : "失败"}</Tag>
        ),
      },
      {
        title: "场地",
        dataIndex: "venue_name",
        key: "venue_name",
        width: 200,
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
        title: "操作内容",
        dataIndex: "request_body",
        key: "request_body",
        width: 200,
        ellipsis: { showTitle: false },
        render: (text: any) => {
          let formattedText = String(text ?? "");
          try {
            if (text) {
              const parsed = typeof text === "string" ? JSON.parse(text) : text;
              formattedText = JSON.stringify(parsed, null, 2);
            }
          } catch (e) {
            // keep original text if it's not valid JSON
          }

          return (
            <Tooltip
              placement="topLeft"
              title={
                <pre style={{ margin: 0, padding: 0, maxHeight: "400px", overflow: "auto" }}>
                  {formattedText}
                </pre>
              }
              overlayInnerStyle={{ width: "max-content", maxWidth: "600px" }}
            >
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
          );
        },
      },
      {
        title: "操作时间",
        dataIndex: "created_at",
        key: "created_at",
        width: 160,
        render: (text: any) => {
          // const d = getDetail(record);
          return text ? dayjs(text).format("YYYY-MM-DD HH:mm:ss") : "-";
        },
      },
    ];
  }, []);

  const fetchData = async (p = page, ps = pageSize) => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        page: p,
        pageSize: ps,
      };
      if (username?.trim()) params.username = username.trim();
      if (selectedVenueName?.trim()) params.venueName = selectedVenueName.trim();
      const res: any = await fetchGet(`/event/operationLogs`, params);
      const list = Array.isArray(res?.data?.list)
        ? res.data.list
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : res?.data || [];
      const t =
        typeof res?.data?.total === "number" ? res.data.total : Number(res?.data?.total) || list.length || 0;
      setDataSource((list || []).map((r: any, idx: number) => ({ key: r.id ?? `${p}-${idx}`, ...r })));
      setTotal(t);
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchData(1, pageSize);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    setDataSource([]);
    setTotal(0);
    setPage(1);
    fetchData(1, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVenueName, username]);

  const scrollX = useMemo(() => {
    const cols = (columns as any[]) || [];
    const total = cols.reduce((sum, col) => {
      const w = Number((col as any)?.width);
      return sum + (Number.isFinite(w) ? w : 160);
    }, 0);
    return Math.max(total, 900);
  }, [columns]);

  return (
    <div className="mx-auto bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <Space>
          <Input
            placeholder="用户名"
            allowClear
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: 180 }}
            size="middle"
          />
          <Select
            size="middle"
            placeholder="选择场地"
            style={{ minWidth: "300px", marginRight: "15px" }}
            options={siteOptions}
            onChange={(val) => setSelectedVenueName(val)}
            value={selectedVenueName}
            allowClear
          />
          <Button
            type="primary"
            size="middle"
            onClick={() => {
              setPage(1);
              fetchData(1, pageSize);
            }}
          >
            查询
          </Button>
        </Space>
      </div>
      <Table
        loading={loading}
        columns={columns}
        dataSource={dataSource}
        // sticky
        scroll={{ y: "60vh", x: scrollX }}
        pagination={{
          total,
          current: page,
          pageSize,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "30", "50", "100"],
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
            fetchData(p, ps);
            const body = document.querySelector(".ant-table-body");
            if (body) body.scrollTop = 0;
          },
          showTotal: (t) => `共 ${t} 条`,
        }}
      />
    </div>
  );
};

export default LogsPage;
