export type AccountLeaseStatus = "全部租赁" | "部分租赁" | "部分租赁算力" | "非租赁";

export type MiningPool = {
  id: number;
  venue_id: number;
  pool_name: string;
  pool_type: string;
  country: string;
  // pool_category: string;
  theoretical_hashrate: string;
  is_overclocked?: number | null;
  overclock_hashrate_per_machine?: number | null;
  // energy_ratio: string;
  // basic_hosting_fee: string;
  master_link: string;
  backup_link: string;
};

export type MiningPoolUpdate = {
  id: number;
  venue_id: number;
  pool_name: string;
  pool_type: string;
  country: string;
  hosted_machine: number;
  status: number;
  pool_category: string;
  theoretical_hashrate: string;
  is_overclocked?: number | null;
  overclock_hashrate_per_machine?: number | null;
  // energy_ratio: string;
  // basic_hosting_fee: string;
  heat_diss_mode: number;
  link: string;
};

export type PoolRecordCreate = {
  venue_id: number;
  pool_id: number;
  start_time: string;
  end_time: string;
  theoretical_hashrate: number;
  hosted_machine: number;
  is_cloud_power?: number;
  leased_power?: number;
  is_overclocked?: number;
  overclock_hashrate_per_machine?: number;
};

export type PoolRecordUpdate = {
  id: number;
  venue_id: number;
  pool_id: number;
  start_time: string;
  end_time: string;
  theoretical_hashrate: number;
  hosted_machine: number;
  is_cloud_power?: number;
  leased_power?: number;
  is_overclocked?: number;
  overclock_hashrate_per_machine?: number;
};

export type HostRecordCreate = {
  venue_id: number; // 场馆ID
  pool_id: number; // 矿池ID
  start_time: string; // 开始时间
  end_time: string; // 结束时间
  hosting_price: number; // 托管单价
  hosting_expiry_date: string; // 托管到期日
  maintenance_price: number; // 运维单价
  power_consumption: number; // 功耗
  is_in_consignment: boolean; // 是否在寄售期
};

export type HostRecordUpdate = {
  id: number; // ID
  venue_id: number; // 场馆ID
  pool_id: number; // 矿池ID
  start_time: string; // 开始时间
  end_time: string; // 结束时间
  hosting_price: number; // 托管单价
  hosting_expiry_date: string; // 托管到期日
  maintenance_price: number; // 运维单价
  power_consumption: number; // 功耗
  is_in_consignment: boolean; // 是否在寄售期
};
