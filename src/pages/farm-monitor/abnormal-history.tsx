import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Empty, Spin, Table, Tag } from "antd";
import { ReactEcharts } from "@/components/react-echarts";
import AbnormalReasonButton from "./components/AbnormalReasonButton";
import {
  type DailyAbnormalReason,
  type DailyAbnormalRecord,
  fetchDailyAbnormalHistory,
} from "./abnormal-history-api";
import { ROUTE_PATHS } from "@/constants/common";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import { useSettingsStore } from "@/stores";
import { useSelector } from "@/stores/selectors";

import "./abnormal-history.css";

import { t } from "@/locales";

const number = (value: number | undefined) => (value == null ? "—" : value.toLocaleString());
const positiveInteger = (value: string | null, fallback: number) => {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export default function AbnormalHistoryPage() {
  useAuthRedirect();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const siteName = params.get("siteName") || "";
  const siteCode = params.get("siteCode") || "";
  const page = positiveInteger(params.get("page"), 1);
  const pageSize = [10, 20, 50, 100].includes(Number(params.get("pageSize")))
    ? Number(params.get("pageSize"))
    : 20;
  const query = useQuery({
    queryKey: ["daily-abnormal-history", poolType, siteName, page, pageSize],
    queryFn: ({ signal }) => fetchDailyAbnormalHistory(poolType, siteName, page, pageSize, signal),
    enabled: Boolean(poolType && siteName),
  });
  const rows = query.data?.list ?? [];
  const chartRows = [...rows].sort((a, b) => a.date.localeCompare(b.date));
  const latest = rows[0];
  const statuses: Record<string, [string, string]> = {
    pending: [t("待排查"), "warning"],
    monitoring: [t("观察中"), "processing"],
    resolved: [t("处理中"), "success"],
    fixed: [t("已修复"), "blue"],
  };
  return (
    <div className="abnormal-history">
      <header className="abnormal-history-header">
        <div>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(`${ROUTE_PATHS.farmMonitor}?${new URLSearchParams({ siteCode })}`)}
          >
            {t("返回矿机监控")}
          </Button>
          <h1>
            {t("场地异常历史")}
            <span className="abnormal-history-site-name">{siteName || t("未选择场地")}</span>
          </h1>
        </div>
        <Button
          icon={<ReloadOutlined />}
          loading={query.isFetching}
          disabled={!siteName}
          onClick={() => void query.refetch()}
        >
          {t("刷新")}
        </Button>
      </header>
      {!siteName ? (
        <Alert type="info" showIcon message={t("请从矿机监控选择场地后进入")} />
      ) : query.isError ? (
        <Alert
          type="error"
          showIcon
          message={t("加载失败")}
          description={query.error.message}
          action={<Button onClick={() => void query.refetch()}>{t("重试")}</Button>}
        />
      ) : (
        <Spin spinning={query.isFetching}>
          <section className="abnormal-history-overview">
            <div className="abnormal-history-section-heading">
              <h2>{t("每日概览")}</h2>
              <span>
                {latest?.date ?? "—"} · {t("本页最新日期")}
              </span>
            </div>
            <div className="abnormal-history-metrics">
              {[
                [t("异常台数"), latest?.abnormalCount],
                [t("扫描数"), latest?.scanMachineCount],
                [t("在架台数"), latest?.onShelfCount],
              ].map(([label, value], index) => (
                <div key={String(label)}>
                  <span>{label}</span>
                  <strong className={index === 0 ? "abnormal-history-accent" : ""}>
                    {number(value as number | undefined)}
                  </strong>
                </div>
              ))}
              <div>
                <span>{t("原因记录")}</span>
                {latest?.reasons.length ? (
                  <ul className="abnormal-history-overview-reasons">
                    {latest.reasons.map((reason) => (
                      <li key={reason.id}>{reason.reason || "—"}</li>
                    ))}
                  </ul>
                ) : (
                  <span>{latest ? t("该日期暂无原因记录") : "—"}</span>
                )}
              </div>
            </div>
            <div className="abnormal-history-section-heading">
              <h2>{t("每日异常趋势")}</h2>
              <span>{t("仅展示当前页数据")}</span>
            </div>
            {rows.length ? (
              <ReactEcharts
                style={{ height: 270 }}
                option={{
                  color: ["#1677ff", "#91a4b7", "#52b59a"],
                  tooltip: { trigger: "axis", confine: true },
                  legend: {
                    bottom: 0,
                    icon: "circle",
                    itemWidth: 8,
                    itemHeight: 8,
                    selected: {
                      [t("异常台数")]: true,
                      [t("扫描数")]: false,
                      [t("在架台数")]: false,
                    },
                  },
                  grid: { top: 24, right: 22, bottom: 64, left: 55 },
                  xAxis: {
                    type: "category",
                    data: chartRows.map((row) => row.date),
                    axisLine: { show: false },
                    axisTick: { show: false },
                    axisLabel: { color: "#8b95a5" },
                  },
                  yAxis: {
                    type: "value",
                    minInterval: 1,
                    splitLine: { lineStyle: { color: "#edf0f4", type: "dashed" } },
                  },
                  series: [
                    { name: t("异常台数"), key: "abnormalCount" },
                    { name: t("扫描数"), key: "scanMachineCount" },
                    { name: t("在架台数"), key: "onShelfCount" },
                  ].map((item, index) => ({
                    name: item.name,
                    type: "line",
                    showSymbol: chartRows.length === 1,
                    symbolSize: 7,
                    lineStyle: { width: index === 0 ? 3 : 1.5 },
                    areaStyle: index === 0 ? { opacity: 0.06 } : undefined,
                    data: chartRows.map((row) => row[item.key as keyof DailyAbnormalRecord]),
                  })),
                }}
              />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("暂无异常数据")} />
            )}
          </section>
          <section className="abnormal-history-detail">
            <div className="abnormal-history-section-heading">
              <h2>{t("每日异常及原因")}</h2>
              <AbnormalReasonButton
                key={`${poolType}-${siteName}`}
                venueType={poolType}
                siteName={siteName}
              />
            </div>
            <Table<DailyAbnormalRecord>
              key={`${poolType}-${siteName}-${page}-${pageSize}-${rows[0]?.date ?? "empty"}`}
              rowKey="date"
              size="small"
              dataSource={rows}
              scroll={{ x: 1100 }}
              tableLayout="fixed"
              columns={[
                { title: t("日期"), dataIndex: "date", width: 140 },
                { title: t("扫描数"), dataIndex: "scanMachineCount", width: 100, render: number },
                { title: t("在架台数"), dataIndex: "onShelfCount", width: 100, render: number },
                {
                  title: t("异常台数"),
                  dataIndex: "abnormalCount",
                  width: 100,
                  render: (v: number) => (
                    <strong className={v > 0 ? "abnormal-history-accent" : ""}>{number(v)}</strong>
                  ),
                },
                {
                  title: t("原因记录"),
                  dataIndex: "reasons",
                  render: (reasons: DailyAbnormalReason[], row) =>
                    reasons.length ? (
                      <div className="abnormal-history-reasons">
                        {reasons.map((reason) => (
                          <div className="abnormal-history-reason" key={reason.id}>
                            <div className="abnormal-history-reason-text">{reason.reason || "—"}</div>
                            <div className="abnormal-history-reason-meta">
                              <span>
                                {t("影响台数")}: {number(reason.affectedMachineCount)}
                              </span>
                              <Tag color={statuses[reason.status]?.[1]}>
                                {statuses[reason.status]?.[0] || reason.status || "—"}
                              </Tag>
                              <span>
                                {t("负责人")}: {reason.owner || "—"}
                              </span>
                              <div>
                                <AbnormalReasonButton
                                  venueType={poolType}
                                  siteName={siteName}
                                  date={row.date}
                                  record={reason}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="abnormal-history-reason-empty">{t("该日期暂无原因记录")}</span>
                    ),
                },
                {
                  title: t("操作"),
                  key: "actions",
                  width: 120,
                  render: (_, record) => (
                    <AbnormalReasonButton
                      venueType={poolType}
                      siteName={siteName}
                      date={record.date}
                      abnormalCount={record.abnormalCount}
                    />
                  ),
                },
              ]}
              pagination={{
                current: page,
                pageSize,
                total: query.data?.total ?? 0,
                showSizeChanger: true,
                pageSizeOptions: [10, 20, 50, 100],
                onChange: (nextPage, nextSize) => {
                  const next = new URLSearchParams(params);
                  next.set("page", String(nextSize !== pageSize ? 1 : nextPage));
                  next.set("pageSize", String(nextSize));
                  setParams(next);
                },
              }}
            />
          </section>
        </Spin>
      )}
    </div>
  );
}
