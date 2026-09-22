import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Alert,
  Button,
  DatePicker,
  Descriptions,
  Empty,
  Input,
  Modal,
  Select,
  Space,
  Spin,
  Table,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { type DailySnapshot, fetchDailySnapshots, type SnapshotEvent } from "../snapshot-api";
import { ROUTE_PATHS } from "@/constants/common";
import { useSelector, useSettingsStore } from "@/stores";

import { t } from "@/locales";

const metricLabels: Record<string, string> = {
  btcOutput24h: "24小时产出（BTC）",
  theoreticalPower: "理论算力（E）",
  power24h: "24小时算力（E）",
  effectiveRate24h: "在架有效率",
  forecastHashEfficiency: "净有效率",
  totalMachines: "托管台数",
  powerImpact: "影响算力（E）",
  impactRatio: "影响占比",
  outputImpact: "影响产出（BTC）",
  totalFailuresT1: "总故障台数",
  totalFailures: "总故障台数",
  failures24h: "24小时故障数",
  failureRate24h: "24小时故障率",
  limitImpactRate: "限电影响",
  highTemperatureRate: "高温影响",
  totalTheoreticalPower: "总理论算力（E）",
  totalBtcOutput: "总产出（BTC）",
  totalImpactOutput: "总影响产出（BTC）",
  averageEffectiveRate: "平均有效率",
  totalPowerImpact: "总影响算力（E）",
  totalPower24h: "总24小时算力（E）",
};
const eventLabels: Record<string, string> = {
  venue_id: "场地ID",
  machine_model: "机器型号",
  machine_status: "机器状态",
  actual_loss_hashrate: "影响算力（小智测算）",
  calculated_loss_hashrate: "系统测算（根据算力曲线）",
  baseline_hashrate: "基准算力",
  loss_calculation_status: "计算状态",
  loss_calculation_updated_at: "计算更新时间",
  event_resolution: "备注",
  is_sleep: "是否休眠",
};
const display = (value: unknown) =>
  value == null || value === "" ? "-" : typeof value === "object" ? JSON.stringify(value) : String(value);
function EventDetails({ events }: { events: SnapshotEvent[] }) {
  return (
    <Table<SnapshotEvent>
      size="small"
      rowKey={(row) => String(row.event_id)}
      dataSource={events}
      pagination={false}
      scroll={{ x: 1100 }}
      locale={{ emptyText: t("该版本没有参与计算的事件") }}
      columns={[
        { title: t("事件ID"), dataIndex: "event_id", width: 90 },
        { title: t("子账户ID"), dataIndex: "pool_id", width: 110 },
        { title: t("子账户名称"), dataIndex: "sub_account_name", width: 180, render: display },
        { title: t("事件类型"), dataIndex: "log_type", width: 110, render: (v) => t(display(v)) },
        { title: t("开始时间"), dataIndex: "start_time", width: 175 },
        { title: t("结束时间"), dataIndex: "end_time", width: 175, render: display },
        { title: t("参与计算时长（分钟）"), dataIndex: "event_duration_minutes", width: 180 },
        { title: t("影响台数"), dataIndex: "event_impact_count", width: 100 },
        {
          title: t("影响算力"),
          dataIndex: "impact_power_loss",
          width: 130,
          render: (value) => (value == null ? "-" : Number(value).toFixed(2)),
        },
        { title: t("事件原因"), dataIndex: "event_reason", width: 260 },
      ]}
      expandable={{
        expandedRowRender: (event) => (
          <Descriptions
            size="small"
            bordered
            column={{ xs: 1, sm: 2, lg: 3 }}
            items={Object.entries(eventLabels).map(([key, label]) => ({
              key,
              label: t(label),
              children:
                key === "is_sleep"
                  ? Number(event[key]) === 1
                    ? t("已休眠")
                    : t("未休眠")
                  : display(event[key]),
            }))}
          />
        ),
      }}
    />
  );
}
export default function DailySnapshotPage() {
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
  // 点击“查看详细事件”后记录当前场地/子账户 key；详情只展示该行对应的冻结事件。
  const [eventDetailKey, setEventDetailKey] = useState<string>();
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
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : t("加载失败"));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [poolType, date, reportType, refresh]);
  const selected = snapshots.find((item) => item.id === versionId);
  const rows: (Record<string, unknown> & { key: string })[] = Object.entries(
    selected?.reportData.dailyReportStatistics ?? {},
  ).map(([key, value]) => ({
    ...value,
    key,
  }));
  const columns: ColumnsType<Record<string, unknown> & { key: string }> = [
    { title: t("场地"), dataIndex: "venue_name", width: 190, fixed: "left" },
    ...(reportType === "account" ? [{ title: t("子账户"), dataIndex: "account_name", width: 180 }] : []),
    ...Object.entries(metricLabels)
      .filter(
        ([key]) =>
          !key.startsWith("total") ||
          ["totalMachines", reportType === "venue" ? "totalFailuresT1" : "totalFailures"].includes(key),
      )
      .filter(([key]) => key !== "averageEffectiveRate")
      .map(([key, label]) => ({
        title: t(label),
        dataIndex: key,
        width: 160,
        render: (value: unknown) => {
          if (value == null) return "-";
          const n = Number(value);
          if (!Number.isFinite(n)) return display(value);
          if (["totalMachines", "totalFailures", "totalFailuresT1", "failures24h"].includes(key))
            return n.toLocaleString();
          return /Rate|Ratio|Efficiency/.test(key) ? `${n.toFixed(2)}%` : n.toFixed(6);
        },
      })),
    { title: t("事件描述"), dataIndex: "events", width: 280, ellipsis: true },
    {
      title: t("事件数量"),
      width: 190,
      render: (_, row) => {
        const eventCount = selected?.eventDetails[row.key]?.length ?? 0;
        return (
          <Space size="small">
            <span>{eventCount}</span>
            <Button
              type="link"
              size="small"
              disabled={eventCount === 0}
              onClick={() => setEventDetailKey(row.key)}
            >
              {t("查看详细事件")}
            </Button>
          </Space>
        );
      },
    },
  ];
  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg">
      <div className="flex flex-wrap justify-between items-center gap-3 mb-4">
        <h1 className="text-xl font-bold">{t("运营日报快照")}</h1>
        <Link to={reportType === "account" ? ROUTE_PATHS.subAccountDailyReport : ROUTE_PATHS.dailyReport}>
          <Button>{t("返回日报")}</Button>
        </Link>
      </div>
      <Space wrap className="mb-4">
        <DatePicker
          allowClear={false}
          value={dayjs(date)}
          onChange={(value) => {
            if (value) setParams({ date: value.format("YYYY-MM-DD"), reportType });
          }}
        />
        <Select
          value={reportType}
          style={{ width: 170 }}
          options={[
            { value: "venue", label: t("运营日报") },
            { value: "account", label: t("账户日报") },
          ]}
          onChange={(value) => setParams({ date, reportType: value })}
        />
        <Select
          placeholder={t("快照版本")}
          value={versionId}
          style={{ minWidth: 290 }}
          disabled={loading || !snapshots.length}
          onChange={setVersionId}
          options={snapshots.map((item) => ({
            value: item.id,
            label: `V${item.version} · ${t(item.generated_by === "scheduled" ? "自动生成" : "手工重生成")} · ${dayjs(item.created_at).format("YYYY-MM-DD HH:mm:ss")}`,
          }))}
        />
        <Button onClick={() => setRefresh((v) => v + 1)} loading={loading}>
          {t("刷新")}
        </Button>
      </Space>
      <Alert
        type="info"
        showIcon
        className="mb-4"
        message={t(
          "快照数据已冻结，后续事件修改不会影响此版本。展开场地可查看事件，再展开事件可查看完整详情。",
        )}
      />
      {loading ? (
        <div className="p-12 text-center">
          <Spin />
        </div>
      ) : error ? (
        <Alert type="error" showIcon message={error} />
      ) : !selected ? (
        <Empty description={t("该日期暂无快照")} />
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {["totalTheoreticalPower", "totalBtcOutput", "totalImpactOutput", "averageEffectiveRate"].map(
              (key) => (
                <div key={key} className="border border-slate-200 rounded-xl p-4">
                  <div className="text-xs text-gray-500 mb-2">{t(metricLabels[key])}</div>
                  <div className="text-xl font-semibold">
                    {selected.reportData.summary[key] == null
                      ? "-"
                      : Number(selected.reportData.summary[key]).toFixed(
                          key === "averageEffectiveRate" ? 2 : 6,
                        )}
                    {key === "averageEffectiveRate" ? "%" : ""}
                  </div>
                </div>
              ),
            )}
          </div>
          <Input.Search
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            placeholder={t("搜索场地或子账户")}
            style={{ maxWidth: 320, marginBottom: 16 }}
          />
          <div className="longdataTable">
            <Table
              key={selected.id}
              rowKey="key"
              columns={columns}
              dataSource={rows.filter((row) =>
                `${row.venue_name ?? ""} ${row.account_name ?? ""}`
                  .toLowerCase()
                  .includes(search.toLowerCase()),
              )}
              size="middle"
              scroll={{ x: 1900 }}
              pagination={{ defaultPageSize: 10, showSizeChanger: true }}
            />
          </div>
          <Modal
            open={eventDetailKey !== undefined}
            title={t("事件详情")}
            footer={null}
            width={1200}
            destroyOnClose
            onCancel={() => setEventDetailKey(undefined)}
          >
            <EventDetails events={eventDetailKey ? (selected.eventDetails[eventDetailKey] ?? []) : []} />
          </Modal>
        </>
      )}
    </div>
  );
}
