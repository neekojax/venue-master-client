import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import {
  buildStatsApiParams,
  createAnomalyManagementReport,
  deleteAnomalyManagementRecord,
  fetchAbnormalDataDetail,
  fetchAbnormalLogs,
  fetchAbnormalLogsSiteDetail,
  fetchAbnormalLogsSiteSummary,
  fetchAbnormalLogsTrend,
  fetchAnomalyManagementHistory,
  updateAnomalyManagement,
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

export const useAnomalyManagementHistory = (
  siteName: string | undefined,
  date: string,
  page: number,
  pageSize: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["anomaly-management-history", siteName ?? "", date, page, pageSize],
    queryFn: () => fetchAnomalyManagementHistory({ siteName: siteName!, date, page, pageSize }),
    enabled: enabled && Boolean(siteName),
  });
};

export const useAbnormalDataDetail = (siteName: string | undefined, date: string, enabled = true) => {
  return useQuery({
    queryKey: ["abnormal-data-detail", siteName ?? "", date],
    queryFn: () => fetchAbnormalDataDetail({ siteName: siteName!, date }),
    enabled: enabled && Boolean(siteName),
  });
};

export const useCreateAnomalyManagementReport = () => {
  return useMutation({
    mutationFn: createAnomalyManagementReport,
  });
};

export const useUpdateAnomalyManagement = () => {
  return useMutation({
    mutationFn: updateAnomalyManagement,
  });
};

export const useDeleteAnomalyManagementRecord = () => {
  return useMutation({
    mutationFn: deleteAnomalyManagementRecord,
  });
};
