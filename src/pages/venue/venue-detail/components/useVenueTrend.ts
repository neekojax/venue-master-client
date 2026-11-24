import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { WeeklyChartPoint } from "./weeklyMock";
import { useSelector, useSettingsStore } from "@/stores";
import { getLoginAccountId } from "@/utils/account-preferences";

const emptyPoints: WeeklyChartPoint[] = [];

// 日曲线按组织、场地和指标独立取数，周曲线直接使用周报已有的数据。
export function useVenueTrend<Row>(
  metric: string,
  mode: "day" | "week",
  weeklyData: WeeklyChartPoint[] | undefined,
  loadDaily: (organization: string, venueId: number) => Promise<{ data: Row[] }>,
  toPoint: (row: Row) => WeeklyChartPoint,
) {
  const accountId = getLoginAccountId();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const { venueId } = useParams<{ venueId: string }>();
  const daily = useQuery({
    queryKey: ["venue-daily-trend", accountId, poolType, venueId, metric],
    enabled: mode === "day" && Boolean(poolType && venueId),
    queryFn: async () => {
      const { data } = await loadDaily(poolType, Number(venueId));
      return data.map(toPoint).reverse();
    },
  });
  return {
    points: (mode === "week" ? weeklyData : daily.data) ?? emptyPoints,
    loading: mode === "day" && daily.isLoading,
  };
}
