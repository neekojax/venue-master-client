export interface SiteData {
  device_failure_hashrate: number;
  device_failure_rate: number;
  extreme_weather_hashrate: number;
  extreme_weather_rate: number;
  high_temperature_hashrate: number;
  high_temperature_rate: number;
  limit_hashrate: number;
  limit_rate: number;
  network_hashrate: number;
  network_rate: number;
  power_hashrate: number;
  power_rate: number;
  total_hashrate: number;
  venue_id: number;
  venue_name: string;
}
export interface StatisticsData {
  affected_venue_count: number;
  main_impact_category: EventType;
  record_count: number;
  total_loss_hashrate: number;
}

export interface DailyEventImpact {
  date: string; // "2025-12-01"
  limit_rate: number;
  limit_hashrate: number;
  high_temperature_rate: number;
  high_temperature_hashrate: number;
  power_rate: number;
  power_hashrate: number;
  device_failure_rate: number;
  device_failure_hashrate: number;
  network_rate: number;
  network_hashrate: number;
  extreme_weather_rate: number;
  extreme_weather_hashrate: number;
}

export interface CauseShareData {
  type: string;
  name: string;
  share: number;
  hashrate: number;
}

export type SortField = keyof SiteData;
export type SortOrder = "asc" | "desc";

export interface ColumnDefinition {
  id: string;
  label: string;
  field: keyof SiteData;
  width?: string;
  sortable?: boolean;
}

// --- Environment History Types (Matching Go JSON tags) ---

export interface EnvironmentHistoryItem {
  datetime: string; // "2006-01-02 15:04:05"
  temperature: number;
  humidity: number;
}

export interface DeviceEnvironmentHistory {
  device_id: string;
  location: string;
  history: EnvironmentHistoryItem[];
}

export interface VenueEnvironmentHistoryResp {
  venue_id: number;
  venue_name: string;
  devices: DeviceEnvironmentHistory[];
}

// --- Event Impact Analysis Types ---

export type EventType =
  | "limit"
  | "high_temperature"
  | "power"
  | "device_failure"
  | "network"
  | "extreme_weather"
  | "maintenance";

export type dailyEventImpact = {
  date: string; // "2025-12-01"
  limit_rate: number;
  limit_hashrate: number;
  high_temperature_rate: number;
  high_temperature_hashrate: number;
  power_rate: number;
  power_hashrate: number;
  device_failure_rate: number;
  device_failure_hashrate: number;
  network_rate: number;
  network_hashrate: number;
  extreme_weather_rate: number;
  extreme_weather_hashrate: number;
  maintenance_rate: number;
  maintenance_hashrate: number;
};

export interface EventImpactRecord {
  id: string;
  date: string; // "2025-12-01"
  siteName: string;
  eventType: EventType;
  lossHashrate: number;
  lossPercent: number;
  durationHours: number;

  // device_failure_hashrate: number;
  // device_failure_rate: number;
  // extreme_weather_hashrate: number;
  // extreme_weather_rate: number;
  // high_temperature_hashrate: number;
  // high_temperature_rate: number;
  // limit_hashrate: number;
  // limit_rate: number;
  // network_hashrate: number;
  // network_rate: number;
  // power_hashrate: number;
  // power_rate: number;
  // total_hashrate: number;
  // venue_id: number;
  // venue_name: string;
}

export interface EventAggregation {
  period: string; // Date or Month string
  totalLoss: number;
  breakdown: Record<EventType, number>;
}
