import { useQuery } from "@tanstack/react-query";

import { fetchLinkList } from "@/pages/nest-menu/api.ts";

export const useLinkList = () => {
  return useQuery({
    queryKey: ["link-list"],
    queryFn: fetchLinkList,
  });
};
