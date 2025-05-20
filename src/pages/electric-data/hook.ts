import { useQuery } from "@tanstack/react-query";

import { fetchSettlementPoints } from "@/pages/electric-data/api.tsx";

// export const useSettlementPointsList = () => {
//   return useQuery({
//     queryKey: ["settlement-point-list"],
//     queryFn: fetchSettlementPoints,
//   });
// };

// 修改 useSettlementPointsList 接口以接受 selectedType 参数
export const useSettlementPointsList = (selectedType: any) => {
  return useQuery({
    queryKey: ["settlement-point-list", selectedType], // 增加 selectedType 到 queryKey 以支持缓存的更新
    queryFn: () => fetchSettlementPoints(selectedType), // 传递 selectedType 给 fetchSettlementPoints
    enabled: !!selectedType, // 只有当 selectedType 存在时才启用此查询
  });
};
