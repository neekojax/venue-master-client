import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchCustodyInfoList,
  fetchCustodyStatisticsList,
  fetchDailyAveragePrice,
  fetchDailyHostingFeeRatio,
  fetchMonthlyCustodyStatistics,
  fetchMonthlyHostingFeeRatio,
  submitCustodyInfoDelete,
  submitCustodyInfoNew,
  submitCustodyUpdate,
} from "@/pages/custody-statistics/api.tsx";

export const useCustodyInfoList = () => {
  return useQuery({
    queryKey: ["custody-info-list"],
    queryFn: fetchCustodyInfoList,
  });
};

export const useDailyHostingFeeRatioList = (timeRange: string, poolType: string) => {
  return useQuery({
    queryKey: ["daily-hosting-fee-ratio-list", timeRange, poolType],
    queryFn: fetchDailyHostingFeeRatio,
  });
};

export const useMonthlyHostingFeeRatioList = (poolType: string, startTime: string, endTime: string) => {
  return useQuery({
    queryKey: ["monthly-hosting-fee-ratio-list", poolType, startTime, endTime],
    queryFn: fetchMonthlyHostingFeeRatio,
  });
};

export const useCustodyInfoDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitCustodyInfoDelete,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["custody-info-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("删除托管信息出错:", error);
    },
  });
};

export const useCustodyInfoUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitCustodyUpdate,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["custody-info-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("更新托管信息出错:", error);
    },
  });
};

export const useCustodyInfoNew = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitCustodyInfoNew,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["custody-info-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("新增托管信息出错:", error);
    },
  });
};

export const useCustodyStatisticsList = (timeRange: string, poolType: string) => {
  return useQuery({
    queryKey: ["custody-statistics-list", timeRange, poolType],
    queryFn: fetchCustodyStatisticsList,
  });
};

export const useMonthlyCustodyStatisticsList = (poolType: string, startTime: string, endTime: string) => {
  return useQuery({
    queryKey: ["monthly-custody-statistics-list", poolType, startTime, endTime],
    queryFn: fetchMonthlyCustodyStatistics,
  });
};

export const useDailyAveragePriceList = () => {
  return useQuery({
    queryKey: ["daily-average-price"],
    queryFn: fetchDailyAveragePrice,
  });
};
