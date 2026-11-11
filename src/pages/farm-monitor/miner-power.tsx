import { useCallback, useEffect, useLayoutEffect, useMemo } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, DatePicker, Empty, Select, Spin, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import DailyPowerDetailsDrawer from "./components/DailyPowerDetailsDrawer";
import MinerPowerTrendChart from "./components/MinerPowerTrendChart";
import { useBoundSites } from "./hook";
import { type DailyPowerTrend, fetchPowerTrend } from "./miner-power-api";
import { formatPower, powerDayStatus, powerStatusLabel } from "./miner-power-utils";
import type { BoundSiteItem } from "./types";
import type { FarmMonitorReturnState } from "./view-state";
import { ROUTE_PATHS } from "@/constants/common";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import { useSettingsStore } from "@/stores";
import { useSelector } from "@/stores/selectors";
import { getAbnormalStatsDate } from "@/utils";

import "./daily-mac-stats.css";
import "./miner-power.css";

import { t } from "@/locales";

const DATE_FORMAT = "YYYY-MM-DD";
const validDate = (date: string | null): date is string =>
  Boolean(date && /^\d{4}-\d{2}-\d{2}$/.test(date) && dayjs(date).format(DATE_FORMAT) === date);

export default function MinerPowerPage() {
  useAuthRedirect();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, []);
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const sameOrganization = !params.get("venueType") || params.get("venueType") === poolType;
  const siteCode = sameOrganization ? params.get("siteCode") || "" : "";
  const agentCode = sameOrganization ? params.get("agentCode") || "" : "";
  const lastBusinessDate = getAbnormalStatsDate().format(DATE_FORMAT);
  const rawEndDate = params.get("endDate");
  const endDate = validDate(rawEndDate) ? rawEndDate : lastBusinessDate;
  const rawStartDate = params.get("startDate");
  const startDate =
    validDate(rawStartDate) && rawStartDate <= endDate
      ? rawStartDate
      : dayjs(endDate).subtract(29, "day").format(DATE_FORMAT);
  const rawDetailDate = params.get("businessDate");
  const detailDate =
    validDate(rawDetailDate) && rawDetailDate >= startDate && rawDetailDate <= endDate ? rawDetailDate : "";
  const sitesQuery = useBoundSites(poolType, { refetchOnMount: false });
  const sites = useMemo(() => {
    const list: BoundSiteItem[] = sitesQuery.data?.data?.list ?? [];
    return [...new Map(list.filter((site) => site.site_code).map((site) => [site.site_code, site])).values()];
  }, [sitesQuery.data]);
  const selectedSite = sites.find((site) => site.site_code === siteCode);

  useEffect(() => {
    if (!poolType) return;
    const next = sameOrganization ? new URLSearchParams(params) : new URLSearchParams();
    next.set("venueType", poolType);
    if (sameOrganization && sitesQuery.isSuccess) {
      const site = selectedSite ?? sites[0];
      if (site?.site_code !== siteCode) {
        next.delete("agentCode");
        next.delete("businessDate");
      }
      if (site) next.set("siteCode", site.site_code);
      else next.delete("siteCode");
    }
    next.delete("siteName");
    if (next.toString() !== params.toString()) {
      setParams(next, { replace: true, state: sameOrganization ? location.state : null });
    }
  }, [
    location.state,
    params,
    poolType,
    sameOrganization,
    selectedSite,
    setParams,
    siteCode,
    sites,
    sitesQuery.isSuccess,
  ]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const next = new URLSearchParams(params);
      Object.entries(updates).forEach(([key, value]) =>
        value == null ? next.delete(key) : next.set(key, value),
      );
      setParams(next, { state: location.state });
    },
    [location.state, params, setParams],
  );
  const openDetails = useCallback((date: string) => updateParams({ businessDate: date }), [updateParams]);
  const allTrendQuery = useQuery({
    queryKey: ["site-agent-power-trend", poolType, siteCode, startDate, endDate, ""],
    queryFn: ({ signal }) => fetchPowerTrend(poolType, siteCode, startDate, endDate, "", signal),
    enabled: Boolean(poolType && selectedSite),
  });
  const agentTrendQuery = useQuery({
    queryKey: ["site-agent-power-trend", poolType, siteCode, startDate, endDate, agentCode],
    queryFn: ({ signal }) => fetchPowerTrend(poolType, siteCode, startDate, endDate, agentCode, signal),
    enabled: Boolean(poolType && selectedSite && agentCode),
  });
  const trendQuery = agentCode ? agentTrendQuery : allTrendQuery;
  const agentNames = useMemo(
    () =>
      new Map(
        (allTrendQuery.data?.list ?? [])
          .flatMap((day) => day.agents)
          .map((agent) => [agent.agent_code, agent.agent_name || agent.agent_code]),
      ),
    [allTrendQuery.data],
  );
  const expectedAgents = agentCode ? [agentCode] : [...agentNames.keys()];
  const rows = useMemo(
    () => [...(trendQuery.data?.list ?? [])].sort((a, b) => a.business_date.localeCompare(b.business_date)),
    [trendQuery.data],
  );
  const hasPower = rows.some(
    (row) =>
      row.total_power_mw != null ||
      row.agents.some((agent) => agent.status !== "no_data" && agent.power_mw != null),
  );
  const hasPartial = rows.some((row) => powerDayStatus(row, expectedAgents) === "partial");
  const loading = sitesQuery.isLoading || trendQuery.isFetching;
  const error = sitesQuery.error || trendQuery.error;
  const columns: ColumnsType<DailyPowerTrend> = [
    {
      title: t("业务日期"),
      dataIndex: "business_date",
      width: 180,
      render: (date: string) => (
        <Tooltip title={t("查看当日功耗明细")}>
          <button type="button" className="daily-mac-date" onClick={() => openDetails(date)}>
            {date}
          </button>
        </Tooltip>
      ),
    },
    {
      title: t("日平均功耗（MW）"),
      dataIndex: "total_power_mw",
      align: "right",
      width: 240,
      render: (value: number | null, row) => (
        <div>
          {formatPower(value)}
          {powerDayStatus(row, expectedAgents) === "partial" ? (
            <div className="mt-1 text-xs text-amber-600">{t("可用数据合计")}</div>
          ) : null}
        </div>
      ),
    },
    {
      title: t("有效 Agent / 总数"),
      key: "agents",
      align: "right",
      width: 180,
      render: (_, row) =>
        `${row.agents.filter((agent) => agent.power_mw != null && agent.status !== "no_data").length} / ${Math.max(row.agents.length, expectedAgents.length)}`,
    },
    {
      title: t("数据状态"),
      key: "status",
      width: 180,
      render: (_, row) => {
        const status = powerDayStatus(row, expectedAgents);
        return (
          <Tag color={status === "partial" ? "orange" : status === "valid" ? "green" : undefined}>
            {powerStatusLabel(status)}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="miner-power daily-mac-stats min-h-full bg-white -m-4 p-4 md:p-8">
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
                  const previous = (location.state as FarmMonitorReturnState | null)?.farmMonitorReturn;
                  const returnSite = previous?.venueType === poolType ? previous.siteCode : siteCode;
                  const search = new URLSearchParams(returnSite ? { siteCode: returnSite } : {});
                  navigate(`${ROUTE_PATHS.farmMonitor}${search.size ? `?${search}` : ""}`);
                }}
              />
            </Tooltip>
            <h1 className="m-0 text-lg font-semibold text-gray-900">{t("矿机功耗")}</h1>
          </div>
          <div className="daily-mac-header-actions">
            <div className="daily-mac-site-field">
              <label htmlFor="miner-power-site">{t("场地")}</label>
              <Select
                id="miner-power-site"
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
                onChange={(value: string) =>
                  updateParams({ siteCode: value, agentCode: null, businessDate: null })
                }
              />
            </div>
            <Tooltip title={t("刷新")}>
              <Button
                type="text"
                size="middle"
                className="daily-mac-header-icon"
                aria-label={t("刷新")}
                icon={<ReloadOutlined />}
                loading={loading}
                disabled={!poolType}
                onClick={() => {
                  void sitesQuery.refetch();
                  if (selectedSite) {
                    void allTrendQuery.refetch();
                    if (agentCode) void agentTrendQuery.refetch();
                  }
                }}
              />
            </Tooltip>
          </div>
        </header>
        <section className="miner-power-filters">
          <div className="miner-power-filter">
            <label>{t("业务日期")}</label>
            <DatePicker.RangePicker
              size="middle"
              allowClear={false}
              value={[dayjs(startDate), dayjs(endDate)]}
              format={DATE_FORMAT}
              presets={[
                {
                  label: t("最近 7 天"),
                  value: [dayjs(lastBusinessDate).subtract(6, "day"), dayjs(lastBusinessDate)],
                },
                {
                  label: t("最近 30 天"),
                  value: [dayjs(lastBusinessDate).subtract(29, "day"), dayjs(lastBusinessDate)],
                },
              ]}
              onChange={(range) => {
                if (range?.[0] && range[1])
                  updateParams({
                    startDate: range[0].format(DATE_FORMAT),
                    endDate: range[1].format(DATE_FORMAT),
                    businessDate: null,
                  });
              }}
            />
          </div>
          <div className="miner-power-filter">
            <label htmlFor="miner-power-agent">Agent</label>
            <Select
              id="miner-power-agent"
              aria-label={t("筛选 Agent")}
              size="middle"
              className="miner-power-agent"
              classNames={{ popup: { root: "daily-mac-site-popup" } }}
              showSearch
              optionFilterProp="label"
              value={agentCode}
              loading={allTrendQuery.isFetching}
              options={[
                { value: "", label: t("全部 Agent") },
                ...[...agentNames].map(([value, label]) => ({ value, label, title: `${label} (${value})` })),
                ...(agentCode && !agentNames.has(agentCode) ? [{ value: agentCode, label: agentCode }] : []),
              ]}
              onChange={(value: string) => updateParams({ agentCode: value || null, businessDate: null })}
            />
          </div>
          <span className="ml-auto text-xs text-gray-400">{t("上海时间 · 08:00 至次日 08:00")}</span>
        </section>
        {error ? (
          <Alert
            type="error"
            showIcon
            message={error.message}
            action={
              <Button
                size="middle"
                onClick={() => {
                  if (sitesQuery.isError) void sitesQuery.refetch();
                  else void trendQuery.refetch();
                }}
              >
                {t("重试")}
              </Button>
            }
          />
        ) : null}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="m-0 text-sm font-semibold text-gray-800">{t("每日功耗趋势")}</h2>
            <span className="text-xs text-gray-400">{t("点击日期或曲线节点查看当日明细")}</span>
          </div>
          <Spin spinning={loading}>
            {hasPower ? (
              <MinerPowerTrendChart rows={rows} onDateClick={openDetails} />
            ) : (
              <div className="flex h-[340px] items-center justify-center">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    error
                      ? t("功耗数据加载失败")
                      : selectedSite
                        ? t("所选日期范围暂无功耗数据")
                        : t("请选择场地查看功耗统计")
                  }
                />
              </div>
            )}
          </Spin>
          <p className="mt-3 mb-0 text-xs text-gray-400">
            {t(
              "日平均功耗 = 总平均功耗 − 黑名单平均功耗，单位 MW，保留 3 位小数。缺失数据断开显示，0 正常展示。",
            )}
            {hasPartial ? (
              <span className="ml-2 text-amber-600">
                {t("橙色菱形表示数据不完整，场地合计为可用数据合计。")}
              </span>
            ) : null}
          </p>
        </section>
        <section>
          <h2 className="mb-3 text-sm font-semibold text-gray-800">{t("每日功耗统计")}</h2>
          <Table<DailyPowerTrend>
            key={`${poolType}_${siteCode}_${startDate}_${endDate}_${agentCode}`}
            rowKey="business_date"
            columns={columns}
            dataSource={[...rows].reverse()}
            size="middle"
            loading={loading}
            scroll={{ x: 780 }}
            pagination={{
              defaultPageSize: 20,
              showSizeChanger: true,
              pageSizeOptions: [20, 50, 100],
              showTotal: (total) => t("共 {{total}} 条记录", { total }),
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={error ? t("功耗数据加载失败") : t("暂无功耗数据")}
                />
              ),
            }}
          />
        </section>
      </div>
      {selectedSite && detailDate ? (
        <DailyPowerDetailsDrawer
          key={`${poolType}_${siteCode}_${detailDate}_${agentCode}`}
          venueType={poolType}
          siteCode={siteCode}
          siteName={selectedSite.site_name}
          businessDate={detailDate}
          agentCode={agentCode}
          agentNames={agentNames}
          onClose={() => updateParams({ businessDate: null })}
        />
      ) : null}
    </div>
  );
}
