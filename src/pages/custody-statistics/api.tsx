import { fetchDelete, fetchGet, fetchPost } from "@/helper/fetchHelper.ts";
import { CustodyInfoNew, CustodyInfoUpdate } from "@/pages/custody-statistics/type.tsx";

export const fetchCustodyInfoList = async () => {
  return await fetchGet("custody/custodyInfoList");
};

// 增加托管信息
export const submitCustodyInfoNew = async (data: CustodyInfoNew) => {
  return await fetchPost("custody/newCustodyInfo", data);
};

// 删除托管信息
export const submitCustodyInfoDelete = async (custodyInfoId: number) => {
  return await fetchDelete(`custody/deleteCustodyInfo/${custodyInfoId}`);
};

// 删除记录
export const submitCustodyUpdate = async (data: CustodyInfoUpdate) => {
  return await fetchPost("custody/updateCustodyInfo", data);
};

// 获取托管统计信息
export const fetchCustodyStatisticsList = async ({ queryKey }: { queryKey: [string, string, string] }) => {
  const [_key, timeRange, poolType] = queryKey; // 解构参数
  console.log(_key);
  return await fetchGet(`custody/custodyStatisticsList/${timeRange}/${poolType}`);
};

// 获取BTC每日均价
export const fetchDailyAveragePrice = async () => {
  return await fetchGet(`custody/dailyAveragePriceList`);
};

// 获取托管费比例变化
// /custody/getCustodyStatisticsHistory
// "venue id": [102],"interval":"30"
export const fetchCustodyFeeRatioHistory = async ({ venueId }: { venueId: number }) => {
  return await fetchPost(`custody/getCustodyStatisticsHistory`, {
    venue_id: [venueId],
    interval: 180,
  });
};

// 获取180天内的BTC每日均价
///custody/dailyBtcPrice/180 获取180天内的BTC每日均价
export const fetchDailyBtcPrice = async ({ venueId }: { venueId: number }) => {
  return await fetchGet(`custody/dailyBtcPrice/${venueId}`);
};

// 按月获取托管统计信息
// /custody/monthlyCustodyStatistics/CANG/2025-09-01/2025-09-30
export const fetchMonthlyCustodyStatistics = async ({
  queryKey,
}: {
  queryKey: [string, string, string, string];
}) => {
  const [_key, poolType, startDate, endDate] = queryKey; // 解构参数
  console.log(_key);
  return await fetchGet(`custody/monthlyCustodyStatistics/${poolType}/${startDate}/${endDate}`);
};
