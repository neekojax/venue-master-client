import axiosInstance from "@/helper/axiosInstance";
import { t } from "@/locales";

export interface DailyAbnormalReason {
  id: number;
  reason: string;
  affectedMachineCount: number;
  status: string;
  owner: string;
}

export interface DailyEventImpactDetail {
  eventId: number;
  eventType: string;
  impactCount: number;
  startTime: string;
  endTime: string;
  eventReason: string;
}

export interface DailyEventImpact {
  allDayImpactCount: number;
  shortTermImpactCount: number;
  allDayDetails: DailyEventImpactDetail[];
  shortTermDetails: DailyEventImpactDetail[];
}

export interface DailyAbnormalRecord {
  date: string;
  scanMachineCount: number;
  onShelfCount: number;
  abnormalCount: number;
  reasons: DailyAbnormalReason[];
  eventImpact: DailyEventImpact;
}

export interface DailyAbnormalPage {
  list: DailyAbnormalRecord[];
  total: number;
  page: number;
  pageSize: number;
}

export async function fetchDailyAbnormalHistory(
  venueType: string,
  siteName: string,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<DailyAbnormalPage> {
  // The shared interceptor already unwraps the HTTP response body.
  const body = await axiosInstance.get<
    unknown,
    DailyAbnormalPage & {
      success?: boolean;
      message?: string;
      data?: DailyAbnormalPage;
    }
  >(`minerHashrate/abnormalData/${encodeURIComponent(venueType)}/list`, {
    params: { siteName, page, pageSize },
    signal,
  });
  if (body.success === false) throw new Error(body.message || t("操作失败"));
  const data = body.data ?? body;
  if (!Array.isArray(data.list) || typeof data.total !== "number") {
    throw new Error(t("异常数据格式不正确"));
  }
  return {
    ...data,
    list: data.list.map((row) => ({
      ...row,
      reasons: row.reasons ?? [],
      eventImpact: {
        allDayImpactCount: row.eventImpact?.allDayImpactCount ?? 0,
        shortTermImpactCount: row.eventImpact?.shortTermImpactCount ?? 0,
        allDayDetails: row.eventImpact?.allDayDetails ?? [],
        shortTermDetails: row.eventImpact?.shortTermDetails ?? [],
      },
    })),
  };
}
