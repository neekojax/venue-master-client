import { fetchGet, fetchPost } from "@/helper/fetchHelper.ts";
import { VenueInfoParam } from "@/pages/venue/type.tsx";

export const fetchMiningPoolRunningData = async (poolType: string) => {
  return await fetchGet(`miningPool/listMiningPoolRunningData/${poolType}`);
};

export const fetchVenueList = async (poolType: string) => {
  return await fetchGet(`/venue/listVenue/${poolType}`);
};

export const newVenue = async (poolType: string, data: VenueInfoParam) => {
  return await fetchPost(`/venue/createVenue/${poolType}`, data);
};

export const updateVenue = async (data: VenueInfoParam) => {
  return await fetchPost(`/venue/updateVenue`, data);
};
