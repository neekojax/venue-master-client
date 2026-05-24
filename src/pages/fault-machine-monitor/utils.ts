import dayjs from "dayjs";
import type { FaultCode } from "./constants";
import { getSiteLineColor } from "./mockData";
import type {
  AbnormalLogListItem,
  AbnormalLogRecord,
  AbnormalLogsTrendData,
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
