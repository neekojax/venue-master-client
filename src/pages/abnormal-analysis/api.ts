import { fetchGet } from "@/helper/fetchHelper";

/** 单个时间窗口的异常统计：期望在架、刷新数、异常数 */
export interface AnomalyWindowStat {
  onShelfMax: number;
  refreshedCount: number;
  anomaly: number;
}

/** 五个时间窗口的汇总异常数 */
export interface AnomalyStats {
  yesterday: AnomalyWindowStat;
  last7Days: AnomalyWindowStat;
  last15Days: AnomalyWindowStat;
  last30Days: AnomalyWindowStat;
  allTime: AnomalyWindowStat;
}

/** 逐日曲线点 */
export interface AnomalyDailyPoint {
  date: string;
  onShelfMax: number;
  refreshedCount: number;
  anomaly: number;
}

/** GET minerHashrate/allSiteAnomalyStats/:venueType 的响应 data */
export interface AllSiteAnomalyStatsResponse {
  venueType: string;
  siteCount: number;
  stats: AnomalyStats;
  dailyLast30Days: AnomalyDailyPoint[];
}

/** 全场异常统计：昨日/7日/15日/30日/全部 + 最近30日逐日曲线 */
export const fetchAllSiteAnomalyStats = async (venueType: string) => {
  return await fetchGet(`minerHashrate/allSiteAnomalyStats/${venueType}`);
};

/** GET minerHashrate/siteAnomalySiteList/:venueType 的场地异常列表单项 */
export interface SiteAnomalySiteListItem {
  siteCode: string;
  siteName: string;
  anomaly: number;
  onShelfMax: number;
  refreshedCount: number;
  anomalyRatio: number;
}

/** GET minerHashrate/siteAnomalySiteList/:venueType 的响应 data */
export interface SiteAnomalySiteListResponse {
  venueType: string;
  window: string;
  total: number;
  list: SiteAnomalySiteListItem[];
}

/** 场地异常列表：按 allTime 口径返回各场地异常数 */
export const fetchSiteAnomalySiteList = async (venueType: string) => {
  return await fetchGet(`minerHashrate/siteAnomalySiteList/${venueType}`);
};

/** GET minerHashrate/siteAnomalyStats/:venueType/:siteCode 的响应 data */
export interface SiteAnomalyStatsResponse {
  venueType: string;
  siteCode: string;
  siteName: string;
  stats: AnomalyStats;
  dailyLast30Days: AnomalyDailyPoint[];
}

/** 单场地异常统计：昨日/7日/15日/30日/全部 + 最近30日逐日曲线 */
export const fetchSiteAnomalyStats = async (venueType: string, siteCode: string) => {
  return await fetchGet(`minerHashrate/siteAnomalyStats/${venueType}/${encodeURIComponent(siteCode)}`);
};

/** 异常信息详情栏筛选参数 */
export interface AbnormalAnalysisDetailParams {
  siteName?: string;
  mac?: string;
  controlBoardSN?: string;
  minerId?: string;
  refreshTimeFrom?: string;
  isDismantled?: "在架" | "下架" | "未知";
  assetOwnership?: "自有" | "非自有" | "未知";
  orderBy?: "refreshTimeDesc" | "refreshTimeAsc";
  page?: number;
  pageSize?: number;
}

/** 异常信息详情栏单条矿机记录 */
export interface AbnormalAnalysisDetailItem {
  id: string;
  site: string;
  mac: string;
  controlBoardSN: string;
  model: string;
  minerCode: string[];
  ipAddress: string[];
  refreshTime: string;
  isDismantled: "在架" | "下架" | "未知";
  dismantledTime: string;
  assetOwnership: "自有" | "非自有" | "未知";
}

/** GET minerHashrate/abnormalAnalysisDetail/:venueType 的响应 data */
export interface AbnormalAnalysisDetailResponse {
  venueType: string;
  total: number;
  list: AbnormalAnalysisDetailItem[];
  page: number;
  pageSize: number;
}

/** 异常信息详情栏：矿机明细列表 */
export const fetchAbnormalAnalysisDetail = async (
  venueType: string,
  params: AbnormalAnalysisDetailParams = {},
) => {
  return await fetchGet(`minerHashrate/abnormalAnalysisDetail/${venueType}`, params);
};

/** 异常信息详情栏导出：按当前筛选条件下载 Excel */
export const fetchAbnormalAnalysisDetailExport = async (
  venueType: string,
  params: AbnormalAnalysisDetailParams = {},
) => {
  return await fetchGet(`minerHashrate/abnormalAnalysisDetail/${venueType}/export`, params, {
    responseType: "blob",
  });
};
