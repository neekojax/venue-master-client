import axiosInstance from "@/helper/axiosInstance";
import { t } from "@/locales";

interface DailyComparison {
  statDate: string;
  compareStatus: string | null;
  minerDailyAvgThs: number | null;
  antpoolDailyAvgThs: number | null;
  hashrateDiffThs: number | null;
  hashrateDiffPct: number | null;
  minerTaskHours: number | null;
  minerSampleHours: number | null;
  antpoolSampleHours: number | null;
  comparedAt: string | null;
}

export interface MachineComparison {
  agentId: number | null;
  agentCode: string;
  ipAddress: string;
  macAddress: string | null;
  model: string | null;
  lastCollectTime: string;
  reachable: boolean;
  status: string;
  hashrate: number | null;
  comparison: DailyComparison | null;
}

interface ComparisonPage {
  comparisonStatDate: string;
  comparisonDue: boolean;
  total: number;
  list: MachineComparison[];
}

export const comparisonSorts = {
  latest: { sortBy: "lastCollectTime", sortOrder: "desc" },
  negative: { sortBy: "hashrateDiffPct", sortOrder: "asc" },
  positive: { sortBy: "hashrateDiffPct", sortOrder: "desc" },
  absolute: { sortBy: "absHashrateDiffPct", sortOrder: "desc" },
} as const;

export type ComparisonSort = keyof typeof comparisonSorts;

export interface ComparisonFilters {
  ip: string;
  collectedDates: [string, string] | null;
  sort: ComparisonSort;
  minAbsDiffPct: number | null;
}

function comparisonPath(organization: string, siteCode: string) {
  return `minerHashrate/siteMachineComparisons/${encodeURIComponent(organization)}/${encodeURIComponent(siteCode)}`;
}

function comparisonParams(filters: ComparisonFilters) {
  // 留空表示全部，显式填写 0 会让后端排除没有差异率的记录。
  return {
    ...comparisonSorts[filters.sort],
    minAbsDiffPct: filters.minAbsDiffPct ?? undefined,
    ip: filters.ip || undefined,
    collectStartDate: filters.collectedDates?.[0],
    collectEndDate: filters.collectedDates?.[1],
  };
}

export async function fetchMachineComparisons(
  organization: string,
  siteCode: string,
  page: number,
  pageSize: number,
  filters: ComparisonFilters,
  signal: AbortSignal,
) {
  const response = await axiosInstance.get<
    unknown,
    { success: boolean; message?: string; data?: ComparisonPage }
  >(comparisonPath(organization, siteCode), {
    params: { ...comparisonParams(filters), page, pageSize },
    signal,
  });
  if (!response.success) throw new Error(response.message || t("获取算力核对数据失败"));
  if (!response.data?.comparisonStatDate || !Array.isArray(response.data.list))
    throw new Error(t("算力核对数据格式不正确"));
  return response.data;
}

export function downloadComparisonCsv(
  organization: string,
  siteCode: string,
  statDate: string,
  filters: ComparisonFilters,
) {
  return downloadCsv(`${comparisonPath(organization, siteCode)}/export`, {
    ...comparisonParams(filters),
    statDate,
  });
}

async function downloadCsv(path: string, params: Record<string, string | number | undefined>) {
  const { data } = await axiosInstance.get<Blob>(path, { params, responseType: "blob" });
  if (data.type.includes("json")) {
    const body = JSON.parse(await data.text()) as { message?: string };
    throw new Error(body.message || t("下载失败，请稍后重试"));
  }
  if (!data.type.startsWith("text/csv")) throw new Error(t("下载失败，请稍后重试"));
  return data;
}

export interface HourlySample {
  collectedAt: string;
  ths: number;
}

export interface MachineHour {
  hour: string;
  miner: HourlySample | null;
  antpool: HourlySample | null;
  antpoolIssue?: "no_source" | "ambiguous_source" | "ambiguous_ip";
}

interface MachineHistory {
  asOf: string;
  antpoolStatus: "ok" | "disabled" | "unavailable" | "ambiguous_binding";
  hours: MachineHour[];
}

function hourlyHistoryPath(organization: string, siteCode: string) {
  return `minerHashrate/machineHourlyHistory/${encodeURIComponent(organization)}/${encodeURIComponent(siteCode)}`;
}

export function downloadMachineHourlyCsv(
  organization: string,
  siteCode: string,
  agentCode: string,
  ip: string,
  asOf: string,
) {
  return downloadCsv(`${hourlyHistoryPath(organization, siteCode)}/export`, { agentCode, ip, asOf });
}

export async function fetchMachineHourlyHistory(
  organization: string,
  siteCode: string,
  agentCode: string,
  ip: string,
  signal: AbortSignal,
) {
  const response = await axiosInstance.get<
    unknown,
    { success: boolean; message?: string; data?: MachineHistory }
  >(hourlyHistoryPath(organization, siteCode), { params: { agentCode, ip }, signal });
  if (!response.success || !Array.isArray(response.data?.hours)) {
    throw new Error(response.message || t("获取小时算力失败"));
  }
  return response.data;
}
