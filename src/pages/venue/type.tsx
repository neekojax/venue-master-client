export type VenueInfoParam = {
  id: number;
  venue_name: string;
  venue_code: string;
  country: string;
  address: string;
  agent_key: string;
  hosted_machine: number;
  miner_type: string;
};

export type EventLogParam = {
  id: number;
  venue_id: number;
  log_date: string;
  start_time: string;
  end_time: string;

  log_type: string;
  impact_count: number;
  impact_power_loss: number;
  event_reason: string;
  resolution_measures: string;
};
