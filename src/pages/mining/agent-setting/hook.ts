import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createSiteAgentBinding,
  deleteSiteAgentBinding,
  fetchSiteAgentBindings,
  fetchSiteDailyAnomalyRefreshTask,
  refreshAllSiteDailyAnomalyStats,
  refreshSiteDailyAnomalyStats,
  updateSiteAgentBinding,
} from "./api";
import type { SiteAgentBindingPayload, SiteAgentBindingQueryParams } from "./types";

export const useSiteAgentBindings = (venueType: string, params: SiteAgentBindingQueryParams) => {
  return useQuery({
    queryKey: ["site-agent-bindings", venueType, params],
    queryFn: () => fetchSiteAgentBindings(venueType, params),
    enabled: Boolean(venueType),
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateSiteAgentBinding = (venueType: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SiteAgentBindingPayload) => createSiteAgentBinding(venueType, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["site-agent-bindings", venueType] });
    },
  });
};

export const useUpdateSiteAgentBinding = (venueType: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ agentName, payload }: { agentName: string; payload: SiteAgentBindingPayload }) =>
      updateSiteAgentBinding(venueType, agentName, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["site-agent-bindings", venueType] });
    },
  });
};

export const useDeleteSiteAgentBinding = (venueType: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (agentName: string) => deleteSiteAgentBinding(venueType, agentName),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["site-agent-bindings", venueType] });
    },
  });
};

export const useRefreshSiteDailyAnomalyStats = (venueType: string) => {
  return useMutation({
    mutationFn: (siteCode: string) => refreshSiteDailyAnomalyStats(venueType, siteCode),
  });
};

export const useRefreshAllSiteDailyAnomalyStats = (venueType: string) => {
  return useMutation({
    mutationFn: () => refreshAllSiteDailyAnomalyStats(venueType),
  });
};

export const useSiteDailyAnomalyRefreshTask = (venueType: string, taskId: string | null) => {
  return useQuery({
    queryKey: ["site-daily-anomaly-refresh-task", venueType, taskId],
    queryFn: () => fetchSiteDailyAnomalyRefreshTask(venueType, taskId!),
    enabled: Boolean(venueType) && Boolean(taskId),
    refetchInterval: (query) => {
      const status = query.state.data?.data?.status;
      if (!status || status === "pending" || status === "running") {
        return 2000;
      }
      return false;
    },
  });
};
