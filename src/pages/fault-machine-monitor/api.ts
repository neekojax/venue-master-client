import type { AbnormalLogFilters, AbnormalLogQueryParams, FaultTimeRange } from "./types";

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
