import { fetchGet } from "@/helper/fetchHelper";
import { t } from "@/locales";

export type SnapshotEvent = Record<string, unknown> & { event_id: number };
export interface DailySnapshot {
  id: number;
  version: number;
  report_type: "venue" | "account";
  venue_type: string;
  report_date: string;
  generated_by: string;
  created_at: string;
  reportData: {
    dailyReportStatistics: Record<string, Record<string, unknown>>;
    summary: Record<string, number>;
  };
  eventDetails: Record<string, SnapshotEvent[]>;
}
export async function fetchDailySnapshots(
  venueType: string,
  date: string,
  reportType: "venue" | "account",
): Promise<DailySnapshot[]> {
  const result = (await fetchGet(
    `/report/daily/snapshot/list/${encodeURIComponent(venueType)}/${encodeURIComponent(date)}/${reportType}`,
  )) as unknown as { success: boolean; code: number; message?: string; data?: { list?: DailySnapshot[] } };
  if (!result || (result.success !== true && result.code !== 0))
    throw new Error(result?.message || t("快照加载失败"));
  if (!Array.isArray(result.data?.list)) throw new Error(t("快照响应格式不正确"));
  return result.data.list;
}
