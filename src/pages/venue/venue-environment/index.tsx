// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useEffect, useState } from "react";
import { ReloadOutlined, SettingOutlined, UserOutlined } from "@ant-design/icons";
import { Button, message, Progress } from "antd";
import type { ProgressProps } from "antd/es/progress";
// 场地数据类型定义
interface LocationData {
  name: string;
  temperature: number;
  humidity: number;
}
interface VenueData {
  id: number;
  name: string;
  locations: LocationData[];
}
const App: React.FC = () => {
  // 当前选中的场地
  const [selectedVenue, setSelectedVenue] = useState<number>(1);
  // 场地数据
  const [venueData, setVenueData] = useState<VenueData[]>([]);
  // 最后更新时间
  const [lastUpdated, setLastUpdated] = useState<string>("");
  // 加载状态
  const [loading, setLoading] = useState<boolean>(false);
  // 初始化数据
  useEffect(() => {
    generateVenueData();
    updateLastUpdatedTime();
  }, []);
  // 生成模拟数据
  const generateVenueData = () => {
    const venues: VenueData[] = [];
    for (let i = 1; i <= 10; i++) {
      const locations: LocationData[] = [];
      const locationNames = ["入口区域", "中央大厅", "休息区", "办公区", "储物间"];
      for (let j = 0; j < 5; j++) {
        locations.push({
          name: locationNames[j],
          temperature: Math.floor(Math.random() * 15) + 18, // 18-32°C
          humidity: Math.floor(Math.random() * 40) + 30, // 30-70%
        });
      }
      venues.push({
        id: i,
        name: `场地 ${i}`,
        locations,
      });
    }
    setVenueData(venues);
  };
  // 更新最后更新时间
  const updateLastUpdatedTime = () => {
    const now = new Date();
    const timeString = `${now.getFullYear()}年${(now.getMonth() + 1).toString().padStart(2, "0")}月${now.getDate().toString().padStart(2, "0")}日 ${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}`;
    setLastUpdated(timeString);
  };
  // 刷新数据
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      generateVenueData();
      updateLastUpdatedTime();
      setLoading(false);
      message.success("数据更新成功");
    }, 800);
  };
  // 自动刷新（每30秒）
  useEffect(() => {
    const interval = setInterval(() => {
      generateVenueData();
      updateLastUpdatedTime();
    }, 30000);
    return () => clearInterval(interval);
  }, []);
  // 获取温度进度条颜色
  const getTemperatureColor = (temp: number): ProgressProps["strokeColor"] => {
    if (temp < 20) return "#87CEFA"; // 偏冷
    if (temp < 26) return "#90EE90"; // 舒适
    if (temp < 30) return "#FFD700"; // 偏热
    return "#FF6347"; // 过热
  };
  // 获取湿度进度条颜色
  const getHumidityColor = (humidity: number): ProgressProps["strokeColor"] => {
    if (humidity < 40) return "#87CEFA"; // 干燥
    if (humidity < 60) return "#90EE90"; // 舒适
    return "#4682B4"; // 潮湿
  };
  return (
    <div className="min-h-screen bg-gray-50" style={{ minWidth: "1440px" }}>
      {/* 标题栏 */}
      <header className="bg-gray-800 text-white h-16 flex items-center justify-between px-8 shadow-md">
        <h1 className="text-xl font-semibold">场地环境监测系统</h1>
        <div className="flex items-center space-x-4">
          <Button type="text" className="text-white hover:text-gray-300">
            <SettingOutlined className="text-lg" />
          </Button>
          <Button type="text" className="text-white hover:text-gray-300">
            <UserOutlined className="text-lg" />
          </Button>
        </div>
      </header>
      {/* 主内容区 */}
      <main className="px-8 py-6">
        {/* 场地选择区域 */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4 text-gray-700">选择监测场地</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2" style={{ scrollbarWidth: "none" }}>
            {venueData.slice(0, 5).map((venue) => (
              <button
                key={venue.id}
                className={`flex-shrink-0 px-6 py-3 rounded-lg transition-all duration-200 whitespace-nowrap !rounded-button ${
                  selectedVenue === venue.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-sm"
                }`}
                onClick={() => setSelectedVenue(venue.id)}
              >
                {venue.name}
              </button>
            ))}
          </div>
        </div>
        {/* 位置信息展示区 */}
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4 text-gray-700">
            {venueData.find((v) => v.id === selectedVenue)?.name} - 环境数据
          </h2>
          <div className="grid grid-cols-5 gap-6">
            {venueData
              .find((v) => v.id === selectedVenue)
              ?.locations.map((location, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow duration-200"
                >
                  <h3 className="text-lg font-medium text-gray-800 mb-4 pb-2 border-b border-gray-100">
                    {location.name}
                  </h3>
                  {/* 温度信息 */}
                  <div className="mb-5">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 flex items-center">
                        <i className="fas fa-thermometer-half mr-2 text-red-500"></i>
                        温度
                      </span>
                      <span className="font-medium text-gray-800">{location.temperature}°C</span>
                    </div>
                    <Progress
                      percent={((location.temperature - 15) / 20) * 100}
                      strokeColor={getTemperatureColor(location.temperature)}
                      showInfo={false}
                      size="small"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>15°C</span>
                      <span>35°C</span>
                    </div>
                  </div>
                  {/* 湿度信息 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-600 flex items-center">
                        <i className="fas fa-tint mr-2 text-blue-500"></i>
                        湿度
                      </span>
                      <span className="font-medium text-gray-800">{location.humidity}%</span>
                    </div>
                    <Progress
                      percent={location.humidity}
                      strokeColor={getHumidityColor(location.humidity)}
                      showInfo={false}
                      size="small"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
        {/* 环境标准说明 */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-medium text-gray-800 mb-4">环境标准参考</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">温度标准</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li className="flex items-center">
                  <span className="w-3 h-3 rounded-full bg-blue-300 mr-2"></span>
                  <span>18°C - 24°C 舒适范围</span>
                </li>
                <li className="flex items-center">
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
        </div>
      </main>
      {/* 底部刷新区域 */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-8 flex justify-between items-center shadow-lg">
        <div className="text-gray-600 text-sm">最后更新: {lastUpdated}</div>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={handleRefresh}
          loading={loading}
          className="!rounded-button whitespace-nowrap"
        >
          刷新数据
        </Button>
      </footer>
    </div>
  );
};
export default App;
