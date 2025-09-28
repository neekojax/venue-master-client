import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Button, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
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
}

const BusinessReport: React.FC<BusinessReportProps> = ({ venueName }) => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [showDaily, setShowDaily] = useState(true);
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
      render: (value) => value.toFixed(2),
    },
    {
      title: "24小时有效率",
      dataIndex: "effectiveRate24h",
      key: "effectiveRate24h",
      width: 140,
      align: "right",
      render: (value) => `${value.toFixed(2)}%`,
    },
    { title: "托管台数", dataIndex: "totalMachines", key: "totalMachines", width: 105 },
    { title: "总故障数", dataIndex: "totalFailures", key: "totalFailures", width: 120 },
    {
      title: "总故障率",
      dataIndex: "totalFailuresRate",
      key: "totalFailuresRate",
      width: 120,
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: "24小时故障数",
      dataIndex: "failures24h",
      key: "failures24h",
      width: 138,
      align: "right",
      render: (value) => value.toLocaleString(),
    },
    {
      title: "24小时故障率",
      dataIndex: "failureRate24h",
      key: "failureRate24h",
      width: 138,
      render: (value) => `${value.toFixed(2)}%`,
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
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: "高温影响",
      dataIndex: "highTemperatureRate",
      key: "highTemperatureRate",
      width: 140,
      align: "right",
      render: (value) => `${value.toFixed(2)}%`,
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
      render: (value) => value.toFixed(2),
    },
    {
      title: "24小时有效率",
      dataIndex: "effectiveRate24h",
      key: "effectiveRate24h",
      width: 140,
      align: "right",
      render: (value) => `${value.toFixed(2)}%`,
    },
    { title: "托管台数", dataIndex: "totalMachines", key: "totalMachines", width: 105 },
    { title: "总故障数", dataIndex: "totalFailures", key: "totalFailures", width: 120 },
    {
      title: "总故障率",
      dataIndex: "totalFailuresRate",
      key: "totalFailuresRate",
      width: 120,
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: "24小时故障数",
      dataIndex: "failures24h",
      key: "failures24h",
      width: 138,
      align: "right",
      render: (value) => value.toLocaleString(),
    },
    {
      title: "24小时故障率",
      dataIndex: "failureRate24h",
      key: "failureRate24h",
      width: 138,
      render: (value) => `${value.toFixed(2)}%`,
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
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: "高温影响",
      dataIndex: "highTemperatureRate",
      key: "highTemperatureRate",
      width: 140,
      align: "right",
      render: (value) => `${value.toFixed(2)}%`,
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
          return getTimeDifference(record.start_time, record.end_time);
        }
        return "---";
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
    { title: "影响台数", dataIndex: "impact_count", key: "impact_count" },
    { title: "影响算力", dataIndex: "impact_power_loss", key: "impact_power_loss" },
    { title: "事件原因", dataIndex: "event_reason", key: "event_reason" },
  ];

  // 获取数据
  const fetch10EventData = async () => {
    setLoading(true);
    try {
      const response = await getLast10Event(poolType, Number(venueId));
      // console.log(response);
      setAbnormalData(response.data);
      setLoading(false);

      // 处理响应数据
    } catch (error) {
      // 处理错误

      console.log(error);
    }
  };

  // 获取数据
  const fetch10DailyData = async () => {
    try {
      const response = await getLast10DaysDailyStat(poolType, Number(venueId));
      // console.log(response)
      // 为每条记录添加key属性
      const processedData = response.data.map((item: DailyRecord, index: number) => ({
        ...item,
        key: item.key || `${item.date}-${index}`,
      }));
      setDailyData(processedData);

      // 处理响应数据
    } catch (error) {
      // 处理错误
      console.log(error);
    }
  };

  // 模拟数据用于测试展开功能
  const mockData: DailyRecord[] = [
    {
      key: "mock-1",
      date: "2025-09-27",
      btcOutput24h: 0.6414269599999999,
      theoreticalPower: 1661.62,
      power24h: 1452.06,
      effectiveRate24h: 87.39,
      totalMachines: 12196,
      totalFailures: 988,
      totalFailuresRate: 8.1,
      failures24h: 455,
      failureRate24h: 3.73,
      impactRatio: 12.61,
      limitImpactRate: 0,
      highTemperatureRate: 0,
      subAccountStats: [
        {
          pool_name: "KJDGA007",
          btcOutput24h: 0.04760381,
          theoreticalPower: 118.44,
          power24h: 107.58,
          effectiveRate24h: 90.83,
          totalMachines: 840,
          totalFailures: 69,
          totalFailuresRate: 8.21,
          failures24h: 69,
          failureRate24h: 8.21,
          impactRatio: 9.17,
          limitImpactRate: 0,
          highTemperatureRate: 0,
        },
        {
          pool_name: "KJDGA006",
          btcOutput24h: 0.43150815,
          theoreticalPower: 1134.603,
          power24h: 977.16,
          effectiveRate24h: 86.12,
          totalMachines: 8359,
          totalFailures: 644,
          totalFailuresRate: 7.7,
          failures24h: 111,
          failureRate24h: 1.33,
          impactRatio: 13.88,
          limitImpactRate: 0,
          highTemperatureRate: 0,
        },
        {
          pool_name: "KJDGA009",
          btcOutput24h: 0.10914907,
          theoreticalPower: 268,
          power24h: 247.17,
          effectiveRate24h: 92.23,
          totalMachines: 2000,
          totalFailures: 146,
          totalFailuresRate: 7.3,
          failures24h: 146,
          failureRate24h: 7.3,
          impactRatio: 7.77,
          limitImpactRate: 0,
          highTemperatureRate: 0,
        },
        {
          pool_name: "KJDGA008",
          btcOutput24h: 0.05316593,
          theoreticalPower: 140.577,
          power24h: 120.15,
          effectiveRate24h: 85.47,
          totalMachines: 997,
          totalFailures: 129,
          totalFailuresRate: 12.94,
          failures24h: 129,
          failureRate24h: 12.94,
          impactRatio: 14.53,
          limitImpactRate: 0,
          highTemperatureRate: 0,
        },
      ],
    },
  ];

  useEffect(() => {
    fetch10EventData();
    fetch10DailyData();
    // 临时使用模拟数据进行测试
    setDailyData(mockData);
  }, [venueId]);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Button type={showDaily ? "primary" : "default"} onClick={() => setShowDaily(true)}>
            经营日报
          </Button>
          <Button type={!showDaily ? "primary" : "default"} onClick={() => setShowDaily(false)}>
            异常事件
          </Button>
        </div>

        {showDaily ? (
          <Link to={`/report/daily-list/${venueId}/${venueName}`}>
            <Button type="primary">查看更多日报</Button>
          </Link>
        ) : (
          <Link to={`/venue/event-log-list/${venueId}/${venueName}`}>
            <Button type="primary">查看更多事件</Button>
          </Link>
        )}
      </div>

      <Spin spinning={loading}>
        {showDaily ? (
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
              rowExpandable: (record) => record.subAccountStats && record.subAccountStats.length > 0,
            }}
          />
        ) : (
          <Table<AbnormalRecord>
            columns={abnormalColumns}
            dataSource={abnormalData}
            pagination={false}
            rowKey="key"
          />
        )}
      </Spin>
    </div>
  );
};

export default BusinessReport;
