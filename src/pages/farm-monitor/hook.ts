import { useQuery } from "@tanstack/react-query";
import {
  fetchBoundSites,
  fetchLatestFinishedProbeTask,
  fetchRecentProbeTasks,
  fetchTaskSnapshots,
} from "./api";
import type { TaskSnapshotQueryParams, TimeRange } from "./types";

export const useBoundSites = (venueType: string) => {
  return useQuery({
    queryKey: ["miner-bound-sites", venueType],
    queryFn: () => fetchBoundSites(venueType),
    enabled: Boolean(venueType),
  });
};

export const useRecentProbeTasks = (venueType: string, siteCode: string | null, window: TimeRange) => {
  return useQuery({
    queryKey: ["miner-recent-probe-tasks", venueType, siteCode, window],
    queryFn: () => fetchRecentProbeTasks(venueType, siteCode!, window),
    enabled: Boolean(venueType) && !!siteCode,
  });
};

export const useLatestFinishedProbeTask = (venueType: string, siteCode: string | null) => {
  return useQuery({
    queryKey: ["miner-latest-finished-probe-task", venueType, siteCode],
    queryFn: () => fetchLatestFinishedProbeTask(venueType, siteCode!),
    enabled: Boolean(venueType) && !!siteCode,
  });
};

export const useTaskSnapshots = (
  venueType: string,
  taskIdsParam: string | null | undefined,
  params: TaskSnapshotQueryParams,
) => {
  return useQuery({
    queryKey: ["miner-task-snapshots", venueType, taskIdsParam, params],
    queryFn: () => fetchTaskSnapshots(venueType, taskIdsParam!, params),
    enabled: Boolean(venueType) && !!taskIdsParam,
  });
};
