import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { DownloadOutlined, DownOutlined, SearchOutlined, SwapOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, DatePicker, Descriptions, Empty, Input, message, Popover, Select, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import { saveAs } from "file-saver";
import ComparisonSiteSelect from "./components/ComparisonSiteSelect";
import MachineHourlyDrawer from "./components/MachineHourlyDrawer";
import {
  type ComparisonFilters,
  type ComparisonSort,
  downloadComparisonCsv,
  fetchMachineComparisons,
  type MachineComparison,
} from "./hashrate-comparison-api";
import { useBoundSites } from "./hook";
import type { BoundSiteItem } from "./types";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import { useSettingsStore } from "@/stores";
import { useSelector } from "@/stores/selectors";
import {
  comparisonSitePreferenceKey,
  getLoginAccountId,
  readComparisonSite,
  saveComparisonSite,
} from "@/utils/account-preferences";
import { convertUTCToLocal } from "@/utils/date";

import "./daily-mac-stats.css";

import { t } from "@/locales";

const defaultFilters: ComparisonFilters = {
  ip: "",
  collectedDates: null,
  sort: "latest",
  minAbsDiffPct: null,
};

// 快捷日期在点击时取北京当天，避免浏览器时区或页面跨零点影响结果。
function beijingDayRange(daysAgo: number): [Dayjs, Dayjs] {
  const today = convertUTCToLocal(Date.now(), "YYYY-MM-DD", false, "Asia/Shanghai");
  const day = dayjs(today).subtract(daysAgo, "day");
  return [day, day];
}

function DeviationFilter({
  value,
  onChange,
}: {
  value: number | null;
  onChange: (value: number | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const presets = [null, 5, 10];
  const isCustom = !presets.includes(value);

  function closeEditor() {
    setOpen(false);
    trigger.current?.focus();
  }

  return (
    <div className="hashrate-filter-field hashrate-deviation">
      <span id="hashrate-deviation-label">{t("偏差幅度")}</span>
      <div className="hashrate-thresholds" role="group" aria-labelledby="hashrate-deviation-label">
        {presets.map((threshold) => (
          <Button
            key={threshold ?? "all"}
            autoInsertSpace={false}
            aria-pressed={value === threshold}
            onClick={() => onChange(threshold)}
          >
            {threshold === null ? t("全部") : `≥${threshold}%`}
          </Button>
        ))}
        <Popover
          trigger="click"
          placement="bottomRight"
          open={open}
          onOpenChange={setOpen}
          destroyOnHidden
          title={<label htmlFor="hashrate-custom-threshold">{t("最小绝对差异率")}</label>}
          content={
            open && (
              <form
                className="flex items-center gap-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  onChange(Number(new FormData(event.currentTarget).get("threshold")));
                  closeEditor();
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") closeEditor();
                }}
              >
                <Input
                  id="hashrate-custom-threshold"
                  name="threshold"
                  type="number"
                  step="any"
                  min={0}
                  required
                  autoFocus
                  size="middle"
                  enterKeyHint="done"
                  defaultValue={value ?? ""}
                  suffix="%"
                  style={{ width: 112 }}
                />
                <Button type="primary" size="middle" htmlType="submit" autoInsertSpace={false}>
                  {t("应用")}
                </Button>
              </form>
            )
          }
        >
          <Button ref={trigger} aria-pressed={isCustom} aria-expanded={open} autoInsertSpace={false}>
            <span>{isCustom ? `${t("自定义")} ≥${value}%` : t("自定义")}</span>
            <DownOutlined aria-hidden className="text-[9px]" />
          </Button>
        </Popover>
      </div>
    </div>
  );
}

function numberText(value: number | null | undefined, signed = false, suffix = "") {
  if (value == null) return "—";
  return `${signed && value > 0 ? "+" : ""}${value.toLocaleString(undefined, { maximumFractionDigits: 3 })}${suffix}`;
}

function beijingTime(value: string | null) {
  return value ? convertUTCToLocal(value, "YYYY-MM-DD HH:mm:ss", false, "Asia/Shanghai") : "—";
}

function comparisonStatus(row: MachineComparison, due: boolean) {
  if (!row.comparison) return due ? t("昨日无记录") : t("待结算");
  switch (row.comparison.compareStatus) {
    case "complete":
      return t("已完成");
    case "partial":
      return t("部分采样");
    case "no_pool_samples":
      return t("缺少矿池样本");
    case "no_tasks":
      return t("无探测任务");
    case "waiting_tasks":
      return t("等待探测完成");
    case "no_source":
      return t("无矿池来源");
    case "ambiguous_source":
      return t("矿池来源不唯一");
    case "ambiguous_ip":
      return t("IP 归属冲突");
    case null:
    case "pending":
      return due ? t("待比对") : t("待结算");
    default:
      return row.comparison.compareStatus;
  }
}

function columns(
  date: string | undefined,
  due: boolean,
  onOpen: (row: MachineComparison) => void,
): ColumnsType<MachineComparison> {
  return [
    {
      title: "IP",
      dataIndex: "ipAddress",
      fixed: "left",
      width: 153,
      render: (ip: string, row) => (
        <div>
          <Button
            type="link"
            size="small"
            className="!h-auto !p-0 font-medium tabular-nums"
            onClick={() => onOpen(row)}
          >
            {ip}
          </Button>
          {row.model && (
            <div className="truncate text-xs text-gray-500" title={row.model}>
              {row.model}
            </div>
          )}
        </div>
      ),
    },
    {
      title: t("最近探测"),
      children: [
        { title: t("采集时间（北京时间）"), dataIndex: "lastCollectTime", width: 178, render: beijingTime },
        { title: t("算力 (TH/s)"), width: 125, align: "right", render: (_, row) => numberText(row.hashrate) },
      ],
    },
    {
      title: [t("昨日算力对比"), date].filter(Boolean).join(" · "),
      children: [
        {
          title: t("矿机日均 (TH/s)"),
          width: 145,
          align: "right",
          render: (_, row) => numberText(row.comparison?.minerDailyAvgThs),
        },
        {
          title: t("AntPool 日均 (TH/s)"),
          width: 155,
          align: "right",
          render: (_, row) => numberText(row.comparison?.antpoolDailyAvgThs),
        },
        {
          title: t("差值 (TH/s)"),
          width: 125,
          align: "right",
          render: (_, row) => numberText(row.comparison?.hashrateDiffThs, true),
        },
        {
          title: t("差异率"),
          width: 110,
          align: "right",
          render: (_, row) => (
            <span className="font-semibold">{numberText(row.comparison?.hashrateDiffPct, true, "%")}</span>
          ),
        },
        { title: t("比对状态"), width: 135, render: (_, row) => comparisonStatus(row, due) },
      ],
    },
  ];
}

function HashrateMonitorForOrganization({
  organization,
  accountId,
}: {
  organization: string;
  accountId: string;
}) {
  const preferenceKey = comparisonSitePreferenceKey(accountId, organization);
  const sitesQuery = useBoundSites(organization);
  const available: BoundSiteItem[] = sitesQuery.data?.data?.list ?? [];
  const sites = Array.from(
    new Map(available.filter((s) => s.site_code).map((s) => [s.site_code, s])).values(),
  );
  const [selected, setSelected] = useState(() => readComparisonSite(preferenceKey));
  const siteCode = sites.find((s) => s.site_code === selected)?.site_code ?? sites[0]?.site_code ?? "";
  const [detail, setDetail] = useState<{ site: string; row: MachineComparison } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [filters, setFilters] = useState(defaultFilters);
  const collectedDates = filters.collectedDates;
  const [ipInput, setIpInput] = useState("");
  const [downloading, setDownloading] = useState(false);

  // 等场地列表成功返回再确认回退，加载过程中的空列表不能覆盖上次选择。
  useEffect(() => {
    if (!sitesQuery.isSuccess || sitesQuery.isFetching || selected === siteCode) return;
    setSelected(siteCode);
    setPage(1);
    setDetail(null);
    saveComparisonSite(preferenceKey, siteCode);
  }, [preferenceKey, selected, siteCode, sitesQuery.isSuccess, sitesQuery.isFetching]);

  function updateFilters(change: Partial<ComparisonFilters>) {
    setFilters((current) => ({ ...current, ...change }));
    setPage(1);
  }

  const query = useQuery({
    queryKey: ["site-machine-comparisons", accountId, organization, siteCode, page, pageSize, filters],
    queryFn: ({ signal }) => fetchMachineComparisons(organization, siteCode, page, pageSize, filters, signal),
    enabled: Boolean(organization && siteCode),
  });
  const data = query.data;
  // 数据刷新后总数可能缩小，回到最后一个仍有效的分页。
  useEffect(() => {
    if (data) setPage((current) => Math.min(current, Math.max(1, Math.ceil(data.total / pageSize))));
  }, [data, pageSize]);

  async function handleDownload() {
    if (downloading || !siteCode || !data?.total) return;
    setDownloading(true);
    try {
      const blob = await downloadComparisonCsv(organization, siteCode, data.comparisonStatDate, filters);
      saveAs(blob, `算力对比-${organization}-${siteCode}-${data.comparisonStatDate}.csv`);
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("下载失败，请稍后重试"));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="daily-mac-stats -m-4 min-h-full bg-white p-4 md:p-8">
      <div className="hashrate-comparison mx-auto flex max-w-[1600px] flex-col">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h1 className="m-0 text-lg font-semibold text-gray-900">{t("算力对比")}</h1>
          <Button
            size="middle"
            icon={<DownloadOutlined />}
            loading={downloading}
            disabled={!data?.total || query.isError || sitesQuery.isError}
            onClick={() => void handleDownload()}
          >
            {t("下载 CSV")}
          </Button>
        </div>
        <div className="hashrate-comparison-filters">
          <div className="hashrate-search-fields">
            <ComparisonSiteSelect
              sites={sites}
              value={siteCode}
              loading={sitesQuery.isFetching}
              onChange={(code) => {
                setDetail(null);
                setSelected(code);
                saveComparisonSite(preferenceKey, code);
                setPage(1);
              }}
            />
            <div className="hashrate-filter-field">
              <label htmlFor="hashrate-ip">IP</label>
              <Input.Search
                id="hashrate-ip"
                size="middle"
                allowClear
                value={ipInput}
                placeholder={t("完整 IP 或片段")}
                enterButton={<Button aria-label={t("搜索")} title={t("搜索")} icon={<SearchOutlined />} />}
                onChange={(event) => {
                  const value = event.target.value;
                  setIpInput(value);
                  if (!value && filters.ip) updateFilters({ ip: "" });
                }}
                onSearch={(value) => {
                  const ip = value.trim();
                  setIpInput(ip);
                  updateFilters({ ip });
                }}
              />
            </div>
            <div className="hashrate-filter-field hashrate-collection-filter">
              <label htmlFor="hashrate-collect-start">{t("最新采集时间（北京时间）")}</label>
              <DatePicker.RangePicker
                id={{ start: "hashrate-collect-start", end: "hashrate-collect-end" }}
                size="middle"
                classNames={{ popup: { root: "hashrate-date-menu" } }}
                format="YYYY-MM-DD"
                placeholder={[t("开始日期"), t("结束日期")]}
                value={collectedDates ? [dayjs(collectedDates[0]), dayjs(collectedDates[1])] : null}
                presets={[
                  { label: t("今天"), value: () => beijingDayRange(0) },
                  { label: t("昨天"), value: () => beijingDayRange(1) },
                  { label: t("前天"), value: () => beijingDayRange(2) },
                ]}
                onChange={(range, dates) => updateFilters({ collectedDates: range ? dates : null })}
              />
            </div>
          </div>
          <div className="hashrate-view-fields">
            <DeviationFilter
              value={filters.minAbsDiffPct}
              onChange={(minAbsDiffPct) => updateFilters({ minAbsDiffPct })}
            />
            <div className="hashrate-filter-field hashrate-sort-filter">
              <label htmlFor="hashrate-sort">{t("排序")}</label>
              <Select<ComparisonSort>
                id="hashrate-sort"
                prefix={<SwapOutlined rotate={90} aria-hidden />}
                size="middle"
                value={filters.sort}
                onChange={(sort) => updateFilters({ sort })}
                options={[
                  { value: "latest", label: t("最近采集") },
                  { value: "absolute", label: t("偏差最大优先") },
                  { value: "negative", label: t("差异率从低到高") },
                  { value: "positive", label: t("差异率从高到低") },
                ]}
              />
            </div>
          </div>
        </div>
        {siteCode && !sitesQuery.isError && !query.isError && (
          <p className="hashrate-comparison-summary" role="status" aria-busy={!data}>
            {[
              filters.ip && `IP ${filters.ip}`,
              collectedDates && [...new Set(collectedDates)].join(" ~ "),
              filters.minAbsDiffPct !== null && `${t("偏差幅度")} ≥${filters.minAbsDiffPct}%`,
            ]
              .filter(Boolean)
              .join(" · ") || t("全部机器")}
            {" · "}
            <strong className="font-semibold tabular-nums text-slate-800">
              {data && !query.isPlaceholderData ? t("{{count}} 台", { count: data.total }) : "…"}
            </strong>
          </p>
        )}
        {sitesQuery.isError || query.isError ? (
          <Alert
            type="error"
            showIcon
            message={(sitesQuery.error ?? query.error)?.message || t("获取算力对比失败")}
            action={
              <Button onClick={() => void (sitesQuery.isError ? sitesQuery.refetch() : query.refetch())}>
                {t("重试")}
              </Button>
            }
          />
        ) : (
          <Table<MachineComparison>
            size="middle"
            rowKey={(row) => JSON.stringify([row.agentCode, row.ipAddress])}
            loading={sitesQuery.isLoading || query.isFetching}
            columns={columns(data?.comparisonStatDate, data?.comparisonDue ?? false, (row) =>
              setDetail({ site: siteCode, row }),
            )}
            dataSource={data?.list ?? []}
            scroll={{ x: 1125 }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={siteCode ? t("暂无符合条件的机器") : t("暂无可查询场地")}
                />
              ),
            }}
            expandable={{
              expandedRowRender: (row) => (
                <Descriptions
                  size="small"
                  column={{ xs: 1, md: 2, xl: 4 }}
                  items={[
                    { key: "agent", label: "Agent", children: row.agentCode },
                    { key: "mac", label: "MAC", children: row.macAddress || "—" },
                    {
                      key: "task",
                      label: t("探测任务小时数"),
                      children: numberText(row.comparison?.minerTaskHours),
                    },
                    {
                      key: "miner",
                      label: t("矿机实采小时数"),
                      children: numberText(row.comparison?.minerSampleHours),
                    },
                    {
                      key: "pool",
                      label: t("AntPool 实采小时数"),
                      children: numberText(row.comparison?.antpoolSampleHours),
                    },
                    {
                      key: "time",
                      label: t("比对时间（北京时间）"),
                      children: beijingTime(row.comparison?.comparedAt ?? null),
                    },
                  ]}
                />
              ),
            }}
            pagination={{
              current: page,
              pageSize,
              total: data?.total ?? 0,
              showSizeChanger: true,
              pageSizeOptions: [20, 50, 100, 200, 500],
              showTotal: (total) => t("共 {{count}} 条", { count: total }),
              onChange: (nextPage, nextSize) => {
                setPage(nextSize === pageSize ? nextPage : 1);
                setPageSize(nextSize);
              },
            }}
          />
        )}
        {detail && detail.site === siteCode && (
          <MachineHourlyDrawer
            key={JSON.stringify([siteCode, detail.row.agentCode, detail.row.ipAddress])}
            organization={organization}
            siteCode={siteCode}
            agentCode={detail.row.agentCode}
            ip={detail.row.ipAddress}
            onClose={() => setDetail(null)}
          />
        )}
      </div>
    </div>
  );
}

function subscribeToAccountChanges(notify: () => void) {
  window.addEventListener("storage", notify);
  return () => window.removeEventListener("storage", notify);
}

export default function HashrateMonitorPage() {
  useAuthRedirect();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const accountId = useSyncExternalStore(subscribeToAccountChanges, getLoginAccountId);
  return (
    <HashrateMonitorForOrganization
      key={JSON.stringify([accountId, poolType])}
      organization={poolType}
      accountId={accountId}
    />
  );
}
