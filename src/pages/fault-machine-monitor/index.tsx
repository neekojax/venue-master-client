import { useCallback, useMemo, useState } from "react";
import { Form } from "antd";
import AbnormalLogPanel, { type AbnormalLogSearchValues } from "./components/AbnormalLogPanel";
import FaultTrendChart from "./components/FaultTrendChart";
import { buildAbnormalLogQueryParams } from "./api";
import { useAbnormalLogs, useAbnormalLogsTrend } from "./hook";
import type { AbnormalLogFilters, AbnormalLogsTrendData, FaultTimeRange } from "./types";
import { mapAbnormalLogListToRecords, mapAbnormalLogsTrendToChartData } from "./utils";
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
  const [timeRange, setTimeRange] = useState<FaultTimeRange>("7d");
  const [chartCodeFilter, setChartCodeFilter] = useState<string | undefined>();
  const [tableFilters, setTableFilters] = useState<AbnormalLogFilters>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { data: boundSitesRes } = useBoundSites();

  const {
    data: trendRes,
    isLoading: isTrendLoading,
    isFetching: isTrendFetching,
    refetch: refetchTrend,
  } = useAbnormalLogsTrend(timeRange, chartCodeFilter);

  const listQueryParams = useMemo(
    () => buildAbnormalLogQueryParams(tableFilters, page, pageSize),
    [tableFilters, page, pageSize],
  );

  const {
    data: logsRes,
    isLoading: isLogsLoading,
    isFetching: isLogsFetching,
    refetch: refetchLogs,
  } = useAbnormalLogs(listQueryParams);

  const trendChartData = useMemo(
    () => mapAbnormalLogsTrendToChartData(trendRes?.data as AbnormalLogsTrendData | undefined),
    [trendRes],
  );

  const boundSiteOptions = useMemo(() => {
    const list: BoundSiteItem[] = boundSitesRes?.data?.list ?? [];
    return list.map((item) => ({
      id: item.site_code,
      name: item.site_name || item.site_code,
    }));
  }, [boundSitesRes]);

  const siteOptions = useMemo(() => {
    const trendOptions = trendChartData.series.map((item) => ({
      id: item.siteId,
      name: item.siteName,
    }));
    if (trendOptions.length > 0) return trendOptions;
    return boundSiteOptions;
  }, [trendChartData.series, boundSiteOptions]);

  const logList = useMemo(() => mapAbnormalLogListToRecords(logsRes?.data?.list), [logsRes]);

  const logTotal = logsRes?.data?.total ?? 0;

  const handleTrendRefresh = useCallback(() => {
    void refetchTrend();
  }, [refetchTrend]);

  const handleTableRefresh = useCallback(() => {
    void refetchLogs();
  }, [refetchLogs]);

  const onSearch = (values: AbnormalLogSearchValues) => {
    setTableFilters(searchValuesToFilters(values));
    setPage(1);
  };

  const onReset = () => {
    form.resetFields();
    setTableFilters({});
    setPage(1);
  };

  return (
    <div className="min-h-full bg-[#f5f5f5] -m-4 p-4 flex flex-col gap-4">
      <FaultTrendChart
        data={trendChartData}
        timeRange={timeRange}
        chartCodeFilter={chartCodeFilter}
        loading={isTrendLoading || isTrendFetching}
        onTimeRangeChange={setTimeRange}
        onChartCodeFilterChange={setChartCodeFilter}
        onRefresh={handleTrendRefresh}
      />

      <AbnormalLogPanel
        form={form}
        siteOptions={siteOptions}
        exportFilters={tableFilters}
        logs={logList}
        total={logTotal}
        page={page}
        pageSize={pageSize}
        loading={isLogsLoading || isLogsFetching}
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
