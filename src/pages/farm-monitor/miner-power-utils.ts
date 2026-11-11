import type { DailyPowerTrend, PowerDataStatus } from "./miner-power-api";

import { t } from "@/locales";

export function formatPower(value: number | null | undefined) {
  return value == null
    ? "—"
    : value.toLocaleString(undefined, { minimumFractionDigits: 3, maximumFractionDigits: 3 });
}

export function powerDayStatus(day: DailyPowerTrend, expectedAgentCodes: string[] = []): PowerDataStatus {
  if (day.total_power_mw == null) return "no_data";
  const available = new Set(day.agents.map((agent) => agent.agent_code));
  return day.agents.length === 0 ||
    day.agents.some((agent) => agent.status !== "valid" || agent.power_mw == null) ||
    expectedAgentCodes.some((code) => !available.has(code))
    ? "partial"
    : "valid";
}

export function powerStatusLabel(status: PowerDataStatus) {
  return status === "valid" ? t("完整覆盖") : status === "partial" ? t("数据不完整") : t("无有效数据");
}

export function formatCoverage(ratio: number | null | undefined) {
  return ratio == null ? "—" : `${(ratio * 100).toFixed(1)}%`;
}
