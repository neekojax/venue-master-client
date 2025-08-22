import { fetchDelete, fetchGet, fetchPost } from "@/helper/fetchHelper.ts";
import { EventLogParam, VenueInfoParam } from "@/pages/venue/type.tsx";

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

export const fetchEventLog = async (poolType: string) => {
  return await fetchGet(`/event/listEvent/${poolType}`);
};

export const newEventLog = async (poolType: string, data: EventLogParam) => {
  return await fetchPost(`/event/createEvent/${poolType}`, data);
};

export const updateEventLog = async (data: EventLogParam) => {
  return await fetchPost(`/event/updateEvent`, data);
};

export const deleteEventLog = async (id: number) => {
  return await fetchDelete(`/event/deleteEvent/${id}`);
};
// 获取资产汇总数据
export const getVenueDailyStat = async (venueID: number, data: string) => {
  return await fetchGet(`/venue/getVenueDailyStat/${venueID}/${data}`);
};
