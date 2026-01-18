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
}
export interface VenueWeather {
  // id: number;
  // venue_id: number;
  venue_name: string;
  date: string; // 2006-01-02 15:04:05 or 2006-01-02
  // weather_description: string;
  weather_condition: string;
  data_source: string;
  // period: Period;
  // temperature_min: number;
  // temperature_max: number;
  temperature: number;
  // humidity_min: number;
  // humidity_max: number;
  // humidity_avg: number;
  humidity: number;
  wind_speed: number;
  wind_gust_speed: number;
  wind_direction: string;
  // wind_direction_degrees: number;
  precipitation: number;
  // distance: number;
  // venue_coordinates: string;
  // country: string;
  // timezone: string;
  // data_source_coordinates: string;
  // detail_url: string;
  // alert_effective_date: string;
  // alert_end_date: string;
  // alert_severity: number;
  // alert_text: string;
  // alert_category: string;
  // alert_link: string;
  // created_at: string;
  // updated_at: string;
}

export interface WeatherAlert {
  id: number;
  type: string;
  affected_area: string;
  start_time: string;
  end_time: string;
  description: string;
  source: string;
  url: string;
  created_at: string;
  updated_at: string;
}

export interface Venue {
  id: number;
  name: string;
  location: string;
}
