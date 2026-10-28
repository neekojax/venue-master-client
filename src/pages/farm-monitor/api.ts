import type {
  MinerCodeAnomalySummary,
  TaskAbnormalMinerCount,
  TaskSnapshotQueryParams,
  TimeRange,
} from "./types";

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

export const fetchOtherPoolMachineAnomalies = async (
  venueType: string,
  siteName: string,
  businessDate: string,
) => {
  return await fetchGet(`minerHashrate/otherPoolMachineAnomalies/${venueType}`, { siteName, businessDate });
};

export const fetchTaskAbnormalMinerCount = async (venueType: string, taskId: string) => {
  // 任务异常统计会随最新扫描结果变化，避免命中浏览器或中间层的旧 GET 缓存。
  return await fetchGet(`minerHashrate/taskAbnormalMinerCount/${venueType}/${encodeURIComponent(taskId)}`, {
    _: Date.now(),
  });
};

/** 多 Agent 场地按最新任务分别查询，再按矿工号聚合。 */
export const fetchTaskAbnormalMinerCounts = async (
  venueType: string,
  taskIds: string[],
): Promise<MinerCodeAnomalySummary> => {
  const responses = await Promise.all(
    taskIds.map((taskId) => fetchTaskAbnormalMinerCount(venueType, taskId)),
  );

  // 单任务时完全采用后端统计口径，避免根据首个 minerCodeData 项自行推算。
  if (responses.length === 1) {
    const summary = responses[0].data as TaskAbnormalMinerCount;
    return {
      abnormalCount: Number(summary?.abnormalCount ?? 0),
      minerCodeTotal: Number(summary?.minerCodeTotal ?? 0),
      minerCodes: summary?.minerCodes ?? [],
      minerCodeData: summary?.minerCodeData ?? [],
    };
  }

  const counts = new Map<string, { minerCode: string; abnormalCount: number }>();
  let abnormalCount = 0;

  responses.forEach((response) => {
    const summary = response.data as TaskAbnormalMinerCount;
    abnormalCount += Number(summary?.abnormalCount ?? 0);
    (summary?.minerCodeData ?? []).forEach(({ minerCode, abnormalCount: count }) => {
      const normalizedCode = minerCode.trim();
      if (!normalizedCode) return;
      const key = normalizedCode.toLowerCase();
      const previous = counts.get(key);
      if (previous) {
        previous.abnormalCount += Number(count ?? 0);
      } else {
        counts.set(key, { minerCode: normalizedCode, abnormalCount: Number(count ?? 0) });
      }
    });
  });

  const minerCodeData = Array.from(counts.values());
  return {
    abnormalCount,
    minerCodeTotal: minerCodeData.length,
    minerCodes: minerCodeData.map((item) => item.minerCode),
    minerCodeData,
  };
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
