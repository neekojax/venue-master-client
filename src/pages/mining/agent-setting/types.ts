export interface SiteAgentBindingQueryParams {
  page?: number;
  pageSize?: number;
  siteCode?: string;
  siteName?: string;
  agentCode?: string;
  agentName?: string;
}

export interface SiteAgentBindingPayload {
  siteCode: string;
  siteName: string;
  agentCode?: string;
  agentName: string;
  version?: string;
  assetSiteID?: number;
  minerCodeWhitelist?: string[];
  minerCodeBlacklist?: string[];
  machineTypeBlacklist?: string[];
  ipRanges?: string[];
}

export interface SiteAgentBindingRecord {
  key: string;
  venueType?: string;
  siteCode: string;
  siteName: string;
  agentCode?: string;
  agentName: string;
  version?: string;
  assetSiteId?: number;
  minerCodeWhitelist: string[];
  minerCodeBlacklist: string[];
  machineTypeBlacklist: string[];
  ipRanges: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SiteAgentBindingListData {
  venueType?: string;
  total: number;
  list: SiteAgentBindingRecord[];
  page: number;
  pageSize: number;
}

export interface SiteAgentBindingSearchValues {
  siteCode?: string;
  siteName?: string;
  agentCode?: string;
  agentName?: string;
}

export interface SiteAgentBindingFormValues {
  siteCode: string;
  siteName: string;
  agentCode?: string;
  agentName: string;
  assetSiteId?: number;
  minerCodeWhitelist?: string;
  minerCodeBlacklist?: string;
  machineTypeBlacklist?: string;
  ipRanges?: string;
}

export type SiteDailyAnomalyRefreshScopeType = "site" | "all_site";
export type SiteDailyAnomalyRefreshStatus = "pending" | "running" | "success" | "failed";

export interface SiteDailyAnomalyRefreshTask {
  taskId: string;
  venueType: string;
  scopeType: SiteDailyAnomalyRefreshScopeType;
  siteCode: string;
  status: SiteDailyAnomalyRefreshStatus;
  windowDays: number;
  siteCount: number;
  deletedRows: number;
  upsertedRows: number;
  dateFrom: string;
  dateTo: string;
  errorMessage: string;
  startedAt: string;
  finishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteDailyAnomalyRefreshSubmitData {
  existingTask: boolean;
  task: SiteDailyAnomalyRefreshTask;
}
