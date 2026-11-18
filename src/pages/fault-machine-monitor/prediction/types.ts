export type EntityId = number;
export type AlertStatus = "pending" | "acknowledged" | "processing" | "resolved";
export interface PredictionSession {
  group_id: string;
  sessionId: string;
}
export interface Scope {
  group_id: string;
  site_id?: number;
}
export interface PredictionFilters {
  severity?: string;
  category?: string;
  keyword?: string;
  status?: string;
  network?: string;
}
export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  pages?: number;
}
export interface Paged<T> {
  list: T[];
  pagination: Pagination;
}
export interface Site {
  id: number;
  name: string;
}
export interface CategoryStat {
  category: string;
  machine_count: number;
  log_count: number;
}
export interface Machine {
  id: number;
  site_id: number;
  site_name: string;
  machine_key: string;
  identity_basis: string;
  mac_address: string;
  control_board_sn: string;
  ip: string;
  network: string;
  severity: string;
  log_count: number;
  abnormal_days: number;
  recent_log_count: number;
  repair_count_90d: number;
  repair_recurrence: boolean;
  categories: string[];
  reasons: { key: string; text: string }[];
  first_seen: string;
  last_seen: string;
  computed_at: string;
  alert_id: number | null;
  alert_status: string;
  owner_name: string;
  alert_version: number;
  fault_id: number | null;
}
export interface Snapshot {
  site_id: number;
  window_start: string;
  window_end: string;
  computed_at: string;
  rule_version: string;
  unknown_log_count: number;
  log_count: number;
}
export interface SyncRecord {
  site_id: number;
  date: string;
  status: string;
  last_success_at: string | null;
  completed_at: string | null;
  error_message: string;
}
export interface Overview {
  sites: Site[];
  summary: {
    machine_count: number;
    high_count: number;
    medium_count: number;
    log_count: number;
    unknown_log_count: number;
    cluster_count: number;
  };
  categories: CategoryStat[];
  trend: { date: string; log_count: number; machine_count: number }[];
  snapshots: Snapshot[];
  sync: SyncRecord[];
  window_days: number;
  rule_version: string;
  capabilities: Record<string, boolean>;
  notes: string[];
}
export interface RawLog {
  id: number;
  code: string | null;
  explanation: string | null;
  ip: string | null;
  log_time: string;
  raw_line: string | null;
}
export interface Repair {
  id: number;
  fault_id: number;
  device_sn: string;
  control_sn: string;
  mac_address: string;
  repair_component: string;
  defect_reason: string;
  repair_result: number;
  end_time: string;
  created_at: string;
}
export interface Action {
  id: number;
  alert_id: number;
  actor_user_id: number;
  actor_name: string;
  from_status: string;
  to_status: string;
  owner_name: string;
  fault_id: number | null;
  note: string;
  created_at: string;
}
export interface MachineDetail {
  machine: Machine;
  daily: { site_id: number; date: string; category: string; network: string; log_count: number }[];
  repairs: Repair[];
  repair_total: number;
  actions: Action[];
  logs: RawLog[];
  log_pagination: Pagination;
  window_start: string;
  window_end: string;
  aging_status: string;
  continuous_fault_seconds: null;
  hashrate: null;
  container: null;
}
export interface Cluster {
  site_id: number;
  site_name: string;
  network: string;
  category: string;
  machine_count: number;
  log_count: number;
}
export interface Parts {
  list: CategoryStat[];
  assessment: string;
  purchase_quantity: null;
  note: string;
}
export interface AlertUpdate {
  status: AlertStatus;
  owner_name?: string;
  note: string;
  version: number;
  fault_id?: number;
}

export interface SiteRanking {
  rank: number;
  site_id: number;
  site_name: string;
  machine_count: number;
  high_count: number;
  medium_count: number;
  computed_at: string;
  window_start: string;
  window_end: string;
}
export interface SiteRankings {
  window_days: number;
  rule_version: string;
  abnormal_top5: SiteRanking[];
  high_risk_top5: SiteRanking[];
}
