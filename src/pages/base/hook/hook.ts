import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchVenueTemplates,
  submitVenueTemplateChange,
  submitVenueTemplateDelete,
  submitVenueTemplateNew,
} from "@/pages/base/api.ts";

export const useVenueTemplates = () => {
  return useQuery({
    queryKey: ["venue-templates"],
    queryFn: fetchVenueTemplates,
  });
};

// 自定义 hook 用于提交模版变更
export const useSubmitVenueTemplateChange = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitVenueTemplateChange,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["venue-templates"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("提交模版变更时出错:", error);
    },
  });
};

// 自定义 hook 用于提交模版新增
export const useSubmitVenueTemplateNew = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitVenueTemplateNew,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["venue-templates"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("提交模版变更时出错:", error);
    },
  });
};

// 自定义 hook 用于提交模版新增
export const useSubmitVenueTemplateDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitVenueTemplateDelete,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["venue-templates"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("提交模版变更时出错:", error);
    },
  });
};
