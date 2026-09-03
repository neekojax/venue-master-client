export interface LatestProbeTask {
  task_id?: string;
  finished_at?: string;
  updated_at?: string;
  online_total?: number;
  offline_total?: number;
  fault_total?: number;
  zero_hashrate_total?: number;
  avg_hashrate?: number;
  total_hashrate?: number;
}

export interface BoundSiteItem {
  site_code: string;
  site_name: string;
  status?: string;
  asset_site_id?: number;
  agent_code?: string;
  agent_name?: string;
  version?: string;
  latest_probe_task?: LatestProbeTask;
}

export interface BoundSitesResponse {
  list: BoundSiteItem[];
}

export type TimeRange = "24h" | "7d";

export interface OverviewPoint {
  time: string;
  theoreticalOnline: number;
  online: number;
  lowHashrate: number;
  zeroHashrate: number;
  totalHashrate: number;
}

export interface ProbeTaskItem {
  task_id?: string;
  agent_code?: string;
  site_code?: string;
  probe_type?: string;
  started_at?: string;
  finished_at?: string;
  status?: string;
  planned_total?: number;
  reported_total?: number;
  online_total?: number;
  offline_total?: number;
  fault_total?: number;
  zero_hashrate_total?: number;
  on_shelf_count?: number;
  avg_hashrate?: number;
  total_hashrate?: number;
  created_at?: string;
  updated_at?: string;
}

/** recentProbeTasks 单条 agents 明细 */
export interface ProbeTaskAgentDetail {
  agent_code?: string;
  task_id?: string;
  collect_time?: string;
  backfilled?: boolean;
  present?: boolean;
  online_total?: number;
  offline_total?: number;
  fault_total?: number;
  zero_hashrate_total?: number;
  on_shelf_count?: number;
  avg_hashrate?: number;
  total_hashrate?: number;
}

/** recentProbeTasks 算力时间序列点（单 Agent 为原始点，多 Agent 为小时桶） */
export interface HashrateTimeSeriesPoint {
  time?: string;
  online_total?: number;
  offline_total?: number;
  fault_total?: number;
  zero_hashrate_total?: number;
  on_shelf_count?: number;
  avg_hashrate?: number;
  total_hashrate?: number;
  present_agent_count?: number;
  agents?: ProbeTaskAgentDetail[];
}

export interface RecentProbeTasksResponse {
  site_code: string;
  window: TimeRange;
  agent_count?: number;
  agents?: string[];
  multi_agent?: boolean;
  list: HashrateTimeSeriesPoint[];
}

/** GET minerHashrate/latestFinishedProbeTask/{siteCode} 的 data */
export interface LatestFinishedProbeTask {
  site_code?: string;
  agent_count?: number;
  agents?: ProbeTaskAgentDetail[];
  event_impact?: {
    high_temperature_impact_count?: number;
    limit_impact_count?: number;
    network_impact_count?: number;
    reference_time?: string;
  };
  present_agent_count?: number;
  finished_at?: string;
  updated_at?: string;
  online_total?: number;
  offline_total?: number;
  fault_total?: number;
  zero_hashrate_total?: number;
  on_shelf_count?: number;
  avg_hashrate?: number;
  total_hashrate?: number;
}

export interface KpiSummary {
  theoreticalOnline: number | null;
  online: number | null;
  theoreticalOffline: number | null;
  lowHashrate: number | null;
  zeroHashrate: number | null;
  networkEvents: number | null;
  powerLimitEvents: number | null;
  highTempEvents: number | null;
  yesterdayAbnormal: number | null;
}

export interface TaskSnapshotItem {
  id: number;
  task_id?: string;
  agent_code?: string;
  miner_code?: string;
  site_code?: string;
  ip?: number | string;
  mac_address?: string;
  control_board_sn?: string;
  error?: string;
  full_type?: string;
  power?: number | string;
  hashrate?: number;
  hashrate_5s?: number;
  hashrate_30m?: number;
  ideal_hashrate?: number;
  total_hashrate?: number;
  hashrate_fault?: boolean;
  temperature?: unknown;
  fans?: unknown;
  hash_boards?: unknown;
  firmware_version?: string;
  uptime?: number | string;
  run_mode?: string;
  pool1_url?: string;
  pool1_worker?: string;
  pool2_url?: string;
  pool2_worker?: string;
  pool3_url?: string;
  pool3_worker?: string;
  collect_time?: string;
  created_at?: string;
  updated_at?: string;
}

export interface HashBoardData {
  index?: number;
  serial_number?: string;
  hashrate?: number;
  temperature?: string;
}

export interface TaskSnapshotListData {
  site_code?: string;
  /** 原始入参，可能为逗号分隔的多个 task_id */
  task_id?: string;
  task_ids?: string[];
  list: TaskSnapshotItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore?: boolean;
  fullTypes?: string[];
  minerCodes?: string[];
}

export interface TaskSnapshotQueryParams {
  page?: number;
  pageSize?: number;
  minerCode?: string;
  sn?: string;
  fullType?: string;
  /** 与 fullType 同值，兼容后端 snake_case 查询参数 */
  full_type?: string;
  ip?: string;
  macAddress?: string;
  controlBoardSN?: string;
  hashrateFault?: string;
  zeroHashrate?: string;
  loginFailed?: string;
}
