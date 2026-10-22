import type { AbnormalLogFilters, AbnormalLogQueryParams, FaultStatsTimeMode, FaultTimeRange } from "./types";

import { fetchDelete, fetchGet, fetchPost, fetchPut } from "@/helper/fetchHelper";

export interface FetchAbnormalLogsTrendParams {
  venueType: string;
  window: FaultTimeRange;
  code?: string;
}

export const fetchAbnormalLogsTrend = async (params: FetchAbnormalLogsTrendParams) => {
  return fetchGet(`minerHashrate/abnormalLogs/${params.venueType}/trend`, {
    window: params.window,
    ...(params.code ? { code: params.code } : {}),
  });
};

export function buildAbnormalLogFilterParams(filters: AbnormalLogFilters) {
  return {
    ...(filters.siteCode ? { siteCode: filters.siteCode } : {}),
    ...(filters.code?.trim() ? { code: filters.code.trim() } : {}),
    ...(filters.ip ? { ip: filters.ip } : {}),
    ...(filters.mac ? { mac: filters.mac } : {}),
    ...(filters.controlBoardSN ? { controlBoardSN: filters.controlBoardSN } : {}),
    ...(filters.logTimeFrom ? { logTimeFrom: filters.logTimeFrom } : {}),
    ...(filters.logTimeTo ? { logTimeTo: filters.logTimeTo } : {}),
  };
}

export function buildAbnormalLogQueryParams(
  filters: AbnormalLogFilters,
  page: number,
  pageSize: number,
): AbnormalLogQueryParams {
  return {
    page,
    pageSize,
    ...buildAbnormalLogFilterParams(filters),
  };
}

export const fetchAbnormalLogs = async (venueType: string, params: AbnormalLogQueryParams) => {
  return fetchGet(`minerHashrate/abnormalLogs/${venueType}`, params);
};

export const fetchAbnormalLogsExport = async (venueType: string, filters: AbnormalLogFilters) => {
  return fetchGet(`minerHashrate/abnormalLogs/${venueType}/export`, buildAbnormalLogFilterParams(filters), {
    responseType: "blob",
  });
};

export function buildStatsApiParams(timeMode: FaultStatsTimeMode, selectedDate: string) {
  return timeMode === "customDate" ? { date: selectedDate } : {};
}

export const fetchAbnormalLogsSiteSummary = async (venueType: string, params: { date?: string } = {}) => {
  return fetchGet(`minerHashrate/abnormalLogs/${venueType}/siteSummary`, params);
};

export const fetchAbnormalLogsSiteDetail = async (
  venueType: string,
  siteCode: string,
  params: { date?: string } = {},
) => {
  return fetchGet(
    `minerHashrate/abnormalLogs/${venueType}/siteDetail/${encodeURIComponent(siteCode)}`,
    params,
  );
};

export interface AnomalyManagementHistoryParams {
  siteName: string;
  date?: string;
  page: number;
  pageSize: number;
}

export interface CreateAnomalyManagementReportParams {
  siteName: string;
  logDate: string;
  reason: string;
  abnormalCount: number;
  owner: string;
  status: string;
}

export interface UpdateAnomalyManagementParams {
  id: string;
  status?: string;
  reason?: string;
  abnormalCount?: number;
}

export interface AbnormalDataDetailParams {
  siteName: string;
  date: string;
}

export const fetchAbnormalDataDetail = async (venueType: string, params: AbnormalDataDetailParams) => {
  return fetchGet(`minerHashrate/abnormalData/${venueType}`, params);
};

export const fetchAnomalyManagementHistory = async (
  venueType: string,
  params: AnomalyManagementHistoryParams,
) => {
  return fetchGet(`minerHashrate/anomalyManagement/${venueType}/history`, params);
};

export const createAnomalyManagementReport = async (
  venueType: string,
  params: CreateAnomalyManagementReportParams,
) => {
  return fetchPost(`minerHashrate/anomalyManagement/${venueType}/report`, params);
};

export const updateAnomalyManagement = async (venueType: string, params: UpdateAnomalyManagementParams) => {
  return fetchPut(`minerHashrate/anomalyManagement/${venueType}`, params);
};

export const deleteAnomalyManagementRecord = async (venueType: string, id: string) => {
  return fetchDelete(`minerHashrate/anomalyManagement/${venueType}/${encodeURIComponent(id)}`);
};
