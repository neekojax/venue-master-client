import type { AssetHashrateChangeQueryParams } from "./types";

import { fetchGet } from "@/helper/fetchHelper";

export const fetchAssetHashrateChangeList = async (params: AssetHashrateChangeQueryParams) => {
  return fetchGet("/asset/hashrate-change", params);
};
