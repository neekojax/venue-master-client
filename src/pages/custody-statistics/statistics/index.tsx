import { useEffect, useState } from "react";
import { ExportOutlined, FilterOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Input, Select, Switch } from "antd";
import CustodyStatisticsMonthTable from "./components/CustodyStatisticsMonthTable";
import CustodyStatisticsTable from "./components/CustodyStatisticsTable";

// 单文件 React 组件：可直接在支持 Tailwind 的项目中预览
// 说明：这是一个设计原型，展示“按天数搜索（下拉）”与“按月搜索（日历月）”二选一的交互和界面风格

export default function DateModeHeader() {
  const [mode, setMode] = useState("day"); // 'day' 或 'month'
  const [dayRange, setDayRange] = useState("1days");
  const [discountFilter, setDiscountFilter] = useState<"全部状态" | "打折" | "不变" | "分润">("全部状态");

  // 读取默认时间范围（与 dailyData.tsx 保持一致）
  // const getInitialTimeRange = () => {
  //   const stored = localStorage.getItem("timeRange");
  //   return stored ? stored : "1days";
  // };

  const [month, setMonth] = useState(() => {
    const d = new Date();
    let year = d.getFullYear();
    let monthNum = d.getMonth() + 1; // 1-12
    // 若今天是当月1号，则将初始值设为上一个月
    if (d.getDate() === 1) {
      monthNum -= 1;
      if (monthNum === 0) {
        monthNum = 12;
        year -= 1;
      }
    }
    return `${year}-${String(monthNum).padStart(2, "0")}`; // YYYY-MM
  });
  // 提升的筛选与导出相关状态
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  const [showHighFeeOnly, setShowHighFeeOnly] = useState(false);
  const [showCollectionOnly, setShowCollectionOnly] = useState(false);
  const [venueOptions, setVenueOptions] = useState<{ label: string; value: string }[]>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  // 场地筛选弹层状态
  const [showSiteFilter, setShowSiteFilter] = useState(false);
  const [siteSearch, setSiteSearch] = useState("");
  const [showColumnFilter, setShowColumnFilter] = useState(false);
  // 列显示管理（默认：显示除“预估功耗”外的所有列）
  const availableColumns = [
    { key: "venue_name", label: "场地名" },
    { key: "hash", label: "24h算力" },
    { key: "total_income_btc", label: "收益(BTC/USD/净USD)" },
    { key: "basic_hosting_fee", label: "单价($/kwh)" },
    { key: "power_consumption", label: "预估功耗" },
    { key: "nominal_power_consumption", label: "额定功耗" },
    { key: "power_consumption_diff", label: "功耗差异" },
    { key: "total_hosting_fee", label: "总托管费" },
    { key: "hosting_fee_ratio", label: "托管费占比" },
    { key: "discount_status", label: "折扣状态" },
    { key: "discount_price", label: "折扣价格" },
    { key: "discount_hosting_fee_ratio", label: "折扣托管费占比" },
    { key: "discount_cost_ratio", label: "折扣成本占比" },
    { key: "downclock_discount", label: "降频后折扣" },
    { key: "downclock_discount_hosting_fee_ratio", label: "降频后托管费占比" },
    { key: "downclock_discount_cost_ratio", label: "降频后成本比" },
    { key: "shutdown_price", label: "关机币价" },
    { key: "downclock_price_ranges", label: "降频价格区间" },
    { key: "downclock_before_profit", label: "降频前利润" },
    { key: "downclock_after_profit", label: "降频后利润" },
    { key: "date", label: "收益日期" },
    { key: "period_type", label: "周期类型" },

    // { key: "total_income_btc", label: "收益BTC" },
    // { key: "total_income_usd", label: "收益USD" },
    // { key: "net_income", label: "净USD" },
    // { key: "power_consumption", label: "预估功耗" },
    // { key: "nominal_power_consumption", label: "额定功耗" },
    // { key: "power_consumption_diff", label: "功耗差异" },

    // { key: "discount_status", label: "折扣状态" },
    // { key: "discount_price", label: "折扣价格" },
    // { key: "discount_hosting_fee_ratio", label: "折扣托管费占比" },
    // { key: "period_type", label: "统计周期" },
    // { key: "date", label: "收益日期" },
  ];
  const defaultVisibleColumnKeys = availableColumns
    .map((c) => c.key)
    .filter((k) => !["hash", "total_income_btc"].includes(k));
  const [visibleColumns, setVisibleColumns] = useState<string[]>(defaultVisibleColumnKeys);
  const [columnSearch, setColumnSearch] = useState("");

  // 计算表格内容可滚动高度，确保分页在底部始终可见
  const [tableScrollY, setTableScrollY] = useState<number>(480);
  useEffect(() => {
    const calc = () => {
      const vpH = window.innerHeight;
      // 表格容器相对视口顶部的距离
      const tableContainer = document.getElementById("statistics-table-container");
      const top = tableContainer?.getBoundingClientRect().top ?? 0;
      // 分页区域高度（如果未渲染，则使用预估高度）
      const paginationEl = document.querySelector(".ant-table-pagination") as HTMLElement | null;
      const paginationH = paginationEl?.offsetHeight ?? 64;
      const bottomPadding = 32; // 预留底部内边距
      const y = Math.max(240, vpH - top - paginationH - bottomPadding - 60);
      setTableScrollY(y);
    };
    // 初始与窗口尺寸变化时计算
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, [mode, dayRange, month, selectedVenues, showHighFeeOnly]);

  // 简单 CSV 导出（无需额外依赖）
  const exportCustodyStatisticsToExcel = (rows: any[]) => {
    if (!rows || rows.length === 0) return;

    // 定义导出列的顺序与对应中文列名
    const columns = [
      { key: "venue_name", label: "场地名" },
      { key: "hash", label: "24h算力" },
      { key: "total_income_btc", label: "收益BTC" },
      { key: "total_income_usd", label: "收益USD" },
      { key: "net_income", label: "净USD" },
      { key: "basic_hosting_fee", label: "单价($/kwh)" },
      { key: "power_consumption", label: "预估功耗" },
      { key: "nominal_power_consumption", label: "额定功耗" },
      { key: "power_consumption_diff", label: "功耗差异" },
      { key: "total_hosting_fee", label: "总托管费" },
      { key: "hosting_fee_ratio", label: "托管费占比" },
      { key: "discount_status", label: "折扣状态" },
      { key: "discount_price", label: "折扣价格" },
      { key: "discount_hosting_fee_ratio", label: "折扣托管费占比" },
      { key: "discount_cost_ratio", label: "折扣成本占比" },
      { key: "downclock_discount", label: "降频后折扣" },
      { key: "downclock_discount_hosting_fee_ratio", label: "降频后托管费占比" },
      { key: "downclock_discount_cost_ratio", label: "降频后成本比" },
      { key: "shutdown_price", label: "关机币价" },
      { key: "downclock_price_ranges", label: "降频价格区间" },
      { key: "downclock_before_profit", label: "降频前利润" },
      { key: "downclock_after_profit", label: "降频后利润" },

      { key: "period_type", label: "统计周期" },
      { key: "date", label: "收益日期" },
    ];

    // 仅导出在数据中实际存在的列
    const keys = columns.map((c) => c.key).filter((k) => rows.some((r) => k in r));
    const labels = columns.filter((c) => keys.includes(c.key)).map((c) => c.label);

    // 按字段名格式化数值：收益BTC保持8位，其它数值保留2位；_ratio/_diff追加百分号
    const formatValue = (key: string, val: any) => {
      if (val === null || val === undefined) return "";
      const isPercent = key.includes("_ratio") || key.includes("_diff");
      const isBTC = key === "total_income_btc";

      const toNumber = (v: any) => (typeof v === "number" ? v : parseFloat(v));
      const num = toNumber(val);
      if (key === "downclock_price_ranges") {
        // return val.join(",");
        // text
        return val
          .map((pair: any) => {
            if (!Array.isArray(pair) || pair.length < 2) return null;
            const a = Math.round(Number(pair[0]));
            const b = Math.round(Number(pair[1]));
            return `[${a},${b}]`;
          })
          .filter(Boolean)
          .join(" ,");
      }

      if (Number.isFinite(num)) {
        if (isBTC) return num.toFixed(8); // 收益BTC保持8位
        if (isPercent) return `${num.toFixed(4)}%`; // 百分比两位并加%
        return num.toFixed(4); // 其它数值保留两位
      }

      // 非数值，直接字符串返回
      return String(val);
    };

    // 处理 CSV 单元格转义（包含逗号、引号、换行）
    const escapeCell = (v: any) => {
      if (v === null || v === undefined) return "";
      const str = String(v);
      if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
      return str;
    };

    const csvLines = [
      labels.join(","),
      ...rows.map((r) => keys.map((k) => escapeCell(formatValue(k, (r as any)[k]))).join(",")),
    ];

    const csv = csvLines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    //  {mode === "day" ? `最近 ${dayRange} 天` : `${month}`}
    const fileName =
      mode === "day"
        ? `最近 ${dayRange.replace("days", "天").replace("month", "月")} 电费统计`
        : `${month}电费统计`;
    a.download = `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-gray-50" style={{ height: "100%" }}>
      {/* Card-like container for header */}
      <div className=" mx-auto bg-white rounded-2xl shadow-md p-6">
        <header className="sticky  z-40 bg-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold">电费信息统计</h1>
            <p className="text-sm text-gray-500 mt-1">选择你要展示的时间粒度：按天数 或 按月（单月）</p>
          </div>

          {/* 模式切换控件 */}
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-full bg-gray-100 p-1">
              <button
                onClick={() => setMode("day")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  mode === "day" ? "bg-white shadow-sm text-indigo-700" : "text-gray-600"
                }`}
                aria-pressed={mode === "day"}
              >
                按天数
              </button>
              <button
                onClick={() => setMode("month")}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  mode === "month" ? "bg-white shadow-sm text-indigo-700" : "text-gray-600"
                }`}
                aria-pressed={mode === "month"}
              >
                按月
              </button>
            </div>

            {/* 控件区：根据模式展示不同控件（互斥） */}
            <div className="flex items-center gap-3">
              <div
                className={`group flex items-center gap-2 p-1 rounded-xl border transition ${mode === "day" ? "border-indigo-300 bg-white shadow-sm ring-2 ring-indigo-100" : "border-gray-200 bg-gray-100 text-gray-400 opacity-70 pointer-events-none"}`}
                aria-hidden={mode !== "day"}
              >
                <label className={`text-sm ${mode === "day" ? "text-indigo-600" : "text-gray-500"}`}>
                  最近
                </label>
                <select
                  value={dayRange}
                  onChange={(e) => setDayRange(e.target.value)}
                  disabled={mode !== "day"}
                  className={`appearance-none bg-transparent text-sm font-medium outline-none px-2 py-1 rounded-md ring-1 transition ${mode === "day" ? "ring-gray-300 focus:ring-indigo-500 hover:ring-indigo-300" : "ring-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                >
                  <option value="1days">1 天</option>
                  <option value="7days">7 天</option>
                  <option value="1month">30 天</option>
                  <option value="3month">90 天</option>
                </select>
                <span className={`text-sm ${mode === "day" ? "text-gray-400" : "text-gray-500"}`}>数据</span>
              </div>

              <div
                className={`group flex items-center gap-2 p-1 rounded-xl border transition ${mode === "month" ? "border-indigo-300 bg-white shadow-sm ring-2 ring-indigo-100" : "border-gray-200 bg-gray-100 text-gray-400 opacity-70 pointer-events-none"}`}
                aria-hidden={mode !== "month"}
              >
                <label className={`text-sm ${mode === "month" ? "text-indigo-600" : "text-gray-500"}`}>
                  选择月份
                </label>
                <input
                  type="month"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  disabled={mode !== "month"}
                  className={`text-sm font-medium outline-none bg-transparent px-2 py-1 rounded-md ring-1 transition ${mode === "month" ? "ring-gray-300 focus:ring-indigo-500 hover:ring-indigo-300" : "ring-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                />
              </div>
            </div>
          </div>
        </header>

        {/* 分割线 */}
        <div className="border-t mt-6 pt-6">
          {/* 预览区域：展示卡片与时间范围提示 */}
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm text-gray-500">
              当前筛选：
              <span className="ml-2 font-medium text-gray-700">
                {mode === "day"
                  ? `最近 ${dayRange.replace("days", "天").replace("month", "月")}`
                  : `${month.replace("month", "月")}`}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: -20 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: "#000",
                  marginRight: 10,
                  whiteSpace: "nowrap",
                }}
              >
                <Switch size="small" checked={showCollectionOnly} onChange={setShowCollectionOnly} />
                <span style={{ marginLeft: 8 }}>我的收藏</span>
              </span>

              <div className="relative" style={{ marginRight: 10 }}>
                <Button
                  size="middle"
                  icon={<FilterOutlined />}
                  className="!rounded-button whitespace-nowrap"
                  onClick={() => setShowSiteFilter(!showSiteFilter)}
                >
                  场地筛选
                </Button>
                {showSiteFilter && (
                  <div className="site-filter-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10 border border-gray-200 p-4">
                    <div className="font-medium text-gray-900 mb-3">选择场地</div>
                    <Input
                      size="middle"
                      placeholder="搜索场地..."
                      className="mb-3"
                      value={siteSearch}
                      onChange={(e) => {
                        setSiteSearch(e.target.value);
                      }}
                    />
                    <div className="max-h-60 overflow-y-auto">
                      {(venueOptions.map((o) => o.value) || [])
                        .filter((site: any) =>
                          String(site || "")
                            .toLowerCase()
                            .includes(siteSearch.toLowerCase()),
                        )
                        .map((site: any, index: number) => (
                          <div key={index} className="flex items-center py-2 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              id={`site-${index}`}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              checked={selectedVenues.includes(site)}
                              onChange={(e) => {
                                setSelectedVenues((prev) => {
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

              {/* 表头设置（显示列）独立下拉 */}
              <div className="relative" style={{ marginRight: 10 }}>
                <Button
                  size="middle"
                  icon={<SettingOutlined />}
                  className="!rounded-button whitespace-nowrap"
                  onClick={() => setShowColumnFilter(!showColumnFilter)}
                >
                  表头设置
                </Button>
                {showColumnFilter && (
                  <div className="column-filter-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10 border border-gray-200 p-4">
                    <div className="font-medium text-gray-900 mb-3">显示列</div>
                    <Input
                      size="middle"
                      placeholder="搜索列..."
                      className="mb-3"
                      value={columnSearch}
                      onChange={(e) => setColumnSearch(e.target.value)}
                    />
                    <div className="max-h-60 overflow-y-auto">
                      {availableColumns
                        .filter((col) => col.label.toLowerCase().includes(columnSearch.toLowerCase()))
                        .map((col, index) => (
                          <div key={col.key} className="flex items-center py-2 hover:bg-gray-50 rounded">
                            <input
                              type="checkbox"
                              id={`col-${index}`}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                              checked={visibleColumns.includes(col.key)}
                              onChange={(e) => {
                                setVisibleColumns((prev) => {
                                  const set = new Set(prev);
                                  if (e.target.checked) {
                                    set.add(col.key);
                                  } else {
                                    set.delete(col.key);
                                  }
                                  return Array.from(set);
                                });
                              }}
                            />
                            <label
                              htmlFor={`col-${index}`}
                              className="ml-2 text-gray-700 cursor-pointer flex-grow"
                            >
                              {col.label}
                            </label>
                          </div>
                        ))}
                    </div>
                    <div className="flex justify-between space-x-2 mt-3 pt-3 border-t border-gray-200">
                      <Button size="small" onClick={() => setVisibleColumns(defaultVisibleColumnKeys)}>
                        恢复默认
                      </Button>
                      <Button size="small" type="primary" onClick={() => setShowColumnFilter(false)}>
                        关闭
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 8, marginTop: 8 }}>
                <span className="fee-ratio-title">折扣状态：</span> */}
              <Select
                size="middle"
                value={discountFilter}
                // allowClear
                showSearch
                placeholder="折扣状态"
                onChange={(val) => setDiscountFilter(val as any)}
                style={{ width: 120, marginRight: 10 }}
                options={[
                  { value: "全部状态", label: "全部状态" },
                  { value: "打折", label: "打折" },
                  { value: "不变", label: "不变" },
                  { value: "分润", label: "分润" },
                ]}
              />

              {/* </div> */}
              <Button.Group size="middle" style={{ marginRight: 10 }}>
                <Button
                  type={!showHighFeeOnly ? "primary" : "default"}
                  onClick={() => setShowHighFeeOnly(false)}
                >
                  全部
                </Button>
                <Button
                  type={showHighFeeOnly ? "primary" : "default"}
                  onClick={() => setShowHighFeeOnly(true)}
                >
                  高托管费
                </Button>
              </Button.Group>
              <Button
                icon={<ExportOutlined className="exportIcon" />}
                size="middle"
                className={"text-blue-500 exportButton"}
                onClick={() => exportCustodyStatisticsToExcel(filteredData)}
              >
                导出
              </Button>
            </div>
          </div>

          {/* 在筛选头部下方展示统计表格 */}
          <div id="statistics-table-container" className="mx-auto">
            {mode === "day" ? (
              <CustodyStatisticsTable
                dayRange={dayRange}
                selectedVenues={selectedVenues}
                showHighFeeOnly={showHighFeeOnly}
                showCollectionOnly={showCollectionOnly}
                discountFilter={discountFilter}
                visibleColumns={visibleColumns}
                onVenueOptionsReady={(opts: { label: string; value: string }[]) => setVenueOptions(opts)}
                onFilteredDataChange={(data: any[]) => setFilteredData(data)}
                scrollY={tableScrollY}
              />
            ) : (
              <CustodyStatisticsMonthTable
                month={month}
                selectedVenues={selectedVenues}
                showHighFeeOnly={showHighFeeOnly}
                showCollectionOnly={showCollectionOnly}
                discountFilter={discountFilter}
                visibleColumns={visibleColumns}
                onVenueOptionsReady={(opts: { label: string; value: string }[]) => setVenueOptions(opts)}
                onFilteredDataChange={(data: any[]) => setFilteredData(data)}
                scrollY={tableScrollY}
              />
            )}
          </div>
        </div>
      </div>

      {/* 页面底部提示，用于移动端说明交互 */}
    </div>
  );
}
