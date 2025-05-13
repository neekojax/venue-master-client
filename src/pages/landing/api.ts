// 获取托管统计信息
import { fetchGet } from "@/helper/fetchHelper.ts";

export const fetchCustodyHostingFeeCurve = async () => {
  return await fetchGet(`custody/hostingFeeRatioList`);
};
