// useVenueTemplates.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  fetchVenueRecord,
  fetchVenueTemplateFields,
  fetchVenueTemplateList,
  submitVenueRecord,
  submitVenueRecordDelete,
  submitVenueRecordUpdate,
} from "@/pages/venue/api.ts";

export const useVenueTemplateList = () => {
  return useQuery({
    queryKey: ["venue-template-list"],
    queryFn: fetchVenueTemplateList,
  });
};

export const useVenueTemplateFields = (templateId: any) => {
  return useQuery({
    queryKey: ["venue-template-fields", templateId],
    queryFn: () => fetchVenueTemplateFields(templateId),
    enabled: !!templateId, // 只有在 templateId 存在时才查询
  });
};

export const useVenueRecord = (templateId: any) => {
  return useQuery({
    queryKey: ["venue-venue-record", templateId],
    queryFn: () => fetchVenueRecord(templateId),
    enabled: !!templateId, // 只有在 templateId 存在时才查询
  });
};

export const useVenueRecordNew = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitVenueRecord,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      queryClient.invalidateQueries(["venue-template-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("提交模版变更时出错:", error);
    },
  });
};

export const useVenueRecordDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitVenueRecordDelete,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      // @ts-ignore
      queryClient.invalidateQueries(["venue-template-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("提交模版变更时出错:", error);
    },
  });
};

export const useVenueRecordUpdate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitVenueRecordUpdate,
    onSuccess: () => {
      // 在成功提交后，可能需要刷新 venue-templates 数据
      queryClient.invalidateQueries(["venue-template-list"]);
    },
    onError: (error) => {
      // 错误处理
      console.error("提交模版变更时出错:", error);
    },
  });
};
