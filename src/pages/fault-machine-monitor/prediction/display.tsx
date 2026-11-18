import { Tag } from "antd";

import { getLanguage, t } from "@/locales";

export const severities = [
  { value: "high", label: t("高风险") },
  { value: "medium", label: t("需关注") },
  { value: "low", label: t("观察") },
];
export const statuses = [
  { value: "pending", label: t("待确认") },
  { value: "acknowledged", label: t("已确认") },
  { value: "processing", label: t("处理中") },
  { value: "resolved", label: t("人工已处理") },
];
// Translate known interface text while keeping free-form logs and operator notes intact.
export const faultText = (value?: string | null) => {
  const text = value?.replace(/异常/g, "故障");
  return text ? t(text) : "—";
};

export const categoryText = (value?: string | null) => (value === "未分类" ? t("其他") : faultText(value));

// Values remain the API's original category keys in both languages.
export const categories = ["风扇", "电源", "温度", "算力板", "控制板", "网络", "算力异常", "未分类"].map(
  (value) => ({ value, label: categoryText(value) }),
);
export const statusLabel = (value: string) =>
  value === "none" ? t("无告警") : statuses.find((item) => item.value === value)?.label || value;
export const renderSeverity = (value: string) => (
  <Tag color={({ high: "red", medium: "orange", low: "blue" } as Record<string, string>)[value]}>
    {severities.find((item) => item.value === value)?.label || value}
  </Tag>
);
const formatter = new Intl.DateTimeFormat(getLanguage() === "en" ? "en-US" : "zh-CN", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});
export function shanghaiTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : formatter.format(date);
}
