import { useQuery } from "@tanstack/react-query";
import { fetchAssetHashrateChangeList } from "./api";
import type { AssetHashrateChangeQueryParams } from "./types";

export const useAssetHashrateChangeList = (params: AssetHashrateChangeQueryParams) => {
  return useQuery({
    queryKey: ["asset-hashrate-change-list", params],
    queryFn: () => fetchAssetHashrateChangeList(params),
    placeholderData: (previousData) => previousData,
  });
};
