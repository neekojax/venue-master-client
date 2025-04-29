import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchCustodyInfoList,
  fetchCustodyStatisticsList, fetchDailyAveragePrice,
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

export const useCustodyInfoDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitCustodyInfoDelete,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
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
      queryClient.invalidateQueries(["custody-info-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("新增托管信息出错:", error);
    },
  });
};

export const useCustodyStatisticsList = (timeRange: string) => {
  return useQuery({
    queryKey: ["custody-statistics-list", timeRange],
    queryFn: fetchCustodyStatisticsList,
  });
};

export const useDailyAveragePriceList = () => {
  return useQuery({
    queryKey: ["daily-average-price"],
    queryFn: fetchDailyAveragePrice,
  });
};
