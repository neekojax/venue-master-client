import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  createHostRecord,
  createPoolRecord,
  deleteHostRecord,
  deletePoolRecord,
  fetchAssetSiteInfoList,
  fetchHostRecordList,
  fetchMiningHashRateList,
  fetchMiningPoolList,
  fetchPoolRecordList,
  submitAssetSiteInfoMappingUpdate,
  submitMiningPoolDelete,
  submitMiningPoolNew,
  submitMiningPoolUpdate,
  updateHostRecord,
  updatePoolRecord,
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
      // @ts-ignore
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
      // @ts-ignore
      queryClient.invalidateQueries(["mining-pool-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("更新矿池出错:", error);
    },
  });
};

export const useMiningPoolDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitMiningPoolDelete,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
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

export const useAssetSiteInfoList = (enabled = true) => {
  return useQuery({
    queryKey: ["asset-site-info-list"],
    queryFn: fetchAssetSiteInfoList,
    enabled,
  });
};

export const useAssetSiteInfoUpdateMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitAssetSiteInfoMappingUpdate,
    onSuccess: () => {
      // @ts-ignore
      queryClient.invalidateQueries(["asset-site-info-list"]);
    },
    onError: (error) => {
      console.error("更新资产场地映射出错:", error);
    },
  });
};

// 获取操作日志
export const usePoolRecordList = (poolId: string) => {
  return useQuery({
    queryKey: ["pool-list", poolId], // 缓存标识
    queryFn: () => fetchPoolRecordList(poolId),
  });
};

export const usePoolRecordCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPoolRecord,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["pool-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("新增出错:", error);
    },
  });
};

export const usePoolRecordUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePoolRecord,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["pool-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("更新出错:", error);
    },
  });
};

export const usePoolRecordDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePoolRecord,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["pool-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("删除出错:", error);
    },
  });
};

// 获取操作日志
export const useHostRecordList = (poolId: string) => {
  return useQuery({
    queryKey: ["host-list", poolId], // 缓存标识
    queryFn: () => fetchHostRecordList(poolId),
  });
};

export const useHostRecordCreate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createHostRecord,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["host-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("新增出错:", error);
    },
  });
};

export const useHostRecordUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateHostRecord,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["host-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("更新出错:", error);
    },
  });
};

export const useHostRecordDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHostRecord,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["host-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("删除出错:", error);
    },
  });
};
