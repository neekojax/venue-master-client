// 增加矿池
import { fetchDelete, fetchGet, fetchPost } from "@/helper/fetchHelper.ts";
import { MiningPool, MiningPoolUpdate, PoolRecordCreate, PoolRecordUpdate } from "@/pages/mining/type.tsx";

export const fetchMiningPoolList = async (poolType: string, poolCategory: string) => {
  return await fetchGet(`miningPool/listBtcMiningPool/${poolType}/${poolCategory}`);
};

export const submitMiningPoolNew = async (data: MiningPool) => {
  return await fetchPost("miningPool/createBtcMiningPool", data);
};

export const submitMiningPoolUpdate = async (data: MiningPoolUpdate) => {
  return await fetchPost("miningPool/updateBtcMiningPool", data);
};

// 删除模版
export const submitMiningPoolDelete = async (id: number) => {
  return await fetchDelete(`miningPool/deleteBtcMiningPool/${id}`);
};

export const fetchMiningHashRateList = async (poolType: string, poolCategory: string) => {
  return await fetchGet(`miningPool/listBtcMiningPoolHashRate/${poolType}/${poolCategory}`);
};

export const fetchTotalRealTimeStatus = async (poolType: string) => {
  return await fetchGet(`miningPool/getTotalRealTimeHashStatus/${poolType}`);
};

export const fetchTotalLastHashStatus = async (poolType: string) => {
  return await fetchGet(`miningPool/getTotalLastHashStatus/${poolType}`);
};

export const fetchTotalLastProfitStatus = async (poolType: string) => {
  return await fetchGet(`miningPool/getTotalLastProfitStatus/${poolType}`);
};

export const fetchLastestHashRateEfficiency = async (poolType: string, day: string) => {
  return await fetchGet(`miningPool/getHashRateEfficiency/${poolType}/${day}`);
};

export const fetchLastestHashRate = async (poolType: string, day: string) => {
  return await fetchGet(`miningPool/getLastestHashRate/${poolType}/${day}`);
};
// 获取算力率
export const fetchHomesuanli = async (poolType: string, day: string) => {
  return await fetchGet(`network/stat/${poolType}/${day}`);
};

// 获取操作日志
export const fetchPoolRecordList = async (poolId: string) => {
  return await fetchGet(`pool/record/list/${poolId}`);
};
//添加操作日志
export const createPoolRecord = async (data: PoolRecordCreate) => {
  return await fetchPost("pool/record/create", data);
};
//更新操作日志
export const updatePoolRecord = async (data: PoolRecordUpdate) => {
  return await fetchPost("pool/record/update", data);
};
// 删除操作日志
export const deletePoolRecord = async (id: number) => {
  return await fetchDelete(`pool/record/delete/${id}`);
};
