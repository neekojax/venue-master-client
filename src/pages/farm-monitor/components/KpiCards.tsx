import {
  ApiOutlined,
  CloudOutlined,
  DashboardOutlined,
  DisconnectOutlined,
  FireOutlined,
  PoweroffOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Spin } from "antd";
import type { KpiSummary } from "../types";

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
}> = [
  { key: "theoreticalOnline", label: "理论在架数", icon: ApiOutlined, color: "#1677ff", bg: "#e6f4ff" },
  { key: "online", label: "扫描数", icon: DashboardOutlined, color: "#52c41a", bg: "#f6ffed" },
  { key: "theoreticalOffline", label: "异常数", icon: DisconnectOutlined, color: "#8c8c8c", bg: "#fafafa" },
  { key: "lowHashrate", label: "低算力", icon: WarningOutlined, color: "#fa8c16", bg: "#fff7e6" },
  { key: "zeroHashrate", label: "零算力", icon: PoweroffOutlined, color: "#ff4d4f", bg: "#fff1f0" },
  { key: "networkEvents", label: "网络事件", icon: CloudOutlined, color: "#13c2c2", bg: "#e6fffb" },
  { key: "powerLimitEvents", label: "限电事件", icon: ThunderboltOutlined, color: "#faad14", bg: "#fffbe6" },
  { key: "highTempEvents", label: "高温事件", icon: FireOutlined, color: "#eb2f96", bg: "#fff0f6" },
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
          const clickable = card.key === "theoreticalOffline" && onAbnormalClick;
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
                <div className="text-xs text-gray-500 truncate">{card.label}</div>
                <div
                  className={`text-2xl font-semibold text-gray-800 leading-tight ${
                    clickable ? "hover:underline underline-offset-4" : ""
                  }`}
                >
                  {formatKpiValue(data[card.key])}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Spin>
  );
}
