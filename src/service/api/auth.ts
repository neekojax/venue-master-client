import { fetchGet } from "@/helper/fetchHelper";

// 当前登录主体的最终授权快照
export const checkPermission = async () => {
  const response: any = await fetchGet("/profile/authorization");
  if (response?.success !== true || response?.code !== 0) {
    throw new Error(response?.message || "获取授权信息失败");
  }
  return response;
};
