import type { ReactNode } from "react";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Select, Space, Tag, Tooltip } from "antd";
import type { BinaryStatus, RiskLevel } from "./api";

export const pageSize = 50;

export const cleanParams = (params: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== ""));

export function StatusTag({ value }: { value: BinaryStatus | number }) {
  return <Tag color={value === 1 ? "success" : "default"}>{value === 1 ? "启用" : "禁用"}</Tag>;
}

const riskMap: Record<RiskLevel, { color: string; label: string }> = {
  low: { color: "success", label: "低" },
  medium: { color: "processing", label: "中" },
  high: { color: "warning", label: "高" },
  critical: { color: "error", label: "严重" },
};

export function RiskTag({ value }: { value: RiskLevel }) {
  const item = riskMap[value] || { color: "default", label: value };
  return <Tag color={item.color}>{item.label}</Tag>;
}

export function riskLevelOptions(riskLevels: RiskLevel[]) {
  return riskLevels.map((level) => ({
    label: (
      <span className="authz-risk-option">
        <span className={`authz-risk-dot is-${level}`} />
        {riskMap[level]?.label || level}
      </span>
    ),
    value: level,
  }));
}

export const statusOptions = [
  { label: "全部状态", value: "" },
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 },
];

export function FilterBar({
  keyword,
  setKeyword,
  onSearch,
  onRefresh,
  children,
  extra,
  showSearchButton = true,
  placeholder = "搜索关键词",
}: {
  keyword?: string;
  setKeyword?: (value: string) => void;
  onSearch: () => void;
  onRefresh: () => void;
  children?: ReactNode;
  extra?: ReactNode;
  showSearchButton?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="authz-filter-bar">
      <Space wrap size={10}>
        {setKeyword && (
          <Input
            allowClear
            value={keyword}
            placeholder={placeholder}
            prefix={<SearchOutlined className="text-gray-400" />}
            onChange={(event) => setKeyword(event.target.value)}
            onPressEnter={onSearch}
            style={{ width: 240 }}
          />
        )}
        {children}
        {showSearchButton && (
          <Button type="primary" icon={<SearchOutlined />} onClick={onSearch}>
            查询
          </Button>
        )}
        <Tooltip title="刷新">
          <Button aria-label="刷新" icon={<ReloadOutlined />} onClick={onRefresh} />
        </Tooltip>
      </Space>
      <Space wrap>{extra}</Space>
    </div>
  );
}

export function StatusSelect({
  value,
  onChange,
}: {
  value?: BinaryStatus | "";
  onChange: (value: any) => void;
}) {
  return <Select value={value} options={statusOptions} onChange={onChange} style={{ width: 120 }} />;
}

export const formatTime = (value?: string) => value || "—";
