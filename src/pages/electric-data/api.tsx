import { fetchGet, fetchPost } from "@/helper/fetchHelper.ts";
import { SettlementQueryParam } from "@/pages/electric-data/type.tsx";

export const fetchSettlementPoints = async () => {
  return await fetchGet("settlement/settlementPointList");
};

export const fetchSettlementData = async (data: SettlementQueryParam) => {
  return await fetchPost("settlement/findSettlementData", data);
};

export const fetchSettlementAverage = async (data: SettlementQueryParam) => {
  return await fetchPost("settlement/findSettlementAverage", data);
};
