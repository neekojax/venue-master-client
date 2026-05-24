import type { FaultCode } from "./constants";

export type FaultTimeRange = "7d" | "30d";

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
