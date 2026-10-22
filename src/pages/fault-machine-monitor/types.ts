import type { FaultCode } from "./constants";

export type FaultTimeRange = "7d" | "30d";

/** 运维大盘时间筛选 */
export type FaultStatsTimeMode = "24h" | "customDate";

export type AbnormalLogStatsWindow = "24h" | "date";

export type AnomalyManagementStatus = "pending" | "monitoring" | "resolved" | "fixed";

export interface AnomalyManagementRecord {
  id: string;
  time: string;
  reason: string;
  operator: string;
  devicesAffected: number;
  abnormalCount?: number;
  status: AnomalyManagementStatus;
}

export interface AnomalyManagementHistoryData {
  list: AnomalyManagementRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AbnormalDataDetail {
  id: number;
  siteName: string;
  date: string;
  reason: string;
  scanMachineCount: number;
  onShelfCount: number;
  affectedMachineCount: number;
  abnormalCount: number;
  status: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnomalyManagementRecordDTO {
  id: number | string;
  siteName: string;
  date: string;
  reason: string;
  affectedMachineCount: number;
  abnormalCount: number;
  status: AnomalyManagementStatus;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface AbnormalLogSiteSummaryItem {
  siteCode: string;
  siteName: string;
  count: number;
  onShelfCount: number;
  siteOnShelfRatio: number;
}

export interface AbnormalLogsSiteSummaryData {
  date?: string;
  window: AbnormalLogStatsWindow;
  startTime: string;
  endTime: string;
  totalCount: number;
  list: AbnormalLogSiteSummaryItem[];
}

export interface AbnormalLogTypeStatItem {
  code: string;
  count: number;
}

export interface AbnormalLogHourCodeStat {
  code: string;
  count: number;
}

export interface AbnormalLogHourStat {
  hour: string;
  count: number;
  codeStats: AbnormalLogHourCodeStat[];
}

export interface AbnormalLogsSiteDetailData {
  siteCode: string;
  siteName: string;
  date?: string;
  window: AbnormalLogStatsWindow;
  startTime: string;
  endTime: string;
  total: number;
  typeStats: AbnormalLogTypeStatItem[];
  hours: AbnormalLogHourStat[];
}

export interface AbnormalLogRecord {
  id: number;
  siteId: string;
  siteName: string;
  agentCode: string;
  ip: string;
  mac: string;
  controlBoardSN: string;
  code: FaultCode;
  explanation: string;
  logTime: string;
  collectTime: string;
  createdAt: string;
}

export interface FaultTrendSeries {
  siteId: string;
  siteName: string;
  color: string;
  points: number[];
}

export interface FaultTrendChartData {
  labels: string[];
  series: FaultTrendSeries[];
  lastUpdated: string;
}

export interface AbnormalLogsTrendSeriesItem {
  siteCode: string;
  siteName: string;
  points: number[];
}

export interface AbnormalLogsTrendData {
  window: FaultTimeRange;
  startDate: string;
  endDate: string;
  code: string;
  labels: string[];
  series: AbnormalLogsTrendSeriesItem[];
}

export interface AbnormalLogFilters {
  code?: FaultCode;
  siteCode?: string;
  ip?: string;
  mac?: string;
  controlBoardSN?: string;
  logTimeFrom?: string;
  logTimeTo?: string;
}

export interface AbnormalLogListItem {
  id: number;
  siteCode: string;
  siteName: string;
  agentCode: string;
  ip: string;
  mac: string;
  controlBoardSN: string;
  code: string;
  explanation: string;
  logTime?: string | null;
  collectTime: string;
  createdAt: string;
}

export interface AbnormalLogListData {
  list: AbnormalLogListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AbnormalLogQueryParams {
  page: number;
  pageSize: number;
  siteCode?: string;
  code?: string;
  ip?: string;
  mac?: string;
  controlBoardSN?: string;
  logTimeFrom?: string;
  logTimeTo?: string;
}
