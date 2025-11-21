import React from "react";
import { MapPin } from "lucide-react";
import { WeatherData } from "../types/weather";
import { DayNightRow } from "./DayNightRow";

// interface Props {
//     site: Site;
// }

// interface WeatherData {
//     venue_id: number;
//     venue_name: string;
//     date: string;
//     day_period: string;
//     weather: string;
//     min_temperature: number;
//     max_temperature: number;
//     humidity: number;
//     precipitation: number;
//     wind_speed: number;
// }

interface Venue {
  // venue_id: number;
  venue: GroupVenue;
  items?: DateGroup[];
}
interface GroupVenue {
  id: number;
  name: string;
}
interface DateGroup {
  date: string;
  day?: WeatherData;
  night?: WeatherData;
}

export const SiteCard: React.FC<{ site: Venue }> = ({ site }) => {
  console.log("SiteCard", site);
  return (
    <div className="bg-white mb-4 rounded-xl p-2 shadow-sm border border-gray-100 w-full hover:shadow-md transition-shadow">
      <div className="mb-4 border-b border-gray-100 pb-2 flex items-center gap-2">
        <MapPin className="w-5 h-5 text-blue-500" />
        <h2 className="text-lg font-semibold text-slate-700">{site?.venue?.name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {site.items?.map((daily) => {
          const date = new Date(daily.date);
          const dateStr = new Intl.DateTimeFormat("zh-CN", {
            month: "numeric",
            day: "numeric",
            weekday: "short",
          }).format(date);

          // 保证 DayNightRow 接收到完整的 WeatherData，避免传递 {} 造成类型错误
          const defaultDay: WeatherData = {
            venue_id: site.venue?.id ?? 0,
            venue_name: site.venue?.name ?? "",
            date: daily.date,
            day_period: "白天",
            weather: "-",
            min_temperature: 0,
            max_temperature: 0,
            humidity: 0,
            precipitation: 0,
            wind_speed: 0,
          };
          const defaultNight: WeatherData = {
            venue_id: site.venue?.id ?? 0,
            venue_name: site.venue?.name ?? "",
            date: daily.date,
            day_period: "夜间",
            weather: "-",
            min_temperature: 0,
            max_temperature: 0,
            humidity: 0,
            precipitation: 0,
            wind_speed: 0,
          };

          return (
            <div key={daily.date} className="flex flex-col gap-2">
              <div className="text-center text-sm font-medium text-slate-500">{dateStr}</div>
              <div className="flex flex-col gap-2 flex-1">
                <DayNightRow label="白天" data={daily.day ?? defaultDay} />
                <DayNightRow label="夜间" data={daily.night ?? defaultNight} isNight />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
