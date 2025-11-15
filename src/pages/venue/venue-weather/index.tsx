// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useEffect, useState } from "react";
import { SearchOutlined, UserOutlined } from "@ant-design/icons";
import { DatePicker, Pagination, Select, Spin } from "antd";
import dayjs from "dayjs";
import { LineChart } from "echarts/charts";
import { GridComponent, TitleComponent, TooltipComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import WeatherDetail from "./components/weatherDetail";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchWeatherList } from "@/pages/venue/api";
echarts.use([LineChart, CanvasRenderer, TitleComponent, TooltipComponent, GridComponent]);

interface WeatherData {
  venue_id: number;
  venue_name: string;
  date: string;
  day_period: string;
  weather: string;
  min_temperature: number;
  max_temperature: number;
  humidity: number;
  precipitation: number;
  wind_speed: number;
}

interface Venue {
  venue_id: number;
  venue_name: string;
  grouped_list?: DateGroup[];
}
interface GroupVenue {
  id: number;
  name: string;
}
interface DateGroup {
  date: string;
  day?: WeatherData;
  night?: WeatherData;
}

// const weatherConditions = [
//     { label: '晴天', value: 'sunny', icon: <SunOutlined /> },
//     { label: '多云', value: 'cloudy', icon: <CloudOutlined /> },
//     { label: '雷暴', value: 'storm', icon: <ThunderboltOutlined /> }
// ];

const App: React.FC = () => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [filteredData, setFilteredData] = useState<Venue[]>([]);
  // const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // 移除：const [darkMode, setDarkMode] = useState(false);
  // const [venueName, setVenueName] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [selectedDate, setSelectedDate] = useState<string>(dayjs().format("YYYY-MM-DD"));
  const [loading, setLoading] = useState(false);

  const groupByDate = (value: WeatherData[]): DateGroup[] => {
    const map = new Map<string, DateGroup>();
    if (!Array.isArray(value)) return [];
    for (const it of value) {
      const d = it?.date;
      if (!d) continue;
      const existing = map.get(d) ?? { date: d };
      const period = (it.day_period || "").trim();
      if (period === "白天") {
        existing.day = it;
      } else if (period === "夜间") {
        existing.night = it;
      } else {
        // 未知时段兜底填充
        if (!existing.day) existing.day = it;
        else if (!existing.night) existing.night = it;
      }
      map.set(d, existing);
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  };

  const getWeatherData = async () => {
    setLoading(true);
    try {
      const res: any = await fetchWeatherList(poolType, selectedDate);
      const { success, code, message: msg, data } = res || {};
      if (success === false || (typeof code === "number" && code !== 0)) {
        throw new Error(`API error! code: ${code}, message: ${msg}`);
      }

      if (data && typeof data === "object") {
        const arr = Object.entries(data).map(([key, value]) => {
          if (!value || !Array.isArray(value) || value.length === 0) {
            return {
              venue_id: 0,
              venue_name: key,
              list: (value as WeatherData[]) || [],
              grouped_list: [] as DateGroup[],
            };
          }
          return {
            venue_id: Number(value?.[0]?.venue_id ?? 0),
            venue_name: key,
            list: value as WeatherData[],
            grouped_list: groupByDate(value as WeatherData[]),
          };
        });
        setFilteredData(arr);
      } else {
        setFilteredData([]);
      }
    } catch (err) {
      console.error("getWeatherData error:", err);
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

  // const toggleConditionSelection = (condition: string) => {
  //     setSelectedConditions(prev =>
  //         prev.includes(condition)
  //             ? prev.filter(c => c !== condition)
  //             : [...prev, condition]
  //     );
  // };

  useEffect(() => {
    setFilteredData([]);
    getWeatherData();
  }, [poolType, selectedDate]);
  useEffect(() => {
    // 过滤条件变化时重置页码
    setCurrentPage(1);
  }, [filteredData]);

  // 基于当前数据生成场地名下拉选项
  const venueOptions = Array.from(new Set(filteredData.map((v) => v.venue_name || "未知场地"))).map(
    (name) => ({ value: name, label: name }),
  );

  // 根据下拉框选择或搜索词进行模糊过滤
  const visibleData = filteredData.filter((v) => {
    if (!searchTerm) return true;
    const n = (v.venue_name || "").toLowerCase();
    const s = searchTerm.toLowerCase();
    return n.includes(s);
  });

  // 按场地分组数据（使用过滤后的数据）
  const groupedData = visibleData.reduce(
    (acc, v) => {
      const key = Number(v.venue_id ?? 0);
      acc[key] = {
        venue: { id: key, name: v.venue_name ?? "未知场地" },
        items: Array.isArray(v.grouped_list) ? v.grouped_list : [],
      };
      return acc;
    },
    {} as Record<number, { venue: GroupVenue; items: DateGroup[] }>,
  );
  const groupedEntries = Object.entries(groupedData);
  const totalGroups = groupedEntries.length;
  const startIndex = (currentPage - 1) * pageSize;
  const pageEntries = groupedEntries.slice(startIndex, startIndex + pageSize);
  return (
    <div className="min-h-screen text-gray-900">
      {/* 筛选区域 */}
      <div className={`bg-white shadow-sm py-6 px-8 mt-6  rounded-lg`}>
        <div className="max-w-7xl mx-auto flex flex-wrap gap-6 items-center">
          {/* 日期范围选择器 */}
          <div>
            <DatePicker
              placeholder={"选择日期"}
              className="w-40"
              format="YYYY-MM-DD"
              value={selectedDate ? dayjs(selectedDate) : undefined}
              onChange={(date) => setSelectedDate(date ? date.format("YYYY-MM-DD") : "")}
            />
          </div>
          {/* 天气类型筛选 */}
          {/* <div className="flex space-x-2">
                        {weatherConditions.map(condition => (
                            <Button
                                key={condition.value}
                                className={`!rounded-button whitespace-nowrap flex items-center ${selectedConditions.includes(condition.value)
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100'
                                    }`}
                                onClick={() => toggleConditionSelection(condition.value)}
                            >
                                {condition.icon}
                                <span className="ml-2">{condition.label}</span>
                            </Button>
                        ))}
                    </div> */}
          {/* 搜索框 */}
          <div className="relative ml-auto w-64">
            <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Select
              showSearch
              allowClear
              placeholder="搜索场地名称..."
              className="w-full"
              onSearch={(val) => setSearchTerm(val)}
              onChange={(val) => setSearchTerm(val || "")}
              options={venueOptions}
              filterOption={(input, option) => {
                const label = (option?.label ?? "").toString().toLowerCase();
                return label.includes(input.toLowerCase());
              }}
            />
          </div>
        </div>
      </div>
      {/* 主体内容区域 */}
      <Spin spinning={loading} tip="加载中...">
        <div className=" flex-grow">
          <div className="mx-auto">
            {/* 分组显示天气数据 */}
            {pageEntries.map(([venueId, group]) => (
              <div key={venueId} className={`mb-6 rounded-xl overflow-hidden shadow-lg bg-white`}>
                {/* 场地头部 */}
                <div
                  className={`p-4 flex justify-between items-center cursor-pointer bg-gray-300 hover:bg-gray-200`}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-3">
                      <UserOutlined className="text-blue-500 dark:text-blue-300" />
                    </div>
                    <h2 className="text-xl font-semibold">{group.venue.name}</h2>
                  </div>
                </div>
                {/* 天气详情列表 */}
                {/* {expandedGroups[group.venue.id.toString()] && ( */}
                <div className="grid grid-cols-3 gap-4">
                  {group.items.map((item, idx) => (
                    <WeatherDetail key={`${group.venue.id}-${item.date}-${idx}`} item={item} />
                  ))}
                </div>
                {/* )} */}
              </div>
            ))}
            <div className="flex justify-center mt-6">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalGroups}
                showSizeChanger
                onChange={(p: number, s: number) => {
                  setCurrentPage(p);
                  setPageSize(s);
                }}
              />
            </div>
            {/* 空状态 */}
            {Object.keys(groupedData).length === 0 && (
              <div className={`text-center py-12 rounded-xl bg-white  shadow`}>
                <div className="text-5xl mb-4 text-gray-300">
                  <i className="fas fa-cloud-sun"></i>
                </div>
                <h3 className="text-xl font-medium mb-2">未找到匹配的天气数据</h3>
                <p className="text-gray-500 dark:text-gray-400">请尝试调整筛选条件或搜索关键词</p>
              </div>
            )}
          </div>
        </div>
      </Spin>
    </div>
  );
};
export default App;
