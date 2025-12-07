export interface SiteData {
  id: string;
  name: string;
  theoreticalHashrate: number; // PH/s
  realHashrate: number; // PH/s
  efficiency: number; // percentage (0-100+)
  efficiencyChange: number; // percentage change
  netEfficiency: number; // percentage
  failureRate: number; // percentage
  repairRate: number; // percentage
  highTempRate: number; // percentage
  powerLimitRate: number; // percentage
  eventCause: string;
  followUpItems: string;
  processingProgress: string;
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
