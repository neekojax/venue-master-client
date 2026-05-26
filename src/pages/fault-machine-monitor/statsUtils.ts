import dayjs from "dayjs";
import { FAULT_CODE_COLOR, type FaultCode, SITE_LINE_COLORS } from "./constants";
import type { AbnormalLogFilters, AbnormalLogListItem, AbnormalLogRecord, FaultStatsTimeMode } from "./types";

export interface SiteDistributionItem {
  siteCode: string;
  siteName: string;
  count: number;
  /** 占全部异常条数的比例，用于排序辅助 */
  percentage: number;
  onShelfCount: number;
  /** 异常条数占本场地理论在架数的百分比 */
  siteOnShelfRatio: number;
}

export interface FrequencyPoint {
  label: string;
  count: number;
}

export interface CodeDistributionItem {
  code: string;
  count: number;
  percentage: number;
  color: string;
}

export interface StatsLogRow {
  siteCode: string;
  siteName: string;
  code: string;
  logTime: string;
}

export function toStatsLogRow(record: AbnormalLogRecord | AbnormalLogListItem): StatsLogRow {
  if ("siteId" in record) {
    return {
      siteCode: record.siteId,
      siteName: record.siteName,
      code: record.code,
      logTime: record.logTime,
    };
  }
  return {
    siteCode: record.siteCode,
    siteName: record.siteName,
    code: record.code,
    logTime: record.logTime ?? "",
  };
}

export function buildStatsLogFilters(
  timeMode: FaultStatsTimeMode,
  selectedDate: string,
  siteCode?: string,
): AbnormalLogFilters {
  if (timeMode === "24h") {
    return {
      siteCode,
      logTimeFrom: dayjs().subtract(24, "hour").format("YYYY-MM-DD HH:mm:ss"),
      logTimeTo: dayjs().format("YYYY-MM-DD HH:mm:ss"),
    };
  }
  const day = dayjs(selectedDate).startOf("day");
  return {
    siteCode,
    logTimeFrom: day.format("YYYY-MM-DD HH:mm:ss"),
    logTimeTo: day.endOf("day").format("YYYY-MM-DD HH:mm:ss"),
  };
}

function roundPercent(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return Math.round((numerator * 10000) / denominator) / 100;
}

export function buildSiteDistributionFromLogs(logs: StatsLogRow[]): SiteDistributionItem[] {
  const counts = new Map<string, { siteName: string; count: number }>();
  for (const log of logs) {
    const prev = counts.get(log.siteCode);
    if (prev) {
      prev.count += 1;
    } else {
      counts.set(log.siteCode, { siteName: log.siteName, count: 1 });
    }
  }

  const items = Array.from(counts.entries()).map(([siteCode, { siteName, count }]) => ({
    siteCode,
    siteName,
    count,
  }));
  const total = items.reduce((sum, item) => sum + item.count, 0);
  if (total === 0) {
    return items.map((item) => ({
      ...item,
      percentage: 0,
      onShelfCount: 0,
      siteOnShelfRatio: 0,
    }));
  }
  return items
    .map((item) => {
      const onShelfCount = Math.max(item.count * 8 + 1200, 1);
      return {
        ...item,
        percentage: Math.round((item.count / total) * 100),
        onShelfCount,
        siteOnShelfRatio: roundPercent(item.count, onShelfCount),
      };
    })
    .sort((a, b) => b.count - a.count);
}

export function formatFrequencyHourLabel(hourKey: string, timeMode: FaultStatsTimeMode) {
  const d = dayjs(hourKey);
  if (!d.isValid()) return hourKey;
  return timeMode === "customDate" ? d.format("HH:00") : d.format("MM-DD HH:00");
}

export function buildFrequencyPointsFromLogs(
  logs: StatsLogRow[],
  timeMode: FaultStatsTimeMode,
  selectedDate: string,
): FrequencyPoint[] {
  const bucketCount = 8;
  const points: FrequencyPoint[] = [];

  if (timeMode === "24h") {
    const now = dayjs();
    for (let i = bucketCount - 1; i >= 0; i--) {
      const endOffset = i * 3;
      const startOffset = (i + 1) * 3;
      const label = i === 0 ? "现在" : `${endOffset}h前`;
      const count = logs.filter((row) => {
        const t = dayjs(row.logTime);
        const hoursAgo = now.diff(t, "hour", true);
        if (i === 0) return hoursAgo >= 0 && hoursAgo < 3;
        return hoursAgo >= endOffset && hoursAgo < startOffset;
      }).length;
      points.push({ label, count });
    }
    return points;
  }

  const day = dayjs(selectedDate).startOf("day");
  for (let i = 0; i < bucketCount; i++) {
    const startH = i * 3;
    const endH = (i + 1) * 3;
    const label = `${String(startH).padStart(2, "0")}:00`;
    const count = logs.filter((row) => {
      const h = dayjs(row.logTime).hour();
      return h >= startH && h < endH;
    }).length;
    points.push({ label, count });
  }
  return points;
}

export function aggregateCodeDistributionFromLogs(logs: StatsLogRow[]): CodeDistributionItem[] {
  if (logs.length === 0) return [];

  const counts = new Map<string, number>();
  for (const log of logs) {
    const code = log.code?.trim() || "未知";
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }

  const total = logs.length;
  return Array.from(counts.entries())
    .map(([code, count]) => ({
      code,
      count,
      percentage: Math.round((count / total) * 1000) / 10,
      color: FAULT_CODE_COLOR[code as FaultCode] ?? SITE_LINE_COLORS[0],
    }))
    .sort((a, b) => b.count - a.count);
}

export function getSelectedSiteCountFromLogs(logs: StatsLogRow[], selectedSiteCode?: string) {
  if (!selectedSiteCode) return logs.length;
  return logs.filter((log) => log.siteCode === selectedSiteCode).length;
}

export function paginateLogs<T>(logs: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  return logs.slice(start, start + pageSize);
}
