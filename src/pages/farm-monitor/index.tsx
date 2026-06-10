import { useCallback, useEffect, useMemo, useState } from "react";
import { Form } from "antd";
import dayjs from "dayjs";
import FarmSiteList from "./components/FarmSiteList";
import KpiCards from "./components/KpiCards";
import MinerSnapshotPanel, { type MinerSnapshotSearchValues } from "./components/MinerSnapshotPanel";
import OverviewChart from "./components/OverviewChart";
import { FARM_MONITOR_TOP_HEIGHT } from "./constants";
import { useBoundSites, useLatestFinishedProbeTask, useRecentProbeTasks, useTaskSnapshots } from "./hook";
import type { BoundSiteItem, HashrateTimeSeriesPoint, TaskSnapshotQueryParams, TimeRange } from "./types";
import {
  buildTaskSnapshotQueryParams,
  formatTaskIdsForSnapshotApi,
  getLastProbeTaskTime,
  mapBoundSiteToFarmSite,
  mapLatestTaskToKpiSummary,
  mapProbeTasksToOverviewPoints,
  resolveLatestProbeTaskIds,
} from "./utils";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import { getAbnormalStatsDate } from "@/utils";

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
  useAuthRedirect();

  const [form] = Form.useForm<MinerSnapshotSearchValues>();
  const [abnormalForm] = Form.useForm<AbnormalLogSearchValues>();
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [snapshotFilters, setSnapshotFilters] = useState<TaskSnapshotQueryParams>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [abnormalFilters, setAbnormalFilters] = useState<AbnormalLogFilters>({});
  const [abnormalPage, setAbnormalPage] = useState(1);
  const [abnormalPageSize, setAbnormalPageSize] = useState(20);
  const [abnormalTerminalOpen, setAbnormalTerminalOpen] = useState(false);
  const { data: boundSitesRes, isLoading: isSitesLoading } = useBoundSites();

  const farmSites = useMemo(() => {
    const list: BoundSiteItem[] = boundSitesRes?.data?.list ?? [];
    return list.map(mapBoundSiteToFarmSite);
  }, [boundSitesRes]);

  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);

  useEffect(() => {
    if (farmSites.length === 0) return;
    setSelectedFarmId((prev) => {
      if (prev && farmSites.some((s) => s.id === prev)) return prev;
      return farmSites[0].id;
    });
  }, [farmSites]);

  const {
    data: probeTasksRes,
    isLoading: isProbeTasksLoading,
    isFetching: isProbeTasksFetching,
    refetch: refetchProbeTasks,
  } = useRecentProbeTasks(selectedFarmId, timeRange);

  const {
    data: latestTaskRes,
    isLoading: isLatestTaskLoading,
    isFetching: isLatestTaskFetching,
    refetch: refetchLatestTask,
  } = useLatestFinishedProbeTask(selectedFarmId);

  const selectedFarm = useMemo(
    () => farmSites.find((s) => s.id === selectedFarmId) ?? null,
    [farmSites, selectedFarmId],
  );

  const hashrateSeries: HashrateTimeSeriesPoint[] = probeTasksRes?.data?.list ?? [];

  const overviewData = useMemo(
    () => mapProbeTasksToOverviewPoints(hashrateSeries, timeRange),
    [hashrateSeries, timeRange],
  );

  const lastUpdated = useMemo(() => getLastProbeTaskTime(hashrateSeries) ?? "-", [hashrateSeries]);

  const latestProbeTask = latestTaskRes?.data;

  const kpiOnShelfCount = latestProbeTask?.on_shelf_count ?? null;

  const kpiSummary = useMemo(
    () => mapLatestTaskToKpiSummary(latestProbeTask, kpiOnShelfCount),
    [latestProbeTask, kpiOnShelfCount],
  );

  const latestTaskIds = useMemo(() => resolveLatestProbeTaskIds(latestProbeTask), [latestProbeTask]);

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
  } = useTaskSnapshots(snapshotTaskIdsParam, snapshotQueryParams);

  const {
    data: abnormalLogsRes,
    isLoading: isAbnormalLogsLoading,
    isFetching: isAbnormalLogsFetching,
    refetch: refetchAbnormalLogs,
  } = useAbnormalLogs(abnormalQueryParams, abnormalTerminalOpen && Boolean(selectedFarmId));

  const abnormalStatsDate = getAbnormalStatsDate().format("YYYY-MM-DD");
  const {
    data: anomalyHistoryRes,
    isLoading: isAnomalyHistoryLoading,
    isFetching: isAnomalyHistoryFetching,
    refetch: refetchAnomalyHistory,
  } = useAnomalyManagementHistory(
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
  } = useAbnormalDataDetail(selectedFarm?.name, abnormalStatsDate, abnormalTerminalOpen);

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

  const handleRefresh = useCallback(() => {
    void refetchProbeTasks();
    void refetchLatestTask();
    void refetchSnapshots();
    if (abnormalTerminalOpen) {
      void refetchAbnormalLogs();
      void refetchAnomalyHistory();
      void refetchAbnormalData();
    }
  }, [
    abnormalTerminalOpen,
    refetchAbnormalLogs,
    refetchAbnormalData,
    refetchAnomalyHistory,
    refetchProbeTasks,
    refetchLatestTask,
    refetchSnapshots,
  ]);

  useEffect(() => {
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
    if (!selectedFarmId) return;
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
    setAbnormalTerminalOpen(true);
  }, [abnormalForm, abnormalLogRange, selectedFarmId]);

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
    <div className="min-h-full bg-[#f5f5f5] -m-4 p-4">
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
            loading={isLatestTaskLoading || isLatestTaskFetching}
            onAbnormalClick={openAbnormalManagementTerminal}
          />
        </div>
        {abnormalTerminalOpen ? (
          <div className="w-[440px] shrink-0" style={{ height: FARM_MONITOR_TOP_HEIGHT }}>
            <AbnormalManagementDrawer
              open={abnormalTerminalOpen}
              mode="inline"
              selectedSiteValue={selectedFarmId ?? undefined}
              siteCode={selectedFarmId ?? undefined}
              siteName={selectedFarm?.name}
              abnormalCount={kpiSummary.theoreticalOffline ?? 0}
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
              onSiteChange={(siteCode) => {
                setSelectedFarmId(siteCode);
                setPage(1);
              }}
              onHistoryRefresh={() => void refetchAnomalyHistory()}
            />
          </div>
        ) : null}
        <FarmSiteList
          sites={farmSites}
          selectedId={selectedFarmId}
          loading={isSitesLoading}
          onSelect={(id) => {
            setSelectedFarmId(id);
            setPage(1);
          }}
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
        siteCode={snapshotData?.site_code}
        exportFilters={snapshotFilters}
        onSearch={onSearch}
        onReset={onReset}
        onRefresh={handleRefresh}
        onPageChange={(p, ps) => {
          setPage(p);
          setPageSize(ps || 20);
        }}
      />
    </div>
  );
}
