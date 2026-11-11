import type { MinerSnapshotSearchValues } from "./components/MinerSnapshotPanel";
import type { TaskSnapshotQueryParams, TimeRange } from "./types";

// 仅保留当前浏览器会话中的数据；硬刷新页面后仍按首次进入处理。
export const FARM_MONITOR_CACHE_OPTIONS = { gcTime: 30 * 60 * 1000 };

export interface FarmMonitorQueryOptions {
  gcTime?: number;
  staleTime?: number;
  refetchOnMount?: boolean | "always";
}

export const FARM_MONITOR_RESTORE_OPTIONS = {
  ...FARM_MONITOR_CACHE_OPTIONS,
  staleTime: Infinity,
  refetchOnMount: false,
} satisfies FarmMonitorQueryOptions;

export interface FarmMonitorViewState {
  locationKey: string;
  siteCode: string | null;
  timeRange: TimeRange;
  snapshotFilters: TaskSnapshotQueryParams;
  formValues: MinerSnapshotSearchValues;
  page: number;
  pageSize: number;
  filterExpanded: boolean;
  scrollY: number;
}

export interface FarmMonitorReturnState {
  farmMonitorReturn?: { venueType: string; siteCode: string };
}

export function farmMonitorViewKey(userId: string, venueType: string) {
  return ["farm-monitor-view", userId, venueType] as const;
}
