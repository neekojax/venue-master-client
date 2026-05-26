import dayjs from "dayjs";
import { FAULT_CODE_COLOR, type FaultCode, getSiteLineColor, SITE_LINE_COLORS } from "./constants";
import type { CodeDistributionItem, FrequencyPoint, SiteDistributionItem } from "./statsUtils";
import { formatFrequencyHourLabel } from "./statsUtils";
import type {
  AbnormalLogListItem,
  AbnormalLogRecord,
  AbnormalLogsSiteDetailData,
  AbnormalLogsSiteSummaryData,
  AbnormalLogsTrendData,
  FaultStatsTimeMode,
  FaultTrendChartData,
} from "./types";

const EMPTY_TREND_CHART: FaultTrendChartData = {
  labels: [],
  series: [],
  lastUpdated: "-",
};

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD HH:mm:ss") : value;
}

export function mapAbnormalLogsTrendToChartData(payload?: AbnormalLogsTrendData): FaultTrendChartData {
  if (!payload) return EMPTY_TREND_CHART;

  return {
    labels: payload.labels ?? [],
    series: (payload.series ?? []).map((item, index) => ({
      siteId: item.siteCode,
      siteName: item.siteName,
      color: getSiteLineColor(index),
      points: item.points.map((v) => Number(v)),
    })),
    lastUpdated: payload.endDate || "-",
  };
}

export function mapAbnormalLogListItemToRecord(item: AbnormalLogListItem): AbnormalLogRecord {
  return {
    id: item.id,
    siteId: item.siteCode,
    siteName: item.siteName,
    agentCode: item.agentCode,
    ip: item.ip,
    mac: item.mac,
    controlBoardSN: item.controlBoardSN,
    code: item.code as FaultCode,
    explanation: item.explanation,
    logTime: formatDateTime(item.logTime),
    collectTime: formatDateTime(item.collectTime),
    createdAt: formatDateTime(item.createdAt),
  };
}

export function mapAbnormalLogListToRecords(list: AbnormalLogListItem[] = []) {
  return list.map(mapAbnormalLogListItemToRecord);
}

export function mapSiteSummaryToDistribution(payload?: AbnormalLogsSiteSummaryData): SiteDistributionItem[] {
  if (!payload?.list?.length) return [];

  const total = Number(payload.totalCount) || payload.list.reduce((sum, item) => sum + Number(item.count), 0);

  return payload.list.map((item) => {
    const count = Number(item.count) || 0;
    return {
      siteCode: item.siteCode,
      siteName: item.siteName,
      count,
      onShelfCount: Number(item.onShelfCount) || 0,
      siteOnShelfRatio: Number(item.siteOnShelfRatio) || 0,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

export function mapSiteDetailToFrequencyPoints(
  payload: AbnormalLogsSiteDetailData | undefined,
  timeMode: FaultStatsTimeMode,
): FrequencyPoint[] {
  return (payload?.hours ?? []).map((item) => ({
    label: formatFrequencyHourLabel(item.hour, timeMode),
    count: Number(item.count) || 0,
  }));
}

export function mapSiteDetailToCodeDistribution(
  payload: AbnormalLogsSiteDetailData | undefined,
): CodeDistributionItem[] {
  const typeStats = payload?.typeStats ?? [];
  if (typeStats.length === 0) return [];

  const total = Number(payload?.total) || typeStats.reduce((sum, item) => sum + Number(item.count), 0);
  if (total <= 0) return [];

  return typeStats
    .map((item) => {
      const code = item.code?.trim() || "未知";
      const count = Number(item.count) || 0;
      return {
        code,
        count,
        percentage: Math.round((count / total) * 1000) / 10,
        color: FAULT_CODE_COLOR[code as FaultCode] ?? SITE_LINE_COLORS[0],
      };
    })
    .sort((a, b) => b.count - a.count);
}
