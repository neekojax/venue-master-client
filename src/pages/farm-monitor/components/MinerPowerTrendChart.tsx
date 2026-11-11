import { useEffect, useMemo, useRef } from "react";
import { ReactEcharts } from "@/components/react-echarts";
import type { DailyPowerTrend } from "../miner-power-api";
import { formatCoverage, formatPower, powerDayStatus, powerStatusLabel } from "../miner-power-utils";

import { t } from "@/locales";

interface Props {
  rows: DailyPowerTrend[];
  onDateClick: (date: string) => void;
}

export default function MinerPowerTrendChart({ rows, onDateClick }: Props) {
  const ref = useRef<React.ComponentRef<typeof ReactEcharts>>(null);
  const option = useMemo(() => {
    const agents = [
      ...new Map(rows.flatMap((day) => day.agents).map((agent) => [agent.agent_code, agent])).values(),
    ];
    const agentLabels = new Map(
      agents.map((agent) => [`agent:${agent.agent_code}`, agent.agent_name || "Agent"]),
    );
    const expectedCodes = agents.map((agent) => agent.agent_code);
    const point = (value: number | null, incomplete: boolean) =>
      incomplete && value != null
        ? { value, symbol: "diamond", symbolSize: 9, itemStyle: { color: "#faad14" } }
        : value;
    return {
      color: ["#1677ff", "#52b59a", "#8b5cf6", "#f59e0b", "#06b6d4", "#ec4899"],
      textStyle: { fontFamily: "XPK, Arial, sans-serif", fontSize: 12 },
      legend: {
        type: "scroll",
        top: 0,
        icon: "roundRect",
        itemWidth: 16,
        itemHeight: 3,
        selected: { [t("场地合计")]: false },
        formatter: (name: string) => agentLabels.get(name) ?? name,
      },
      grid: { top: 60, left: 64, right: 24, bottom: 40 },
      tooltip: {
        trigger: "axis",
        renderMode: "richText",
        confine: true,
        formatter: (items: { dataIndex: number }[]) => {
          const day = rows[items[0]?.dataIndex ?? -1];
          if (!day) return "";
          const partial = powerDayStatus(day, expectedCodes) === "partial";
          return [
            day.business_date,
            `${partial ? t("可用数据合计") : t("场地合计")}：${formatPower(day.total_power_mw)} MW`,
            ...day.agents.map(
              (agent) =>
                `${agent.agent_name || agent.agent_code}：${formatPower(agent.status === "no_data" ? null : agent.power_mw)} MW · ${powerStatusLabel(agent.status)} · ${t("覆盖率")} ${formatCoverage(agent.coverage_ratio)}`,
            ),
          ].join("\n");
        },
      },
      xAxis: {
        type: "category",
        data: rows.map((row) => row.business_date),
        triggerEvent: true,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "#e5e7eb" } },
        axisLabel: { color: "#6b7280", formatter: (date: string) => date.slice(5) },
      },
      yAxis: {
        type: "value",
        name: `${t("日平均功耗")} (MW)`,
        axisLabel: { color: "#6b7280" },
        splitLine: { lineStyle: { color: "#f0f1f3", type: "dashed" } },
      },
      series: [
        {
          id: "site-total",
          name: t("场地合计"),
          type: "line",
          connectNulls: false,
          symbol: "none",
          lineStyle: { width: 3 },
          data: rows.map((row) =>
            point(row.total_power_mw, powerDayStatus(row, expectedCodes) === "partial"),
          ),
        },
        ...agents.map((agent) => ({
          id: agent.agent_code,
          name: `agent:${agent.agent_code}`,
          type: "line",
          connectNulls: false,
          symbol: "none",
          lineStyle: { width: 1.5 },
          data: rows.map((row) => {
            const value = row.agents.find((item) => item.agent_code === agent.agent_code);
            return point(
              value?.status === "no_data" ? null : (value?.power_mw ?? null),
              value?.status === "partial",
            );
          }),
        })),
      ],
    };
  }, [rows]);

  useEffect(() => {
    const chart = ref.current?.getEChartInstance();
    if (!chart) return;
    const click = (event: { componentType?: string; value?: unknown; dataIndex?: number }) => {
      const date = event.componentType === "xAxis" ? event.value : rows[event.dataIndex ?? -1]?.business_date;
      if (typeof date === "string") onDateClick(date);
    };
    chart.on("click", click);
    return () => {
      chart.off("click", click);
    };
  }, [onDateClick, rows]);

  return <ReactEcharts ref={ref} renderer="svg" option={option} style={{ height: 340 }} />;
}
