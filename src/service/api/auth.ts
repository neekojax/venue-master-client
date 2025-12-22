import { fetchGet } from "@/helper/fetchHelper";

// 添加模版 /passport/roles
export const checkPermission = async () => {
  return await fetchGet("/passport/roles");
};
