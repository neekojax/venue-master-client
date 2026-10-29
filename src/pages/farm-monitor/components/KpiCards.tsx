import { useState } from "react";
import {
  ApiOutlined,
  CheckCircleOutlined,
  DashboardOutlined,
  DisconnectOutlined,
  PoweroffOutlined,
  QuestionCircleOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Spin, Tooltip } from "antd";
import type { KpiSummary, MinerCodeAnomalySummary, OtherPoolMachineAnomalySummary } from "../types";

import { t } from "@/locales";

interface KpiCardsProps {
  data: KpiSummary;
  loading?: boolean;
  onAbnormalClick?: () => void;
  yesterdayAbnormalCalculating?: boolean;
  latestMinerAnomaly?: MinerCodeAnomalySummary;
  latestMinerAnomalyLoading?: boolean;
  yesterdayMinerAnomaly?: OtherPoolMachineAnomalySummary;
}

const CARDS: Array<{
  key: keyof KpiSummary;
  label: string;
  icon: typeof ApiOutlined;
  color: string;
  bg: string;
  description?: string;
}> = [
  { key: "theoreticalOnline", label: t("理论在架数"), icon: ApiOutlined, color: "#1677ff", bg: "#e6f4ff" },
  { key: "online", label: t("最新在线数"), icon: DashboardOutlined, color: "#52c41a", bg: "#f6ffed" },
  {
    key: "theoreticalOffline",
    label: t("最新异常"),
    icon: DisconnectOutlined,
    color: "#8c8c8c",
    bg: "#fafafa",
    description: t("当前在架，但未识别到的机器"),
  },
  {
    key: "yesterdayAbnormal",
    label: t("昨日异常"),
    icon: DisconnectOutlined,
    color: "#8c8c8c",
    bg: "#fafafa",
    description: t("昨日在架，但未识别到的机器"),
  },
  { key: "lowHashrate", label: t("低算力"), icon: WarningOutlined, color: "#fa8c16", bg: "#fff7e6" },
  { key: "zeroHashrate", label: t("零算力"), icon: PoweroffOutlined, color: "#ff4d4f", bg: "#fff1f0" },
  {
    key: "powerLimitEvents",
    label: t("最新异常矿工"),
    icon: DisconnectOutlined,
    color: "#8c8c8c",
    bg: "#fafafa",
  },
  {
    key: "otherImpactEvents",
    label: t("昨日异常矿工"),
    icon: DisconnectOutlined,
    color: "#8c8c8c",
    bg: "#fafafa",
  },
];

function formatKpiValue(value: number | null) {
  return value == null ? "-" : String(value);
}

export default function KpiCards({
  data,
  loading = false,
  onAbnormalClick,
  yesterdayAbnormalCalculating = false,
  latestMinerAnomaly,
  latestMinerAnomalyLoading = false,
  yesterdayMinerAnomaly,
}: KpiCardsProps) {
  const [expandedMinerCard, setExpandedMinerCard] = useState<"latest" | "yesterday" | null>(null);

  return (
    <Spin spinning={loading}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CARDS.map((card) => {
          const Icon = card.icon;
          const isNoAbnormal =
            (card.key === "theoreticalOffline" && data.theoreticalOffline === 0) ||
            (card.key === "yesterdayAbnormal" &&
              data.yesterdayAbnormal === 0 &&
              !yesterdayAbnormalCalculating);
          const isYesterdayAbnormalCalculating =
            card.key === "yesterdayAbnormal" &&
            (yesterdayAbnormalCalculating || data.yesterdayAbnormal == null);
          const clickable =
            card.key === "yesterdayAbnormal" && !isYesterdayAbnormalCalculating && onAbnormalClick;
          const minerCardType =
            card.key === "powerLimitEvents"
              ? "latest"
              : card.key === "otherImpactEvents"
                ? "yesterday"
                : null;
          const isMinerCard = minerCardType != null;
          const minerAnomaly = minerCardType === "latest" ? latestMinerAnomaly : yesterdayMinerAnomaly;
          const minerCardLoading = minerCardType === "latest" && latestMinerAnomalyLoading;
          const minerCodeData = minerAnomaly?.minerCodeData ?? [];
          const hasMinerAnomaly = (minerAnomaly?.abnormalCount ?? 0) > 0;
          const hasMoreMinerCodes = minerCodeData.length > 2;
          const showAllMinerCodes = expandedMinerCard === minerCardType;
          const visibleMinerCodeData = showAllMinerCodes ? minerCodeData : minerCodeData.slice(0, 2);
          return (
            <div
              key={card.key}
              onClick={clickable ? onAbnormalClick : undefined}
              onKeyDown={
                clickable
                  ? (event) => {
                      if (event.key === "Enter" || event.key === " ") onAbnormalClick?.();
                    }
                  : undefined
              }
              role={clickable ? "button" : undefined}
              tabIndex={clickable ? 0 : undefined}
              className={`bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3 w-full text-left ${
                clickable ? "hover:border-blue-300 hover:shadow-sm cursor-pointer" : "cursor-default"
              }`}
            >
              {!isMinerCard ? (
                <div
                  className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                  style={{ backgroundColor: card.bg, color: card.color }}
                >
                  <Icon style={{ fontSize: 20 }} />
                </div>
              ) : null}
              <div
                className={`flex-1 min-w-0 ${
                  isMinerCard
                    ? `flex items-center gap-3 ${hasMinerAnomaly ? "" : "justify-end"}`
                    : "text-right"
                }`}
              >
                {isMinerCard && hasMinerAnomaly ? (
                  <div className="min-w-0 flex-1 text-left text-xs leading-5 text-gray-500">
                    {visibleMinerCodeData.map((item, index) => (
                      <div key={item.minerCode} className="truncate" title={item.minerCode}>
                        <span className="text-gray-700">{item.minerCode}</span>
                        <span className="ml-1 text-gray-400">
                          {item.abnormalCount} {t("台")}
                        </span>
                        {hasMoreMinerCodes && index === visibleMinerCodeData.length - 1 ? (
                          <button
                            type="button"
                            className="ml-2 text-blue-500 hover:text-blue-600"
                            onClick={(event) => {
                              event.stopPropagation();
                              setExpandedMinerCard((current) =>
                                current === minerCardType ? null : minerCardType,
                              );
                            }}
                          >
                            {t(showAllMinerCodes ? "收起" : "更多")}
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                ) : null}
                <div>
                  <div className="flex items-center justify-end gap-1 text-xs text-gray-500 truncate">
                    <span className="truncate">{card.label}</span>
                    {card.description ? (
                      <Tooltip title={card.description}>
                        <QuestionCircleOutlined className="shrink-0 cursor-help text-gray-400" />
                      </Tooltip>
                    ) : null}
                  </div>
                  <div
                    className={`text-2xl font-semibold text-gray-800 leading-tight ${
                      clickable ? "hover:underline underline-offset-4" : ""
                    }`}
                  >
                    {isMinerCard ? (
                      minerCardLoading ? (
                        <Spin size="small" />
                      ) : minerAnomaly == null ? (
                        "-"
                      ) : hasMinerAnomaly ? (
                        <>
                          {minerAnomaly.abnormalCount}
                          <span className="ml-1 text-xs font-normal text-gray-400">{t("台")}</span>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-base text-emerald-600">
                          <CheckCircleOutlined />
                          {t("无异常")}
                        </span>
                      )
                    ) : isYesterdayAbnormalCalculating ? (
                      <span className="text-base font-medium text-slate-400">{t("计算中")}</span>
                    ) : isNoAbnormal ? (
                      <span className="inline-flex items-center gap-1 text-base text-emerald-600">
                        <CheckCircleOutlined />
                        {t("无异常")}
                      </span>
                    ) : (
                      formatKpiValue(data[card.key])
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Spin>
  );
}
