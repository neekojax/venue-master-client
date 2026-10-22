export type WeeklyChartPoint = {
  date: string;
  value: number;
  auxValue?: number;
  weekNo?: number;
};

export type VenueWeeklyCurvePoint = {
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  value: number;
};

type RawVenueWeeklyCurvePoint = {
  week_start?: string;
  week_end?: string;
  week_label?: string;
  value?: number;
  weekStart?: string;
  weekEnd?: string;
  weekLabel?: string;
};

export type VenueWeeklyReportItem = {
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  averageTheoreticalPower: number;
  averagePower24h: number;
  averageHashEffectiveRate: number;
  weeklyBtcOutput: number;
  outputEfficiency: number;
  forecastHashEfficiency: number;
  averageFailure: number;
  averageFailureRate: number;
  averagePendingRepair: number;
  averagePendingRepairRate: number;
  averageScrap: number;
  averageHighTemperatureImpactRate: number;
  averageLimitImpactRate: number;
  weekShelved: number;
  weekUnshelved: number;
};

export type VenueWeeklyReportResponse = {
  list: VenueWeeklyReportItem[];
  hashEffectiveRateCurve: VenueWeeklyCurvePoint[];
  failureRateCurve: VenueWeeklyCurvePoint[];
  highTemperatureImpactRateCurve: VenueWeeklyCurvePoint[];
  limitImpactRateCurve: VenueWeeklyCurvePoint[];
};

export type RawVenueWeeklyReportItem = {
  week_start?: string;
  week_end?: string;
  week_label?: string;
  average_theoretical_power?: number;
  average_power_24h?: number;
  average_hash_effective_rate?: number;
  weekly_btc_output?: number;
  output_efficiency?: number;
  forecast_hash_efficiency?: number;
  average_failure?: number;
  average_failure_rate?: number;
  average_pending_repair?: number;
  average_pending_repair_rate?: number;
  average_scrap?: number;
  average_high_temperature_impact_rate?: number;
  average_limit_impact_rate?: number;
  week_shelved?: number;
  week_unshelved?: number;
};

export type RawVenueWeeklyReportResponse = {
  list?: RawVenueWeeklyReportItem[];
  data?: RawVenueWeeklyReportItem[];
  hash_effective_rate_curve?: RawVenueWeeklyCurvePoint[];
  failure_rate_curve?: RawVenueWeeklyCurvePoint[];
  high_temperature_impact_rate_curve?: RawVenueWeeklyCurvePoint[];
  limit_impact_rate_curve?: RawVenueWeeklyCurvePoint[];
  hashEffectiveRateCurve?: RawVenueWeeklyCurvePoint[];
  failureRateCurve?: RawVenueWeeklyCurvePoint[];
  highTemperatureImpactRateCurve?: RawVenueWeeklyCurvePoint[];
  limitImpactRateCurve?: RawVenueWeeklyCurvePoint[];
};

export type RawVenueWeeklyPageResponse = {
  data?: RawVenueWeeklyReportItem[];
  total?: number;
  page?: number;
  pageSize?: number;
  hasMore?: boolean;
};

export type VenueWeeklyPageResponse = {
  data: VenueWeeklyReportItem[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type WeeklyReportRow = {
  key: string;
  weekLabel: string;
  weekNo: number;
  startDate: string;
  endDate: string;
  theoreticalHashrate: number;
  actualHashrate: number;
  hashEffectiveRate: number;
  incomeBtc: number;
  incomeEfficiency: number;
  netEffectiveRate: number;
  faultCount: number;
  faultRate: number;
  pendingCount: number;
  pendingRate: number;
  scrapCount: number;
  highTemperatureImpactRate: number;
  limitImpactRate: number;
  weeklyOnlineCount: number;
  weeklyOfflineCount: number;
};

function seeded(venueId: number, offset: number) {
  const x = Math.sin(venueId * 97 + offset * 131) * 10000;
  return x - Math.floor(x);
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getWeekNumber(dateStr: string) {
  const date = new Date(dateStr);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const diffDays = Math.floor((date.getTime() - yearStart.getTime()) / 86400000);
  return Math.ceil((diffDays + yearStart.getDay() + 1) / 7);
}

function getWeekStart(date: Date) {
  const next = new Date(date);
  const day = next.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + diff);
  next.setHours(0, 0, 0, 0);
  return next;
}

function buildWeeks(venueId: number, count = 10) {
  const currentWeekStart = getWeekStart(new Date());

  return Array.from({ length: count }).map((_, index) => {
    const start = new Date(currentWeekStart);
    start.setDate(start.getDate() - (count - 1 - index) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    const theoreticalHashrate = 320 + seeded(venueId, index) * 140;
    const actualHashrate = theoreticalHashrate * (0.86 + seeded(venueId, index + 10) * 0.12);
    const hashEffectiveRate = (actualHashrate / theoreticalHashrate) * 100;
    const faultCount = Math.round(8 + seeded(venueId, index + 20) * 24);
    const pendingCount = Math.round(3 + seeded(venueId, index + 30) * 12);
    const scrapCount = Math.round(seeded(venueId, index + 40) * 6);
    const highTemperatureImpactRate = 0.6 + seeded(venueId, index + 50) * 3.2;
    const limitImpactRate = 0.3 + seeded(venueId, index + 60) * 2.4;
    const weeklyOnlineCount = Math.round(12 + seeded(venueId, index + 70) * 38);
    const weeklyOfflineCount = Math.round(1 + seeded(venueId, index + 80) * 15);
    const incomeBtc = 0.92 + seeded(venueId, index + 90) * 0.64;
    const incomeEfficiency = 0.008 + seeded(venueId, index + 100) * 0.004;
    const netEffectiveRate = hashEffectiveRate - highTemperatureImpactRate - limitImpactRate;
    const installedBase = 3000 + venueId * 3;
    const faultRate = (faultCount / installedBase) * 100;
    const pendingRate = (pendingCount / installedBase) * 100;

    return {
      key: `${start.toISOString()}-${venueId}`,
      weekLabel: `${start.getMonth() + 1}/${start.getDate()} - ${end.getMonth() + 1}/${end.getDate()}`,
      weekNo: getWeekNumber(formatDate(start)),
      startDate: formatDate(start),
      endDate: formatDate(end),
      theoreticalHashrate: Number(theoreticalHashrate.toFixed(2)),
      actualHashrate: Number(actualHashrate.toFixed(2)),
      hashEffectiveRate: Number(hashEffectiveRate.toFixed(2)),
      incomeBtc: Number(incomeBtc.toFixed(4)),
      incomeEfficiency: Number(incomeEfficiency.toFixed(4)),
      netEffectiveRate: Number(netEffectiveRate.toFixed(2)),
      faultCount,
      faultRate: Number(faultRate.toFixed(2)),
      pendingCount,
      pendingRate: Number(pendingRate.toFixed(2)),
      scrapCount,
      highTemperatureImpactRate: Number(highTemperatureImpactRate.toFixed(2)),
      limitImpactRate: Number(limitImpactRate.toFixed(2)),
      weeklyOnlineCount,
      weeklyOfflineCount,
    };
  });
}

export function getWeeklyEffectiveRateSeries(venueId: number, count = 10): WeeklyChartPoint[] {
  return buildWeeks(venueId, count).map((week) => ({
    date: week.weekLabel,
    value: week.hashEffectiveRate,
  }));
}

export function getWeeklyFailureRateSeries(venueId: number, count = 10): WeeklyChartPoint[] {
  return buildWeeks(venueId, count).map((week) => ({
    date: week.weekLabel,
    value: week.faultRate,
    auxValue: week.faultCount,
  }));
}

export function getWeeklyHighTemperatureSeries(venueId: number, count = 10): WeeklyChartPoint[] {
  return buildWeeks(venueId, count).map((week) => ({
    date: week.weekLabel,
    value: week.highTemperatureImpactRate,
  }));
}

export function getWeeklyLimitImpactSeries(venueId: number, count = 10): WeeklyChartPoint[] {
  return buildWeeks(venueId, count).map((week) => ({
    date: week.weekLabel,
    value: week.limitImpactRate,
  }));
}

export function getWeeklyReportRows(venueId: number, count = 10): WeeklyReportRow[] {
  return buildWeeks(venueId, count);
}

export function mapWeeklyCurvePoints(
  points: VenueWeeklyCurvePoint[],
  auxValues?: number[],
): WeeklyChartPoint[] {
  return points.map((item, index) => ({
    date: item.weekLabel,
    value: item.value,
    auxValue: auxValues?.[index],
    weekNo: getWeekNumber(item.weekStart),
  }));
}

export function mapWeeklyReportItemsToRows(items: VenueWeeklyReportItem[]): WeeklyReportRow[] {
  return items
    .map((item, index) => ({
      key: `${item.weekStart}-${item.weekEnd}-${index}`,
      weekLabel: item.weekLabel,
      weekNo: getWeekNumber(item.weekStart),
      startDate: item.weekStart,
      endDate: item.weekEnd,
      theoreticalHashrate: item.averageTheoreticalPower,
      actualHashrate: item.averagePower24h,
      hashEffectiveRate: item.averageHashEffectiveRate,
      incomeBtc: item.weeklyBtcOutput,
      incomeEfficiency: item.outputEfficiency,
      netEffectiveRate: item.forecastHashEfficiency,
      faultCount: item.averageFailure,
      faultRate: item.averageFailureRate,
      pendingCount: item.averagePendingRepair,
      pendingRate: item.averagePendingRepairRate,
      scrapCount: item.averageScrap,
      highTemperatureImpactRate: item.averageHighTemperatureImpactRate,
      limitImpactRate: item.averageLimitImpactRate,
      weeklyOnlineCount: item.weekShelved,
      weeklyOfflineCount: item.weekUnshelved,
    }))
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
}

export function normalizeWeeklyCurvePoint(item: RawVenueWeeklyCurvePoint): VenueWeeklyCurvePoint {
  return {
    weekStart: item.week_start ?? item.weekStart ?? "",
    weekEnd: item.week_end ?? item.weekEnd ?? "",
    weekLabel: item.week_label ?? item.weekLabel ?? "",
    value: Number(item.value ?? 0),
  };
}

export function normalizeWeeklyReportItem(item: RawVenueWeeklyReportItem): VenueWeeklyReportItem {
  return {
    weekStart: item.week_start ?? "",
    weekEnd: item.week_end ?? "",
    weekLabel: item.week_label ?? "",
    averageTheoreticalPower: Number(item.average_theoretical_power ?? 0),
    averagePower24h: Number(item.average_power_24h ?? 0),
    averageHashEffectiveRate: Number(item.average_hash_effective_rate ?? 0),
    weeklyBtcOutput: Number(item.weekly_btc_output ?? 0),
    outputEfficiency: Number(item.output_efficiency ?? 0),
    forecastHashEfficiency: Number(item.forecast_hash_efficiency ?? 0),
    averageFailure: Number(item.average_failure ?? 0),
    averageFailureRate: Number(item.average_failure_rate ?? 0),
    averagePendingRepair: Number(item.average_pending_repair ?? 0),
    averagePendingRepairRate: Number(item.average_pending_repair_rate ?? 0),
    averageScrap: Number(item.average_scrap ?? 0),
    averageHighTemperatureImpactRate: Number(item.average_high_temperature_impact_rate ?? 0),
    averageLimitImpactRate: Number(item.average_limit_impact_rate ?? 0),
    weekShelved: Number(item.week_shelved ?? 0),
    weekUnshelved: Number(item.week_unshelved ?? 0),
  };
}

export function normalizeWeeklyReportResponse(
  raw?: RawVenueWeeklyReportResponse | null,
): VenueWeeklyReportResponse {
  return {
    list: (raw?.list || raw?.data || []).map(normalizeWeeklyReportItem),
    hashEffectiveRateCurve: (raw?.hash_effective_rate_curve || raw?.hashEffectiveRateCurve || []).map(
      normalizeWeeklyCurvePoint,
    ),
    failureRateCurve: (raw?.failure_rate_curve || raw?.failureRateCurve || []).map(normalizeWeeklyCurvePoint),
    highTemperatureImpactRateCurve: (
      raw?.high_temperature_impact_rate_curve ||
      raw?.highTemperatureImpactRateCurve ||
      []
    ).map(normalizeWeeklyCurvePoint),
    limitImpactRateCurve: (raw?.limit_impact_rate_curve || raw?.limitImpactRateCurve || []).map(
      normalizeWeeklyCurvePoint,
    ),
  };
}

export function normalizeWeeklyPageResponse(
  raw?: RawVenueWeeklyPageResponse | null,
): VenueWeeklyPageResponse {
  return {
    data: (raw?.data || []).map(normalizeWeeklyReportItem),
    total: Number(raw?.total || 0),
    page: Number(raw?.page || 1),
    pageSize: Number(raw?.pageSize || 10),
    hasMore: Boolean(raw?.hasMore),
  };
}
