import { fetchGet } from "@/helper/fetchHelper.ts";

export const fetchLinkList = async () => {
  return await fetchGet("link/list");
};
