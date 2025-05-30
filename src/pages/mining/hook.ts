import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchMiningHashRateList,
  fetchMiningPoolList,
  submitMiningPoolNew,
  submitMiningPoolUpdate,
} from "@/pages/mining/api.tsx";

export const useMiningPoolList = (poolType: string, poolCategory: string) => {
  return useQuery({
    queryKey: ["mining-pool-list", poolType, poolCategory],
    queryFn: () => fetchMiningPoolList(poolType, poolCategory),
  });
};

export const useMiningPoolNew = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitMiningPoolNew,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      queryClient.invalidateQueries(["mining-pool-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("新增矿池出错:", error);
    },
  });
};

export const useMiningPoolUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitMiningPoolUpdate,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      queryClient.invalidateQueries(["mining-pool-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("更新矿池出错:", error);
    },
  });
};

export const useMiningHashRateList = (poolType: string, poolCategory: string) => {
  return useQuery({
    queryKey: ["mining-hash-list", poolType, poolCategory],
    queryFn: () => fetchMiningHashRateList(poolType, poolCategory),
  });
};