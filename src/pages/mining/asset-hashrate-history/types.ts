export interface AssetHashrateChangeQueryParams {
  venue_id?: number;
  pool_id?: number;
  hashrate_changed_at_start?: string;
  hashrate_changed_at_end?: string;
  updated_at_start?: string;
  updated_at_end?: string;
  pageNum?: number;
  pageSize?: number;
}

export interface AssetHashrateChangePoolOption {
  pool_id: number;
  pool_name?: string;
  pool_category?: string;
}

export interface AssetHashrateChangeVenueOption {
  venue_id: number;
  venue_name?: string;
  pools?: AssetHashrateChangePoolOption[];
}

export interface AssetHashrateChangeRecord {
  id: number;
  venue_id: number;
  venue_name?: string;
  pool_id: number;
  pool_name?: string;
  hosted_machine?: number;
  theoretical_hashrate?: number;
  hashrate_changed_at?: string;
  updated_at?: string;
}

export interface AssetHashrateChangeListData {
  list: AssetHashrateChangeRecord[];
  total: number;
  page: number;
  pageNum: number;
  pageSize: number;
  hasMore?: boolean;
  venues: AssetHashrateChangeVenueOption[];
}

export interface AssetHashrateChangeSearchValues {
  venueId?: number;
  poolId?: number;
  hashrateChangedAt?: [string, string];
  updatedAt?: [string, string];
}
