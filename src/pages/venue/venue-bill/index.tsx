// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useEffect, useState } from "react";
import {
  CaretRightOutlined,
  DownloadOutlined,
  FilterOutlined,
  ReloadOutlined,
  SearchOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Button, Col, Collapse, DatePicker, Input, Pagination, Row, Select, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";

import "dayjs/locale/zh-cn";
dayjs.locale("zh-cn");
import HostingRecord from "./components/HostingRecord";
import PowerConsumption from "./components/PowerConsumption";
interface BillRecord {
  key: string;
  siteName: string;
  period: string;
  totalPower: number;
  托管Price: number;
  maintenancePrice: number;
  托管PricePeriod: string;
  maintenancePricePeriod: string;
  history?: BillRecord[];
}
const App: React.FC = () => {
  const [data, setData] = useState<BillRecord[]>([]);
  const [filteredData, setFilteredData] = useState<BillRecord[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"power" | "service">("power");
  const [showSiteFilter, setShowSiteFilter] = useState(false);
  const [filters, setFilters] = useState({
    siteName: "",
    startDate: "",
    endDate: "",
    powerMin: "",
    powerMax: "",
    托管PriceMin: "",
    托管PriceMax: "",
    maintenancePriceMin: "",
    maintenancePriceMax: "",
  });
  const [allSites, setAllSites] = useState<string[]>([]);
  // Mock data generation
  useEffect(() => {
    const mockData: BillRecord[] = [];
    const sites = [
      "北京朝阳数据中心",
      "上海浦东云计算中心",
      "广州白云科技园区",
      "深圳南山创新基地",
      "杭州西湖数字港",
      "成都高新区信息园",
      "武汉光谷大数据中心",
      "西安高新软件园",
      "南京江北新区机房",
      "重庆两江云计算中心",
    ];
    for (let i = 0; i < 50; i++) {
      const siteIndex = Math.floor(Math.random() * sites.length);
      const baseYear = 2023 + Math.floor(i / 12);
      const baseMonth = i % 12;
      const startDay = Math.floor(Math.random() * 15) + 1; // 1-15号开始
      const endDay = Math.floor(Math.random() * 15) + 15; // 15-30号结束
      const record: BillRecord = {
        key: `${i}`,
        siteName: sites[siteIndex],
        period: `${baseYear}-${String(baseMonth + 1).padStart(2, "0")}-${String(startDay).padStart(2, "0")} ~ ${baseYear}-${String(baseMonth + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`,
        totalPower: parseFloat((Math.random() * 10000 + 5000).toFixed(2)),
        托管Price: parseFloat((Math.random() * 0.8 + 0.4).toFixed(3)),
        maintenancePrice: parseFloat((Math.random() * 0.3 + 0.1).toFixed(3)),
        托管PricePeriod: `${baseYear}-${String(baseMonth + 1).padStart(2, "0")}-01 ~ ${baseYear}-${String(baseMonth + 1).padStart(2, "0")}-01`,
        maintenancePricePeriod: `${baseYear}-${String(baseMonth + 1).padStart(2, "0")}-01 ~ ${baseYear}-${String(baseMonth + 1).padStart(2, "0")}-01`,
      };
      // Add historical bills for some sites
      if (i % 5 === 0) {
        const history: BillRecord[] = [];
        for (let j = 1; j <= 3; j++) {
          const historyStartDay = Math.floor(Math.random() * 15) + 1;
          const historyEndDay = Math.floor(Math.random() * 15) + 15;
          history.push({
            key: `${i}-${j}`,
            siteName: sites[siteIndex],
            period: `${baseYear - j}-${String(baseMonth + 1).padStart(2, "0")}-${String(historyStartDay).padStart(2, "0")} ~ ${baseYear - j}-${String(baseMonth + 1).padStart(2, "0")}-${String(historyEndDay).padStart(2, "0")}`,
            totalPower: parseFloat((Math.random() * 10000 + 5000).toFixed(2)),
            托管Price: parseFloat((Math.random() * 0.8 + 0.4).toFixed(3)),
            maintenancePrice: parseFloat((Math.random() * 0.3 + 0.1).toFixed(3)),
            托管PricePeriod: `${baseYear - j}-${String(baseMonth + 1).padStart(2, "0")}-01 ~ ${baseYear - j}-${String(baseMonth + 1).padStart(2, "0")}-01`,
            maintenancePricePeriod: `${baseYear - j}-${String(baseMonth + 1).padStart(2, "0")}-01 ~ ${baseYear - j}-${String(baseMonth + 1).padStart(2, "0")}-01`,
          });
        }
        record.history = history;
      }
      mockData.push(record);
    }
    setData(mockData);
    setFilteredData(mockData);
    // Extract unique site names
    const uniqueSites = Array.from(new Set(sites));
    setAllSites(uniqueSites);
  }, []);
  // Apply filters
  useEffect(() => {
    let result = [...data];
    if (filters.siteName) {
      result = result.filter((item) => item.siteName.includes(filters.siteName));
    }
    if (filters.startDate) {
      result = result.filter((item) => {
        const itemDate = new Date(item.period.split(" ~ ")[0]);
        return itemDate >= new Date(filters.startDate);
      });
    }
    if (filters.endDate) {
      result = result.filter((item) => {
        const itemDate = new Date(item.period.split(" ~ ")[1]);
        return itemDate <= new Date(filters.endDate);
      });
    }
    if (filters.powerMin) {
      result = result.filter((item) => item.totalPower >= parseFloat(filters.powerMin));
    }
    if (filters.powerMax) {
      result = result.filter((item) => item.totalPower <= parseFloat(filters.powerMax));
    }
    if (filters.托管PriceMin) {
      result = result.filter((item) => item.托管Price >= parseFloat(filters.托管PriceMin));
    }
    if (filters.托管PriceMax) {
      result = result.filter((item) => item.托管Price <= parseFloat(filters.托管PriceMax));
    }
    if (filters.maintenancePriceMin) {
      result = result.filter((item) => item.maintenancePrice >= parseFloat(filters.maintenancePriceMin));
    }
    if (filters.maintenancePriceMax) {
      result = result.filter((item) => item.maintenancePrice <= parseFloat(filters.maintenancePriceMax));
    }
    setFilteredData(result);
    setCurrentPage(1);
  }, [filters, data]);
  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const resetFilters = () => {
    setFilters({
      siteName: "",
      startDate: "",
      endDate: "",
      powerMin: "",
      powerMax: "",
      托管PriceMin: "",
      托管PriceMax: "",
      maintenancePriceMin: "",
      maintenancePriceMax: "",
    });
  };
  const columns: ColumnsType<BillRecord> = [
    {
      title: "场地名称",
      dataIndex: "siteName",
      key: "siteName",
      sorter: (a, b) => a.siteName.localeCompare(b.siteName),
      fixed: "left",
      width: 350,
    },
    {
      title: "账单覆盖周期",
      dataIndex: "period",
      key: "period",
      sorter: (a, b) =>
        new Date(a.period.split(" ~ ")[0]).getTime() - new Date(b.period.split(" ~ ")[0]).getTime(),
      width: 250,
    },
    {
      title: "总功耗 (kWh)",
      dataIndex: "totalPower",
      key: "totalPower",
      sorter: (a, b) => a.totalPower - b.totalPower,
      render: (value) => <span className="font-semibold text-blue-600">{value.toLocaleString()}</span>,
      width: 150,
    },
  ];
  const serviceColumns: ColumnsType<BillRecord> = [
    {
      title: "场地名称",
      dataIndex: "siteName",
      key: "siteName",
      sorter: (a, b) => a.siteName.localeCompare(b.siteName),
      fixed: "left",
      width: 350,
    },
    {
      title: "托管单价周期",
      dataIndex: "托管PricePeriod",
      key: "托管PricePeriod",
      sorter: (a, b) =>
        new Date(a.托管PricePeriod.split(" ~ ")[0]).getTime() -
        new Date(b.托管PricePeriod.split(" ~ ")[0]).getTime(),
      width: 250,
    },
    {
      title: "托管单价 (元/kWh)",
      dataIndex: "托管Price",
      key: "托管Price",
      sorter: (a, b) => a.托管Price - b.托管Price,
      render: (value) => <span className="font-semibold text-green-600">¥{value}</span>,
      width: 180,
    },
    {
      title: "运维单价 (元/kWh)",
      dataIndex: "maintenancePrice",
      key: "maintenancePrice",
      sorter: (a, b) => a.maintenancePrice - b.maintenancePrice,
      render: (value) => <span className="font-semibold text-purple-600">¥{value}</span>,
      width: 180,
    },
  ];
  const expandedRowRender = (record: BillRecord, tabType: string) => {
    if (!record.history) return null;
    const columnsToUse = tabType === "power" ? columns : serviceColumns;
    return (
      <Table
        columns={columnsToUse}
        dataSource={record.history}
        pagination={false}
        rowKey="key"
        className="ml-8"
        size="small"
      />
    );
  };
  const expandableConfig = (tabType: string) => ({
    expandedRowRender: (record: BillRecord) => expandedRowRender(record, tabType),
    expandedRowKeys,
    onExpand: (expanded: boolean, record: BillRecord) => {
      const keys = expanded
        ? [...expandedRowKeys, record.key]
        : expandedRowKeys.filter((key) => key !== record.key);
      setExpandedRowKeys(keys);
    },
    expandIcon: ({ expanded, onExpand, record }: any) => {
      if (!record.history) return null;
      return expanded ? (
        <UpOutlined onClick={(e) => onExpand(record, e)} className="text-blue-500" />
      ) : (
        <CaretRightOutlined onClick={(e) => onExpand(record, e)} className="text-blue-500" />
      );
    },
  });
  // Close filter when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSiteFilter && !(e.target as HTMLElement).closest(".site-filter-dropdown")) {
        setShowSiteFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSiteFilter]);
  return (
    <div className="min-h-screen">
      <div className=" mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">场地账单</h1>
        </div>
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-4">
          <div className="text-gray-600">
            {/* 共找到 <span className="font-semibold">{filteredData.length}</span> 条记录 */}
          </div>
          <div className="flex items-center space-x-2" v-if={activeTab === "power"}>
            <div className="relative">
              <Button
                icon={<FilterOutlined />}
                className="!rounded-button whitespace-nowrap"
                onClick={() => setShowSiteFilter(!showSiteFilter)}
              >
                筛选
              </Button>
              {showSiteFilter && (
                <div className="site-filter-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10 border border-gray-200 p-4">
                  <div className="font-medium text-gray-900 mb-3">选择场地</div>
                  <Input
                    placeholder="搜索场地..."
                    className="mb-3"
                    value={filters.siteName}
                    onChange={(e) => {
                      handleFilterChange("siteName", e.target.value);
                    }}
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {allSites
                      .filter((site) => site.includes(filters.siteName))
                      .map((site, index) => (
                        <div key={index} className="flex items-center py-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            id={`site-${index}`}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`site-${index}`}
                            className="ml-2 text-gray-700 cursor-pointer flex-grow"
                          >
                            {site}
                          </label>
                        </div>
                      ))}
                  </div>
                  <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-200">
                    <Button size="small" onClick={() => setShowSiteFilter(false)}>
                      取消
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        setShowSiteFilter(false);
                      }}
                    >
                      应用
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <Button icon={<DownloadOutlined />} className="!rounded-button whitespace-nowrap">
              导出 Excel
            </Button>
          </div>
          <div className="flex items-center space-x-2" v-else>
            <div className="relative">
              <Button
                icon={<FilterOutlined />}
                className="!rounded-button whitespace-nowrap"
                onClick={() => setShowSiteFilter(!showSiteFilter)}
              >
                筛选
              </Button>
              {showSiteFilter && (
                <div className="site-filter-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10 border border-gray-200 p-4">
                  <div className="font-medium text-gray-900 mb-3">选择场地</div>
                  <Input
                    placeholder="搜索场地..."
                    className="mb-3"
                    value={filters.siteName}
                    onChange={(e) => {
                      handleFilterChange("siteName", e.target.value);
                    }}
                  />
                  <div className="max-h-60 overflow-y-auto">
                    {allSites
                      .filter((site) => site.includes(filters.siteName))
                      .map((site, index) => (
                        <div key={index} className="flex items-center py-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            id={`site-${index}`}
                            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <label
                            htmlFor={`site-${index}`}
                            className="ml-2 text-gray-700 cursor-pointer flex-grow"
                          >
                            {site}
                          </label>
                        </div>
                      ))}
                  </div>
                  <div className="flex justify-end space-x-2 mt-3 pt-3 border-t border-gray-200">
                    <Button size="small" onClick={() => setShowSiteFilter(false)}>
                      取消
                    </Button>
                    <Button
                      size="small"
                      type="primary"
                      onClick={() => {
                        setShowSiteFilter(false);
                      }}
                    >
                      应用
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <Button icon={<DownloadOutlined />} className="!rounded-button whitespace-nowrap">
              导出 Excel
            </Button>
          </div>
        </div>
        {/* Tabs for Different Billing Types */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "power"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("power")}
              >
                总功耗账单
              </button>
              <button
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "service"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("service")}
              >
                服务费用账单
              </button>
            </div>
          </div>
          <div className={`p-4 ${activeTab !== "power" ? "hidden" : ""}`}>
            <PowerConsumption
              columns={columns}
              data={filteredData}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={(page: number, size: number) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              expandable={expandableConfig("power")}
              scrollX={1000}
              rowClassName="hover:bg-gray-50 transition-colors"
            />
          </div>
          <div className={`p-4 ${activeTab !== "service" ? "hidden" : ""}`}>
            <HostingRecord
              columns={serviceColumns}
              data={filteredData}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={(page: number, size: number) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
              expandable={expandableConfig("service")}
              scrollX={1200}
              rowClassName="hover:bg-gray-50 transition-colors"
            />
          </div>
        </div>
        {/* Footer Info */}
        {/* <div className="mt-8 text-center text-gray-500 text-sm">
                    <p>© 2023 数据中心管理系统. 所有账单数据均为模拟数据，仅用于演示目的。</p>
                </div> */}
      </div>
    </div>
  );
};
export default App;
