import type { ReactNode } from "react";
import { ArrowRightOutlined } from "@ant-design/icons";
import { Spin, Tooltip } from "antd";
import type { AgentDailyMacStat } from "../daily-mac-stats-api";
import type { DailyPowerDetailData } from "../miner-power-api";
import { formatPower } from "../miner-power-utils";

import { t } from "@/locales";

interface Props {
  title: string;
  disabled?: boolean;
  businessDate: string;
  loading?: boolean;
  error?: Error | null;
  onMore: () => void;
  children: ReactNode;
}

export default function YesterdaySummaryCard({
  title,
  disabled,
  businessDate,
  loading,
  error,
  onMore,
  children,
}: Props) {
  return (
    <section
      aria-label={title}
      className="flex min-w-0 flex-col justify-center rounded-lg border border-gray-200 bg-white px-4 py-3"
    >
      <div className="flex items-center justify-between gap-2">
        <Tooltip title={`${businessDate} · ${t("统计窗口（上海时间）")} 08:00 — ${t("次日")} 08:00`}>
          <span className="truncate text-xs text-gray-500">{title}</span>
        </Tooltip>
        <button
          type="button"
          aria-label={t("{{title}}更多", { title })}
          disabled={disabled}
          className="inline-flex shrink-0 items-center gap-1 border-0 bg-transparent p-0 text-xs text-blue-500 hover:text-blue-600 disabled:cursor-not-allowed disabled:text-gray-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-400"
          onClick={onMore}
        >
          {t("更多")}
          <ArrowRightOutlined className="text-[10px]" />
        </button>
      </div>
      <div className="flex h-[30px] min-w-0 items-center justify-end text-xs text-gray-600">
        {disabled ? (
          "—"
        ) : loading ? (
          <Spin size="small" />
        ) : error ? (
          <Tooltip title={error.message}>
            <span className="text-gray-400">{t("加载失败")}</span>
          </Tooltip>
        ) : (
          children
        )}
      </div>
    </section>
  );
}

export function YesterdayMacSummary({ rows }: { rows: AgentDailyMacStat[] }) {
  if (!rows.length) return <span className="text-gray-400">{t("暂无昨日数据")}</span>;
  const count = (value: number | null) => (value == null ? "—" : value.toLocaleString());
  return (
    <Tooltip
      title={
        <div>
          <div>{t("各 Agent 独立统计")}</div>
          {rows.map((row, index) => (
            <div key={`${row.agent_name}_${index}`}>
              {row.agent_name}：{t("新增")} {count(row.added_mac_count)}，{t("减少")}{" "}
              {count(row.removed_mac_count)}
            </div>
          ))}
        </div>
      }
    >
      <div className="w-full min-w-0 leading-[15px]">
        {rows.slice(0, 2).map((row, index) => (
          <div
            key={`${row.agent_name}_${index}`}
            className="flex min-w-0 items-center justify-end gap-2 tabular-nums"
          >
            {rows.length > 1 ? (
              <span className="min-w-0 flex-1 truncate text-gray-400">{row.agent_name || "Agent"}</span>
            ) : null}
            <span className="shrink-0">
              {t("新增")}{" "}
              <strong className="font-semibold text-emerald-600">{count(row.added_mac_count)}</strong>
            </span>
            <span className="shrink-0">
              {t("减少")}{" "}
              <strong className="font-semibold text-red-500">{count(row.removed_mac_count)}</strong>
            </span>
          </div>
        ))}
      </div>
    </Tooltip>
  );
}

export function YesterdayPowerSummary({ data }: { data?: DailyPowerDetailData }) {
  if (data?.total_power_mw == null) return <span className="text-gray-400">{t("暂无昨日数据")}</span>;
  const partial = data.list.some((agent) => agent.status !== "valid");
  return (
    <Tooltip title={partial ? `${t("数据不完整")} · ${t("可用数据合计")}` : undefined}>
      <div className="min-w-0 text-right text-2xl font-semibold leading-tight text-gray-800 tabular-nums">
        {formatPower(data.total_power_mw)}
        <span className="ml-1 text-xs font-normal text-gray-400">MW</span>
        {partial ? (
          <span aria-label={t("数据不完整")} className="ml-1 align-middle text-xs text-amber-600">
            ◆
          </span>
        ) : null}
      </div>
    </Tooltip>
  );
}
