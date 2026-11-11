import { ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Drawer, Empty, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { type AgentPowerDetail, fetchDailyPowerDetail } from "../miner-power-api";
import { formatCoverage, formatPower, powerStatusLabel } from "../miner-power-utils";
import { convertUTCToLocal } from "@/utils/date";

import { t } from "@/locales";

interface Props {
  venueType: string;
  siteCode: string;
  siteName: string;
  businessDate: string;
  agentCode: string;
  agentNames: Map<string, string>;
  onClose: () => void;
}

export default function DailyPowerDetailsDrawer({
  venueType,
  siteCode,
  siteName,
  businessDate,
  agentCode,
  agentNames,
  onClose,
}: Props) {
  const query = useQuery({
    queryKey: ["site-agent-daily-power-detail", venueType, siteCode, businessDate, agentCode],
    queryFn: ({ signal }) => fetchDailyPowerDetail(venueType, siteCode, businessDate, agentCode, signal),
  });
  const columns: ColumnsType<AgentPowerDetail> = [
    {
      title: t("Agent 名称"),
      dataIndex: "agent_code",
      width: 210,
      render: (code: string, row) => row.agent_name || agentNames.get(code) || code,
    },
    {
      title: t("日平均总功耗（MW）"),
      dataIndex: "total_average_load_mw",
      align: "right",
      width: 180,
      render: formatPower,
    },
    {
      title: t("黑名单平均功耗（MW）"),
      dataIndex: "blacklist_average_load_mw",
      align: "right",
      width: 190,
      render: formatPower,
    },
    {
      title: t("白名单平均功耗（MW）"),
      dataIndex: "whitelist_average_load_mw",
      align: "right",
      width: 190,
      render: formatPower,
    },
    {
      title: t("覆盖时长（小时）"),
      dataIndex: "covered_seconds",
      align: "right",
      width: 150,
      render: (seconds: number) => (seconds == null ? "—" : (seconds / 3600).toFixed(2)),
    },
    { title: t("覆盖率"), dataIndex: "coverage_ratio", align: "right", width: 110, render: formatCoverage },
    {
      title: t("数据状态"),
      dataIndex: "status",
      width: 140,
      render: (status: AgentPowerDetail["status"]) => (
        <Tag color={status === "partial" ? "orange" : status === "valid" ? "green" : undefined}>
          {powerStatusLabel(status)}
        </Tag>
      ),
    },
    {
      title: t("更新时间"),
      dataIndex: "updated_at",
      width: 180,
      render: (date: string) =>
        date ? convertUTCToLocal(date, "YYYY-MM-DD HH:mm:ss", false, "Asia/Shanghai") : "—",
    },
  ];
  return (
    <Drawer
      open
      title={t("当日功耗明细")}
      width="min(1500px, 96vw)"
      classNames={{ body: "daily-mac-stats" }}
      onClose={onClose}
      extra={
        <Button icon={<ReloadOutlined />} loading={query.isFetching} onClick={() => void query.refetch()}>
          {t("刷新")}
        </Button>
      }
    >
      <div className="mb-3 text-sm text-gray-700">
        {siteName} · {businessDate}
        {agentCode ? ` · ${agentNames.get(agentCode) || agentCode}` : ""}
      </div>
      <p className="mb-5 text-xs text-gray-400">
        {t("统计窗口（上海时间）")}：{businessDate} 08:00 —{" "}
        {dayjs(businessDate).add(1, "day").format("YYYY-MM-DD")} 08:00
      </p>
      {query.isError ? (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message={query.error.message}
          action={<Button onClick={() => void query.refetch()}>{t("重试")}</Button>}
        />
      ) : null}
      {query.data ? (
        <div className="mb-5 flex flex-wrap gap-6 text-sm text-gray-700">
          <span>
            {t("可用数据合计")}：<strong>{formatPower(query.data.total_power_mw)} MW</strong>
          </span>
          <span>
            {t("已覆盖时段用电量")}：{formatPower(query.data.total_energy_mwh)} MWh
          </span>
        </div>
      ) : null}
      <Table<AgentPowerDetail>
        rowKey="agent_code"
        columns={columns}
        dataSource={query.data?.list ?? []}
        loading={query.isFetching}
        size="middle"
        scroll={{ x: 1450 }}
        pagination={false}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("暂无功耗数据")} /> }}
      />
    </Drawer>
  );
}
