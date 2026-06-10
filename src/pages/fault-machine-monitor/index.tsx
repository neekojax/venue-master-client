import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Form } from "antd";
import dayjs from "dayjs";
import AbnormalLogPanel, { type AbnormalLogSearchValues } from "./components/AbnormalLogPanel";
import FaultStatsPanel from "./components/FaultStatsPanel";
import { buildAbnormalLogQueryParams } from "./api";
import { useAbnormalLogs, useAbnormalLogsSiteDetail, useAbnormalLogsSiteSummary } from "./hook";
import {
  buildMockSiteDetail,
  buildMockSiteSummary,
  filterMockAbnormalLogs,
  MOCK_ABNORMAL_LOGS,
  USE_FAULT_MONITOR_MOCK,
} from "./mockData";
import { paginateLogs } from "./statsUtils";
import type {
  AbnormalLogFilters,
  AbnormalLogsSiteDetailData,
  AbnormalLogsSiteSummaryData,
  FaultStatsTimeMode,
} from "./types";
import {
  mapAbnormalLogListToRecords,
  mapSiteDetailToCodeDistribution,
  mapSiteDetailToFrequencyPoints,
  mapSiteSummaryToDistribution,
} from "./utils";
import useAuthRedirect from "@/hooks/useAuthRedirect";

import { useBoundSites } from "@/pages/farm-monitor/hook";
import type { BoundSiteItem } from "@/pages/farm-monitor/types";

function searchValuesToFilters(values: AbnormalLogSearchValues): AbnormalLogFilters {
  const range = values.logTimeRange;
  return {
    code: values.code,
    siteCode: values.siteCode || undefined,
    ip: values.ip?.trim() || undefined,
    mac: values.mac?.trim() || undefined,
    controlBoardSN: values.controlBoardSN?.trim() || undefined,
    logTimeFrom: range?.[0]?.format("YYYY-MM-DD HH:mm:ss"),
    logTimeTo: range?.[1]?.format("YYYY-MM-DD HH:mm:ss"),
  };
}

export default function FaultMachineMonitorPage() {
  useAuthRedirect();

  const [form] = Form.useForm<AbnormalLogSearchValues>();
  const [statsTimeMode, setStatsTimeMode] = useState<FaultStatsTimeMode>("24h");
  const [statsSelectedDate, setStatsSelectedDate] = useState(() => dayjs().format("YYYY-MM-DD"));
  const [selectedStatsSiteCode, setSelectedStatsSiteCode] = useState<string>();
  const [selectedStatsSiteName, setSelectedStatsSiteName] = useState<string>();
  const [tableFilters, setTableFilters] = useState<AbnormalLogFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [mockRefreshTick, setMockRefreshTick] = useState(0);

  const useMock = USE_FAULT_MONITOR_MOCK;

  const { data: boundSitesRes } = useBoundSites();

  const {
    data: summaryRes,
    isLoading: isSummaryLoading,
    isError: isSummaryError,
    error: summaryError,
    refetch: refetchSummary,
  } = useAbnormalLogsSiteSummary(statsTimeMode, statsSelectedDate, !useMock);

  const {
    data: detailRes,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
    refetch: refetchDetail,
  } = useAbnormalLogsSiteDetail(selectedStatsSiteCode, statsTimeMode, statsSelectedDate, !useMock);

  const listQueryParams = useMemo(
    () => buildAbnormalLogQueryParams(tableFilters, page, pageSize),
    [tableFilters, page, pageSize],
  );

  const {
    data: logsRes,
    isLoading: isLogsLoading,
    isError: isLogsError,
    error: logsError,
    refetch: refetchLogs,
  } = useAbnormalLogs(listQueryParams, !useMock);

  const siteSummaryData = useMemo((): AbnormalLogsSiteSummaryData | undefined => {
    void mockRefreshTick;
    if (useMock) return buildMockSiteSummary(statsTimeMode, statsSelectedDate);
    return summaryRes?.data as AbnormalLogsSiteSummaryData | undefined;
  }, [useMock, statsTimeMode, statsSelectedDate, summaryRes, mockRefreshTick]);

  const siteDetailData = useMemo((): AbnormalLogsSiteDetailData | undefined => {
    void mockRefreshTick;
    if (!selectedStatsSiteCode) return undefined;
    if (useMock) return buildMockSiteDetail(selectedStatsSiteCode, statsTimeMode, statsSelectedDate);
    return detailRes?.data as AbnormalLogsSiteDetailData | undefined;
  }, [useMock, selectedStatsSiteCode, statsTimeMode, statsSelectedDate, detailRes, mockRefreshTick]);

  const siteDistribution = useMemo(() => mapSiteSummaryToDistribution(siteSummaryData), [siteSummaryData]);

  const frequencyPoints = useMemo(
    () => mapSiteDetailToFrequencyPoints(siteDetailData, statsTimeMode),
    [siteDetailData, statsTimeMode],
  );

  const codeDistribution = useMemo(() => mapSiteDetailToCodeDistribution(siteDetailData), [siteDetailData]);

  const selectedSiteCount = useMemo(() => {
    if (siteDetailData?.total != null) return Number(siteDetailData.total) || 0;
    const matched = siteDistribution.find((item) => item.siteCode === selectedStatsSiteCode);
    return matched?.count ?? 0;
  }, [siteDetailData, siteDistribution, selectedStatsSiteCode]);

  const mockTableLogs = useMemo(() => {
    void mockRefreshTick;
    return filterMockAbnormalLogs(MOCK_ABNORMAL_LOGS, tableFilters);
  }, [tableFilters, mockRefreshTick]);

  const apiLogList = useMemo(() => mapAbnormalLogListToRecords(logsRes?.data?.list), [logsRes]);

  const logList = useMock ? paginateLogs(mockTableLogs, page, pageSize) : apiLogList;
  const logTotal = useMock
    ? mockTableLogs.length
    : typeof logsRes?.data?.total === "number"
      ? logsRes.data.total
      : apiLogList.length;

  useEffect(() => {
    if (siteDistribution.length === 0) {
      setSelectedStatsSiteCode(undefined);
      setSelectedStatsSiteName(undefined);
      return;
    }
    const stillExists = selectedStatsSiteCode
      ? siteDistribution.some((s) => s.siteCode === selectedStatsSiteCode)
      : false;
    if (!stillExists) {
      const first = siteDistribution[0];
      setSelectedStatsSiteCode(first.siteCode);
      setSelectedStatsSiteName(first.siteName);
    }
  }, [siteDistribution, selectedStatsSiteCode]);

  useEffect(() => {
    if (siteDetailData?.siteName) {
      setSelectedStatsSiteName(siteDetailData.siteName);
    }
  }, [siteDetailData?.siteName, siteDetailData?.siteCode]);

  const boundSiteOptions = useMemo(() => {
    const list: BoundSiteItem[] = boundSitesRes?.data?.list ?? [];
    return list.map((item) => ({
      id: item.site_code,
      name: item.site_name || item.site_code,
    }));
  }, [boundSitesRes]);

  /** 表格筛选用绑定场地列表，与运维大盘选中场地无关 */
  const tableSiteOptions = boundSiteOptions;

  const handleStatsRefresh = useCallback(() => {
    if (useMock) {
      setMockRefreshTick((t) => t + 1);
      return;
    }
    void refetchSummary();
    void refetchDetail();
  }, [useMock, refetchSummary, refetchDetail]);

  const handleTableRefresh = useCallback(() => {
    if (useMock) {
      setMockRefreshTick((t) => t + 1);
      return;
    }
    void refetchLogs();
  }, [useMock, refetchLogs]);

  const handleStatsSiteSelect = useCallback((siteCode: string, siteName: string) => {
    setSelectedStatsSiteCode(siteCode);
    setSelectedStatsSiteName(siteName);
  }, []);

  const onSearch = (values: AbnormalLogSearchValues) => {
    setTableFilters(searchValuesToFilters(values));
    setPage(1);
    form.setFieldsValue(values);
  };

  const onReset = () => {
    form.resetFields();
    setTableFilters({});
    setPage(1);
  };

  const statsTimeLabel = statsTimeMode === "24h" ? "24小时内" : statsSelectedDate;
  const statsLoading = useMock
    ? false
    : isSummaryLoading || (Boolean(selectedStatsSiteCode) && isDetailLoading);

  const statsErrorMessage = useMemo(() => {
    if (useMock) return "";
    if (isSummaryError) return (summaryError as Error)?.message || "场地汇总加载失败";
    if (selectedStatsSiteCode && isDetailError) {
      return (detailError as Error)?.message || "场地明细加载失败";
    }
    return "";
  }, [useMock, isSummaryError, summaryError, selectedStatsSiteCode, isDetailError, detailError]);

  const logsErrorMessage = useMemo(() => {
    if (useMock || !isLogsError) return "";
    return (logsError as Error)?.message || "故障日志列表加载失败";
  }, [useMock, isLogsError, logsError]);

  return (
    <div className="min-h-full bg-[#f5f5f5] -m-4 p-4 flex flex-col gap-4">
      {statsErrorMessage ? (
        <Alert
          type="error"
          showIcon
          message={statsErrorMessage}
          action={
            <button type="button" className="text-[#1677ff]" onClick={() => void handleStatsRefresh()}>
              重试
            </button>
          }
        />
      ) : null}
      <FaultStatsPanel
        timeMode={statsTimeMode}
        selectedDate={statsSelectedDate}
        timeLabel={statsTimeLabel}
        loading={statsLoading}
        siteDistribution={siteDistribution}
        frequencyPoints={frequencyPoints}
        codeDistribution={codeDistribution}
        selectedSiteCode={selectedStatsSiteCode}
        selectedSiteName={selectedStatsSiteName}
        selectedSiteCount={selectedSiteCount}
        onTimeModeChange={setStatsTimeMode}
        onSelectedDateChange={setStatsSelectedDate}
        onSiteSelect={handleStatsSiteSelect}
        onRefresh={handleStatsRefresh}
      />

      {logsErrorMessage ? (
        <Alert
          type="error"
          showIcon
          message={logsErrorMessage}
          action={
            <button type="button" className="text-[#1677ff]" onClick={() => void handleTableRefresh()}>
              重试
            </button>
          }
        />
      ) : null}

      <AbnormalLogPanel
        form={form}
        siteOptions={tableSiteOptions}
        exportFilters={tableFilters}
        logs={logList}
        total={logTotal}
        page={page}
        pageSize={pageSize}
        loading={useMock ? false : isLogsLoading && !isLogsError}
        onSearch={onSearch}
        onReset={onReset}
        onRefresh={handleTableRefresh}
        onPageChange={(p, ps) => {
          setPage(p);
          setPageSize(ps || 20);
        }}
      />
    </div>
  );
}
