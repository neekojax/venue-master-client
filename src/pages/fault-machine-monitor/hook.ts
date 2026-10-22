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

export const useAbnormalLogsTrend = (venueType: string, window: FaultTimeRange, code?: string) => {
  return useQuery({
    queryKey: ["abnormal-logs-trend", venueType, window, code ?? ""],
    queryFn: () => fetchAbnormalLogsTrend({ venueType, window, code }),
    enabled: Boolean(venueType),
  });
};

export const useAbnormalLogs = (venueType: string, params: AbnormalLogQueryParams, enabled = true) => {
  return useQuery({
    queryKey: ["abnormal-logs", venueType, params],
    queryFn: () => fetchAbnormalLogs(venueType, params),
    enabled,
  });
};

export const useAbnormalLogsSiteSummary = (
  venueType: string,
  timeMode: FaultStatsTimeMode,
  selectedDate: string,
  enabled = true,
) => {
  const params = buildStatsApiParams(timeMode, selectedDate);
  return useQuery({
    queryKey: ["abnormal-logs-site-summary", venueType, timeMode, selectedDate],
    queryFn: () => fetchAbnormalLogsSiteSummary(venueType, params),
    enabled,
  });
};

export const useAbnormalLogsSiteDetail = (
  venueType: string,
  siteCode: string | undefined,
  timeMode: FaultStatsTimeMode,
  selectedDate: string,
  enabled = true,
) => {
  const params = buildStatsApiParams(timeMode, selectedDate);
  return useQuery({
    queryKey: ["abnormal-logs-site-detail", venueType, siteCode ?? "", timeMode, selectedDate],
    queryFn: () => fetchAbnormalLogsSiteDetail(venueType, siteCode!, params),
    enabled: enabled && Boolean(venueType) && Boolean(siteCode),
  });
};

export const useAnomalyManagementHistory = (
  venueType: string,
  siteName: string | undefined,
  date: string,
  page: number,
  pageSize: number,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["anomaly-management-history", venueType, siteName ?? "", date, page, pageSize],
    queryFn: () => fetchAnomalyManagementHistory(venueType, { siteName: siteName!, date, page, pageSize }),
    enabled: enabled && Boolean(venueType) && Boolean(siteName),
  });
};

export const useAbnormalDataDetail = (
  venueType: string,
  siteName: string | undefined,
  date: string,
  enabled = true,
) => {
  return useQuery({
    queryKey: ["abnormal-data-detail", venueType, siteName ?? "", date],
    queryFn: () => fetchAbnormalDataDetail(venueType, { siteName: siteName!, date }),
    enabled: enabled && Boolean(venueType) && Boolean(siteName),
  });
};

export const useCreateAnomalyManagementReport = (venueType: string) => {
  return useMutation({
    mutationFn: (params: Parameters<typeof createAnomalyManagementReport>[1]) =>
      createAnomalyManagementReport(venueType, params),
  });
};

export const useUpdateAnomalyManagement = (venueType: string) => {
  return useMutation({
    mutationFn: (params: Parameters<typeof updateAnomalyManagement>[1]) =>
      updateAnomalyManagement(venueType, params),
  });
};

export const useDeleteAnomalyManagementRecord = (venueType: string) => {
  return useMutation({
    mutationFn: (id: string) => deleteAnomalyManagementRecord(venueType, id),
  });
};
