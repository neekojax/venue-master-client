import { fetchDelete, fetchGet, fetchPost } from "@/helper/fetchHelper";
import { TemplateDataChange, TemplateDataNew } from "@/pages/base/type.ts";

// 获取模版
export const fetchVenueTemplates = async () => {
  return await fetchGet("venue-templates");
};

// 变更模版
export const submitVenueTemplateChange = async (templateData: TemplateDataChange) => {
  return await fetchPost("venue-templates/update", templateData);
};

// 添加模版
export const submitVenueTemplateNew = async (templateData: TemplateDataNew) => {
  return await fetchPost("venue-templates/new", templateData);
};

// 删除模版
export const submitVenueTemplateDelete = async (id: number) => {
  return await fetchDelete(`venue-templates/${id}`);
};
