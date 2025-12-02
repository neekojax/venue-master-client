// useVenueTemplates.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosResponse } from "axios";

import {
  deleteEventLog,
  fetchEventLog,
  fetchVenueList,
  getAllVEvent,
  listEventPage,
  newEventLog,
  newVenue,
  updateEventLog,
  updateVenue,
} from "@/pages/venue/api.tsx";
import { EventLogParam, VenueInfoParam } from "@/pages/venue/type.tsx";

// 自定义 Hook: 使用场地列表
export const useVenueList = (poolType: string) => {
  return useQuery({
    queryKey: ["venue-list", poolType], // 添加 poolType 到 queryKey
    queryFn: () => fetchVenueList(poolType), // 传递 poolType 参数
  });
};

// 自定义 Hook: 使用场地列表
export const useListEventPage = (poolType: string, params: { page: number; pageSize: number }) => {
  return useQuery({
    queryKey: ["event-log-Page", poolType], // 添加 poolType 到 queryKey
    queryFn: () => listEventPage(poolType, params), // 传递 poolType 参数
  });
};

// 聚合分页：每次取 pageSize=100，直到拿完所有数据
export const useAllEventPages = (poolType: string, pageSize = 1000) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ["event-log-all", poolType, pageSize],
    queryFn: async () => {
      let page = 1;
      // 先返回第一页数据，保证前端快速展示
      const first = await listEventPage(poolType, { page, pageSize });
      const firstData = first?.data?.data || [];
      const total = Number(first?.data?.total ?? firstData.length);
      const initial = { data: firstData, total };

      // 异步继续加载剩余页码，并逐步写入缓存，前端列表会自动扩充
      const totalPages = Math.ceil(total / pageSize);
      if (totalPages > 1) {
        (async () => {
          let allItems = [...firstData];
          for (page = 2; page <= totalPages; page++) {
            const resp = await listEventPage(poolType, { page, pageSize });
            const items = resp?.data?.data || [];
            if (!items.length) break; // 防御：无数据则提前结束
            allItems = allItems.concat(items);
            // 更新 react-query 缓存，让使用该 Hook 的组件逐步拿到更多数据
            queryClient.setQueryData(["event-log-all", poolType, pageSize], { data: allItems, total });
            if (allItems.length >= total) break; // 已经拉满
          }
        })();
      }

      return initial;
    },
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

// 自定义 Hook: 使用场地列表
export const useEventLogList = (poolType: string, Eventid: number) => {
  return useQuery({
    queryKey: ["event-log-list", Eventid], // 添加 poolType 到 queryKey
    queryFn: () => getAllVEvent(poolType, Number(Eventid)), // 传递 poolType 参数
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
