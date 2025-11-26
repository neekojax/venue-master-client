// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useEffect, useState } from "react";
import { ReloadOutlined } from "@ant-design/icons";
import { Button, message, Pagination, Select, Spin, Switch } from "antd";
import type { ProgressProps } from "antd/es/progress";
import LocationCard from "./components/LocationCard";
import { useSelector, useSettingsStore } from "@/stores"; // 根据实际路径调整

import { fetchVenueEnvironment } from "@/pages/venue/api";

// 场地数据类型定义
interface LocationData {
  device: string;
  humidity: number;
  location: string;
  temperature: number;
}
interface EnvironmentData {
  id: number;
  venue_name: string;
  last_update: string; //
  // is_normal: boolean;// 判断环境整体是否正常：所以environments 更新时间都有问题，则异常
  collection: number;
  environments: LocationData[];
}
const App: React.FC = () => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  // 当前选中的场地
  // 场地数据
  const [venueData, setVenueData] = useState<EnvironmentData[]>([]);
  // 最后更新时间
  // const [lastUpdated, setLastUpdated] = useState<string>("");
  // 加载状态
  const [loading, setLoading] = useState<boolean>(false);
  // 新增：场地名筛选与分页
  const [filterText, setFilterText] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 5;
  // 新增：下拉选择的选中值与选项集合
  const [selectedVenueName, setSelectedVenueName] = useState<string | undefined>(undefined);
  const venueNameOptions = Array.from(new Set(venueData.map((v) => v.venue_name))).map((name) => ({
    label: name,
    value: name,
  }));
  // 新增：我的自选开关
  const [showCollectionOnly, setShowCollectionOnly] = useState<boolean>(
    () => localStorage.getItem("showCollectionOnly") === "true",
  );
  useEffect(() => {
    localStorage.setItem("showCollectionOnly", String(showCollectionOnly));
  }, [showCollectionOnly]);

  // 依据筛选计算派生数据
  const filteredVenues = venueData
    .filter((v) => v.venue_name.toLowerCase().includes(filterText.trim().toLowerCase()))
    .filter((v) => !showCollectionOnly || Number(v.collection) === 1);
  const paginatedVenues = filteredVenues.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // 初始化数据
  useEffect(() => {
    setLoading(true);
    generateVenueData();
    // updateLastUpdatedTime();
  }, []);

  // 当筛选或数据源变化时，重置到第一页
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, venueData]);

  // 生成场地环境数据
  const generateVenueData = () => {
    fetchVenueEnvironment(poolType).then((res) => {
      // console.log(res);
      const { data } = res;
      if (data && data.length > 0) {
        // 过滤掉没有数据的场地，并为 collection 提供缺省值
        const validVenue = data
          .filter((v: any) => v.environments?.length > 0)
          .map((v: any) => ({
            ...v,
            collection: Number(v.collection ?? 0),
          }));
        setVenueData(validVenue);
        setLoading(false);
      }
    });
  };
  // 更新最后更新时间
  // const updateLastUpdatedTime = () => {
  //   const now = new Date();
  //   const timeString = `${now.getFullYear()}年${(now.getMonth() + 1).toString().padStart(2, "0")}月${now.getDate().toString().padStart(2, "0")}日 ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
  //   setLastUpdated(timeString);
  // };
  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      generateVenueData();
      // updateLastUpdatedTime();
      setLoading(false);
      message.success("数据更新成功");
    }, 800);
  };
  // 自动刷新（每30秒）
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     generateVenueData();
  //     updateLastUpdatedTime();
  //   }, 30000);
  //   return () => clearInterval(interval);
  // }, []);
  // 获取温度进度条颜色
  const getTemperatureColor = (temp: number): ProgressProps["strokeColor"] => {
    // if (temp < 20) return "#90EE90"; // 偏冷 #90EE90
    if (temp < 20) return "#90EE90"; // 舒适 #90EE90
    if (temp < 28) return "#FFD700"; // 偏热 #FFD700
    return "#FF6347"; // 过热 #FF6347
  };
  // 获取湿度进度条颜色
  const getHumidityColor = (humidity: number): ProgressProps["strokeColor"] => {
    if (humidity < 40) return "#90EE90"; // 舒适 #90EE90
    if (humidity < 60) return "#87CEFA"; // 干燥 #87CEFA
    return "#4682B4"; // 潮湿 #4682B4
  };
  return (
    <div className="min-h-screen ">
      {/* 主内容区 */}
      <main className=" py-6">
        {/* 筛选与分页控制栏 */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <Select
              showSearch
              size="middle"
              allowClear
              placeholder="按场地名筛选"
              options={venueNameOptions}
              value={selectedVenueName}
              onSearch={(val) => setFilterText(val)}
              onChange={(val) => {
                setSelectedVenueName(val || undefined);
                setFilterText((val as string) || "");
              }}
              filterOption={(input, option) =>
                ((option?.label as string) || "").toLowerCase().includes(input.toLowerCase())
              }
              style={{ width: 280 }}
            />
            <Switch
              checked={showCollectionOnly}
              onChange={(checked) => setShowCollectionOnly(checked)}
              className="mr-3"
              style={{ marginLeft: "10px" }}
            />
            <span className="ml-1">我的自选</span>
          </div>

          <>
            <div className="text-gray-600 text-sm">
              {/* <span style={{ marginRight: "10px" }}>最后更新: {lastUpdated}</span> */}
              <Button
                size="middle"
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
                loading={loading}
                className="!rounded-button whitespace-nowrap"
              >
                刷新数据
              </Button>
            </div>
          </>
        </div>

        <Spin
          spinning={loading}
          tip="加载中..."
          size="large"
          className="w-full"
          style={{ minHeight: "200px" }}
        >
          {/* 位置信息展示区 */}
          {paginatedVenues.map((venue) => (
            <div key={venue.id} className="mb-8">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="mr-2">{venue.venue_name}</span>
                  <span className="text-sm text-gray-500">环境数据</span>
                  {/* {(() => {
                    const d = new Date(venue.last_update);
                    const parsed = !isNaN(d.getTime())
                      ? d
                      : new Date(String(venue.last_update).replace(/-/g, "/"));
                    const diffMs = parsed && !isNaN(parsed.getTime()) ? Date.now() - parsed.getTime() : 0;
                    return diffMs > 3600_000 ? (
                      <span className="ml-2 inline-flex items-center rounded-full bg-red-100 text-red-700 border border-red-200 px-2 py-0.5 animate-bounce">
                        设备异常，请检查设备
                      </span>
                    ) : null;
                  })()} */}
                </h2>
                <div
                  className={`text-xs ${(() => {
                    const d = new Date(venue.last_update);
                    const parsed = !isNaN(d.getTime())
                      ? d
                      : new Date(String(venue.last_update).replace(/-/g, "/"));
                    const diffMs = parsed && !isNaN(parsed.getTime()) ? Date.now() - parsed.getTime() : 0;
                    return diffMs > 3600_000
                      ? "text-red-600 bg-red-50 border-red-200 ring-1 ring-red-300 animate-pulse"
                      : "text-gray-600 bg-gray-50 border-gray-200";
                  })()} rounded-full px-3 py-1`}
                >
                  最后更新:{" "}
                  <span
                    className={`font-mono ${(() => {
                      const d = new Date(venue.last_update);
                      const parsed = !isNaN(d.getTime())
                        ? d
                        : new Date(String(venue.last_update).replace(/-/g, "/"));
                      const diffMs = parsed && !isNaN(parsed.getTime()) ? Date.now() - parsed.getTime() : 0;
                      return diffMs > 3600_000 ? "text-red-700" : "";
                    })()}`}
                  >
                    {venue.last_update}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-6">
                {venue.environments &&
                  venue.environments.map((location, index) => (
                    <LocationCard
                      key={index}
                      location={{
                        name: location.location,
                        temperature: location.temperature,
                        humidity: location.humidity,
                      }}
                      getTemperatureColor={getTemperatureColor}
                      getHumidityColor={getHumidityColor}
                    />
                  ))}
              </div>
            </div>
          ))}

          {/* 分页器 */}
          <div className="mt-4 flex justify-end">
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={filteredVenues.length}
              onChange={(page) => setCurrentPage(page)}
              showTotal={(total: number, _range: [number, number]) => `共 ${total} 条`}
            />
          </div>
        </Spin>

        {/* 环境标准说明 */}
        {/* <div className="bg白 rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-4">环境标准参考</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">温度标准</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-300 mr-2"></span>
                  <span>18°C - 24°C 舒适范围</span>
                </li>
                <li className="flex items中心">
                  <span className="w-3 h-3 rounded-full bg-yellow-300 mr-2"></span>
                  <span>24°C - 28°C 可接受范围</span>
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-red-300 mr-2"></span>
                  <span>28°C以上 过热警告</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">湿度标准</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-300 mr-2"></span>
                  <span>40% - 60% 舒适范围</span>
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-yellow-300 mr-2"></span>
                  <span>30% - 40% / 60% - 70% 可接受范围</span>
                </li>
                <li className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-red-300 mr-2"></span>
                  <span>70%以上 高湿警告</span>
                </li>
              </ul>
            </div>
          </div>
        </div> */}
      </main>
    </div>
  );
};
export default App;
