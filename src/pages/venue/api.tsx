import { fetchDelete, fetchGet, fetchPost, fetchPostFile } from "@/helper/fetchHelper.ts";
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
export const getVenueBasicInfo = async (poolType: string, venueID: number) => {
  return await fetchGet(`/venue/getVenueBasicInfo/${poolType}/${venueID}`);
};

// 获取资产汇总数据
export const getVenueDailyStat = async (poolType: string, venueID: number, data: string) => {
  return await fetchGet(`/venue/getVenueDailyStat/${poolType}/${venueID}/${data}`);
};

// 获取近10天经营日报数据
export const getLast10DaysDailyStat = async (poolType: string, venueID: number) => {
  return await fetchGet(`/venue/getLast10DaysDailyStat/${poolType}/${venueID}`);
};

// 获取近10天事件日志数据
export const getLast10Event = async (poolType: string, venueID: number) => {
  return await fetchGet(`/venue/getLast10Event/${poolType}/${venueID}`);
};

// 获取近30天有效率影响曲线图///venue/getLast30DaysEffectiveRate
export const getLast30DaysEffectiveRate = async (poolType: string, venueID: number) => {
  return await fetchGet(`/venue/getLast30DaysEffectiveRate/${poolType}/${venueID}`);
};

// 获取近30天故障影响曲线图
export const getLast30DaysFailureRate = async (poolType: string, venueID: number) => {
  return await fetchGet(`/venue/getLast30DaysFailureRate/${poolType}/${venueID}`);
};

// 获取近30天高温影响曲线图
export const getLast30DaysHighTemperatureImpactRate = async (poolType: string, venueID: number) => {
  return await fetchGet(`/venue/getLast30DaysHighTemperatureImpactRate/${poolType}/${venueID}`);
};

// 获取近30天限电影响曲线图
export const getLast30DaysLimitImpactRate = async (poolType: string, venueID: number) => {
  return await fetchGet(`/venue/getLast30DaysLimitImpactRate/${poolType}/${venueID}`);
};

///venue/getAllVEvent
export const getAllVEvent = async (poolType: string, venueID: number) => {
  return await fetchGet(`/venue/getAllVEvent/${poolType}/${venueID}`);
};

// Excel文件上传
export const uploadVenueExcel = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return await fetchPostFile("/powerConsumption/import", formData).then((response: any) => {
    if (!response?.success) {
      console.log("response?.code", response?.code);
      console.log("response?.message", response?.message);
      throw new Error(`API error! code: ${response?.code}, message: ${response?.message}`);
    }
    return response;
  });
};
