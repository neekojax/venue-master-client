// export type WeatherData = {
//     date: string;
//     day_period: string;
//     weather: string;
//     min_temperature: number;
//     max_temperature: number;
//     humidity: number;
//     precipitation: number;
//     wind_speed: number;

// };

export type WeatherData = {
  venue_id: number;
  venue_name: string;
  date: string;
  day_period: string;
  weather: string;
  min_temperature: number;
  max_temperature: number;
  humidity: number;
  precipitation: number;
  wind_speed: number;
};

export type WeatherCondition = "sunny" | "cloudy" | "rainy" | "snowy" | "stormy" | "partly-cloudy" | "clear";

// export interface WeatherData {
//     condition: WeatherCondition;
//     minTemp: number; // Celsius
//     maxTemp: number; // Celsius
//     humidity: number; // %
//     windSpeed: number; // km/h
//     precipitation: number; // mm
// }

export interface DailyWeather {
  date: string; // YYYY-MM-DD
  day: WeatherData;
  night: WeatherData;
}

export interface Site {
  id: string;
  name: string;
  history: DailyWeather[]; // Past 3 days + Today? User said "recent 3 days", usually means T-2, T-1, T
  forecast: DailyWeather[]; // Future 7 days
}
