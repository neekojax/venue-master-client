import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Empty, Pagination, Select, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import DailyMachineRecordsDrawer from "./components/DailyMachineRecordsDrawer";
import { type AgentDailyMacStat, fetchAgentDailyMacStats } from "./daily-mac-stats-api";
import { useBoundSites } from "./hook";
import type { BoundSiteItem } from "./types";
import type { FarmMonitorReturnState } from "./view-state";
import { ROUTE_PATHS } from "@/constants/common";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import { useSettingsStore } from "@/stores";
import { useSelector } from "@/stores/selectors";

import "./daily-mac-stats.css";

import { t } from "@/locales";

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function formatCount(value: number | null) {
  return value == null ? "—" : value.toLocaleString();
}

export default function DailyMacStatsPage() {
  useAuthRedirect();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const siteCode = searchParams.get("siteCode")?.trim() ?? "";
  const page = positiveInteger(searchParams.get("page"), 1);
  const pageSize = Math.min(500, positiveInteger(searchParams.get("pageSize"), 20));
  const rawDate = searchParams.get("stat_date") ?? "";
  const statDate =
    /^\d{4}-\d{2}-\d{2}$/.test(rawDate) && dayjs(rawDate).format("YYYY-MM-DD") === rawDate ? rawDate : "";
  const recordsPage = positiveInteger(searchParams.get("recordsPage"), 1);
  const recordsPageSize = Math.min(500, positiveInteger(searchParams.get("recordsPageSize"), 20));
  const queryVenueType = searchParams.get("venueType");
  const inCurrentOrganization = !queryVenueType || queryVenueType === poolType;
  const sitesQuery = useBoundSites(poolType, { refetchOnMount: false });
  const sites = useMemo(() => {
    const list: BoundSiteItem[] = sitesQuery.data?.data?.list ?? [];
    return [...new Map(list.filter((site) => site.site_code).map((site) => [site.site_code, site])).values()];
  }, [sitesQuery.data]);
  const selectedSite = inCurrentOrganization ? sites.find((site) => site.site_code === siteCode) : undefined;

  useEffect(() => {
    if (!poolType) return;
    const next = inCurrentOrganization ? new URLSearchParams(searchParams) : new URLSearchParams();
    next.set("venueType", poolType);
    next.delete("miner_code");
    next.delete("minerCode");
    if (inCurrentOrganization && sitesQuery.isSuccess) {
      const site = sites.find((item) => item.site_code === siteCode) ?? sites[0];
      if (site?.site_code !== siteCode) {
        ["page", "stat_date", "recordsPage", "recordsPageSize"].forEach((key) => next.delete(key));
      }
      if (site) {
        next.set("siteCode", site.site_code);
        next.set("siteName", site.site_name);
      } else {
        next.delete("siteCode");
        next.delete("siteName");
      }
    }
    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true, state: inCurrentOrganization ? location.state : null });
    }
  }, [
    inCurrentOrganization,
    location.state,
    poolType,
    searchParams,
    setSearchParams,
    siteCode,
    sites,
    sitesQuery.isSuccess,
  ]);

  const statsQuery = useQuery({
    queryKey: ["site-agent-daily-mac-stats", poolType, siteCode, page, pageSize],
    queryFn: ({ signal }) => fetchAgentDailyMacStats(poolType, siteCode, page, pageSize, signal),
    enabled: Boolean(poolType && selectedSite),
  });
  const data = statsQuery.data;

  const updateSearchParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) next.delete(key);
      else next.set(key, value);
    });
    setSearchParams(next, { state: location.state });
  };

  const closeRecords = () =>
    updateSearchParams({ stat_date: null, recordsPage: null, recordsPageSize: null });
  const openRecords = (date: string) => updateSearchParams({ stat_date: date, recordsPage: "1" });
  const columns: ColumnsType<AgentDailyMacStat> = [
    {
      title: t("业务日期"),
      dataIndex: "stat_date",
      width: 210,
      render: (value: string, row) => (
        <div>
          <Tooltip title={t("查看当日机器记录")}>
            <button type="button" className="daily-mac-date" onClick={() => openRecords(value)}>
              {value}
            </button>
          </Tooltip>
          <div className="mt-1 max-w-[180px] truncate text-xs text-gray-400" title={row.agent_name}>
            {row.agent_name || "—"}
          </div>
        </div>
      ),
    },
    {
      title: t("唯一 MAC 数"),
      dataIndex: "unique_mac_count",
      width: 180,
      align: "right",
      render: formatCount,
    },
    {
      title: t("新增 MAC 数"),
      dataIndex: "added_mac_count",
      width: 170,
      align: "right",
      render: formatCount,
    },
    {
      title: t("减少 MAC 数"),
      dataIndex: "removed_mac_count",
      width: 170,
      align: "right",
      render: formatCount,
    },
    {
      title: t("净变化"),
      key: "netChange",
      width: 150,
      align: "right",
      render: (_, row) => {
        if (row.added_mac_count == null || row.removed_mac_count == null) return "—";
        const change = row.added_mac_count - row.removed_mac_count;
        return `${change > 0 ? "+" : ""}${formatCount(change)}`;
      },
    },
    {
      title: t("对比日期"),
      dataIndex: "compare_date",
      width: 180,
      render: (value: string, row) => (
        <div>
          <span>{value || "—"}</span>
          {row.previous_mac_count == null || row.added_mac_count == null || row.removed_mac_count == null ? (
            <div className="mt-1 text-xs text-gray-400">{t("缺少前日基准")}</div>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <div className="daily-mac-stats min-h-full bg-white -m-4 p-4 md:p-8">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-6">
        <header className="daily-mac-header">
          <div className="daily-mac-header-title">
            <Tooltip title={t("返回矿机监控")}>
              <Button
                type="text"
                size="middle"
                className="daily-mac-header-icon"
                aria-label={t("返回矿机监控")}
                icon={<ArrowLeftOutlined />}
                onClick={() => {
                  const params = new URLSearchParams();
                  const previous = (location.state as FarmMonitorReturnState | null)?.farmMonitorReturn;
                  const returnSite = previous?.venueType === poolType ? previous.siteCode : siteCode;
                  if (returnSite) params.set("siteCode", returnSite);
                  navigate(`${ROUTE_PATHS.farmMonitor}${params.size ? `?${params}` : ""}`);
                }}
              />
            </Tooltip>
            <h1 className="m-0 text-lg font-semibold text-gray-900">{t("每日 MAC 地址统计")}</h1>
          </div>
          <div className="daily-mac-header-actions">
            <div className="daily-mac-site-field">
              <label htmlFor="daily-mac-site-select">{t("场地")}</label>
              <Select
                id="daily-mac-site-select"
                aria-label={t("场地")}
                size="middle"
                showSearch
                optionFilterProp="label"
                className="daily-mac-site-select"
                classNames={{ popup: { root: "daily-mac-site-popup" } }}
                placeholder={t("搜索并选择场地")}
                value={selectedSite?.site_code}
                loading={sitesQuery.isFetching}
                options={sites.map((site) => ({
                  value: site.site_code,
                  label: site.site_name || site.site_code,
                  title: site.site_name || site.site_code,
                }))}
                onChange={(value: string) => {
                  const site = sites.find((item) => item.site_code === value);
                  if (!site) return;
                  updateSearchParams({
                    siteCode: site.site_code,
                    siteName: site.site_name,
                    page: "1",
                    stat_date: null,
                    recordsPage: null,
                    recordsPageSize: null,
                  });
                }}
              />
            </div>
            <Tooltip title={t("刷新")}>
              <Button
                type="text"
                size="middle"
                className="daily-mac-header-icon"
                aria-label={t("刷新")}
                icon={<ReloadOutlined />}
                loading={statsQuery.isFetching || sitesQuery.isFetching}
                disabled={!poolType}
                onClick={() => {
                  void sitesQuery.refetch();
                  if (selectedSite) void statsQuery.refetch();
                }}
              />
            </Tooltip>
          </div>
        </header>

        <section>
          <div className="mb-3 text-xs text-gray-400">
            <span>{t("每个业务日每个 Agent 一行，点击业务日期查看当日机器记录。")}</span>
          </div>
          {sitesQuery.isError ? (
            <Alert
              className="mb-4"
              type="error"
              showIcon
              message={sitesQuery.error.message}
              action={<Button onClick={() => void sitesQuery.refetch()}>{t("重试")}</Button>}
            />
          ) : null}
          {statsQuery.isError ? (
            <Alert
              className="mb-4"
              type="error"
              showIcon
              message={statsQuery.error.message}
              action={<Button onClick={() => void statsQuery.refetch()}>{t("重试")}</Button>}
            />
          ) : null}
          <Table<AgentDailyMacStat>
            rowKey={(row) => `${row.stat_date}_${row.agent_name}`}
            columns={columns}
            dataSource={data?.list ?? []}
            loading={statsQuery.isFetching || sitesQuery.isLoading}
            pagination={false}
            scroll={{ x: 1080 }}
            size="middle"
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={selectedSite ? t("暂无每日 MAC 统计") : t("请选择场地查看每日 MAC 统计")}
                />
              ),
            }}
          />
          <p className="mt-4 mb-0 text-xs leading-5 text-gray-400">
            {t("统计按场地绑定的 Agent 展示，各 Agent 独立去重，不合并为场地总数。")}
          </p>
          {data ? (
            <div className="mt-4 flex justify-end">
              <Pagination
                current={data.page}
                pageSize={data.pageSize}
                total={data.total}
                showSizeChanger
                pageSizeOptions={[20, 50, 100, 200, 500]}
                showTotal={(total) => t("共 {{total}} 条记录", { total })}
                onChange={(nextPage, nextPageSize) =>
                  updateSearchParams({
                    page: String(nextPageSize !== data.pageSize ? 1 : nextPage),
                    pageSize: String(nextPageSize),
                  })
                }
              />
            </div>
          ) : null}
        </section>
      </div>
      {selectedSite && statDate ? (
        <DailyMachineRecordsDrawer
          key={`${poolType}_${siteCode}_${statDate}`}
          venueType={poolType}
          siteCode={siteCode}
          siteName={selectedSite.site_name}
          statDate={statDate}
          page={recordsPage}
          pageSize={recordsPageSize}
          onClose={closeRecords}
          onPageChange={(nextPage, nextPageSize) =>
            updateSearchParams({ recordsPage: String(nextPage), recordsPageSize: String(nextPageSize) })
          }
        />
      ) : null}
    </div>
  );
}
