import { useQuery } from "@tanstack/react-query";
import {
  fetchBoundSites,
  fetchLatestFinishedProbeTask,
  fetchRecentProbeTasks,
  fetchTaskSnapshots,
} from "./api";
import type { TaskSnapshotQueryParams, TimeRange } from "./types";

export const useBoundSites = () => {
  return useQuery({
    queryKey: ["miner-bound-sites"],
    queryFn: fetchBoundSites,
  });
};

export const useRecentProbeTasks = (siteCode: string | null, window: TimeRange) => {
  return useQuery({
    queryKey: ["miner-recent-probe-tasks", siteCode, window],
    queryFn: () => fetchRecentProbeTasks(siteCode!, window),
    enabled: !!siteCode,
  });
};

export const useLatestFinishedProbeTask = (siteCode: string | null) => {
  return useQuery({
    queryKey: ["miner-latest-finished-probe-task", siteCode],
    queryFn: () => fetchLatestFinishedProbeTask(siteCode!),
    enabled: !!siteCode,
  });
};

export const useTaskSnapshots = (
  taskIdsParam: string | null | undefined,
  params: TaskSnapshotQueryParams,
) => {
  return useQuery({
    queryKey: ["miner-task-snapshots", taskIdsParam, params],
    queryFn: () => fetchTaskSnapshots(taskIdsParam!, params),
    enabled: !!taskIdsParam,
  });
};
