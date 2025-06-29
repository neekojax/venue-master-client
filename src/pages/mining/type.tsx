export type MiningPool = {
  id: number;
  venue_name: string;
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
  venue_name: string;
  pool_name: string;
  pool_type: string;
  country: string;
  pool_category: string;
  theoretical_hashrate: string;
  energy_ratio: string;
  basic_hosting_fee: string;
  link: string;
};
