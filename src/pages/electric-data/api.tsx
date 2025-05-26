import { fetchGet, fetchPost } from "@/helper/fetchHelper.ts";
import { SettlementQueryParam, SettlementQueryWithPageParam } from "@/pages/electric-data/type.tsx";

export const fetchSettlementPoints = async (type: any) => {
  return await fetchGet(`settlement/settlementPointList/${type}`);
};

export const fetchSettlementData = async (data: SettlementQueryParam) => {
  return await fetchPost("settlement/findSettlementData", data);
};

export const fetchSettlementAverage = async (data: SettlementQueryParam) => {
  return await fetchPost("settlement/findSettlementAverage", data);
};

export const fetchSettlementDataWithPagination = async (data: SettlementQueryWithPageParam) => {
  return await fetchPost("settlement/findSettlementDataWithPagination", data);
};

export const downloadSettlementData = async (data: SettlementQueryWithPageParam) => {
  return await fetchPost("settlement/downloadSettlementData", data);
};