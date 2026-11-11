import axiosInstance from "@/helper/axiosInstance";
import { t } from "@/locales";

export type PowerDataStatus = "valid" | "partial" | "no_data";

export interface AgentDailyPower {
  agent_code: string;
  agent_name: string;
  power_mw: number | null;
  status: PowerDataStatus;
  covered_seconds: number;
  coverage_ratio: number;
}

export interface DailyPowerTrend {
  business_date: string;
  total_power_mw: number | null;
  agents: AgentDailyPower[];
}

export interface PowerTrendData {
  site_code: string;
  site_name: string;
  agent_code: string;
  start_date: string;
  end_date: string;
  timezone: string;
  unit: string;
  list: DailyPowerTrend[];
}

export interface AgentPowerDetail {
  agent_code: string;
  agent_name?: string;
  status: PowerDataStatus;
  covered_seconds: number;
  coverage_ratio: number;
  whitelist_average_load_mw: number | null;
  blacklist_average_load_mw: number | null;
  total_average_load_mw: number | null;
  updated_at: string;
}

export interface DailyPowerDetailData {
  site_code: string;
  business_date: string;
  total_power_mw: number | null;
  total_energy_mwh: number | null;
  list: AgentPowerDetail[];
}

async function fetchPowerData<T extends { list: unknown[] }>(
  venueType: string,
  siteCode: string,
  trend: boolean,
  params: Record<string, string>,
  signal?: AbortSignal,
): Promise<T> {
  const body = await axiosInstance.get<
    unknown,
    { success?: boolean; code?: number; message?: string; data?: T }
  >(
    `minerHashrate/siteAgentDailyPowerLoads/${encodeURIComponent(venueType)}/${encodeURIComponent(siteCode)}${trend ? "/trend" : ""}`,
    { params, signal },
  );
  if (body.success === false || (typeof body.code === "number" && body.code !== 0)) {
    throw new Error(body.message || t("操作失败"));
  }
  if (!body.data || !Array.isArray(body.data.list)) throw new Error(t("功耗数据格式不正确"));
  return body.data;
}

export function fetchPowerTrend(
  venueType: string,
  siteCode: string,
  startDate: string,
  endDate: string,
  agentCode: string,
  signal?: AbortSignal,
) {
  return fetchPowerData<PowerTrendData>(
    venueType,
    siteCode,
    true,
    { startDate, endDate, ...(agentCode ? { agentCode } : {}) },
    signal,
  );
}

export function fetchDailyPowerDetail(
  venueType: string,
  siteCode: string,
  businessDate: string,
  agentCode: string,
  signal?: AbortSignal,
) {
  return fetchPowerData<DailyPowerDetailData>(
    venueType,
    siteCode,
    false,
    { businessDate, ...(agentCode ? { agentCode } : {}) },
    signal,
  );
}
