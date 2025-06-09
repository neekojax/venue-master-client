export type MiningPool = {
  id: number;
  pool_name: string;
  pool_type: string;
  country: string;
  // pool_category: string;
  theoretical_hashrate: string;
  master_link: string;
  backup_link: string;
};

export type MiningPoolUpdate = {
  id: number;
  pool_name: string;
  pool_type: string;
  country: string;
  pool_category: string;
  theoretical_hashrate: string;
  link: string;
};
