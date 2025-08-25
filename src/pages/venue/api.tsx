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
// 获取场地详情
export const getVenueBasicInfo = async (venueID: number) => {
  return await fetchGet(`/venue/getVenueBasicInfo/${venueID}`);
};

// 获取资产汇总数据
export const getVenueDailyStat = async (venueID: number, data: string) => {
  return await fetchGet(`/venue/getVenueDailyStat/${venueID}/${data}`);
};

// 获取近10天经营日报数据
export const getLast10DaysDailyStat = async (venueID: number) => {
  return await fetchGet(`/venue/getLast10DaysDailyStat/${venueID}`);
};

// 获取近10天事件日志数据
export const getLast10Event = async (venueID: number) => {
  return await fetchGet(`/venue/getLast10Event/${venueID}`);
};

// 获取近30天有效率影响曲线图///venue/getLast30DaysEffectiveRate
export const getLast30DaysEffectiveRate = async (venueID: number) => {
  return await fetchGet(`/venue/getLast30DaysEffectiveRate/${venueID}`);
};

// 获取近30天故障影响曲线图
export const getLast30DaysFailureRate = async (venueID: number) => {
  return await fetchGet(`/venue/getLast30DaysFailureRate/${venueID}`);
};

// 获取近30天高温影响曲线图
export const getLast30DaysHighTemperatureImpactRate = async (venueID: number) => {
  return await fetchGet(`/venue/getLast30DaysHighTemperatureImpactRate/${venueID}`);
};

// 获取近30天限电影响曲线图
export const getLast30DaysLimitImpactRate = async (venueID: number) => {
  return await fetchGet(`/venue/getLast30DaysLimitImpactRate/${venueID}`);
};

///venue/getAllVEvent
export const getAllVEvent = async (venueID: number) => {
  return await fetchGet(`/venue/getAllVEvent/${venueID}`);
};

///venue/getLast10DaysDailystat/:venueID"//
///venue/getLast10Event/:venueID
//
//venue/getLast30DaysLimitImpactRate/:venueID
///venue/getLast30DaysFailureRate/:venueID"
///venue/getLast30DaysHighTemperatureImpactRate/:venueID"
///venue/getLast30DaysLimitImpactRate/:venueID"
