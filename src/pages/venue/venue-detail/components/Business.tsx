import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { SyncOutlined } from "@ant-design/icons";
import { Button, Segmented, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import WeeklyBusinessReport from "./WeeklyBusinessReport";
import type { WeeklyReportRow } from "./weeklyMock";
import { useSelector, useSettingsStore } from "@/stores";
import { getTimeDifference } from "@/utils/date";

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
  onRequireWeekly?: () => void;
  weeklyLoading?: boolean;
}

const BusinessReport: React.FC<BusinessReportProps> = ({
  venueName,
  weeklyRows = [],
  onRequireWeekly,
  weeklyLoading = false,
}) => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [viewMode, setViewMode] = useState<"daily" | "events" | "weekly">("daily");
  const [dailyData, setDailyData] = useState<DailyRecord[]>([]);
  const [abnormalData, setAbnormalData] = useState<AbnormalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const params = useParams<{ venueId: string }>();
  const venueId = params.venueId!;

  // 子账户统计表格列配置
  const subAccountColumns: ColumnsType<SubAccountStat> = [
    { title: "矿池名称", dataIndex: "pool_name", key: "pool_name", fixed: "left", width: 120 },
    {
      title: "24小时产出(BTC)",
      dataIndex: "btcOutput24h",
      key: "btcOutput24h",
      width: 165,
      render: (value) => value.toFixed(8),
    },
    {
      title: "理论算力(P)",
      dataIndex: "theoreticalPower",
      width: 120,
      key: "theoreticalPower",
      align: "right",
      render: (value) => value.toFixed(2),
    },
    {
      title: "24小时算力(P)",
      dataIndex: "power24h",
      key: "power24h",
      width: 145,
      align: "right",
      render: (value) => <span className="font-semibold text-blue-600">{value.toFixed(2)}</span>,
    },
    {
      title: "24小时有效率",
      dataIndex: "effectiveRate24h",
      key: "effectiveRate24h",
      width: 140,
      align: "right",
      render: (value) => (
        <Tag color={value >= 95 ? "green" : value >= 90 ? "gold" : "red"}>{value.toFixed(2)}%</Tag>
      ),
    },
    {
      title: "在架有效率",
      dataIndex: "onlineRatio",
      key: "onlineRatio",
      width: 140,
      align: "center",
      render: (value) => `${value.toFixed(2)}%`,
    },
    { title: "托管台数", dataIndex: "totalMachines", key: "totalMachines", width: 105 },
    { title: "总故障数", dataIndex: "totalFailures", key: "totalFailures", width: 120 },
    {
      title: "总故障率",
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
      title: "24小时故障数",
      dataIndex: "failures24h",
      key: "failures24h",
      width: 138,
      align: "right",
      render: (value) => <span className="font-medium text-amber-600">{value.toLocaleString()}</span>,
    },
    {
      title: "24小时故障率",
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
      title: "影响占比",
      dataIndex: "impactRatio",
      key: "impactRatio",
      width: 105,
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: "限电影响",
      dataIndex: "limitImpactRate",
      key: "limitImpactRate",
      width: 140,
      align: "right",
      render: (value) => <span className="font-medium text-violet-600">{value.toFixed(2)}%</span>,
    },
    {
      title: "高温影响",
      dataIndex: "highTemperatureRate",
      key: "highTemperatureRate",
      width: 140,
      align: "right",
      render: (value) => <span className="font-medium text-orange-600">{value.toFixed(2)}%</span>,
    },
  ];

  const dailyColumns: ColumnsType<DailyRecord> = [
    { title: "日期", dataIndex: "date", key: "date", fixed: "left", width: 120 },
    {
      title: "24小时产出(BTC)",
      dataIndex: "btcOutput24h",
      key: "btcOutput24h",
      width: 165,
      render: (value) => value.toFixed(8),
    },
    {
      title: "理论算力(P)",
      dataIndex: "theoreticalPower",
      width: 120,
      key: "theoreticalPower",
      align: "right",
      render: (value) => value.toFixed(2),
    },
    {
      title: "24小时算力(P)",
      dataIndex: "power24h",
      key: "power24h",
      width: 145,
      align: "right",
      render: (value) => <span className="font-semibold text-blue-600">{value.toFixed(2)}</span>,
    },
    {
      title: "24小时有效率",
      dataIndex: "effectiveRate24h",
      key: "effectiveRate24h",
      width: 140,
      align: "right",
      render: (value) => (
        <Tag color={value >= 95 ? "green" : value >= 90 ? "gold" : "red"}>{value.toFixed(2)}%</Tag>
      ),
    },
    {
      title: "在架有效率",
      dataIndex: "onlineRatio",
      key: "onlineRatio",
      width: 140,
      align: "center",
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: "托管台数",
      dataIndex: "totalMachines",
      key: "totalMachines",
      width: 105,
      render: (value) => value.toLocaleString(),
    },
    {
      title: "总故障数",
      dataIndex: "totalFailures",
      key: "totalFailures",
      width: 120,
      render: (value) => value.toLocaleString(),
    },
    {
      title: "总故障率",
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
      title: "24小时故障数",
      dataIndex: "failures24h",
      key: "failures24h",
      width: 138,
      align: "right",
      render: (value) => <span className="font-medium text-amber-600">{value.toLocaleString()}</span>,
    },
    {
      title: "24小时故障率",
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
      title: "影响占比",
      dataIndex: "impactRatio",
      key: "impactRatio",
      width: 105,
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: "限电影响",
      dataIndex: "limitImpactRate",
      key: "limitImpactRate",
      width: 140,
      align: "right",
      render: (value) => <span className="font-medium text-violet-600">{value.toFixed(2)}%</span>,
    },
    {
      title: "高温影响",
      dataIndex: "highTemperatureRate",
      key: "highTemperatureRate",
      width: 140,
      align: "right",
      render: (value) => <span className="font-medium text-orange-600">{value.toFixed(2)}%</span>,
    },
  ];

  const abnormalColumns: ColumnsType<AbnormalRecord> = [
    { title: "日期", dataIndex: "log_date", key: "log_date", fixed: "left", width: 120 },
    // { title: "影响时长", dataIndex: "level", key: "level" },
    // { title: "时间范围", dataIndex: "start_time", key: "start_time" },
    {
      title: "影响时长",
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
              <SyncOutlined spin style={{ marginRight: 4 }} /> 影响中
            </Tag>
          );
        }
        return (
          <Tag color="red">
            <SyncOutlined spin style={{ marginRight: 4 }} /> 影响中
          </Tag>
        );
        // return dayjs(text).format("YYYY-MM-DD HH:mm");
      },
    },
    {
      title: "时间范围",
      dataIndex: "start_time",
      // width: 280,
      render: (_text, record) => `${record.start_time} - ${record.end_time}`,
    },
    {
      title: "事件类型",
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
      title: "影响台数",
      dataIndex: "impact_count",
      key: "impact_count",
      width: 105,
      render: (value) => <span className="font-medium text-amber-600">{value.toLocaleString()}</span>,
    },
    {
      title: "影响算力",
      dataIndex: "impact_power_loss",
      key: "impact_power_loss",
      render: (value) => <span className="font-semibold text-blue-600">{value}</span>,
    },
    { title: "事件原因", dataIndex: "event_reason", key: "event_reason" },
  ];

  // 获取数据
  const fetch10EventData = async () => {
    try {
      const response = await getLast10Event(poolType, Number(venueId));
      setAbnormalData(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  // 获取数据
  const fetch10DailyData = async () => {
    try {
      const response = await getLast10DaysDailyStat(poolType, Number(venueId));
      // 为每条记录添加key属性
      const processedData = response.data.map((item: DailyRecord, index: number) => ({
        ...item,
        key: item.key || `${item.date}-${index}`,
      }));
      setDailyData(processedData);
    } catch (error) {
      console.log(error);
    }
  };

  // 模拟数据用于测试展开功能
  const mockData: DailyRecord[] = [];

  useEffect(() => {
    // 日报与异常事件并行拉取，统一用一个 loading 态覆盖两个 tab
    setLoading(true);
    Promise.all([fetch10EventData(), fetch10DailyData()]).finally(() => {
      setLoading(false);
    });
    // 先清空，避免切换场地时短暂残留上一场地数据
    setDailyData(mockData);
  }, [venueId]);

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
              if (mode === "weekly") onRequireWeekly?.();
            }}
            className="venue-detail-segmented"
            options={[
              { label: "运营日报", value: "daily" },
              { label: "运营周报", value: "weekly" },
              { label: "异常事件", value: "events" },
            ]}
          />
        </div>

        {viewMode === "daily" ? (
          <Link to={`/report/daily-list/${venueId}/${venueName}`}>
            <Button type="primary">查看更多日报</Button>
          </Link>
        ) : viewMode === "events" ? (
          <Link to={`/venue/event-log-list/${venueId}/${venueName}`}>
            <Button type="primary">查看更多事件</Button>
          </Link>
        ) : (
          <Link to={`/venue/weekly-report/${venueId}`}>
            <Button type="primary">查看更多周报</Button>
          </Link>
        )}
      </div>

      <Spin
        spinning={loading || (viewMode === "weekly" && weeklyLoading)}
        tip={viewMode === "weekly" && weeklyLoading ? "周报加载中..." : "数据加载中..."}
      >
        {viewMode === "daily" ? (
          <Table<DailyRecord>
            columns={dailyColumns}
            dataSource={dailyData}
            pagination={false}
            scroll={{ x: 1500 }}
            sticky={true}
            rowKey={(record) => record.key || record.date}
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ margin: 0 }}>
                  <h4 style={{ marginBottom: 16 }}>子账户统计详情</h4>
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
            dataSource={abnormalData}
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
