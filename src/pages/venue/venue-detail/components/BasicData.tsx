import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  AlertOutlined,
  AreaChartOutlined,
  CloudOutlined,
  DatabaseOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
  LineChartOutlined,
  ThunderboltOutlined,
  ToolOutlined,
} from "@ant-design/icons";

import { getVenueDailyStat } from "@/pages/venue/api.tsx";

interface VenueStats {
  btcOutput24h: number;
  theoreticalPower: number;
  power24h: number;
  effectiveRate24h: number;
  totalMachines: number;
  totalFailures: number;
  failures24h: number;
  failureRate24h: number;
  impactRatio: number;
  limitImpactRate: number;
  highTemperatureRate: number;
}

const BasicData: React.FC = () => {
  const { venueId } = useParams<{ venueId: string }>();
  const [stats, setStats] = useState<VenueStats | null>(null);
  const [qitaRate, setQitaRate] = useState<string>("");

  // 获取昨日的日期
  const yesterday = new Date(Date.now() - 864e5);
  const formattedDate = yesterday.toISOString().split("T")[0];

  // 获取数据
  const fetchData = async () => {
    try {
      const response = await getVenueDailyStat(Number(venueId), formattedDate);
      // console.log(response)
      setStats(response.data);
      const { failureRate24h, impactRatio, limitImpactRate, highTemperatureRate } = response.data;
      const qitaRate_num = impactRatio - failureRate24h - limitImpactRate - highTemperatureRate;
      setQitaRate(qitaRate_num.toFixed(2));

      // 处理响应数据
    } catch (error) {
      // 处理错误
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [venueId]);
  // 获取当前日期

  const statusCards = [
    {
      title: "理论台数",
      value: stats?.totalMachines + " 台",
      description: "满负荷运行中",
      icon: <DatabaseOutlined className="text-gray-400" />,
    },
    {
      title: "故障总台数",
      value: stats?.totalFailures + " 台",
      description: "需要检修",
      textColor: "text-yellow-500",
      icon: <AlertOutlined className="text-gray-400 font-12" />,
    },
    {
      title: "理论算力",
      value: stats?.theoreticalPower?.toFixed(2) + " PH/s",
      description: "标准水平",
      icon: <ThunderboltOutlined className="text-gray-400 font-12" />,
    },
    {
      title: "24 小时算力",
      value: stats?.power24h + " PH/s",
      // description: "较昨日下降 1.2%",
      textColor: "text-yellow-500",
      // trendIcon: <ArrowDownOutlined className="mr-1" />,
      icon: <LineChartOutlined className="text-gray-400 font-12" />,
    },
  ];

  const impactCards = [
    {
      title: "故障占比",
      value: stats?.failureRate24h.toFixed(2) + " %",
      description: "一般水平",
      icon: <ToolOutlined className="text-gray-400 font-12" />,
    },
    {
      title: "高温占比",
      value: stats?.highTemperatureRate.toFixed(2) + " %",
      description: "正常范围",
      icon: <CloudOutlined className="text-gray-400 font-12" style={{ fontSize: "0.95rem" }} />,
    },
    {
      title: "限电占比",
      value: stats?.limitImpactRate.toFixed(2) + " %",
      description: "正常范围",
      icon: <ThunderboltOutlined className="text-gray-500 font-12" />,
    },
    {
      title: "其他占比",
      value: qitaRate + " %",
      description: "正常范围",
      icon: <EllipsisOutlined className="text-gray-500 font-12" />,
    },
  ];

  const getCardStyles = (rate: number) => {
    if (rate >= 90) {
      return {
        borderColor: "#52c41a", // 绿色
        textColor: "text-green-600",
        // backGround: 'text-green-100',
        backGround: "rgba(204, 250, 232, 0.4)",
        gradient: "from-green-50 to-green-100",
      };
    } else if (rate >= 80) {
      return {
        borderColor: "#1890ff", // 浅蓝色
        textColor: "text-blue-600",

        backGround: "rgba(204, 204, 250, 0.4)",
        gradient: "from-blue-50 to-blue-100",
      };
    } else if (rate >= 60) {
      return {
        borderColor: "#faad14", // 橙色rgb(250, 235, 204)
        textColor: "text-orange-600",
        backGround: "rgba(250, 235, 204,0.4)",
        gradient: "from-orange-50 to-orange-100",
      };
    } else {
      return {
        borderColor: "#f5222d", // 红色
        textColor: "text-red-600",
        backGround: "rgba(250, 229, 204, 0.4)",
        gradient: "from-red-50 to-red-100",
      };
    }
  };

  return (
    <>
      {/* 算力运行状态 */}
      <div
        className="bg-gray-100 rounded-xl p-4 mb-4"
        style={{
          background: "#fff",
          borderRadius: "4px",
        }}
      >
        <h3 className="text-xl font-bold mb-6 text-gray-800 pl-2">
          <AreaChartOutlined className={`mr-2 ${getCardStyles(stats?.effectiveRate24h || 0).textColor}`} />
          算力运行状态
        </h3>
        <div className="bg-white rounded-lg grid grid-cols-5 gap-4">
          <div
            className={`p-4 rounded-lg shadow-demo border-2 ${getCardStyles(stats?.effectiveRate24h || 0).gradient}`}
            style={{
              borderColor: getCardStyles(stats?.effectiveRate24h || 0).borderColor,
              background: getCardStyles(stats?.effectiveRate24h || 0).backGround,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-lg font-semibold ${getCardStyles(stats?.effectiveRate24h || 0).textColor}`}
              >
                算力有效率
              </span>
              <AreaChartOutlined
                className={` text-xl ${getCardStyles(stats?.effectiveRate24h || 0).textColor}`}
              />
            </div>
            <div className={`text-4xl font-bold ${getCardStyles(stats?.effectiveRate24h || 0).textColor}`}>
              {stats?.effectiveRate24h.toFixed(2)}%
            </div>
          </div>

          {statusCards.map((item, index) => (
            <div key={index} className="shadow-demo p-6 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-semibold">{item.title}</span>
                {item.icon}
              </div>
              <div className="text-2xl font-bold text-gray-800">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 算力影响分析 */}
      <div
        className="bg-gray-100 rounded-xl p-4 mb-4"
        style={{
          background: "#fff",
          borderRadius: "4px",
        }}
      >
        <h3 className="text-xl font-bold mb-6 text-gray-800 pl-2">
          <ExclamationCircleOutlined className="mr-2 text-red-500" />
          算力影响因素
        </h3>
        <div className="bg-white rounded-lg grid grid-cols-5 gap-4">
          <div className="p-4 rounded-lg bg-gradient-to-br shadow-demo from-red-100 to-red-50 border-2 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold text-red-600">算力影响</span>
              <ExclamationCircleOutlined className="text-red-500 text-xl" />
            </div>
            <div className="text-4xl font-bold text-red-500">{stats?.impactRatio.toFixed(2)} %</div>
          </div>
          {impactCards.map((item, index) => (
            <div key={index} className="p-6 shadow-sm shadow-demo rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-semibold">{item.title}</span>
                {item.icon}
              </div>
              <div className="text-2xl font-bold text-gray-800">{item.value}</div>
              {/*  <div className="text-sm text-gray-500 mt-2">{item.description}</div> */}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default BasicData;
