export type MiningPool = {
  id: number;
  venue_id: number;
  pool_name: string;
  pool_type: string;
  country: string;
  // pool_category: string;
  theoretical_hashrate: string;
  energy_ratio: string;
  basic_hosting_fee: string;
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
  energy_ratio: string;
  basic_hosting_fee: string;
  link: string;
};

export type PoolRecordCreate = {
  venue_id: number;
  pool_id: number;
  start_time: string;
  end_time: string;
  theoretical_hashrate: number;
  hosted_machine: number;
};

export type PoolRecordUpdate = {
  id: number;
  venue_id: number;
  pool_id: number;
  start_time: string;
  end_time: string;
  theoretical_hashrate: number;
  hosted_machine: number;
};
