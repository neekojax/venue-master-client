// api.ts
import { fetchDelete, fetchGet, fetchPost } from "@/helper/fetchHelper.ts";
import { VenueRecordNew, VenueRecordUpdate } from "@/pages/venue/venue-order/type.ts";

// 获取模版列表
export const fetchVenueTemplateList = async () => {
  return await fetchGet("venue-templates/list");
};

// 获取模版字段
export const fetchVenueTemplateFields = async (templateId: any) => {
  return await fetchGet(`venue/${templateId}/GetFieldsByTemplateID`);
};

// 获取记录数据
export const fetchVenueRecord = async (templateId: any) => {
  return await fetchGet(`venue/${templateId}/GetVenueRecordByTemplateID`);
};

// 增加记录
export const submitVenueRecord = async (venueRecord: VenueRecordNew) => {
  return await fetchPost("venue/newVenueRecord", venueRecord);
};

// 删除记录

export const submitVenueRecordDelete = async (recordId: number) => {
  return await fetchDelete(`venue/deleteVenueRecord/${recordId}`);
};

// 删除记录
export const submitVenueRecordUpdate = async (data: VenueRecordUpdate) => {
  return await fetchPost("venue/updateVenueRecordAttributes", data);
};
