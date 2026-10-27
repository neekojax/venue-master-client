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
import type { KpiSummary } from "../types";

import { t } from "@/locales";

interface KpiCardsProps {
  data: KpiSummary;
  loading?: boolean;
  onAbnormalClick?: () => void;
}

const CARDS: Array<{
  key: keyof KpiSummary;
  label: string;
  icon: typeof ApiOutlined;
  color: string;
  bg: string;
  description?: string;
  showNoAbnormalPlaceholder?: boolean;
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
    showNoAbnormalPlaceholder: true,
  },
  {
    key: "otherImpactEvents",
    label: t("昨日异常矿工"),
    icon: DisconnectOutlined,
    color: "#8c8c8c",
    bg: "#fafafa",
    showNoAbnormalPlaceholder: true,
  },
];

function formatKpiValue(value: number | null) {
  return value == null ? "-" : String(value);
}

export default function KpiCards({ data, loading = false, onAbnormalClick }: KpiCardsProps) {
  return (
    <Spin spinning={loading}>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {CARDS.map((card) => {
          const Icon = card.icon;
          const isNoAbnormal =
            (card.key === "theoreticalOffline" && data.theoreticalOffline === 0) ||
            (card.key === "yesterdayAbnormal" && data.yesterdayAbnormal === 0) ||
            Boolean(card.showNoAbnormalPlaceholder);
          const clickable = card.key === "yesterdayAbnormal" && onAbnormalClick;
          return (
            <button
              key={card.key}
              type="button"
              onClick={clickable ? onAbnormalClick : undefined}
              className={`bg-white rounded-lg border border-gray-200 px-4 py-3 flex items-center gap-3 w-full text-left ${
                clickable ? "hover:border-blue-300 hover:shadow-sm cursor-pointer" : "cursor-default"
              }`}
            >
              <div
                className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                style={{ backgroundColor: card.bg, color: card.color }}
              >
                <Icon style={{ fontSize: 20 }} />
              </div>
              <div className="flex-1 min-w-0 text-right">
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
                  {isNoAbnormal ? (
                    <span className="inline-flex items-center gap-1 text-base text-emerald-600">
                      <CheckCircleOutlined />
                      {t("无异常")}
                    </span>
                  ) : (
                    formatKpiValue(data[card.key])
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Spin>
  );
}
