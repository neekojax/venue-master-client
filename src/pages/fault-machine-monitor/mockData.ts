import dayjs from "dayjs";
import { FAULT_CODE_EXPLANATIONS, FAULT_CODES, type FaultCode, getSiteLineColor } from "./constants";
import {
  aggregateCodeDistributionFromLogs,
  buildSiteDistributionFromLogs,
  buildStatsLogFilters,
  toStatsLogRow,
} from "./statsUtils";
import type {
  AbnormalLogFilters,
  AbnormalLogListItem,
  AbnormalLogRecord,
  AbnormalLogsSiteDetailData,
  AbnormalLogsSiteSummaryData,
  FaultStatsTimeMode,
  FaultTimeRange,
  FaultTrendChartData,
} from "./types";

import { MOCK_FARM_SITES } from "@/pages/farm-monitor/mockData";

/** 仅当 VITE_FAULT_MONITOR_USE_MOCK=true 时启用 mock，默认走真实接口 */
export const USE_FAULT_MONITOR_MOCK = import.meta.env.VITE_FAULT_MONITOR_USE_MOCK === "true";

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randomMac(rand: () => number) {
  const hex = () =>
    Math.floor(rand() * 256)
      .toString(16)
      .padStart(2, "0");
  return Array.from({ length: 6 }, hex).join(":").toUpperCase();
}

function randomIp(rand: () => number) {
  return `10.${Math.floor(rand() * 200) + 10}.${Math.floor(rand() * 200)}.${Math.floor(rand() * 200) + 1}`;
}

function buildMockLogs(): AbnormalLogRecord[] {
  const sites = MOCK_FARM_SITES.slice(0, 10);
  const records: AbnormalLogRecord[] = [];
  let id = 1;
  const now = dayjs();

  for (let siteIndex = 0; siteIndex < sites.length; siteIndex++) {
    const site = sites[siteIndex];
    const rand = mulberry32(1000 + siteIndex * 97);

    for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
      const day = now.subtract(dayOffset, "day");
      const logsPerDay = Math.floor(rand() * 6) + (siteIndex % 3) + (dayOffset < 7 ? 3 : 1);

      for (let j = 0; j < logsPerDay; j++) {
        const code = FAULT_CODES[Math.floor(rand() * FAULT_CODES.length)] as FaultCode;
        const explanations = FAULT_CODE_EXPLANATIONS[code];
        const explanation = explanations[Math.floor(rand() * explanations.length)];
        const hour = Math.floor(rand() * 24);
        const minute = Math.floor(rand() * 60);
        const collectTime = day
          .hour(hour)
          .minute(minute)
          .second(Math.floor(rand() * 60));
        const logTime = collectTime.add(Math.floor(rand() * 45) + 1, "minute");
        const createdAt = logTime.add(Math.floor(rand() * 10) + 1, "minute");

        records.push({
          id: id++,
          siteId: site.id,
          siteName: site.name,
          agentCode: `agent-${String((siteIndex % 4) + 1).padStart(2, "0")}`,
          ip: randomIp(rand),
          mac: randomMac(rand),
          controlBoardSN: `SN-ABN-${String(300000 + id).slice(1)}`,
          code,
          explanation,
          logTime: logTime.format("YYYY-MM-DD HH:mm:ss"),
          collectTime: collectTime.format("YYYY-MM-DD HH:mm:ss"),
          createdAt: createdAt.format("YYYY-MM-DD HH:mm:ss"),
        });
      }
    }
  }

  return records.sort((a, b) => dayjs(b.logTime).valueOf() - dayjs(a.logTime).valueOf());
}

export const MOCK_ABNORMAL_LOGS: AbnormalLogRecord[] = buildMockLogs();

export function recordToListItem(record: AbnormalLogRecord): AbnormalLogListItem {
  return {
    id: record.id,
    siteCode: record.siteId,
    siteName: record.siteName,
    agentCode: record.agentCode,
    ip: record.ip,
    mac: record.mac,
    controlBoardSN: record.controlBoardSN,
    code: record.code,
    explanation: record.explanation,
    logTime: record.logTime,
    collectTime: record.collectTime,
    createdAt: record.createdAt,
  };
}

export function filterMockAbnormalLogs(
  logs: AbnormalLogRecord[],
  filters: AbnormalLogFilters,
): AbnormalLogRecord[] {
  return logs.filter((row) => {
    if (filters.code && row.code !== filters.code) return false;
    if (filters.siteCode && row.siteId !== filters.siteCode) return false;
    if (filters.ip && !row.ip.includes(filters.ip)) return false;
    if (filters.mac && !row.mac.toLowerCase().includes(filters.mac.toLowerCase())) return false;
    if (
      filters.controlBoardSN &&
      !row.controlBoardSN.toLowerCase().includes(filters.controlBoardSN.toLowerCase())
    ) {
      return false;
    }
    const t = dayjs(row.logTime);
    if (filters.logTimeFrom && t.isBefore(dayjs(filters.logTimeFrom), "second")) return false;
    if (filters.logTimeTo && t.isAfter(dayjs(filters.logTimeTo), "second")) return false;
    return true;
  });
}

export function buildMockSiteSummary(
  timeMode: FaultStatsTimeMode,
  selectedDate: string,
): AbnormalLogsSiteSummaryData {
  const filters = buildStatsLogFilters(timeMode, selectedDate);
  const logs = filterMockAbnormalLogs(MOCK_ABNORMAL_LOGS, filters);
  const list = buildSiteDistributionFromLogs(logs.map(toStatsLogRow)).map((item) => ({
    siteCode: item.siteCode,
    siteName: item.siteName,
    count: item.count,
    onShelfCount: item.onShelfCount,
    siteOnShelfRatio: item.siteOnShelfRatio,
  }));
  const totalCount = list.reduce((sum, item) => sum + item.count, 0);
  const window = timeMode === "customDate" ? ("date" as const) : ("24h" as const);

  return {
    date: timeMode === "customDate" ? selectedDate : undefined,
    window,
    startTime: filters.logTimeFrom ?? "",
    endTime: filters.logTimeTo ?? "",
    totalCount,
    list,
  };
}

export function buildMockSiteDetail(
  siteCode: string,
  timeMode: FaultStatsTimeMode,
  selectedDate: string,
): AbnormalLogsSiteDetailData {
  const filters = buildStatsLogFilters(timeMode, selectedDate, siteCode);
  const logs = filterMockAbnormalLogs(MOCK_ABNORMAL_LOGS, filters).map(toStatsLogRow);
  const siteName = logs[0]?.siteName ?? siteCode;

  const typeDistribution = aggregateCodeDistributionFromLogs(logs);
  const typeStats = typeDistribution.map((item) => ({ code: item.code, count: item.count }));
  const total = logs.length;

  const start = dayjs(filters.logTimeFrom);
  const end = dayjs(filters.logTimeTo);
  const hours: AbnormalLogsSiteDetailData["hours"] = [];
  let cursor = start.startOf("hour");
  const endCursor = end;

  while (cursor.isBefore(endCursor)) {
    const next = cursor.add(1, "hour");
    const inHour = logs.filter((row) => {
      const t = dayjs(row.logTime);
      return !t.isBefore(cursor) && t.isBefore(next);
    });
    const codeCounts = new Map<string, number>();
    for (const row of inHour) {
      const code = row.code?.trim() || "未知";
      codeCounts.set(code, (codeCounts.get(code) ?? 0) + 1);
    }
    hours.push({
      hour: cursor.format("YYYY-MM-DD HH:mm:ss"),
      count: inHour.length,
      codeStats: typeStats.map((item) => ({
        code: item.code,
        count: codeCounts.get(item.code) ?? 0,
      })),
    });
    cursor = next;
  }

  const window = timeMode === "customDate" ? ("date" as const) : ("24h" as const);
  return {
    siteCode,
    siteName,
    date: timeMode === "customDate" ? selectedDate : undefined,
    window,
    startTime: filters.logTimeFrom ?? "",
    endTime: filters.logTimeTo ?? "",
    total,
    typeStats,
    hours,
  };
}

export function buildMockTrendChartData(timeRange: FaultTimeRange): FaultTrendChartData {
  const days = timeRange === "7d" ? 7 : 30;
  const now = dayjs();
  const labels: string[] = [];
  const dayKeys: string[] = [];

  for (let i = days - 1; i >= 0; i--) {
    const d = now.subtract(i, "day").startOf("day");
    labels.push(d.format("MM-DD"));
    dayKeys.push(d.format("YYYY-MM-DD"));
  }

  const siteIndexMap = new Map<string, number>();
  const seriesMap = new Map<string, { siteId: string; siteName: string; points: number[] }>();

  for (const log of MOCK_ABNORMAL_LOGS) {
    const dayKey = dayjs(log.logTime).format("YYYY-MM-DD");
    const dayIdx = dayKeys.indexOf(dayKey);
    if (dayIdx < 0) continue;

    if (!seriesMap.has(log.siteId)) {
      const idx = siteIndexMap.size;
      siteIndexMap.set(log.siteId, idx);
      seriesMap.set(log.siteId, {
        siteId: log.siteId,
        siteName: log.siteName,
        points: Array.from({ length: days }, () => 0),
      });
    }
    const series = seriesMap.get(log.siteId)!;
    series.points[dayIdx] += 1;
  }

  const series = Array.from(seriesMap.values()).map((item, index) => ({
    ...item,
    color: getSiteLineColor(index),
  }));

  return {
    labels,
    series,
    lastUpdated: now.format("YYYY-MM-DD"),
  };
}
