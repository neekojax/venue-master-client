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

/** 路径 :taskID，支持逗号分隔的多个任务 ID（与后端 parseTaskIDs 一致） */
function taskSnapshotPath(taskIds: string, forExport = false) {
  const segment = encodeURIComponent(taskIds);
  return forExport
    ? `minerHashrate/taskSnapshots/${segment}/export`
    : `minerHashrate/taskSnapshots/${segment}`;
}

/** taskIds 为逗号分隔，如 "id1,id2" */
export const fetchTaskSnapshots = async (taskIds: string, params?: TaskSnapshotQueryParams) => {
  return await fetchGet(taskSnapshotPath(taskIds), params);
};

/** 导出 Excel，taskIds 同样支持逗号分隔多个任务 */
export const fetchTaskSnapshotExport = async (taskIds: string, params?: TaskSnapshotQueryParams) => {
  return await fetchGet(taskSnapshotPath(taskIds, true), params, {
    responseType: "blob",
  });
};
