import type { TaskSnapshotQueryParams, TimeRange } from "./types";

import { fetchGet } from "@/helper/fetchHelper";

export const fetchBoundSites = async (venueType: string) => {
  return await fetchGet(`minerHashrate/boundSites/${venueType}`);
};

export const fetchRecentProbeTasks = async (venueType: string, siteCode: string, window: TimeRange) => {
  return await fetchGet(`minerHashrate/recentProbeTasks/${venueType}/${siteCode}`, { window });
};

export const fetchLatestFinishedProbeTask = async (venueType: string, siteCode: string) => {
  return await fetchGet(`minerHashrate/latestFinishedProbeTask/${venueType}/${siteCode}`);
};

/** 路径 :taskID，支持逗号分隔的多个任务 ID（与后端 parseTaskIDs 一致） */
function taskSnapshotPath(venueType: string, taskIds: string, forExport = false) {
  const segment = encodeURIComponent(taskIds);
  return forExport
    ? `minerHashrate/taskSnapshots/${venueType}/${segment}/export`
    : `minerHashrate/taskSnapshots/${venueType}/${segment}`;
}

/** taskIds 为逗号分隔，如 "id1,id2" */
export const fetchTaskSnapshots = async (
  venueType: string,
  taskIds: string,
  params?: TaskSnapshotQueryParams,
) => {
  return await fetchGet(taskSnapshotPath(venueType, taskIds), params);
};

/** 导出 Excel，taskIds 同样支持逗号分隔多个任务 */
export const fetchTaskSnapshotExport = async (
  venueType: string,
  taskIds: string,
  params?: TaskSnapshotQueryParams,
) => {
  return await fetchGet(taskSnapshotPath(venueType, taskIds, true), params, {
    responseType: "blob",
  });
};
