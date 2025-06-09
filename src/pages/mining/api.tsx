// 增加矿池
import { fetchGet, fetchPost } from "@/helper/fetchHelper.ts";
import { MiningPool } from "@/pages/mining/type.tsx";

export const fetchMiningPoolList = async (poolType: string, poolCategory: string) => {
  return await fetchGet(`miningPool/listBtcMiningPool/${poolType}/${poolCategory}`);
};

export const submitMiningPoolNew = async (data: MiningPool) => {
  return await fetchPost("miningPool/createBtcMiningPool", data);
};

export const submitMiningPoolUpdate = async (data: MiningPool) => {
  return await fetchPost("miningPool/updateBtcMiningPool", data);
};

export const fetchMiningHashRateList = async (poolType: string, poolCategory: string) => {
  return await fetchGet(`miningPool/listBtcMiningPoolHashRate/${poolType}/${poolCategory}`);
};

export const fetchTotalRealTimeStatus = async (poolType: string) => {
  return await fetchGet(`miningPool/getTotalRealTimeStatus/${poolType}`);
};

export const fetchTotalLastDayStatus = async (poolType: string) => {
  return await fetchGet(`miningPool/getTotalLastDayStatus/${poolType}`);
};

export const fetchTotalLastWeekStatus = async (poolType: string) => {
  return await fetchGet(`miningPool/getTotalLastWeekStatus/${poolType}`);
};

export const fetchLastestHashRateEfficiency = async (poolType: string, day: string) => {
  return await fetchGet(`miningPool/getHashRateEfficiency/${poolType}/${day}`);
};

export const fetchLastestHashRate = async (poolType: string, day: string) => {
  return await fetchGet(`miningPool/getLastestHashRate/${poolType}/${day}`);
};
