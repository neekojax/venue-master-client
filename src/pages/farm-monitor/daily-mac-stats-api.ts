import axiosInstance from "@/helper/axiosInstance";
import { t } from "@/locales";

export interface AgentDailyMacStat {
  agent_name: string;
  site_name: string;
  stat_date: string;
  compare_date: string;
  unique_mac_count: number;
  previous_mac_count: number | null;
  added_mac_count: number | null;
  removed_mac_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface MachineDailyRecord {
  id: number;
  stat_date: string;
  agent_id: number;
  mac_address: string;
  ip_address: string;
  miner_code: string;
  control_board_sn: string;
  miner_blacklisted: boolean;
  miner_whitelisted: boolean;
  last_seen_at: string;
  created_at: string;
  updated_at: string;
}

export interface DailyMacListData<T> {
  siteCode?: string;
  miner_code?: string;
  stat_date?: string;
  list: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface ResponseEnvelope<T> {
  success?: boolean;
  code?: number;
  message?: string;
  data?: DailyMacListData<T>;
}

async function fetchDailyMacList<T>(
  endpoint: string,
  params: Record<string, string | number>,
  signal?: AbortSignal,
): Promise<DailyMacListData<T>> {
  const body = await axiosInstance.get<unknown, ResponseEnvelope<T>>(endpoint, { params, signal });
  if (body.success === false || (typeof body.code === "number" && body.code !== 0)) {
    throw new Error(body.message || t("操作失败"));
  }
  const data = body.data;
  if (!data || !Array.isArray(data.list) || typeof data.total !== "number") {
    throw new Error(t("每日 MAC 数据格式不正确"));
  }
  // 保留 null，避免把缺少对比基准的数据转成 0。
  return data;
}

export function fetchAgentDailyMacStats(
  venueType: string,
  siteCode: string,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
) {
  return fetchDailyMacList<AgentDailyMacStat>(
    `minerHashrate/agentDailyMacStats/${encodeURIComponent(venueType)}`,
    { siteCode, page, pageSize },
    signal,
  );
}

export function fetchMachineDailyRecords(
  venueType: string,
  siteCode: string,
  statDate: string,
  page: number,
  pageSize: number,
  signal?: AbortSignal,
) {
  return fetchDailyMacList<MachineDailyRecord>(
    `minerHashrate/machineDailyRecords/${encodeURIComponent(venueType)}`,
    { siteCode, stat_date: statDate, page, pageSize },
    signal,
  );
}

export async function fetchDailyMacOverview(
  venueType: string,
  siteCode: string,
  statDate: string,
  signal?: AbortSignal,
): Promise<AgentDailyMacStat[]> {
  const rows: AgentDailyMacStat[] = [];
  let page = 1;
  // 接口没有日期筛选，按日期倒序翻页，取齐目标业务日的所有 Agent 后停止。
  while (true) {
    const data = await fetchAgentDailyMacStats(venueType, siteCode, page, 500, signal);
    rows.push(...data.list.filter((row) => row.stat_date === statDate));
    const lastDate = data.list.at(-1)?.stat_date;
    if (!data.hasMore || !lastDate || lastDate < statDate) return rows;
    page += 1;
  }
}

export async function exportMachineDailyRecords(venueType: string, siteCode: string, statDate: string) {
  const response = await axiosInstance.get<Blob>(
    `minerHashrate/machineDailyRecords/${encodeURIComponent(venueType)}/export`,
    {
      params: { siteCode, stat_date: statDate },
      responseType: "blob",
    },
  );
  // 错误响应仍是 JSON，不能作为 CSV 文件下载。
  if (response.data.type.includes("json")) {
    const body = JSON.parse(await response.data.text()) as { message?: string };
    throw new Error(body.message || t("下载失败，请稍后重试"));
  }
  return response.data;
}
