// useVenueTemplates.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

import {
  deleteEventLog,
  fetchEventLog,
  fetchVenueList,
  newEventLog,
  newVenue,
  updateEventLog,
  updateVenue,
} from "@/pages/venue/api.tsx";
import { EventLogParam, VenueInfoParam } from "@/pages/venue/type.tsx";

// 自定义 Hook: 使用场地列表
export const useVenueList = (poolType: any) => {
  return useQuery({
    queryKey: ["venue-list", poolType], // 添加 poolType 到 queryKey
    queryFn: () => fetchVenueList(poolType), // 传递 poolType 参数
  });
};

// 定义参数类型
interface MutationParams {
  poolType: string; // 根据您的实际类型定义
  data: VenueInfoParam; // 根据您的数据结构定义
}

// 自定义 Hook: 使用创建新场地
export const useVenueNew = () => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<any, any>, Error, MutationParams>({
    mutationFn: ({ poolType, data }: MutationParams) => newVenue(poolType, data), // 修改为接受对象并传递两个参数
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["venue-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("提交变更时出错:", error);
    },
  });
};

export const useVenueUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateVenue,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["venue-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("提交变更时出错:", error);
    },
  });
};

// 自定义 Hook: 使用场地列表
export const useEventList = (poolType: string) => {
  return useQuery({
    queryKey: ["event-list", poolType], // 添加 poolType 到 queryKey
    queryFn: () => fetchEventLog(poolType), // 传递 poolType 参数
  });
};

// 定义参数类型
interface EventMutationParams {
  poolType: string; // 根据您的实际类型定义
  data: EventLogParam; // 根据您的数据结构定义
}

// 自定义 Hook: 使用创建新场地
export const useEventNew = () => {
  const queryClient = useQueryClient();
  return useMutation<AxiosResponse<any, any>, Error, EventMutationParams>({
    mutationFn: ({ poolType, data }: EventMutationParams) => newEventLog(poolType, data), // 修改为接受对象并传递两个参数
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["event-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("提交变更时出错:", error);
    },
  });
};

export const useEventUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEventLog,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["event-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("提交变更时出错:", error);
    },
  });
};

export const useDeleteUpdate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEventLog,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["event-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("提交变更时出错:", error);
    },
  });
};
