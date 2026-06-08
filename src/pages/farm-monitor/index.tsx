import { useCallback, useEffect, useMemo, useState } from "react";
import { Form } from "antd";
import FarmSiteList from "./components/FarmSiteList";
import KpiCards from "./components/KpiCards";
import MinerSnapshotPanel, { type MinerSnapshotSearchValues } from "./components/MinerSnapshotPanel";
import OverviewChart from "./components/OverviewChart";
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

export default function FarmMonitorPage() {
  useAuthRedirect();

  const [form] = Form.useForm<MinerSnapshotSearchValues>();
  const [timeRange, setTimeRange] = useState<TimeRange>("24h");
  const [snapshotFilters, setSnapshotFilters] = useState<TaskSnapshotQueryParams>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
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

  const {
    data: snapshotsRes,
    isLoading: isSnapshotsLoading,
    isFetching: isSnapshotsFetching,
    refetch: refetchSnapshots,
  } = useTaskSnapshots(snapshotTaskIdsParam, snapshotQueryParams);

  const snapshotData = snapshotsRes?.data;
  const snapshotList = snapshotData?.list ?? [];
  const snapshotTotal = snapshotData?.total ?? 0;
  const fullTypeOptions = snapshotData?.fullTypes ?? [];
  const minerCodeOptions = snapshotData?.minerCodes ?? [];

  const handleRefresh = useCallback(() => {
    void refetchProbeTasks();
    void refetchLatestTask();
    void refetchSnapshots();
  }, [refetchProbeTasks, refetchLatestTask, refetchSnapshots]);

  useEffect(() => {
    setPage(1);
    setSnapshotFilters({});
    form.resetFields();
  }, [selectedFarmId, snapshotTaskIdsParam]);

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
          <KpiCards data={kpiSummary} loading={isLatestTaskLoading || isLatestTaskFetching} />
        </div>
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
