import { ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Drawer, Empty, Table, Tabs, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { type DailyMacChangeDetail, fetchDailyMacChanges } from "../daily-mac-stats-api";
import { convertUTCToLocal } from "@/utils/date";

import "../daily-mac-stats.css";

import { t } from "@/locales";

interface Props {
  venueType: string;
  siteCode: string;
  siteName: string;
  statDate: string;
  onClose: () => void;
}

function timestamp(value: string) {
  return value && dayjs(value).isValid()
    ? convertUTCToLocal(value, "YYYY-MM-DD HH:mm:ss", false, "Asia/Shanghai")
    : "—";
}

export default function DailyMacChangesDrawer({ venueType, siteCode, siteName, statDate, onClose }: Props) {
  const query = useQuery({
    queryKey: ["site-daily-mac-changes", venueType, siteCode, statDate],
    queryFn: ({ signal }) => fetchDailyMacChanges(venueType, siteCode, statDate, signal),
    enabled: Boolean(venueType && siteCode && statDate),
    retry: false,
  });
  const data = query.data;
  const columns: ColumnsType<DailyMacChangeDetail> = [
    { title: "MAC", dataIndex: "mac_address", width: 190, render: (value: string) => value || "—" },
    { title: "IP", dataIndex: "ip_address", width: 150, render: (value: string) => value || "—" },
    { title: t("矿工号"), dataIndex: "miner_code", width: 160, render: (value: string) => value || "—" },
    {
      title: t("控制板 SN"),
      dataIndex: "control_board_sn",
      width: 180,
      render: (value: string) => value || "—",
    },
    { title: t("Agent 名称"), dataIndex: "agent_name", width: 190 },
    { title: t("对比日期"), dataIndex: "compare_date", width: 130 },
    { title: t("最新采集时间"), dataIndex: "last_seen_at", width: 180, render: timestamp },
  ];
  const comparisonDates = data
    ? [...new Set(data.comparisons.map((item) => item.compare_date))].join(" / ")
    : "—";
  const comparisonDetails = data?.comparisons
    .map((item) => `${item.agent_name} · ${item.compare_date}`)
    .join("；");

  return (
    <Drawer
      open
      placement="right"
      title={t("场地 MAC 增减详情")}
      width="min(1320px, 96vw)"
      classNames={{ body: "daily-mac-stats" }}
      onClose={onClose}
      extra={
        <Button icon={<ReloadOutlined />} loading={query.isFetching} onClick={() => void query.refetch()}>
          {t("刷新")}
        </Button>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-gray-700">
        <Tag color="blue">{venueType}</Tag>
        <span>{siteName || siteCode}</span>
        <span>· {statDate}</span>
      </div>
      <p className="mb-3 text-xs leading-5 text-gray-500">
        {t("按整个场地去重，同一 MAC 在场地内不同 Agent 之间转移不计增减。")}
      </p>
      {data ? (
        <Tooltip title={comparisonDetails}>
          <p className="mb-5 text-xs text-gray-500">
            {t("对比日期")}：{comparisonDates}
          </p>
        </Tooltip>
      ) : null}
      {query.isError ? (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message={query.error.message}
          action={<Button onClick={() => void query.refetch()}>{t("重试")}</Button>}
        />
      ) : null}
      {query.isLoading || data ? (
        <Tabs
          defaultActiveKey="added"
          items={[
            {
              key: "added",
              label: t("新增 MAC"),
              count: data?.added_count,
              rows: data?.added ?? [],
              color: "green",
              empty: t("暂无新增 MAC"),
            },
            {
              key: "removed",
              label: t("减少 MAC"),
              count: data?.removed_count,
              rows: data?.removed ?? [],
              color: "red",
              empty: t("暂无减少 MAC"),
            },
          ].map((tab) => ({
            key: tab.key,
            label: (
              <span className="inline-flex items-center gap-2">
                {tab.label}
                <Tag color={tab.color} className="m-0">
                  {tab.count == null ? "—" : tab.count.toLocaleString()}
                </Tag>
              </span>
            ),
            children: (
              <div>
                {tab.key === "removed" ? (
                  <p className="mb-4 text-xs text-gray-500">
                    {t("减少列表展示该 MAC 在对比基准日的最后记录。")}
                  </p>
                ) : null}
                <Table<DailyMacChangeDetail>
                  rowKey={(row) => `${row.stat_date}_${row.agent_id}_${row.id}`}
                  columns={columns}
                  dataSource={tab.rows}
                  loading={query.isFetching}
                  size="middle"
                  scroll={{ x: 1180 }}
                  pagination={{
                    defaultPageSize: 20,
                    showSizeChanger: true,
                    pageSizeOptions: [20, 50, 100],
                    showTotal: (total) => t("共 {{total}} 条记录", { total }),
                  }}
                  locale={{
                    emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={tab.empty} />,
                  }}
                />
              </div>
            ),
          }))}
        />
      ) : null}
    </Drawer>
  );
}
