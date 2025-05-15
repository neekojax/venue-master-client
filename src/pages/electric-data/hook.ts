import { useQuery } from "@tanstack/react-query";

import { fetchSettlementPoints } from "@/pages/electric-data/api.tsx";

export const useSettlementPointsList = () => {
  return useQuery({
    queryKey: ["settlement-point-list"],
    queryFn: fetchSettlementPoints,
  });
};