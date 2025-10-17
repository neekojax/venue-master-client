import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarOutlined, CloudOutlined, EnvironmentOutlined, ThunderboltOutlined } from "@ant-design/icons";
import { Select } from "antd";
import BasicDataChart from "./components/BasicDataChart";
import BusinessReport from "./components/Business";
import ChartFail from "./components/ChartFail";
import ChartHighTemperatureImpact from "./components/ChartHighTemperatureImpact";
import ChartLimitImpact from "./components/ChartLimitImpact";
import ChartSuanli from "./components/ChartSuanli";
import type { VenueStats } from "./types";
import { useSelector, useSettingsStore } from "@/stores";

import "./index.css";

import ChartFee from "@/pages/custody-statistics/statisticsDetail/components/chartFee";
import { getVenueBasicInfo, getVenueDailyStat } from "@/pages/venue/api.tsx";
import { useVenueList } from "@/pages/venue/hook/hook";

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
  humidity: number;
  temperature: number;
}
// import { Button, Table } from "antd";

const VenueDetail: React.FC = () => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const params = useParams<{ venueId: string }>();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<VenueStats | null>(null);
  const venueId = params.venueId!;
  const navigate = useNavigate();
  const [basicInfo, setBasicInfo] = useState<VenueData | null>(null);

  // 获取场地列表数据
  const { data: venueListData } = useVenueList(poolType);

  // 获取数据
  const fetchData = async () => {
    try {
      const response = await getVenueBasicInfo(poolType, Number(venueId));
      // console.log(response)
      setBasicInfo(response.data);

      // 处理响应数据
    } catch (error) {
      // 处理错误
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // 获取数据
  const fetchDailyStat = async () => {
    try {
      const response = await getVenueDailyStat(poolType, Number(venueId), formattedDate);
      if (response.data) {
        console.log("response.data", response.data);
        setStats(response.data);
        // 不在这里直接调用 initChart，而是通过 useEffect 监听 stats 变化
      }
      // 处理响应数据
    } catch (error) {
      // 处理错误
      console.log("error", error);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchData();
    fetchDailyStat();
  }, [venueId]);

  const yesterday = new Date(Date.now() - 864e5);
  const formattedDate = yesterday.toISOString().split("T")[0];

  return (
    <div className=" mx-auto  min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-3 sm:justify-between">
          <div>
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
          <div>
            <Select
              placeholder="选择场地"
              style={{ width: 200 }}
              value={venueId}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              onChange={(value) => {
                navigate(`/venue/detail/${value}`);
              }}
              options={
                venueListData?.data?.map((venue: any) => ({
                  label: venue.venue_name,
                  value: venue.id.toString(),
                })) || []
              }
            />
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
              <span className="text-gray-600">当前温度: {basicInfo?.temperature + " ℃" || "--"}</span>
            </div>
            <div className="flex items-center gap-2">
              <ThunderboltOutlined className="text-primary" />
              <span className="text-gray-600">当前湿度: {basicInfo?.humidity + " %" || "--"}</span>
            </div>
          </div>
        </div>
      </header>
      {stats && <BasicDataChart stats={stats} loading={loading} />}
      {/* 图表区域 */}
      <ChartFee />
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
      <BusinessReport venueName={basicInfo?.venue_name || ""}></BusinessReport>
    </div>
  );
};

export default VenueDetail;
