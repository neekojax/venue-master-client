// Shared types for week report components
export interface DailyData {
  Date: string; // 日期
  VenueName: string; // 场馆名称
  TheoreticalPower: number; // 理论算力
  HostedMachine: number; // 托管机器数量
  Power24h: number; // 24小时算力
  HashEffectiveRate: number; // 算力有效率（%）
  HighTemperatureImpactPower: number; // 高温影响算力
  HighTemperatureImpactRate: number; // 高温影响率（%）
  LimitImpactPower: number; // 限电影响算力
  LimitImpactRate: number; // 限电影响率（%）
  Failure: number; // 故障数量
  FailureRate: number; // 故障率（%）
  PendingRepair: number; // 待维修数量
  PendingRepairRate: number; // 待维修率（%）
  ForecastHashEfficiency: number; // 净修率（%）
  NetFailureRate: number; // 净故障率（%）
  Scrap: number; // 报废数量
  Shelved: number; // 上架数量
  Unshelved: number; // 下架数量
  OutputEfficiency: number; // 输出效率（%）
  low_power_impact_power: number; // 低功耗影响算力
  low_power_impact_rate: number; // 低功耗影响率（%）
  withdraw_impact_power: number; // 撤场影响算力
  withdraw_impact_rate: number; // 撤场影响率（%）
  cloud_power_hashrate: number; // 云算力哈希率
  cloud_power_rate: number; // 云算力率（%）
}

export interface DataItem {
  venue_id: number; // 场馆 ID
  venue_name: string; // 场馆名称
  collection: number; // 是否收藏
  average_thermal_power: number; // 平均理论算力
  average_power_24h: number; // 平均24小时算力
  average_hash_effective_rate: number; // 平均算力有效率（%）
  average_failure_rate: number; // 平均故障率（%）
  average_high_temperature_impact_rate: number; // 平均高温影响率（%）
  average_limit_impact_rate: number; // 平均限电影响率（%）
  average_pending_repair_rate: number; // 平均待维修率（%）
  hash_effective_diff_rate: number; // 算力有效率差异（%）
  daily_items: DailyData[];
  forecast_hash_efficiency: number; // 净修率（%）
  // 新增的后端返回项（周维度/综合指标）
  average_failure?: number; // 平均故障数量
  average_pending_repair?: number; // 平均待维修数量
  average_scrap?: number; // 平均报废数量
  average_net_failure_rate?: number; // 平均净故障率（%）
  week_shelved?: number; // 本周上架
  week_unshelved?: number; // 本周下架
  event_reason?: string; // 事件原因
  follow_up?: string; // 跟进事项
  progress?: string; // 处理进度
  shutdown_price?: number; // 关机价格
  output_efficiency?: number; // 输出效率（%）
  average_low_power_impact_power?: number; // 平均低功耗影响算力
  average_low_power_impact_rate?: number; // 平均低功耗影响率（%）
  average_withdraw_impact_power?: number; // 平均提现影响算力
  average_withdraw_impact_rate?: number; // 平均提现影响率（%）
  average_cloud_power_hashrate?: number; // 平均云算力哈希率
  average_cloud_power_rate?: number; // 平均云算力率（%）
}
