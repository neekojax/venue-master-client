import { useState } from "react";
import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Drawer, Empty, message, Pagination, Space, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { saveAs } from "file-saver";
import {
  exportMachineDailyRecords,
  fetchMachineDailyRecords,
  type MachineDailyRecord,
} from "../daily-mac-stats-api";
import { convertUTCToLocal } from "@/utils/date";

import "../daily-mac-stats.css";

import { t } from "@/locales";

interface Props {
  venueType: string;
  siteCode: string;
  siteName: string;
  statDate: string;
  page: number;
  pageSize: number;
  onClose: () => void;
  onPageChange: (page: number, pageSize: number) => void;
}

function timestamp(value: string) {
  return value && dayjs(value).isValid()
    ? convertUTCToLocal(value, "YYYY-MM-DD HH:mm:ss", false, "Asia/Shanghai")
    : "—";
}

export default function DailyMachineRecordsDrawer({
  venueType,
  siteCode,
  siteName,
  statDate,
  page,
  pageSize,
  onClose,
  onPageChange,
}: Props) {
  const [downloading, setDownloading] = useState(false);
  const recordsQuery = useQuery({
    queryKey: ["site-machine-daily-records", venueType, siteCode, statDate, page, pageSize],
    queryFn: ({ signal }) => fetchMachineDailyRecords(venueType, siteCode, statDate, page, pageSize, signal),
    enabled: Boolean(venueType && siteCode && statDate),
  });
  const data = recordsQuery.data;

  const handleDownload = async () => {
    if (downloading || !venueType || !siteCode || !statDate) return;
    setDownloading(true);
    try {
      const blob = await exportMachineDailyRecords(venueType, siteCode, statDate);
      saveAs(blob, `machine-daily-records-${venueType}-${statDate}.csv`);
      message.success(t("下载成功"));
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("下载失败，请稍后重试"));
    } finally {
      setDownloading(false);
    }
  };

  const columns: ColumnsType<MachineDailyRecord> = [
    {
      title: "MAC",
      dataIndex: "mac_address",
      width: 190,
      render: (value: string) => value || "—",
    },
    { title: "IP", dataIndex: "ip_address", width: 150 },
    { title: t("矿工号"), dataIndex: "miner_code", width: 160 },
    { title: t("控制板 SN"), dataIndex: "control_board_sn", width: 180 },
    {
      title: t("命中白名单"),
      dataIndex: "miner_whitelisted",
      width: 120,
      render: (value: boolean) => <Tag color={value ? "green" : undefined}>{value ? t("是") : t("否")}</Tag>,
    },
    {
      title: t("命中黑名单"),
      dataIndex: "miner_blacklisted",
      width: 120,
      render: (value: boolean) => <Tag color={value ? "red" : undefined}>{value ? t("是") : t("否")}</Tag>,
    },
    { title: t("最新采集时间"), dataIndex: "last_seen_at", width: 180, render: timestamp },
    { title: t("创建时间"), dataIndex: "created_at", width: 180, render: timestamp },
    { title: t("更新时间"), dataIndex: "updated_at", width: 180, render: timestamp },
  ];

  return (
    <Drawer
      title={t("当日机器记录")}
      classNames={{ body: "daily-mac-stats" }}
      open
      width="min(1500px, 96vw)"
      onClose={onClose}
      extra={
        <Space>
          <Button
            icon={<DownloadOutlined />}
            loading={downloading}
            disabled={!venueType || !siteCode || !statDate}
            onClick={() => void handleDownload()}
          >
            {t("下载")}
          </Button>
          <Button
            icon={<ReloadOutlined />}
            loading={recordsQuery.isFetching}
            onClick={() => void recordsQuery.refetch()}
          >
            {t("刷新")}
          </Button>
        </Space>
      }
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 text-gray-700">
        <Tag color="blue">{venueType}</Tag>
        <span>
          {t("场地")}：{siteName}
        </span>
        <span>· {statDate}</span>
      </div>
      <p className="text-sm text-gray-500">
        {t("统计窗口（上海时间）")}：{statDate} 08:00 — {dayjs(statDate).add(1, "day").format("YYYY-MM-DD")}{" "}
        08:00
      </p>
      {recordsQuery.isError ? (
        <Alert
          className="mb-4"
          type="error"
          showIcon
          message={recordsQuery.error.message}
          action={<Button onClick={() => void recordsQuery.refetch()}>{t("重试")}</Button>}
        />
      ) : null}
      <Table<MachineDailyRecord>
        rowKey={(row) => `${row.stat_date}_${row.id}`}
        columns={columns}
        dataSource={data?.list ?? []}
        loading={recordsQuery.isFetching}
        pagination={false}
        scroll={{ x: 1560 }}
        size="middle"
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("暂无当日机器记录")} />,
        }}
      />
      {data ? (
        <div className="mt-4 flex justify-end">
          <Pagination
            current={data.page}
            pageSize={data.pageSize}
            total={data.total}
            showSizeChanger
            pageSizeOptions={[20, 50, 100, 200, 500]}
            showTotal={(total) => t("共 {{total}} 条记录", { total })}
            onChange={(nextPage, nextPageSize) =>
              onPageChange(nextPageSize !== data.pageSize ? 1 : nextPage, nextPageSize)
            }
          />
        </div>
      ) : null}
    </Drawer>
  );
}
