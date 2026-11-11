import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Form } from "antd";
import dayjs from "dayjs";
import FarmSiteList from "./components/FarmSiteList";
import KpiCards from "./components/KpiCards";
import MinerSnapshotPanel, { type MinerSnapshotSearchValues } from "./components/MinerSnapshotPanel";
import OverviewChart from "./components/OverviewChart";
import YesterdaySummaryCard, {
  YesterdayMacSummary,
  YesterdayPowerSummary,
} from "./components/YesterdaySummaryCard";
import { FARM_MONITOR_TOP_HEIGHT } from "./constants";
import {
  useBoundSites,
  useLatestFinishedProbeTask,
  useOtherPoolMachineAnomalies,
  useRecentProbeTasks,
  useTaskAbnormalMinerCounts,
  useTaskSnapshots,
  useYesterdayMacOverview,
  useYesterdayPowerOverview,
} from "./hook";
import type {
  BoundSiteItem,
  HashrateTimeSeriesPoint,
  MinerCodeAnomalySummary,
  OtherPoolMachineAnomalySummary,
  TaskSnapshotQueryParams,
  TimeRange,
} from "./types";
import {
  buildTaskSnapshotQueryParams,
  formatTaskIdsForSnapshotApi,
  getLastProbeTaskTime,
  mapBoundSiteToFarmSite,
  mapLatestTaskToKpiSummary,
  mapProbeTasksToOverviewPoints,
  resolveLatestProbeTaskIds,
} from "./utils";
import {
  FARM_MONITOR_CACHE_OPTIONS,
  FARM_MONITOR_RESTORE_OPTIONS,
  farmMonitorViewKey,
  type FarmMonitorViewState,
} from "./view-state";
import { ROUTE_PATHS } from "@/constants/common";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import { useSettingsStore } from "@/stores";
import { useSelector } from "@/stores/selectors";
import { getAbnormalStatsDate, isYesterdayAbnormalCalculating } from "@/utils";

import { t } from "@/locales";
import type { AbnormalLogSearchValues } from "@/pages/fault-machine-monitor/components/AbnormalLogPanel";
import AbnormalManagementDrawer from "@/pages/fault-machine-monitor/components/AbnormalManagementDrawer";
import {
  useAbnormalDataDetail,
  useAbnormalLogs,
  useAnomalyManagementHistory,
} from "@/pages/fault-machine-monitor/hook";
import type {
  AbnormalDataDetail,
  AbnormalLogFilters,
  AnomalyManagementRecord,
  AnomalyManagementRecordDTO,
} from "@/pages/fault-machine-monitor/types";
import { mapAbnormalLogListToRecords } from "@/pages/fault-machine-monitor/utils";

export default function FarmMonitorPage() {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const userId = localStorage.getItem("user_id") ?? "";
  return <FarmMonitorContent key={`${userId}:${poolType}`} poolType={poolType} userId={userId} />;
}

function FarmMonitorContent({ poolType, userId }: { poolType: string; userId: string }) {
  useAuthRedirect();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const viewKey = useMemo(() => farmMonitorViewKey(userId, poolType), [poolType, userId]);
  const [restoredView] = useState(() => {
    const cached = queryClient.getQueryData<FarmMonitorViewState>(viewKey);
    const requestedSite = searchParams.get("siteCode");
    if (!cached) return undefined;
    // 浏览器后退回到原历史记录时，以离开前实际选中的场地为准。
    return cached.locationKey === location.key || !requestedSite || cached.siteCode === requestedSite
      ? cached
      : undefined;
  });
  const cacheOptions = restoredView ? FARM_MONITOR_RESTORE_OPTIONS : FARM_MONITOR_CACHE_OPTIONS;

  const [form] = Form.useForm<MinerSnapshotSearchValues>();
  const [abnormalForm] = Form.useForm<AbnormalLogSearchValues>();
  const [timeRange, setTimeRange] = useState<TimeRange>(restoredView?.timeRange ?? "24h");
  const [snapshotFilters, setSnapshotFilters] = useState<TaskSnapshotQueryParams>(
    restoredView?.snapshotFilters ?? {},
  );
  const [page, setPage] = useState(restoredView?.page ?? 1);
  const [pageSize, setPageSize] = useState(restoredView?.pageSize ?? 20);
  const [filterExpanded, setFilterExpanded] = useState(restoredView?.filterExpanded ?? true);
  const [abnormalFilters, setAbnormalFilters] = useState<AbnormalLogFilters>({});
  const [abnormalPage, setAbnormalPage] = useState(1);
  const [abnormalPageSize, setAbnormalPageSize] = useState(20);
  const [abnormalTerminalOpen, setAbnormalTerminalOpen] = useState(false);
  const {
    data: boundSitesRes,
    isLoading: isSitesLoading,
    refetch: refetchBoundSites,
  } = useBoundSites(poolType, cacheOptions);

  const farmSites = useMemo(() => {
    const list: BoundSiteItem[] = boundSitesRes?.data?.list ?? [];
    return list.map(mapBoundSiteToFarmSite);
  }, [boundSitesRes]);

  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(
    () => restoredView?.siteCode ?? searchParams.get("siteCode"),
  );

  const selectFarm = useCallback(
    (id: string | null) => {
      if (id === selectedFarmId) return;
      setSelectedFarmId(id);
      setPage(1);
      setSnapshotFilters({});
      form.resetFields();
    },
    [form, selectedFarmId],
  );

  useEffect(() => {
    if (farmSites.length === 0) return;
    if (selectedFarmId && farmSites.some((site) => site.id === selectedFarmId)) return;
    selectFarm(farmSites[0].id);
  }, [farmSites, selectFarm, selectedFarmId]);

  const selectedFarm = useMemo(
    () => farmSites.find((s) => s.id === selectedFarmId) ?? null,
    [farmSites, selectedFarmId],
  );
  const visibleFarmId = selectedFarm?.id ?? null;

  useEffect(() => {
    if (restoredView) form.setFieldsValue(restoredView.formValues);
  }, [form, restoredView]);

  useLayoutEffect(() => {
    if (!restoredView) return;
    const restoreScroll = () => window.scrollTo({ top: restoredView.scrollY, left: 0, behavior: "instant" });
    restoreScroll();
    const frame = requestAnimationFrame(restoreScroll);
    return () => cancelAnimationFrame(frame);
  }, [restoredView]);

  const rememberView = useCallback(() => {
    queryClient.setQueryDefaults(viewKey, FARM_MONITOR_CACHE_OPTIONS);
    queryClient.setQueryData<FarmMonitorViewState>(viewKey, {
      locationKey: location.key,
      siteCode: selectedFarmId,
      timeRange,
      snapshotFilters,
      formValues: form.getFieldsValue(true),
      page,
      pageSize,
      filterExpanded,
      scrollY: window.scrollY,
    });
  }, [
    filterExpanded,
    form,
    location.key,
    page,
    pageSize,
    queryClient,
    selectedFarmId,
    snapshotFilters,
    timeRange,
    viewKey,
  ]);

  const {
    data: probeTasksRes,
    isLoading: isProbeTasksLoading,
    isFetching: isProbeTasksFetching,
    refetch: refetchProbeTasks,
  } = useRecentProbeTasks(poolType, visibleFarmId, timeRange, cacheOptions);

  const {
    data: latestTaskRes,
    isLoading: isLatestTaskLoading,
    isFetching: isLatestTaskFetching,
    refetch: refetchLatestTask,
  } = useLatestFinishedProbeTask(poolType, visibleFarmId, cacheOptions);

  const hashrateSeries = useMemo<HashrateTimeSeriesPoint[]>(
    () => probeTasksRes?.data?.list ?? [],
    [probeTasksRes],
  );

  const overviewData = useMemo(
    () => mapProbeTasksToOverviewPoints(hashrateSeries, timeRange),
    [hashrateSeries, timeRange],
  );

  const lastUpdated = useMemo(() => getLastProbeTaskTime(hashrateSeries) ?? "-", [hashrateSeries]);

  const latestProbeTask = latestTaskRes?.data;

  const kpiOnShelfCount = latestProbeTask?.on_shelf_count ?? null;

  const latestTaskIds = useMemo(() => resolveLatestProbeTaskIds(latestProbeTask), [latestProbeTask]);

  const {
    data: latestMinerAnomalyRes,
    isLoading: isLatestMinerAnomalyLoading,
    isFetching: isLatestMinerAnomalyFetching,
    refetch: refetchLatestMinerAnomaly,
  } = useTaskAbnormalMinerCounts(poolType, latestTaskIds, cacheOptions);

  const snapshotTaskIdsParam = useMemo(() => formatTaskIdsForSnapshotApi(latestTaskIds), [latestTaskIds]);

  const snapshotQueryParams = useMemo(
    () => buildTaskSnapshotQueryParams(snapshotFilters, page, pageSize),
    [snapshotFilters, page, pageSize],
  );

  const abnormalLogRange = useMemo(() => {
    return timeRange === "24h"
      ? ([dayjs().subtract(24, "hour"), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs])
      : ([dayjs().subtract(7, "day"), dayjs()] as [dayjs.Dayjs, dayjs.Dayjs]);
  }, [timeRange]);

  const abnormalQueryParams = useMemo(
    () => ({
      page: abnormalPage,
      pageSize: abnormalPageSize,
      ...(abnormalFilters.siteCode ? { siteCode: abnormalFilters.siteCode } : {}),
      ...(abnormalFilters.code ? { code: abnormalFilters.code } : {}),
      ...(abnormalFilters.ip ? { ip: abnormalFilters.ip } : {}),
      ...(abnormalFilters.mac ? { mac: abnormalFilters.mac } : {}),
      ...(abnormalFilters.controlBoardSN ? { controlBoardSN: abnormalFilters.controlBoardSN } : {}),
      ...(abnormalFilters.logTimeFrom ? { logTimeFrom: abnormalFilters.logTimeFrom } : {}),
      ...(abnormalFilters.logTimeTo ? { logTimeTo: abnormalFilters.logTimeTo } : {}),
    }),
    [abnormalFilters, abnormalPage, abnormalPageSize],
  );

  const {
    data: snapshotsRes,
    isLoading: isSnapshotsLoading,
    isFetching: isSnapshotsFetching,
    refetch: refetchSnapshots,
  } = useTaskSnapshots(poolType, snapshotTaskIdsParam, snapshotQueryParams, cacheOptions);

  const {
    data: abnormalLogsRes,
    isLoading: isAbnormalLogsLoading,
    isFetching: isAbnormalLogsFetching,
    refetch: refetchAbnormalLogs,
  } = useAbnormalLogs(poolType, abnormalQueryParams, abnormalTerminalOpen && Boolean(selectedFarmId));

  const abnormalStatsDate = getAbnormalStatsDate().format("YYYY-MM-DD");
  const yesterdayAbnormalCalculating = isYesterdayAbnormalCalculating();
  const yesterdayMacQuery = useYesterdayMacOverview(poolType, visibleFarmId, abnormalStatsDate, cacheOptions);
  const yesterdayPowerQuery = useYesterdayPowerOverview(
    poolType,
    visibleFarmId,
    abnormalStatsDate,
    cacheOptions,
  );
  const yesterdayPower = yesterdayPowerQuery.data?.list.find(
    (day) => day.business_date === abnormalStatsDate,
  );
  const refetchYesterdayMac = yesterdayMacQuery.refetch;
  const refetchYesterdayPower = yesterdayPowerQuery.refetch;
  const {
    data: anomalyHistoryRes,
    isLoading: isAnomalyHistoryLoading,
    isFetching: isAnomalyHistoryFetching,
    refetch: refetchAnomalyHistory,
  } = useAnomalyManagementHistory(
    poolType,
    selectedFarm?.name,
    abnormalStatsDate,
    abnormalPage,
    abnormalPageSize,
    abnormalTerminalOpen,
  );

  const {
    data: abnormalDataRes,
    isLoading: isAbnormalDataLoading,
    isFetching: isAbnormalDataFetching,
    refetch: refetchAbnormalData,
  } = useAbnormalDataDetail(poolType, selectedFarm?.name, abnormalStatsDate, true, cacheOptions);

  const {
    data: yesterdayMinerAnomalyRes,
    isLoading: isYesterdayMinerAnomalyLoading,
    isFetching: isYesterdayMinerAnomalyFetching,
    refetch: refetchYesterdayMinerAnomaly,
  } = useOtherPoolMachineAnomalies(poolType, selectedFarm?.name, abnormalStatsDate, cacheOptions);

  const snapshotData = snapshotsRes?.data;
  const snapshotList = snapshotData?.list ?? [];
  const snapshotTotal = snapshotData?.total ?? 0;
  const fullTypeOptions = snapshotData?.fullTypes ?? [];
  const minerCodeOptions = snapshotData?.minerCodes ?? [];
  const abnormalLogList = useMemo(
    () => mapAbnormalLogListToRecords(abnormalLogsRes?.data?.list),
    [abnormalLogsRes],
  );
  const anomalyHistoryList = useMemo(
    () =>
      ((anomalyHistoryRes?.data?.list ?? []) as AnomalyManagementRecordDTO[]).map((item) => ({
        id: String(item.id),
        time: item.createdAt || `${item.date} 00:00:00`,
        reason: item.reason,
        operator: item.owner || "-",
        devicesAffected: item.affectedMachineCount ?? 0,
        abnormalCount: item.abnormalCount ?? 0,
        status: item.status,
      })) as AnomalyManagementRecord[],
    [anomalyHistoryRes],
  );
  const anomalyHistoryTotal =
    typeof anomalyHistoryRes?.data?.total === "number"
      ? anomalyHistoryRes.data.total
      : anomalyHistoryList.length;
  const abnormalDataSummary = useMemo(
    () => (abnormalDataRes?.data ?? undefined) as AbnormalDataDetail | undefined,
    [abnormalDataRes],
  );
  const yesterdayMinerAnomaly = useMemo(
    () => (yesterdayMinerAnomalyRes?.data ?? undefined) as OtherPoolMachineAnomalySummary | undefined,
    [yesterdayMinerAnomalyRes],
  );
  const latestMinerAnomaly = useMemo(
    () => latestMinerAnomalyRes as MinerCodeAnomalySummary | undefined,
    [latestMinerAnomalyRes],
  );
  const kpiSummary = useMemo(
    () => mapLatestTaskToKpiSummary(latestProbeTask, kpiOnShelfCount, abnormalDataSummary?.abnormalCount),
    [abnormalDataSummary?.abnormalCount, kpiOnShelfCount, latestProbeTask],
  );

  const handleRefresh = useCallback(() => {
    void refetchBoundSites();
    void refetchProbeTasks();
    void refetchLatestTask();
    void refetchSnapshots();
    void refetchAbnormalData();
    void refetchLatestMinerAnomaly();
    void refetchYesterdayMinerAnomaly();
    if (visibleFarmId) {
      void refetchYesterdayMac();
      void refetchYesterdayPower();
    }
    if (abnormalTerminalOpen) {
      void refetchAbnormalLogs();
      void refetchAnomalyHistory();
    }
  }, [
    abnormalTerminalOpen,
    refetchBoundSites,
    refetchAbnormalLogs,
    refetchAbnormalData,
    refetchAnomalyHistory,
    refetchProbeTasks,
    refetchLatestTask,
    refetchLatestMinerAnomaly,
    refetchSnapshots,
    refetchYesterdayMinerAnomaly,
    visibleFarmId,
    refetchYesterdayMac,
    refetchYesterdayPower,
  ]);

  const previousSnapshotScope = useRef({ siteCode: selectedFarmId, taskIds: snapshotTaskIdsParam });
  useEffect(() => {
    const previous = previousSnapshotScope.current;
    previousSnapshotScope.current = { siteCode: selectedFarmId, taskIds: snapshotTaskIdsParam };
    // 返回时保留原筛选/分页；只有同一场地刷新出了新任务时才重置。
    if (
      previous.siteCode !== selectedFarmId ||
      !previous.taskIds ||
      !snapshotTaskIdsParam ||
      previous.taskIds === snapshotTaskIdsParam
    )
      return;
    setPage(1);
    setSnapshotFilters({});
    form.resetFields();
  }, [form, selectedFarmId, snapshotTaskIdsParam]);

  const onSearch = (values: MinerSnapshotSearchValues) => {
    setSnapshotFilters({
      minerCode: values.minerCode,
      sn: values.sn,
      fullType: values.fullType,
      ip: values.ip,
      macAddress: values.macAddress,
      controlBoardSN: values.controlBoardSN,
      zeroHashrate: values.zeroHashrate,
      hashrateFault: values.hashrateFault,
    });
    setPage(1);
  };

  const onReset = () => {
    form.resetFields();
    setSnapshotFilters({});
    setPage(1);
  };

  const onAbnormalSearch = (values: AbnormalLogSearchValues) => {
    const range = values.logTimeRange;
    setAbnormalFilters({
      code: values.code,
      siteCode: values.siteCode || undefined,
      ip: values.ip?.trim() || undefined,
      mac: values.mac?.trim() || undefined,
      controlBoardSN: values.controlBoardSN?.trim() || undefined,
      logTimeFrom: range?.[0]?.format("YYYY-MM-DD HH:mm:ss"),
      logTimeTo: range?.[1]?.format("YYYY-MM-DD HH:mm:ss"),
    });
    setAbnormalPage(1);
  };

  const onAbnormalReset = () => {
    abnormalForm.resetFields();
    setAbnormalFilters({
      siteCode: selectedFarmId || undefined,
      logTimeFrom: abnormalLogRange[0].format("YYYY-MM-DD HH:mm:ss"),
      logTimeTo: abnormalLogRange[1].format("YYYY-MM-DD HH:mm:ss"),
    });
    setAbnormalPage(1);
  };

  const openAbnormalManagementTerminal = useCallback(() => {
    if (!selectedFarm?.name || !selectedFarmId) return;
    rememberView();
    const params = new URLSearchParams({ siteName: selectedFarm.name, siteCode: selectedFarmId });
    navigate(`${ROUTE_PATHS.farmAbnormalHistory}?${params}`);
  }, [navigate, rememberView, selectedFarm, selectedFarmId]);

  const openYesterdayMinerAnomalyHistory = useCallback(() => {
    if (!selectedFarm?.name || !selectedFarmId) return;
    rememberView();
    const params = new URLSearchParams({ siteName: selectedFarm.name, siteCode: selectedFarmId });
    navigate(`${ROUTE_PATHS.farmMinerAnomalyHistory}?${params}`);
  }, [navigate, rememberView, selectedFarm, selectedFarmId]);

  const openSiteStatistics = (path: string) => {
    if (!selectedFarm || !selectedFarmId) return;
    rememberView();
    const params = new URLSearchParams({
      venueType: poolType,
      siteName: selectedFarm.name,
      siteCode: selectedFarmId,
    });
    navigate(`${path}?${params}`, {
      state: { farmMonitorReturn: { venueType: poolType, siteCode: selectedFarmId } },
    });
  };

  useEffect(() => {
    if (!abnormalTerminalOpen || !selectedFarmId) return;
    const nextValues: AbnormalLogSearchValues = {
      siteCode: selectedFarmId,
      code: undefined,
      ip: undefined,
      mac: undefined,
      controlBoardSN: undefined,
      logTimeRange: abnormalLogRange,
    };
    abnormalForm.setFieldsValue(nextValues);
    setAbnormalFilters({
      siteCode: selectedFarmId,
      logTimeFrom: abnormalLogRange[0].format("YYYY-MM-DD HH:mm:ss"),
      logTimeTo: abnormalLogRange[1].format("YYYY-MM-DD HH:mm:ss"),
    });
    setAbnormalPage(1);
  }, [abnormalForm, abnormalLogRange, abnormalTerminalOpen, selectedFarmId]);

  return (
    <div className="min-h-full bg-[#f5f5f5] -m-4 p-4 [overflow-anchor:none]">
      <div className="flex gap-4 items-start mb-4">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <OverviewChart
            farmName={selectedFarm?.name}
            farmStatus={selectedFarm?.status}
            data={overviewData}
            timeRange={timeRange}
            lastUpdated={lastUpdated}
            loading={isProbeTasksLoading || isProbeTasksFetching}
            onTimeRangeChange={setTimeRange}
            onRefresh={handleRefresh}
          />
          <KpiCards
            data={kpiSummary}
            loading={
              isLatestTaskLoading ||
              isLatestTaskFetching ||
              isAbnormalDataLoading ||
              isAbnormalDataFetching ||
              isYesterdayMinerAnomalyLoading ||
              isYesterdayMinerAnomalyFetching
            }
            onAbnormalClick={openAbnormalManagementTerminal}
            onYesterdayMinerAnomalyClick={openYesterdayMinerAnomalyHistory}
            yesterdayAbnormalCalculating={yesterdayAbnormalCalculating}
            latestMinerAnomaly={latestMinerAnomaly}
            latestMinerAnomalyLoading={isLatestMinerAnomalyLoading || isLatestMinerAnomalyFetching}
            yesterdayMinerAnomaly={yesterdayMinerAnomaly}
            yesterdayChangeCard={
              <YesterdaySummaryCard
                title={t("昨日变化")}
                disabled={!selectedFarm}
                businessDate={abnormalStatsDate}
                loading={yesterdayMacQuery.isFetching}
                error={yesterdayMacQuery.error}
                onMore={() => openSiteStatistics(ROUTE_PATHS.farmDailyMacStats)}
              >
                <YesterdayMacSummary rows={yesterdayMacQuery.data ?? []} />
              </YesterdaySummaryCard>
            }
            yesterdayPowerCard={
              <YesterdaySummaryCard
                title={t("昨日功耗")}
                disabled={!selectedFarm}
                businessDate={abnormalStatsDate}
                loading={yesterdayPowerQuery.isFetching}
                error={yesterdayPowerQuery.error}
                onMore={() => openSiteStatistics(ROUTE_PATHS.farmMinerPower)}
              >
                <YesterdayPowerSummary day={yesterdayPower} />
              </YesterdaySummaryCard>
            }
          />
        </div>
        {abnormalTerminalOpen ? (
          <div className="w-[440px] shrink-0" style={{ height: FARM_MONITOR_TOP_HEIGHT }}>
            <AbnormalManagementDrawer
              open={abnormalTerminalOpen}
              mode="inline"
              venueType={poolType}
              selectedSiteValue={selectedFarmId ?? undefined}
              siteCode={selectedFarmId ?? undefined}
              siteName={selectedFarm?.name}
              abnormalCount={kpiSummary.yesterdayAbnormal ?? 0}
              scannedCount={kpiSummary.online}
              theoreticalCount={kpiSummary.theoreticalOnline}
              summary={abnormalDataSummary}
              logRange={abnormalLogRange}
              form={abnormalForm}
              siteOptions={farmSites.map((site) => ({ id: site.id, name: site.name }))}
              exportFilters={abnormalFilters}
              logs={abnormalLogList}
              historyRecords={anomalyHistoryList}
              total={anomalyHistoryTotal}
              page={abnormalPage}
              pageSize={abnormalPageSize}
              loading={isAbnormalLogsLoading || isAbnormalLogsFetching}
              historyLoading={
                isAnomalyHistoryLoading ||
                isAnomalyHistoryFetching ||
                isAbnormalDataLoading ||
                isAbnormalDataFetching
              }
              onClose={() => setAbnormalTerminalOpen(false)}
              onSearch={onAbnormalSearch}
              onReset={onAbnormalReset}
              onRefresh={() => void refetchAbnormalLogs()}
              onPageChange={(p, ps) => {
                setAbnormalPage(p);
                setAbnormalPageSize(ps || 20);
              }}
              onSiteChange={selectFarm}
              onHistoryRefresh={() => void refetchAnomalyHistory()}
            />
          </div>
        ) : null}
        <FarmSiteList
          sites={farmSites}
          selectedId={selectedFarmId}
          loading={isSitesLoading}
          onSelect={selectFarm}
        />
      </div>

      <MinerSnapshotPanel
        form={form}
        fullTypeOptions={fullTypeOptions}
        minerCodeOptions={minerCodeOptions}
        snapshotList={snapshotList}
        snapshotTotal={snapshotTotal}
        page={page}
        pageSize={pageSize}
        loading={isSnapshotsLoading || isSnapshotsFetching}
        snapshotTaskIdsParam={snapshotTaskIdsParam}
        venueType={poolType}
        siteCode={snapshotData?.site_code}
        exportFilters={snapshotFilters}
        onSearch={onSearch}
        onReset={onReset}
        onRefresh={handleRefresh}
        filterExpanded={filterExpanded}
        onFilterExpandedChange={setFilterExpanded}
        onPageChange={(p, ps) => {
          setPage(p);
          setPageSize(ps || 20);
        }}
      />
    </div>
  );
}
