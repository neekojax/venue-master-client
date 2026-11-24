import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { SyncOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Segmented, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import WeeklyBusinessReport from "./WeeklyBusinessReport";
import type { WeeklyReportRow } from "./weeklyMock";
import { useSelector, useSettingsStore } from "@/stores";
import { getLoginAccountId } from "@/utils/account-preferences";
import { getTimeDifference } from "@/utils/date";

import { t } from "@/locales";
import { getLast10DaysDailyStat, getLast10Event } from "@/pages/venue/api.tsx";

interface SubAccountStat {
  pool_name: string;
  btcOutput24h: number;
  theoreticalPower: number;
  power24h: number;
  effectiveRate24h: number;
  totalMachines: number;
  totalFailures: number;
  totalFailuresRate: number;
  failures24h: number;
  shelved?: number;
  failureRate24h: number;
  onlineRatio: number;
  impactRatio: number;
  limitImpactRate: number;
  highTemperatureRate: number;
}

interface DailyRecord {
  key?: string;
  date: string;
  btcOutput24h: number;
  theoreticalPower: number;
  power24h: number;
  effectiveRate24h: number;
  totalMachines: number;
  totalFailures: number;
  totalFailuresRate: number;
  onlineRatio: number;
  failures24h: number;
  shelved: number;
  failureRate24h: number;
  impactRatio: number;
  limitImpactRate: number;
  highTemperatureRate: number;
  subAccountStats: SubAccountStat[];
}

interface AbnormalRecord {
  key: string;
  event: string;
  level: string;
  time: string;
  start_time: string;
  end_time: string;
  log_type: string;
}
interface BusinessReportProps {
  venueName: string;
  weeklyRows?: WeeklyReportRow[];
  onWeeklyViewChange?: (visible: boolean) => void;
  weeklyLoading?: boolean;
}

const BusinessReport: React.FC<BusinessReportProps> = ({
  venueName,
  weeklyRows = [],
  onWeeklyViewChange,
  weeklyLoading = false,
}) => {
  const accountId = getLoginAccountId();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [viewMode, setViewMode] = useState<"daily" | "events" | "weekly">("daily");
  const { venueId } = useParams<{ venueId: string }>();
  const daily = useQuery<DailyRecord[]>({
    queryKey: ["venue-detail-recent-daily", accountId, poolType, venueId],
    enabled: viewMode === "daily" && Boolean(poolType && venueId),
    queryFn: async () => (await getLast10DaysDailyStat(poolType, Number(venueId))).data,
  });
  const events = useQuery<AbnormalRecord[]>({
    queryKey: ["venue-detail-recent-events", accountId, poolType, venueId],
    enabled: viewMode === "events" && Boolean(poolType && venueId),
    queryFn: async () => (await getLast10Event(poolType, Number(venueId))).data,
  });
  const activeQuery = viewMode === "events" ? events : daily;

  // 子账户统计表格列配置
  const subAccountColumns: ColumnsType<SubAccountStat> = [
    { title: t("矿池名称"), dataIndex: "pool_name", key: "pool_name", fixed: "left", width: 120 },
    {
      title: t("24小时产出(BTC)"),
      dataIndex: "btcOutput24h",
      key: "btcOutput24h",
      width: 165,
      render: (value) => value.toFixed(8),
    },
    {
      title: t("理论算力(P)"),
      dataIndex: "theoreticalPower",
      width: 120,
      key: "theoreticalPower",
      align: "right",
      render: (value) => value.toFixed(2),
    },
    {
      title: t("24小时算力(P)"),
      dataIndex: "power24h",
      key: "power24h",
      width: 145,
      align: "right",
      render: (value) => <span className="font-semibold text-blue-600">{value.toFixed(2)}</span>,
    },
    {
      title: t("24小时有效率"),
      dataIndex: "effectiveRate24h",
      key: "effectiveRate24h",
      width: 140,
      align: "right",
      render: (value) => (
        <Tag color={value >= 95 ? "green" : value >= 90 ? "gold" : "red"}>{value.toFixed(2)}%</Tag>
      ),
    },
    {
      title: t("在架有效率"),
      dataIndex: "onlineRatio",
      key: "onlineRatio",
      width: 140,
      align: "center",
      render: (value) => `${value.toFixed(2)}%`,
    },
    { title: t("托管台数"), dataIndex: "totalMachines", key: "totalMachines", width: 105 },
    { title: t("总故障数"), dataIndex: "totalFailures", key: "totalFailures", width: 120 },
    {
      title: t("总故障率"),
      dataIndex: "totalFailuresRate",
      key: "totalFailuresRate",
      width: 120,
      render: (value) => (
        <span
          className={`font-medium ${value >= 1 ? "text-rose-600" : value >= 0.5 ? "text-amber-600" : "text-emerald-600"}`}
        >
          {value.toFixed(2)}%
        </span>
      ),
    },
    {
      title: t("24小时故障数"),
      dataIndex: "failures24h",
      key: "failures24h",
      width: 138,
      align: "right",
      render: (value) => <span className="font-medium text-amber-600">{value.toLocaleString()}</span>,
    },
    {
      title: t("24小时故障率"),
      dataIndex: "failureRate24h",
      key: "failureRate24h",
      width: 138,
      render: (value) => (
        <span
          className={`font-medium ${value >= 1 ? "text-rose-600" : value >= 0.5 ? "text-amber-600" : "text-emerald-600"}`}
        >
          {value.toFixed(2)}%
        </span>
      ),
    },
    {
      title: t("影响占比"),
      dataIndex: "impactRatio",
      key: "impactRatio",
      width: 105,
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: t("限电影响"),
      dataIndex: "limitImpactRate",
      key: "limitImpactRate",
      width: 140,
      align: "right",
      render: (value) => <span className="font-medium text-violet-600">{value.toFixed(2)}%</span>,
    },
    {
      title: t("高温影响"),
      dataIndex: "highTemperatureRate",
      key: "highTemperatureRate",
      width: 140,
      align: "right",
      render: (value) => <span className="font-medium text-orange-600">{value.toFixed(2)}%</span>,
    },
  ];

  const dailyColumns: ColumnsType<DailyRecord> = [
    { title: t("日期"), dataIndex: "date", key: "date", fixed: "left", width: 120 },
    {
      title: t("24小时产出(BTC)"),
      dataIndex: "btcOutput24h",
      key: "btcOutput24h",
      width: 165,
      render: (value) => value.toFixed(8),
    },
    {
      title: t("理论算力(P)"),
      dataIndex: "theoreticalPower",
      width: 120,
      key: "theoreticalPower",
      align: "right",
      render: (value) => value.toFixed(2),
    },
    {
      title: t("24小时算力(P)"),
      dataIndex: "power24h",
      key: "power24h",
      width: 145,
      align: "right",
      render: (value) => <span className="font-semibold text-blue-600">{value.toFixed(2)}</span>,
    },
    {
      title: t("24小时有效率"),
      dataIndex: "effectiveRate24h",
      key: "effectiveRate24h",
      width: 140,
      align: "right",
      render: (value) => (
        <Tag color={value >= 95 ? "green" : value >= 90 ? "gold" : "red"}>{value.toFixed(2)}%</Tag>
      ),
    },
    {
      title: t("在架有效率"),
      dataIndex: "onlineRatio",
      key: "onlineRatio",
      width: 140,
      align: "center",
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: t("托管台数"),
      dataIndex: "totalMachines",
      key: "totalMachines",
      width: 105,
      render: (value) => value.toLocaleString(),
    },
    {
      title: t("总故障数"),
      dataIndex: "totalFailures",
      key: "totalFailures",
      width: 120,
      render: (value) => value.toLocaleString(),
    },
    {
      title: t("总故障率"),
      dataIndex: "totalFailuresRate",
      key: "totalFailuresRate",
      width: 120,
      render: (value) => (
        <span
          className={`font-medium ${value >= 1 ? "text-rose-600" : value >= 0.5 ? "text-amber-600" : "text-emerald-600"}`}
        >
          {value.toFixed(2)}%
        </span>
      ),
    },
    {
      title: t("24小时故障数"),
      dataIndex: "failures24h",
      key: "failures24h",
      width: 138,
      align: "right",
      render: (value) => <span className="font-medium text-amber-600">{value.toLocaleString()}</span>,
    },
    {
      title: t("24小时上架数"),
      dataIndex: "shelved",
      key: "shelved",
      width: 138,
      align: "right",
      render: (value) => (
        <span className="font-medium text-emerald-600">{(value ?? 0).toLocaleString()}</span>
      ),
    },
    {
      title: t("24小时故障率"),
      dataIndex: "failureRate24h",
      key: "failureRate24h",
      width: 138,
      render: (value) => (
        <span
          className={`font-medium ${value >= 1 ? "text-rose-600" : value >= 0.5 ? "text-amber-600" : "text-emerald-600"}`}
        >
          {value.toFixed(2)}%
        </span>
      ),
    },
    {
      title: t("影响占比"),
      dataIndex: "impactRatio",
      key: "impactRatio",
      width: 105,
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: t("限电影响"),
      dataIndex: "limitImpactRate",
      key: "limitImpactRate",
      width: 140,
      align: "right",
      render: (value) => <span className="font-medium text-violet-600">{value.toFixed(2)}%</span>,
    },
    {
      title: t("高温影响"),
      dataIndex: "highTemperatureRate",
      key: "highTemperatureRate",
      width: 140,
      align: "right",
      render: (value) => <span className="font-medium text-orange-600">{value.toFixed(2)}%</span>,
    },
  ];

  const abnormalColumns: ColumnsType<AbnormalRecord> = [
    { title: t("日期"), dataIndex: "log_date", key: "log_date", fixed: "left", width: 120 },
    // { title: "影响时长", dataIndex: "level", key: "level" },
    // { title: "时间范围", dataIndex: "start_time", key: "start_time" },
    {
      title: t("影响时长"),
      dataIndex: "log_date",
      // width: 120,
      render: (text: string, record: any) => {
        if (text === "---valid---") {
          console.log(text);
        }
        if (record.start_time && record.end_time) {
          const duration = getTimeDifference(record.start_time, record.end_time);
          if (duration != "---") {
            return duration;
          }
          return (
            <Tag color="red">
              <SyncOutlined spin style={{ marginRight: 4 }} /> {t("影响中")}
            </Tag>
          );
        }
        return (
          <Tag color="red">
            <SyncOutlined spin style={{ marginRight: 4 }} /> {t("影响中")}
          </Tag>
        );
        // return dayjs(text).format("YYYY-MM-DD HH:mm");
      },
    },
    {
      title: t("时间范围"),
      dataIndex: "start_time",
      // width: 280,
      render: (_text, record) => `${record.start_time} - ${record.end_time}`,
    },
    {
      title: t("事件类型"),
      dataIndex: "log_type",
      key: "log_type",
      render: (text) => {
        const colors = {
          限电: "red",
          设备故障: "orange",
          电力: "cyan", // 为电力指定颜色
          高温: "blue", // 为高温指定颜色
          极端天气: "magenta", // 为极端天气指定颜色
          日常维护: "green", // 为日常维护指定颜色
          网络: "geekblue", // 为网络指定颜色
          其他: "default",
        };
        return <Tag color={colors[text as keyof typeof colors]}>{text}</Tag>;
      },
    },
    {
      title: t("影响台数"),
      dataIndex: "impact_count",
      key: "impact_count",
      width: 105,
      render: (value) => <span className="font-medium text-amber-600">{value.toLocaleString()}</span>,
    },
    {
      title: t("影响算力"),
      dataIndex: "impact_power_loss",
      key: "impact_power_loss",
      render: (value) => <span className="font-semibold text-blue-600">{value}</span>,
    },
    { title: t("事件原因"), dataIndex: "event_reason", key: "event_reason" },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="rounded-2xl bg-slate-50 p-1.5 shadow-inner">
          <Segmented
            value={viewMode}
            onChange={(value) => {
              const mode = value as "daily" | "events" | "weekly";
              setViewMode(mode);
              // 切到「运营周报」时按需拉取周报数据
              onWeeklyViewChange?.(mode === "weekly");
            }}
            className="venue-detail-segmented"
            options={[
              { label: t("运营日报"), value: "daily" },
              { label: t("运营周报"), value: "weekly" },
              { label: t("异常事件"), value: "events" },
            ]}
          />
        </div>

        {viewMode === "daily" ? (
          <Link to={`/report/daily-list/${venueId}/${venueName}`}>
            <Button type="primary">{t("查看更多日报")}</Button>
          </Link>
        ) : viewMode === "events" ? (
          <Link to={`/venue/event-log-list/${venueId}/${venueName}`}>
            <Button type="primary">{t("查看更多事件")}</Button>
          </Link>
        ) : (
          <Link to={`/venue/weekly-report/${venueId}`}>
            <Button type="primary">{t("查看更多周报")}</Button>
          </Link>
        )}
      </div>

      <Spin
        spinning={viewMode === "weekly" ? weeklyLoading : activeQuery.isFetching}
        tip={viewMode === "weekly" && weeklyLoading ? t("周报加载中...") : t("数据加载中...")}
      >
        {viewMode !== "weekly" && activeQuery.isError ? (
          <Alert
            type="error"
            showIcon
            message={activeQuery.error.message || t("数据加载失败，请稍后重试")}
            action={<Button onClick={() => void activeQuery.refetch()}>{t("重试")}</Button>}
          />
        ) : viewMode === "daily" ? (
          <Table<DailyRecord>
            columns={dailyColumns}
            dataSource={daily.data}
            pagination={false}
            scroll={{ x: 1500 }}
            sticky={true}
            rowKey={(record) => record.key || record.date}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ margin: 0 }}>
                  <h4 style={{ marginBottom: 16 }}>{t("子账户统计详情")}</h4>
                  <Table<SubAccountStat>
                    columns={subAccountColumns}
                    dataSource={record.subAccountStats}
                    pagination={false}
                    scroll={{ x: 1500 }}
                    rowKey="pool_name"
                    size="small"
                  />
                </div>
              ),
              rowExpandable: (record) => (record.subAccountStats?.length ?? 0) > 1,
            }}
          />
        ) : viewMode === "events" ? (
          <Table<AbnormalRecord>
            columns={abnormalColumns}
            dataSource={events.data}
            pagination={false}
            rowKey="key"
          />
        ) : (
          <WeeklyBusinessReport data={weeklyRows} />
        )}
      </Spin>
    </div>
  );
};

export default BusinessReport;
