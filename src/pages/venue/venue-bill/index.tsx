// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useEffect, useRef, useState } from "react";
import { DownloadOutlined, FilterOutlined } from "@ant-design/icons";
import { Button, Input } from "antd";
import dayjs from "dayjs";

import "dayjs/locale/zh-cn";
dayjs.locale("zh-cn");
import HostingRecord, { type HostingRecordHandle } from "./components/HostingRecord";
import PowerConsumption, { type PowerConsumptionHandle } from "./components/PowerConsumption";

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"power" | "service">("power");
  const [showSiteFilter, setShowSiteFilter] = useState(false);
  const [filters, setFilters] = useState<{ siteName: string }>({ siteName: "" });
  const [powerSites, setPowerSites] = useState<string[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const powerRef = useRef<PowerConsumptionHandle>(null);

  // service 联动所需的状态与 ref
  const [serviceSites, setServiceSites] = useState<string[]>([]);
  const [selectedServiceSites, setSelectedServiceSites] = useState<string[]>([]);
  const serviceRef = useRef<HostingRecordHandle>(null);

  const handleFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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
          <h1 className="text-2xl font-bold text-gray-900">场地账单</h1>
        </div>
        {/* Action Bar */}
        <div className="flex justify-between items-center mb-4">
          {activeTab === "power" && (
            <>
              <div className="text-gray-600">
                共找到 <span className="font-semibold">{powerSites.length}</span> 条记录
              </div>

              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Button
                    size="middle"
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
                        size="middle"
                        placeholder="搜索场地..."
                        className="mb-3"
                        value={filters.siteName}
                        onChange={(e) => {
                          handleFilterChange("siteName", e.target.value);
                        }}
                      />
                      <div className="max-h-60 overflow-y-auto">
                        {powerSites
                          .filter((site: string) => site.includes(filters.siteName))
                          .map((site: string, index: number) => (
                            <div key={index} className="flex items-center py-2 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                id={`site-${index}`}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                checked={selectedSites.includes(site)}
                                onChange={(e) => {
                                  setSelectedSites((prev: string[]) => {
                                    const set = new Set(prev);
                                    if (e.target.checked) {
                                      set.add(site);
                                    } else {
                                      set.delete(site);
                                    }
                                    return Array.from(set);
                                  });
                                }}
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
                <Button
                  size="middle"
                  icon={<DownloadOutlined />}
                  className="!rounded-button whitespace-nowrap"
                  onClick={() => powerRef.current?.exportToExcel()}
                >
                  导出 Excel
                </Button>
              </div>
            </>
          )}

          {activeTab === "service" && (
            <>
              <div className="text-gray-600">
                共找到 <span className="font-semibold">{serviceSites.length}</span> 条记录
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Button
                    size="middle"
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
                        size="middle"
                        placeholder="搜索场地..."
                        className="mb-3"
                        value={filters.siteName}
                        onChange={(e) => {
                          handleFilterChange("siteName", e.target.value);
                        }}
                      />
                      <div className="max-h-60 overflow-y-auto">
                        {serviceSites
                          .filter((site: string) => site.includes(filters.siteName))
                          .map((site: string, index: number) => (
                            <div key={index} className="flex items-center py-2 hover:bg-gray-50 rounded">
                              <input
                                type="checkbox"
                                id={`service-site-${index}`}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                checked={selectedServiceSites.includes(site)}
                                onChange={(e) => {
                                  setSelectedServiceSites((prev: string[]) => {
                                    const set = new Set(prev);
                                    if (e.target.checked) {
                                      set.add(site);
                                    } else {
                                      set.delete(site);
                                    }
                                    return Array.from(set);
                                  });
                                }}
                              />
                              <label
                                htmlFor={`service-site-${index}`}
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
                <Button
                  size="middle"
                  icon={<DownloadOutlined />}
                  className="!rounded-button whitespace-nowrap"
                  onClick={() => serviceRef.current?.exportToExcel?.()}
                >
                  导出 Excel
                </Button>
              </div>
            </>
          )}
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
                账单总功耗
              </button>
              <button
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "service"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("service")}
              >
                托管运维单价
              </button>
            </div>
          </div>
          <div className={`p-4 ${activeTab !== "power" ? "hidden" : ""}`}>
            <PowerConsumption
              ref={powerRef}
              setPowerSites={setPowerSites}
              filterSiteName={filters.siteName ?? ""}
              selectedSites={selectedSites}
            />
          </div>
          <div className={`p-4 ${activeTab !== "service" ? "hidden" : ""}`}>
            <HostingRecord
              ref={serviceRef}
              setServiceSites={setServiceSites}
              filterSiteName={filters.siteName ?? ""}
              selectedSites={selectedServiceSites}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default App;
