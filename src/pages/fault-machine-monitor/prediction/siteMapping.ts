import type { Site } from "./types";

export interface CurrentVenue {
  id: number;
  venue_name: string;
}

// 仅做唯一、精确的名称映射，不把运营库主键直接作为预测库主键。
export function mapPredictionSiteOptions(venues: CurrentVenue[], predictionSites: Site[]) {
  return venues.flatMap((venue) => {
    const name = String(venue.venue_name || "").trim();
    const matches = predictionSites.filter((site) => String(site.name || "").trim() === name);
    const uniqueLocal = venues.filter((item) => String(item.venue_name || "").trim() === name).length === 1;
    const predictionId = name !== "" && matches.length === 1 && uniqueLocal ? matches[0].id : undefined;
    if (predictionId == null) return [];
    return [{ value: predictionId, label: name }];
  });
}
