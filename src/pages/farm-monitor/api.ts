import type { TaskSnapshotQueryParams, TimeRange } from "./types";

import { fetchGet } from "@/helper/fetchHelper";

export const fetchBoundSites = async () => {
  return await fetchGet("minerHashrate/boundSites");
};

export const fetchRecentProbeTasks = async (siteCode: string, window: TimeRange) => {
  return await fetchGet(`minerHashrate/recentProbeTasks/${siteCode}`, { window });
};

export const fetchLatestFinishedProbeTask = async (siteCode: string) => {
  return await fetchGet(`minerHashrate/latestFinishedProbeTask/${siteCode}`);
};

export const fetchTaskSnapshots = async (taskId: string, params?: TaskSnapshotQueryParams) => {
  return await fetchGet(`minerHashrate/taskSnapshots/${taskId}`, params);
};

export const fetchTaskSnapshotExport = async (taskId: string, params?: TaskSnapshotQueryParams) => {
  return await fetchGet(`minerHashrate/taskSnapshots/${taskId}/export`, params, {
    responseType: "blob",
  });
};
