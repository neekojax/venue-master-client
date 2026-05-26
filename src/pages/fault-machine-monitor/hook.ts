import { useQuery } from "@tanstack/react-query";
import {
  buildStatsApiParams,
  fetchAbnormalLogs,
  fetchAbnormalLogsSiteDetail,
  fetchAbnormalLogsSiteSummary,
  fetchAbnormalLogsTrend,
} from "./api";
import type { AbnormalLogQueryParams, FaultStatsTimeMode, FaultTimeRange } from "./types";

export const useAbnormalLogsTrend = (window: FaultTimeRange, code?: string) => {
  return useQuery({
    queryKey: ["abnormal-logs-trend", window, code ?? ""],
    queryFn: () => fetchAbnormalLogsTrend({ window, code }),
  });
};

export const useAbnormalLogs = (params: AbnormalLogQueryParams, enabled = true) => {
  return useQuery({
    queryKey: ["abnormal-logs", params],
    queryFn: () => fetchAbnormalLogs(params),
    enabled,
  });
};

export const useAbnormalLogsSiteSummary = (
  timeMode: FaultStatsTimeMode,
  selectedDate: string,
  enabled = true,
) => {
  const params = buildStatsApiParams(timeMode, selectedDate);
  return useQuery({
    queryKey: ["abnormal-logs-site-summary", timeMode, selectedDate],
    queryFn: () => fetchAbnormalLogsSiteSummary(params),
    enabled,
  });
};

export const useAbnormalLogsSiteDetail = (
  siteCode: string | undefined,
  timeMode: FaultStatsTimeMode,
  selectedDate: string,
  enabled = true,
) => {
  const params = buildStatsApiParams(timeMode, selectedDate);
  return useQuery({
    queryKey: ["abnormal-logs-site-detail", siteCode ?? "", timeMode, selectedDate],
    queryFn: () => fetchAbnormalLogsSiteDetail(siteCode!, params),
    enabled: enabled && Boolean(siteCode),
  });
};
