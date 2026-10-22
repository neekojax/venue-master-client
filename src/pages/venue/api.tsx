import { fetchDelete, fetchGet, fetchPost, fetchPostFile } from "@/helper/fetchHelper.ts";
import { EventLogParam, VenueInfoParam } from "@/pages/venue/type.tsx";
import type {
  RawVenueWeeklyPageResponse,
  RawVenueWeeklyReportResponse,
} from "@/pages/venue/venue-detail/components/weeklyMock";

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

// event/listEventPage/CANG
export const listEventPage = async (poolType: string, data: { page: number; pageSize: number }) => {
  const { page, pageSize } = data || {};
  // 正常传参：将分页参数作为查询字符串传递
  const url = `/event/listEventPage/${poolType}?page=${encodeURIComponent(String(page))}&pageSize=${encodeURIComponent(
    String(pageSize),
  )}`;
  return await fetchGet(url);
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

// 获取最近10周场地周报数据（包含4条周曲线 + 周报明细）
export const getRecent10WeeksWeeklyReport = async (
  poolType: string,
  venueID: number,
): Promise<{ data: RawVenueWeeklyReportResponse }> => {
  return await fetchGet(`/venue/getRecent10WeeksWeeklyReport/${poolType}/${venueID}`);
};

export const getWeeklyReportPage = async (
  poolType: string,
  venueID: number,
  page = 1,
  pageSize = 10,
): Promise<{ data: RawVenueWeeklyPageResponse }> => {
  return await fetchGet(`/venue/getWeeklyReportPage/${poolType}/${venueID}`, {
    page,
    pageSize,
  });
};

export const downloadAllWeeklyReports = async (poolType: string, venueID: number) => {
  return await fetchGet(`/venue/downloadAllWeeklyReports/${poolType}/${venueID}`, undefined, {
    responseType: "blob",
  });
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

// 天气预报接口
// weather/list/:venueType/:date"
export const fetchWeatherList = async (poolType: string, date: string) => {
  return await fetchGet(`/weather/list/${poolType}/${date}`);
};
// /powerConsumption/list
export const fetchPowerConsumptionList = async () => {
  return await fetchGet(`/powerConsumption/list`);
};

// /hosting/record/listAll
export const fetchHostingRecordListAll = async () => {
  return await fetchGet(`/hosting/record/listAll`);
};
// /venue/environment/:venueType/:date 场地环境
export const fetchVenueEnvironment = async (poolType: string) => {
  return await fetchGet(`/venue/environment/${poolType}`);
};

// /venue/environment/history/12?startDate=2025-12-05&endDate=2025-12-06 场地环境历史数据
export const fetchVenueEnvironmentHistory = async (venueID: number, startDate: string, endDate: string) => {
  return await fetchGet(`/venue/environment/history/${venueID}?startDate=${startDate}&endDate=${endDate}`);
};

// /event/event-impact/:daily(monthly)/:venueType/:date 场地事件影响日数据
export const fetchEventImpactDaily = async (searchType: string, poolType: string, date: string) => {
  return await fetchGet(`/event/event-impact/${searchType}/${poolType}/${date}`);
};

// /event/listEventPageWithFilter/:venueType
export const fetchEventLogWithFilter = async (poolType: string, params?: Record<string, any>) => {
  return await fetchGet(`/event/listEventPageWithFilter/${poolType}`, params);
};

// /event/listEventForExport/:venueType
export const fetchEventLogForExport = async (poolType: string, params?: Record<string, any>) => {
  return await fetchGet(`/event/listEventForExport/${poolType}`, params, { responseType: "blob" });
};

// /event/operationLogs/:eventId 获取事件操作日志
export const fetchEventOperationLogs = async (eventId: number) => {
  return await fetchGet(`/event/operationLogs/${eventId}`);
};

// GET 天气监控列表接口 /weather/monitoring/:venueId
export const fetchWeatherMonitoring = async (venueID: number) => {
  return await fetchGet(`/weather/monitoring/${venueID}`);
};

// GET /weather/alert-center?venueId=123
export const fetchWeatherMonitoringDetail = async (poolType: string) => {
  // return await fetchGet(`/weather/alert-center?venueId=${venueID}`);
  return await fetchGet(`/weather/all-alerts?venueType=${poolType}`);
};

// /weather/all-alerts?venueId=123
// export const fetchAllWeatherAlerts = async (venueID: number) => {
//   return await fetchGet(`/weather/all-alerts?venueId=${venueID}`);
// };
