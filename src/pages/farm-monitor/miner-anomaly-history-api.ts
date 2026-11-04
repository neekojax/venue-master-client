import type {
  MinerCodeAnomaly,
  OtherPoolMachineAnomalyHistoryData,
  OtherPoolMachineAnomalyHistoryItem,
  OtherPoolMachineAnomalyMachine,
} from "./types";

import axiosInstance from "@/helper/axiosInstance";
import { t } from "@/locales";

interface HistoryResponseEnvelope extends Partial<OtherPoolMachineAnomalyHistoryData> {
  success?: boolean;
  code?: number;
  message?: string;
  data?: OtherPoolMachineAnomalyHistoryData;
}

function normalizeMinerCodeData(value: unknown): MinerCodeAnomaly[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = item as Partial<MinerCodeAnomaly>;
    return {
      minerCode: String(row.minerCode ?? ""),
      abnormalCount: Number(row.abnormalCount ?? 0),
    };
  });
}

function normalizeMachineData(value: unknown): OtherPoolMachineAnomalyMachine[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    const row = item as Partial<OtherPoolMachineAnomalyMachine>;
    return {
      mac: String(row.mac ?? ""),
      controlBoardSN: String(row.controlBoardSN ?? ""),
      minerCodes: Array.isArray(row.minerCodes) ? row.minerCodes.map(String) : [],
    };
  });
}

function normalizeHistoryItem(value: unknown): OtherPoolMachineAnomalyHistoryItem {
  const row = value as Partial<OtherPoolMachineAnomalyHistoryItem>;
  return {
    businessDate: String(row.businessDate ?? ""),
    windowStart: String(row.windowStart ?? ""),
    windowEnd: String(row.windowEnd ?? ""),
    abnormalCount: Number(row.abnormalCount ?? 0),
    minerCodeTotal: Number(row.minerCodeTotal ?? 0),
    minerCodes: Array.isArray(row.minerCodes) ? row.minerCodes.map(String) : [],
    minerCodeData: normalizeMinerCodeData(row.minerCodeData),
    machineData: normalizeMachineData(row.machineData),
  };
}

export async function fetchOtherPoolMachineAnomalyHistory(
  venueType: string,
  siteName: string,
  startDate: string,
  endDate: string,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
): Promise<OtherPoolMachineAnomalyHistoryData> {
  const body = await axiosInstance.get<unknown, HistoryResponseEnvelope>(
    `minerHashrate/otherPoolMachineAnomalies/${encodeURIComponent(venueType)}/history`,
    {
      params: { siteName, startDate, endDate, page, pageSize },
      signal,
    },
  );

  if (body.success === false || (typeof body.code === "number" && body.code !== 0)) {
    throw new Error(body.message || t("操作失败"));
  }

  const data = body.data ?? body;
  if (!Array.isArray(data.list) || typeof data.total !== "number") {
    throw new Error(t("异常矿工历史数据格式不正确"));
  }

  return {
    venueType: String(data.venueType ?? venueType),
    siteName: String(data.siteName ?? siteName),
    startDate: String(data.startDate ?? startDate),
    endDate: String(data.endDate ?? endDate),
    list: data.list.map(normalizeHistoryItem),
    total: data.total,
    page: Number(data.page ?? page),
    pageSize: Number(data.pageSize ?? pageSize),
    hasMore: Boolean(data.hasMore),
  };
}
