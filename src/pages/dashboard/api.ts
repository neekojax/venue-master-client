// 获取托管统计信息
import { fetchGet } from "@/helper/fetchHelper.ts";

// export const fetchCustodyHostingFeeCurve = async () => {
//   return await fetchGet(`custody/hostingFeeRatioList`);
// };

export const fetchMiningBenefitLine = async (poolType: string, day: string) => {
  return await fetchGet(`miningPool/getLastestProfitLineData/${poolType}/${day}`);
};
