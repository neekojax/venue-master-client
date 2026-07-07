import type {
  SiteAgentBindingPayload,
  SiteAgentBindingQueryParams,
  SiteDailyAnomalyRefreshTask,
} from "./types";

import { fetchDelete, fetchGet, fetchPost, fetchPut } from "@/helper/fetchHelper";

export const fetchSiteAgentBindings = async (venueType: string, params: SiteAgentBindingQueryParams) => {
  return fetchGet(`minerHashrate/siteAgentBindings/${venueType}`, params);
};

export const createSiteAgentBinding = async (venueType: string, payload: SiteAgentBindingPayload) => {
  return fetchPost(`minerHashrate/siteAgentBindings/${venueType}`, payload);
};

export const updateSiteAgentBinding = async (
  venueType: string,
  agentName: string,
  payload: SiteAgentBindingPayload,
) => {
  return fetchPut(`minerHashrate/siteAgentBindings/${venueType}/${encodeURIComponent(agentName)}`, payload);
};

export const deleteSiteAgentBinding = async (venueType: string, agentName: string) => {
  return fetchDelete(`minerHashrate/siteAgentBindings/${venueType}/${encodeURIComponent(agentName)}`);
};

export const refreshSiteDailyAnomalyStats = async (venueType: string, siteCode: string) => {
  return fetchPost(
    `minerHashrate/siteDailyAnomalyStats/${venueType}/${encodeURIComponent(siteCode)}/refresh`,
    {},
  );
};

export const refreshAllSiteDailyAnomalyStats = async (venueType: string) => {
  return fetchPost(`minerHashrate/siteDailyAnomalyStats/${venueType}/refresh`, {});
};

export const fetchSiteDailyAnomalyRefreshTask = async (venueType: string, taskId: string) => {
  return fetchGet(
    `minerHashrate/siteDailyAnomalyStats/${venueType}/refreshTask/${encodeURIComponent(taskId)}`,
  ) as Promise<{
    data: SiteDailyAnomalyRefreshTask;
  }>;
};
