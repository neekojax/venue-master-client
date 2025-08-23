import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { CalendarOutlined, CloudOutlined, EnvironmentOutlined, ThunderboltOutlined } from "@ant-design/icons";
import BasicData from "./components/BasicData";
import BusinessReport from "./components/Business";
import ChartFail from "./components/ChartFail";
import ChartHighTemperatureImpact from "./components/ChartHighTemperatureImpact";
import ChartLimitImpact from "./components/ChartLimitImpact";
import ChartSuanli from "./components/ChartSuanli";

import "./index.css";

import { getVenueBasicInfo } from "@/pages/venue/api.tsx";
// type ChartConfig = {
//   id: string;
//   title: string;
//   period: "day" | "month";
// };
interface SubAccount {
  pool_id: number;
  pool_name: string;
  pool_link: string;
  status: number;
}

interface VenueData {
  venue_name: string;
  address: string;
  sub_accounts: SubAccount[];
}
// import { Button, Table } from "antd";

const VenueDetail: React.FC = () => {
  const params = useParams<{ venueId: string }>();
  const venueId = params.venueId!;
  const [basicInfo, setBasicInfo] = useState<VenueData | null>(null);

  // 获取数据
  const fetchData = async () => {
    try {
      const response = await getVenueBasicInfo(Number(venueId));
      // console.log(response)
      setBasicInfo(response.data);

      // 处理响应数据
    } catch (error) {
      // 处理错误
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [venueId]);

  const yesterday = new Date(Date.now() - 864e5);
  const formattedDate = yesterday.toISOString().split("T")[0];

  return (
    <div className=" mx-auto  min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <h1 className="text-3xl font-bold text-gray-900">{basicInfo?.venue_name}</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded-md">
              矿工号:{" "}
              {basicInfo?.sub_accounts?.map((item, index) => (
                <span key={item.pool_id}>
                  <a href={item.pool_link} target="_blank" rel="noreferrer">
                    {item.pool_name}
                  </a>
                  {index !== basicInfo.sub_accounts.length - 1 && " "}
                </span>
              ))}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <EnvironmentOutlined className="text-primary" />
              <span className="text-gray-600">{basicInfo?.address || "--"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-primary" />
              <span className="text-gray-600">{formattedDate}</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CloudOutlined className="text-primary" />
              <span className="text-gray-600">当前温度: --</span>
            </div>
            <div className="flex items-center gap-2">
              <ThunderboltOutlined className="text-primary" />
              <span className="text-gray-600">当前湿度: --</span>
            </div>
          </div>
        </div>
      </header>

      <BasicData />
      {/* 图表区域 */}

      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <ChartSuanli></ChartSuanli>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <ChartFail></ChartFail>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <ChartHighTemperatureImpact></ChartHighTemperatureImpact>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm">
          <ChartLimitImpact></ChartLimitImpact>
        </div>
      </div>

      {/* 数据表格 */}
      <BusinessReport></BusinessReport>
    </div>
  );
};

export default VenueDetail;
