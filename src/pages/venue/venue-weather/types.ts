export enum Period {
  REALTIME = 0,
  DAY = 1,
  NIGHT = 2,
}
export interface GeographicLocation {
  venue_coordinates: string;
  data_source_coordinates: string;
  distance: number;
}

export interface ForecastDay {
  date: string;
  weather: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_gust_speed: number;
  wind_direction: string;
  precipitation: number;
  temp_min: number;
  temp_max: number;
  humidity_min: number;
  humidity_avg: number;
  humidity_max: number;
  icon_id: number;
}
export interface VenueWeather {
  venue_name: string;
  date: string; // 2006-01-02 15:04:05 or 2006-01-02
  timezone: string;
  weather_condition: string;
  icon_id?: number;
  data_source: string;
  temperature: number;
  humidity: number;
  wind_speed: number;
  wind_gust_speed: number;
  wind_direction: string;
  precipitation: number;
}

export interface WeatherAlert {
  id: number;
  type: string;
  summary: string;
  affected_area: string;
  start_time: string;
  end_time: string;
  description: string;
  source: string;
  url: string;
  created_at: string;
  updated_at: string;
  venue_id: number;
  alert_id: string;
  timezone: string;
  is_notified: number;
  notified_at: null;
  venue_name: string;
  collection: number;
}

export interface Venue {
  id: number;
  name: string;
  location: string;
}

export interface VenueWeatherAlert {
  type: string;
  level: number;
  start_time: string;
  end_time: string;
  description: string;
  detail_url: string;
}
