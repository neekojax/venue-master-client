// 增加矿池
import axiosInstance from "@/helper/axiosInstance";
import { fetchDelete, fetchGet, fetchPost, fetchPostFile } from "@/helper/fetchHelper.ts";
import {
  AssetPoolRecordCreate,
  AssetPoolRecordRebuild,
  AssetPoolRecordUpdate,
  AssetSiteMappingUpdate,
  HostRecordCreate,
  HostRecordUpdate,
  MiningPool,
  MiningPoolUpdate,
  PoolRecordCreate,
  PoolRecordUpdate,
} from "@/pages/mining/type.tsx";

const ensureCodeSuccess = <T,>(
  result: T & { success?: boolean; code?: number; message?: string; msg?: string },
) => {
  if (result?.success === true || result?.code === 0) {
    return result;
  }

  throw new Error(result?.message || result?.msg || "操作失败");
};

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

export const fetchRecentSubAccountStatus = async (venueType: string, poolId: string) => {
  return await fetchGet(`/venue/getRecentSubAccountStatus/${venueType}/${poolId}`);
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

// 获取操作日志
export const fetchHostRecordList = async (poolId: string) => {
  return await fetchGet(`hosting/record/list/${poolId}`);
};
//添加操作日志
export const createHostRecord = async (data: HostRecordCreate) => {
  return await fetchPost("hosting/record/create", data);
};
//更新操作日志
export const updateHostRecord = async (data: HostRecordUpdate) => {
  return await fetchPost("hosting/record/update", data);
};
// 删除操作日志
export const deleteHostRecord = async (id: number) => {
  return await fetchDelete(`miningPool/deleteHostRecord/${id}`);
};

// Excel文件上传
export const uploadMiningPoolExcel = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return await fetchPostFile("/hosting/import", formData).then((response: any) => {
    if (!response?.success) {
      console.log("response?.code", response?.code);
      console.log("response?.message", response?.message);
      throw new Error(`API error! code: ${response?.code}, message: ${response?.message}`);
    }
    return response;
  });
};

export const fetchAssetSiteInfoList = async () => {
  return await fetchGet("/asset/site-info");
};

export const submitAssetSiteInfoMappingUpdate = async (data: AssetSiteMappingUpdate) => {
  return await fetchPost("/asset/site-info/update-mapping", data);
};

export const fetchAssetPoolRecordList = async (poolId: string) => {
  const result = await axiosInstance.get(`/asset/pool-record/list/${poolId}`);
  return ensureCodeSuccess(result);
};

export const createAssetPoolRecord = async (data: AssetPoolRecordCreate) => {
  const result = await axiosInstance.post("/asset/pool-record/create", data);
  return ensureCodeSuccess(result);
};

export const updateAssetPoolRecord = async (data: AssetPoolRecordUpdate) => {
  const result = await axiosInstance.post("/asset/pool-record/update", data);
  return ensureCodeSuccess(result);
};

export const deleteAssetPoolRecord = async (id: number) => {
  const result = await axiosInstance.delete(`/asset/pool-record/delete/${id}`);
  return ensureCodeSuccess(result);
};

export const rebuildAssetPoolRecord = async (data: AssetPoolRecordRebuild) => {
  const result = await axiosInstance.post("/asset/pool-record/rebuild", data);
  return ensureCodeSuccess(result);
};
