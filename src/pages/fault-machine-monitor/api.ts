import type { AbnormalLogFilters, AbnormalLogQueryParams, FaultStatsTimeMode, FaultTimeRange } from "./types";

import { fetchGet } from "@/helper/fetchHelper";

export interface FetchAbnormalLogsTrendParams {
  window: FaultTimeRange;
  code?: string;
}

export const fetchAbnormalLogsTrend = async (params: FetchAbnormalLogsTrendParams) => {
  return fetchGet("minerHashrate/abnormalLogs/trend", {
    window: params.window,
    ...(params.code ? { code: params.code } : {}),
  });
};

export function buildAbnormalLogFilterParams(filters: AbnormalLogFilters) {
  return {
    ...(filters.siteCode ? { siteCode: filters.siteCode } : {}),
    ...(filters.code ? { code: filters.code } : {}),
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

export const fetchAbnormalLogs = async (params: AbnormalLogQueryParams) => {
  return fetchGet("minerHashrate/abnormalLogs", params);
};

export const fetchAbnormalLogsExport = async (filters: AbnormalLogFilters) => {
  return fetchGet("minerHashrate/abnormalLogs/export", buildAbnormalLogFilterParams(filters), {
    responseType: "blob",
  });
};

export function buildStatsApiParams(timeMode: FaultStatsTimeMode, selectedDate: string) {
  return timeMode === "customDate" ? { date: selectedDate } : {};
}

export const fetchAbnormalLogsSiteSummary = async (params: { date?: string } = {}) => {
  return fetchGet("minerHashrate/abnormalLogs/siteSummary", params);
};

export const fetchAbnormalLogsSiteDetail = async (siteCode: string, params: { date?: string } = {}) => {
  return fetchGet(`minerHashrate/abnormalLogs/siteDetail/${encodeURIComponent(siteCode)}`, params);
};
