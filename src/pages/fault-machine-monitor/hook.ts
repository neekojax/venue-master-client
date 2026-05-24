import { useQuery } from "@tanstack/react-query";
import { fetchAbnormalLogs, fetchAbnormalLogsTrend } from "./api";
import type { AbnormalLogQueryParams, FaultTimeRange } from "./types";

export const useAbnormalLogsTrend = (window: FaultTimeRange, code?: string) => {
  return useQuery({
    queryKey: ["abnormal-logs-trend", window, code ?? ""],
    queryFn: () => fetchAbnormalLogsTrend({ window, code }),
  });
};

export const useAbnormalLogs = (params: AbnormalLogQueryParams) => {
  return useQuery({
    queryKey: ["abnormal-logs", params],
    queryFn: () => fetchAbnormalLogs(params),
  });
};
