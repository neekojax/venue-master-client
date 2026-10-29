import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Empty, Input, message, Select, Space, Spin, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { type DailySnapshot, fetchDailySnapshots, type SnapshotEvent } from "../snapshot-api";
import { ROUTE_PATHS } from "@/constants/common";
import { useSelector, useSettingsStore } from "@/stores";

import { t } from "@/locales";
import ResizableHeaderCell from "@/pages/custody-statistics/statistics/components/ResizableHeaderCell";

type SnapshotEventRow = SnapshotEvent & { key: string; snapshotOwner: string; snapshotOwnerName: string };

const display = (value: unknown) =>
  value == null || value === "" ? "-" : typeof value === "object" ? JSON.stringify(value) : String(value);

const formatImpactPower = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? (
    <span>
      {numberValue.toFixed(2)} <span className="text-slate-400">T</span>
    </span>
  ) : (
    "-"
  );
};

const formatDateTime = (value: unknown) => (value ? dayjs(String(value)).format("YYYY-MM-DD HH:mm:ss") : "-");

const downloadSnapshotEvents = (events: SnapshotEventRow[], reportDate: string) => {
  const rows = events.map((event) => ({
    [t("场地")]: display(event.venue_name ?? event.snapshotOwnerName),
    [t("子账户")]: display(event.sub_account_name),
    [t("事件类型")]: display(event.log_type),
    [t("机器型号")]: display(event.machine_model),
    [t("机器状态")]: display(event.machine_status),
    [t("时间范围")]: `${display(event.start_time)} - ${display(event.end_time)}`,
    [t("计算时长(分)")]: display(event.event_duration_minutes),
    [t("影响台数")]: display(event.event_impact_count),
    [t("日报影响算力")]: Number.isFinite(Number(event.daily_report_impact_hashrate))
      ? `${Number(event.daily_report_impact_hashrate).toFixed(2)} T`
      : "-",
    [t("事件原因")]: display(event.event_reason),
    [t("创建时间")]: formatDateTime(event.event_created_at),
    [t("更新时间")]: formatDateTime(event.event_updated_at),
  }));
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, t("事件快照"));
  XLSX.writeFile(workbook, t("事件快照_{{value}}.xlsx", { value: reportDate }));
};

const eventTypeColors: Record<string, string> = {
  限电: "red",
  设备故障: "orange",
  电力: "cyan",
  高温: "blue",
  极端天气: "magenta",
  日常维护: "green",
  网络: "geekblue",
  低功耗: "purple",
  其他: "default",
};

const VENUE_COLUMN_WIDTH_STORAGE_KEY = "daily-event-snapshot-venue-column-width";
const DEFAULT_VENUE_COLUMN_WIDTH = 200;

interface DailySnapshotPageProps {
  embedded?: boolean;
}

export default function DailySnapshotPage({ embedded = false }: DailySnapshotPageProps) {
  const [params, setParams] = useSearchParams();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const inputDate = params.get("date");
  const date =
    inputDate && dayjs(inputDate).isValid()
      ? dayjs(inputDate).format("YYYY-MM-DD")
      : dayjs().subtract(1, "day").format("YYYY-MM-DD");
  const reportType = params.get("reportType") === "account" ? "account" : "venue";
  const [snapshots, setSnapshots] = useState<DailySnapshot[]>([]);
  const [versionId, setVersionId] = useState<number>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [search, setSearch] = useState("");
  const [venueColumnWidth, setVenueColumnWidth] = useState(() => {
    const storedWidth = Number(localStorage.getItem(VENUE_COLUMN_WIDTH_STORAGE_KEY));
    return Number.isFinite(storedWidth) && storedWidth >= 160 ? storedWidth : DEFAULT_VENUE_COLUMN_WIDTH;
  });

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    setSnapshots([]);
    setVersionId(undefined);
    fetchDailySnapshots(poolType, date, reportType)
      .then((list) => {
        if (!active) return;
        const sorted = [...list].sort((a, b) => b.version - a.version);
        setSnapshots(sorted);
        setVersionId(sorted[0]?.id);
      })
      .catch((fetchError) => {
        if (active) setError(fetchError instanceof Error ? fetchError.message : t("加载失败"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [poolType, date, reportType, refresh]);

  const selected = snapshots.find((item) => item.id === versionId);
  const eventRows = useMemo<SnapshotEventRow[]>(() => {
    const statistics = selected?.reportData.dailyReportStatistics ?? {};
    return Object.entries(selected?.eventDetails ?? {}).flatMap(([snapshotOwner, events]) => {
      const owner = statistics[snapshotOwner] ?? {};
      const snapshotOwnerName = display(
        owner.venue_name ?? owner.account_name ?? owner.sub_account_name ?? snapshotOwner,
      );
      return events.map((event, index) => ({
        ...event,
        key: `${snapshotOwner}-${event.event_id ?? index}`,
        snapshotOwner,
        snapshotOwnerName,
      }));
    });
  }, [selected]);
  const filteredEvents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return eventRows;
    return eventRows.filter((event) =>
      [event.venue_name, event.sub_account_name, event.log_type, event.event_reason, event.snapshotOwner]
        .map(display)
        .join(" ")
        .toLowerCase()
        .includes(keyword),
    );
  }, [eventRows, search]);

  const columns: ColumnsType<SnapshotEventRow> = [
    { title: t("序号"), width: 72, render: (_, __, index) => index + 1 },
    {
      title: t("场地"),
      width: venueColumnWidth,
      fixed: "left",
      onHeaderCell: () =>
        ({
          width: venueColumnWidth,
          onColumnResize: (nextWidth: number) => {
            setVenueColumnWidth(nextWidth);
            localStorage.setItem(VENUE_COLUMN_WIDTH_STORAGE_KEY, String(nextWidth));
          },
        }) as any,
      render: (_, event) => {
        const venueName = display(event.venue_name ?? event.snapshotOwnerName);
        const venueContent = event.venue_id ? (
          <Link
            to={`/venue/detail/${event.venue_id}`}
            className="block truncate text-[#1677ff] hover:underline"
          >
            {venueName}
          </Link>
        ) : (
          <span className="block truncate text-[#1677ff]">{venueName}</span>
        );
        return <Tooltip title={venueName}>{venueContent}</Tooltip>;
      },
    },
    { title: t("子账户"), dataIndex: "sub_account_name", width: 170, render: display },
    {
      title: t("事件类型"),
      dataIndex: "log_type",
      width: 120,
      render: (value) => {
        const eventType = display(value);
        return eventType === "-" ? "-" : <Tag color={eventTypeColors[eventType]}>{t(eventType)}</Tag>;
      },
    },
    { title: t("机器型号"), dataIndex: "machine_model", width: 140, render: display },
    { title: t("机器状态"), dataIndex: "machine_status", width: 120, render: display },
    {
      title: t("时间范围"),
      dataIndex: "start_time",
      width: 280,
      render: (_text, record) => `${display(record.start_time)} - ${display(record.end_time)}`,
    },
    {
      title: t("计算时长(分)"),
      dataIndex: "event_duration_minutes",
      width: 115,
      align: "right",
      render: display,
    },
    { title: t("影响台数"), dataIndex: "event_impact_count", width: 90, align: "right", render: display },
    {
      title: t("日报影响算力"),
      dataIndex: "daily_report_impact_hashrate",
      width: 130,
      align: "right",
      render: formatImpactPower,
    },
    { title: t("事件原因"), dataIndex: "event_reason", width: 260, ellipsis: true, render: display },
    {
      title: t("创建时间"),
      dataIndex: "event_created_at",
      width: 200,
      render: (value) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-"),
    },
    {
      title: t("更新时间"),
      dataIndex: "event_updated_at",
      width: 200,
      render: (value) => (value ? dayjs(value).format("YYYY-MM-DD HH:mm:ss") : "-"),
    },
  ];

  return (
    <div className={embedded ? "" : "min-h-full bg-[#f5f5f5] -m-4 p-4"}>
      <div className="rounded-xl bg-white border border-slate-200 p-4 sm:p-6">
        <div className="flex flex-wrap justify-between items-center gap-3 mb-5">
          <h1 className="text-xl font-bold text-slate-800">{t("事件快照")}</h1>
          {!embedded ? (
            <Link to={reportType === "account" ? ROUTE_PATHS.subAccountDailyReport : ROUTE_PATHS.dailyReport}>
              <Button>{t("返回日报")}</Button>
            </Link>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <Space wrap>
            <DatePicker
              allowClear={false}
              value={dayjs(date)}
              onChange={(value) => {
                if (value) setParams({ date: value.format("YYYY-MM-DD"), reportType });
              }}
            />
            <Input.Search
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              allowClear
              placeholder={t("搜索事件、场地或子账户")}
              className="w-72"
            />
          </Space>
          <Space>
            <span className="text-sm text-slate-500">{t("快照版本")}</span>
            <Select
              value={versionId ?? ""}
              className="min-w-64"
              disabled={loading || !snapshots.length}
              onChange={(value) => setVersionId(Number(value))}
              options={snapshots.map((item) => ({
                value: item.id,
                label: `V${item.version} · ${t(item.generated_by === "scheduled" ? "自动生成" : "手工重生成")} · ${dayjs(item.created_at).format("YYYY-MM-DD HH:mm:ss")}`,
              }))}
            />
            <Button onClick={() => setRefresh((value) => value + 1)} loading={loading}>
              {t("刷新")}
            </Button>
            <Button
              icon={<DownloadOutlined />}
              disabled={!selected || !filteredEvents.length}
              onClick={() => {
                if (!filteredEvents.length) {
                  message.warning(t("当前页没有数据可导出"));
                  return;
                }
                downloadSnapshotEvents(filteredEvents, date);
                message.success(t("事件快照下载成功"));
              }}
            >
              {t("下载事件快照")}
            </Button>
          </Space>
        </div>
        {loading ? (
          <div className="p-12 text-center">
            <Spin />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-red-600">{error}</div>
        ) : !selected ? (
          <Empty description={t("该日期的日报尚未生成，请选择其他日期查看事件快照")} />
        ) : (
          <Table<SnapshotEventRow>
            rowKey="key"
            columns={columns}
            dataSource={filteredEvents}
            size="middle"
            components={{ header: { cell: ResizableHeaderCell } }}
            scroll={{ x: 1900 }}
            pagination={{ defaultPageSize: 20, showSizeChanger: true }}
            locale={{ emptyText: t("该版本没有参与计算的事件") }}
          />
        )}
      </div>
    </div>
  );
}
