import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { Button, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { getTimeDifference } from "@/utils/date";

import { getLast10DaysDailyStat, getLast10Event } from "@/pages/venue/api.tsx";

interface DailyRecord {
  key: string;
  date: string;
  revenue: number;
  orders: number;
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
  const [showDaily, setShowDaily] = useState(true);
  const [dailyData, setDailyData] = useState<DailyRecord[]>([]);
  const [abnormalData, setAbnormalData] = useState<AbnormalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const params = useParams<{ venueId: string }>();
  const venueId = params.venueId!;

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
      title: "理论算力(E)",
      dataIndex: "theoreticalPower",
      width: 120,
      key: "theoreticalPower",
      align: "right",
      render: (value) => value.toFixed(6),
    },
    // { title: "24小时算力", dataIndex: "power24h", key: "power24h", width: 180 },
    {
      title: "24小时算力(E)",
      dataIndex: "power24h",
      key: "power24h",
      width: 145,
      align: "right",
      render: (value) => value.toFixed(6),
    },
    {
      title: "24小时有效率",
      dataIndex: "effectiveRate24h",
      key: "effectiveRate24h",
      width: 140,
      align: "right",
      render: (value) => `${value.toFixed(2)}%`,
    },
    // { title: "理论算力", dataIndex: "effectiveRate24h", key: "effectiveRate24h", width: 180 },
    { title: "托管台数", dataIndex: "totalMachines", key: "totalMachines", width: 105 },
    { title: "总故障数", dataIndex: "totalFailures", key: "totalFailures", width: 120 },
    {
      title: "24小时故障数",
      dataIndex: "failures24h",
      key: "failures24h",
      width: 138,
      align: "right",
      render: (value) => value.toLocaleString(),
      // sorter: (a, b) => a.failures24h - b.failures24h,
    },
    {
      title: "24小时故障率",
      dataIndex: "failureRate24h",
      key: "failureRate24h",
      width: 138,
      render: (value) => ({
        children: `${value.toFixed(2)}%`,
        props: {
          style: {
            color: value > 20 ? "#ff4d4f" : "inherit",
          },
        },
      }),
      // sorter: (a, b) => a.failureRate24h - b.failureRate24h,
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
      // render: (value) => value.toFixed(8),
      render: (value) => `${value.toFixed(2)}%`,
      // sorter: (a, b) => a.limitImpactRate - b.limitImpactRate,
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
      const response = await getLast10Event(Number(venueId));
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
      const response = await getLast10DaysDailyStat(Number(venueId));
      // console.log(response)
      setDailyData(response.data);

      // 处理响应数据
    } catch (error) {
      // 处理错误
      console.log(error);
    }
  };

  useEffect(() => {
    fetch10EventData();
    fetch10DailyData();
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
            rowKey="key"
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
