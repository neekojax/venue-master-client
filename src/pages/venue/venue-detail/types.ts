export interface VenueStats {
  onlineRatio: number;
  btcOutput24h: number;
  theoreticalPower: number;
  power24h: number;
  effectiveRate24h: number;
  totalMachines: number;
  totalFailures: number;
  failures24h: number;
  failureRate24h: number;
  impactRatio: number;
  totalFailuresRate: number;
  limitImpactRate: number;
  highTemperatureRate: number;
  onlineMachines: number;
  onRackMachines: number;
}
