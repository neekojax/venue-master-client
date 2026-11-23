import { useQuery } from "@tanstack/react-query";

import { checkPermission } from "@/service/api/auth";

export default function useAnomalyReasonPermissions(venueType: string) {
  const query = useQuery({
    queryKey: ["anomaly-reason-permissions", venueType],
    enabled: Boolean(venueType),
    queryFn: async () => {
      const { data } = await checkPermission();
      // 只读取当前组织的权限，同一用户在不同组织可以有不同的操作范围。
      const keys: string[] = data?.domains?.[venueType] ?? [];
      const all = keys.includes("system:all");
      return {
        canCreate: all || keys.includes("miner-agent-monitor:manage"),
        canEdit: all || keys.includes("miner-anomaly-reason:manage"),
      };
    },
  });
  return {
    canCreate: query.isSuccess && query.data.canCreate,
    canEdit: query.isSuccess && query.data.canEdit,
  };
}
