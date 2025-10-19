import { useEffect, useMemo, useState } from "react";
import { AiOutlineCalendar } from "react-icons/ai";
import { FaList } from "react-icons/fa6";
import { FcCalendar } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
// import { GiMining } from "react-icons/gi";
import { ExportOutlined } from "@ant-design/icons"; // 导入时钟图标
import { Alert, Button, Select, Space, Spin, Table, Tag, Tooltip } from "antd";
// import EditTable from "@/components/edit-table";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";
import { exportCustodyStatisticsToExcel } from "@/utils/excel";
import { formatHashrate } from "@/utils/num";
import { formatAmount } from "@/utils/num";

import { useCustodyStatisticsList } from "@/pages/custody-statistics/hook/hook.ts";

// 初始化时从 localStorage 获取值
const getInitialTimeRange = () => {
  const stored = localStorage.getItem("timeRange");
  console.log("stored", stored);
  return stored ? stored : "1days"; // 默认为 'all'
};

const getInitialPoolFilter = () => {
  const stored = localStorage.getItem("poolFilter");
  return stored ? stored : ""; // 默认为空
};

export default function StatisticsPage() {
  useAuthRedirect();

  const navigate = useNavigate();

  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const [timeRange, setTimeRange] = useState(getInitialTimeRange()); // 默认时间范围
  const [poolFilter, setPoolFilter] = useState(getInitialPoolFilter()); // 默认池过滤
  const { data: statisticsData, error, isLoading } = useCustodyStatisticsList(timeRange, poolType);

  // const { data: linksData, error, isLoading: isLoadingFields } = useCustodyInfoList();
  const [columns, setColumns] = useState<any>([]);
  const [filteredData, setFilteredData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 新增搜索状态
  const [alertMessage, setAlertMessage] = useState("");
  // 全局序号需要分页信息
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  // 高托管费筛选（> 90%）
  const [showHighFeeOnly, setShowHighFeeOnly] = useState(false);
  const [selectedVenues, setSelectedVenues] = useState<string[]>([]);
  const venueOptions = useMemo(() => {
    const names = Array.from(new Set(tableData.map((i: any) => i.venue_name))).filter(Boolean) as string[];
    return names.map((name) => ({ label: name, value: name }));
  }, [tableData]);

  useEffect(() => {
    if (statisticsData && statisticsData.data) {
      setAlertMessage("");
      const newData = statisticsData.data.map(
        (item: {
          date: any;
          venue_id: any;
          venue_name: any;
          hash: any;
          income_btc: any;
          managed_unit_price: any;
          power_consumption: any;
          nominal_power_consumption: any;
          power_consumption_diff: any;
          total_hosting_fee: any;
          total_income_usd: any;
          net_income: any;
          hosting_fee_ratio: any;
        }) => ({
          key: item.venue_id, // 使用场地ID作为唯一 key
          venue_name: item.venue_name,
          venue_id: item.venue_id,
          // sub_account_name: item.sub_account_name,
          // observer_link: item.observer_link,
          power_consumption: item.power_consumption,
          nominal_power_consumption: item.nominal_power_consumption,
          power_consumption_diff: item.power_consumption_diff,
          energy_ratio: item.power_consumption,
          basic_hosting_fee: item.managed_unit_price,
          hash: item.hash,
          total_hosting_fee: item.total_hosting_fee,
          total_income_btc: item.income_btc,
          total_income_usd: item.total_income_usd,
          net_income: item.net_income,
          hosting_fee_ratio: item.hosting_fee_ratio,
          report_date: item.date,
        }),
      );
      setTableData(newData); // 设置表格数据源
    } else {
      // 处理空数据情况
      // setAlertMessage({
      //   message: "暂无数据",
      //   type: "info",
      // });
      setFilteredData([]);
      setTableData([]);
      // 如果当前时间是最近的时间范围，不展示数据
      const now = new Date(); // 当前时间
      const hour = now.getHours(); // 获取当前小时（0~23）

      if (timeRange === "1days" && hour < 10) {
        setAlertMessage("今日数据处理中，请稍后查看，或者查看近三天的数据");
        // message.open({
        //   type: "warning",
        //   content: "今日数据处理中，请稍后查看，或者查看近三天的数据",
        //   duration: 5,
        // });
      } else {
        setAlertMessage("");
      }
    }
  }, [statisticsData, timeRange]);

  // 表头定义
  useEffect(() => {
    setColumns([
      {
        title: (
          <span className="fee-ratio-title" style={{ padding: 0, margin: 0 }}>
            No
          </span>
        ), // 使用英文标题
        dataIndex: "index",
        key: "index",
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        width: 55,
        render: (_: any, __: any, index: number) => {
          return <span>{(currentPage - 1) * pageSize + index + 1}</span>;
        },
      },
      {
        title: <span className="fee-ratio-title">场地名</span>,
        dataIndex: "venue_name",
        key: "venue_name",
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        width: 280,
        render: (text: string, record: { key?: any }) => {
          const isSpecialVenue = text === "Arct-HF01-J XP-AR-US" || text === "ARCT Technologies-HF02-AR-US";
          return (
            <Tooltip
              title={text}
              placement="top"
              overlayInnerStyle={{ color: "white" }}
              style={{ color: "white" }}
            >
              <div
                style={{
                  width: "280px",
                  overflow: "hidden",
                  color: isSpecialVenue ? "red" : "#333", // 特殊场地字体颜色为红色
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontWeight: isSpecialVenue ? "bold" : "normal", // 加粗特殊场地
                }}
              >
                {isSpecialVenue && (
                  <Tag color="red" style={{ marginLeft: 2 }}>
                    补充
                  </Tag>
                )}
                {/* {text} */}
                <Link
                  to={`/venue/detail/${record.key}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-500 hover:underline"
                >
                  {text}
                </Link>
              </div>
            </Tooltip>
          );
        },
      },
      {
        title: <span className="fee-ratio-title">24h算力</span>,
        dataIndex: "hash",
        key: "hash",
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        // width: 140,
        width: "10%",
        sorter: (a: any, b: any) =>
          (typeof a.hash === "number" ? a.hash : parseFloat(a.hash)) -
          (typeof b.hash === "number" ? b.hash : parseFloat(b.hash)), // 添加排序逻辑（兼容字符串）
        render: (text: any) => (
          <span>
            <span>{formatHashrate(text, "TH", 2, "EH")}</span>
            {/* <span style={{ marginLeft: 4, color: "rgba(0,0,0,0.45)" }}>TH/s</span> */}
          </span>
        ), // 渲染单位
      },
      {
        title: <span className="fee-ratio-title">收益(BTC/USD/净USD)</span>,
        dataIndex: "total_income_btc",
        key: "total_income_btc",
        // width: 280,
        width: "25%",
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        sorter: (a: any, b: any) =>
          (typeof a.total_income_btc === "number" ? a.total_income_btc : parseFloat(a.total_income_btc)) -
          (typeof b.total_income_btc === "number" ? b.total_income_btc : parseFloat(b.total_income_btc)), // 添加排序逻辑（兼容字符串）
        render: (text: any, record: any) => (
          <>
            <Tag color="gold" style={{ marginBottom: 8 }}>
              {text.toFixed(8)}
              <span style={{ marginLeft: 2, color: "rgba(0,0,0,0.45)" }}>BTC</span>
            </Tag>
            <Tag color="green">
              <span style={{ marginRight: 3 }}>{formatAmount(record.total_income_usd, 2, "$")}</span>
              <span style={{ marginLeft: 2, color: "rgba(0,0,0,0.45)" }}>/</span>
              <span style={{ marginLeft: 3 }}>{formatAmount(record.net_income, 2, "$")}</span>
            </Tag>
          </>
        ), // 渲染单位
      },
      {
        title: <span className="fee-ratio-title">单价</span>,
        dataIndex: "basic_hosting_fee",
        key: "basic_hosting_fee",
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        // width: 220,
        width: "10%",
        sorter: (a: any, b: any) =>
          (typeof a.basic_hosting_fee === "number" ? a.basic_hosting_fee : parseFloat(a.basic_hosting_fee)) -
          (typeof b.basic_hosting_fee === "number" ? b.basic_hosting_fee : parseFloat(b.basic_hosting_fee)), // 添加排序逻辑（兼容字符串）
        render: (text: any) => (
          <>
            {/* <Tag color="gold" style={{ marginBottom: 8 }}> */}
            {text} $/kwh
            {/* </Tag> */}
          </>
        ),
      },
      {
        title: <span className="fee-ratio-title">预估能耗</span>,
        dataIndex: "energy_ratio",
        key: "energy_ratio",
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        // width: 220,
        width: "10%",
        sorter: (a: any, b: any) =>
          (typeof a.energy_ratio === "number" ? a.energy_ratio : parseFloat(a.energy_ratio)) -
          (typeof b.energy_ratio === "number" ? b.energy_ratio : parseFloat(b.energy_ratio)), // 添加排序逻辑（兼容字符串）
        render: (text: any) => <>{text}</>,
      },
      {
        dataIndex: "nominal_power_consumption",
        key: "nominal_power_consumption",
        title: <span className="fee-ratio-title">额定能耗</span>,
        // width: 200,
        width: "7%",
        render: (text: any) => (
          <>
            <span>{text.toFixed(2)}</span>
          </>
        ), // 渲染单位
      },
      {
        dataIndex: "power_consumption_diff",
        key: "power_consumption_diff",
        title: <span className="fee-ratio-title">能耗差异</span>,
        // width: 200,
        width: "7%",
        render: (text: any) => (
          <>
            <span style={{ color: text > 10 ? "red" : "green" }}>{text}%</span>
          </>
        ), // 渲染单位
      },
      {
        dataIndex: "hosting_fee_ratio",
        key: "hosting_fee_ratio",
        title: <span className="fee-ratio-title">总托管费</span>,
        // width: 200,
        width: "8%",
        render: (text: any, record: any) => (
          <span>
            {/* <span style={{ color: "#3498DB" }}> {record.basic_hosting_fee}</span>{" "}
            <span className="text-sm text-gray-500">$/kwh</span> /{" "} */}
            <span style={{ display: "none" }}>{text.toFixed(2)}</span>
            <span>{formatAmount(record.total_hosting_fee, 2, "$")}</span>
          </span>
        ), // 渲染单位
      },
      {
        title: <span className="fee-ratio-title">托管费占比</span>,
        dataIndex: "hosting_fee_ratio",
        key: "hosting_fee_ratio",
        // width: 220,
        width: "12%",
        sorter: (a: any, b: any) => {
          const av =
            typeof a.hosting_fee_ratio === "number" ? a.hosting_fee_ratio : parseFloat(a.hosting_fee_ratio);
          const bv =
            typeof b.hosting_fee_ratio === "number" ? b.hosting_fee_ratio : parseFloat(b.hosting_fee_ratio);
          return av - bv;
        },
        onHeaderCell: () => ({ className: "fee-ratio-header" }),
        onCell: (record: any) => {
          const val = record?.hosting_fee_ratio;
          const num = typeof val === "number" ? val : parseFloat(val);
          return {
            className: num >= 90 ? "fee-ratio-high" : "fee-ratio-low",
          };
        },
        render: (text: any) => <span>{typeof text === "number" ? `${text.toFixed(2)}%` : `${text}%`}</span>, // 渲染单位
      },
      {
        title: <span className="fee-ratio-title">收益日期</span>,
        // width: 140,
        width: "10%",
        dataIndex: "report_date",
        key: "report_date",
        sorter: (a: any, b: any) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime(), // 确保将日期转换为时间戳进行比较
        render: (text: any) => {
          const date = new Date(text);
          const month = date.getMonth() + 1;
          const day = date.getDate();
          return `${month}-${day}`;
          // return moment(text).format("MM-DD");
        },
      },
    ]);
  }, [timeRange]);

  // 每当 tableData/filter 改变时，更新 displayData
  useEffect(() => {
    // 根据搜索词过滤数据
    const filteredData = tableData.filter((item: { [s: string]: unknown } | ArrayLike<unknown>) => {
      const matchesSearchTerm = Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      );
      // 根据选定的池进行过滤
      // @ts-ignore
      const matchesPoolFilter = poolFilter ? false : true;
      // 高托管费过滤（> 90）
      const ratioVal = (item as any)?.hosting_fee_ratio;
      const ratioNum = typeof ratioVal === "number" ? ratioVal : parseFloat(ratioVal);
      const matchesHighFee = showHighFeeOnly ? ratioNum > 90 : true;
      const matchesSelectedVenues =
        selectedVenues.length > 0 ? selectedVenues.includes((item as any).venue_name) : true;

      return matchesSearchTerm && matchesPoolFilter && matchesHighFee && matchesSelectedVenues;
    });
    setFilteredData(filteredData);
  }, [tableData, searchTerm, showHighFeeOnly, selectedVenues]);

  // Loading 状态
  if (isLoading) {
    return <Spin tip="加载中..." />;
  }
  // 错误状态
  if (error) {
    return <Alert message="错误" description={error.message} type="error" showIcon />;
  }
  // 时间选择
  const handleChange = (value: string) => {
    setTimeRange(value);
    handleSearch();
    localStorage.setItem("timeRange", value); // 存储到本地存储
  };

  // 搜索处理函数
  const handleSearch = () => {
    handlePoolFilterChange("");
    setSearchTerm("");
  };

  // 池选择处理函数
  const handlePoolFilterChange = (value: string) => {
    setPoolFilter(value);
  };

  // @ts-ignore
  return (
    <div>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}
      >
        <Space size={24}>
          {/* <div style={{ display: "flex", alignItems: "center" }}>
            <GiMining style={{ fontSize: "20px", color: "#1890ff", marginRight: "16px" }} />
            <Select
              placeholder="选择池"
              style={{ width: 180, height: 32 }}
              className={"text-xs"}
              size={"small"}
              onChange={handlePoolFilterChange}
              options={[
                {
                  value: "",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <FaList style={{ color: "green", fontSize: 14, marginRight: 8 }} /> 全部
                    </span>
                  ),
                },
                {
                  value: "antpool",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <FaAdn style={{ color: "green", fontSize: 14, marginRight: 8 }} /> 蚂蚁矿池
                    </span>
                  ),
                },
                {
                  value: "f2pool",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <FaFish style={{ color: "#252F4A", fontSize: 14, marginRight: 8 }} /> 鱼池
                    </span>
                  ),
                },
              ]}
              value={poolFilter} // 设置选中的值
            />
          </div> */}
          <div style={{ display: "flex", alignItems: "center" }}>
            <FcCalendar style={{ fontSize: "20px", color: "#1890ff", marginRight: "16px" }} />
            <Select
              placeholder="选择时间"
              style={{ width: 180, height: 32 }}
              size={"small"}
              onChange={handleChange}
              options={[
                {
                  value: "all",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <FaList style={{ color: "green", fontSize: 14, marginRight: 8 }} /> 全部
                    </span>
                  ),
                },
                {
                  value: "1days",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <AiOutlineCalendar style={{ color: "#252F4A", fontSize: 14, marginRight: 8 }} /> 一天
                    </span>
                  ),
                },
                {
                  value: "3days",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <AiOutlineCalendar style={{ color: "#252F4A", fontSize: 14, marginRight: 8 }} /> 三天
                    </span>
                  ),
                },
                {
                  value: "7days",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <AiOutlineCalendar style={{ color: "#252F4A", fontSize: 14, marginRight: 8 }} /> 一周
                    </span>
                  ),
                },
                {
                  value: "1month",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <AiOutlineCalendar style={{ color: "#252F4A", fontSize: 14, marginRight: 8 }} /> 一个月
                    </span>
                  ),
                },
                // {
                //   value: "3month",
                //   label: (
                //     <span style={{ display: "flex", alignItems: "center" }}>
                //       <AiOutlineCalendar style={{ color: "#252F4A", fontSize: 14, marginRight: 8 }} /> 三个月
                //     </span>
                //   ),
                // },
                // {
                //   value: "6month",
                //   label: (
                //     <span style={{ display: "flex", alignItems: "center" }}>
                //       <AiOutlineCalendar style={{ color: "#252F4A", fontSize: 14, marginRight: 8 }} /> 半年
                //     </span>
                //   ),
                // },
              ]}
              value={timeRange} // 设置选中的值
            />
          </div>
        </Space>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Select
            mode="multiple"
            allowClear
            showSearch
            size="middle"
            placeholder="选择场地"
            value={selectedVenues}
            onChange={(vals) => setSelectedVenues(vals as string[])}
            options={venueOptions}
            maxTagCount="responsive"
            maxTagTextLength={8}
            maxTagPlaceholder={(omitted) => `已选 ${omitted.length} 项`}
            style={{ width: 300, marginRight: 10 }}
            className="text-sm"
          />
          <Button.Group size="middle" style={{ marginRight: 10 }}>
            <Button type={!showHighFeeOnly ? "primary" : "default"} onClick={() => setShowHighFeeOnly(false)}>
              全部
            </Button>
            <Button type={showHighFeeOnly ? "primary" : "default"} onClick={() => setShowHighFeeOnly(true)}>
              高托管费
            </Button>
          </Button.Group>

          <Button
            // type="text"
            icon={<ExportOutlined className="exportIcon" />}
            size="middle"
            className={"text-blue-500 exportButton"}
            onClick={() => exportCustodyStatisticsToExcel(filteredData)}
          >
            导出
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Spin style={{ marginTop: 20 }} />
      ) : (
        <div>
          {alertMessage ? (
            <div
              className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative"
              role="alert"
            >
              <strong className="font-bold">提示：</strong>
              <span className="block sm:inline">{alertMessage}</span>
            </div>
          ) : (
            <Table
              pagination={{
                position: ["bottomCenter"],
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "30", "50"],
                defaultPageSize: 20,
                showTotal: (total) => `共 ${total} 条`,
                total: filteredData?.length,
                onChange: (page, pageSize) => {
                  setCurrentPage(page);
                  setPageSize(pageSize);
                  const tableBody = document.querySelector(".ant-table-body");
                  if (tableBody) {
                    (tableBody as HTMLElement).scrollTop = 0;
                  }
                },
              }}
              onRow={(record) => ({
                onClick: () => navigate(`/custody-menu/statisticsDetail/${record.venue_id}`),
                style: { cursor: "pointer" },
              })}
              // rowKey={(record: any) => record.venue_id}
              rowKey={(record) => record.id || record._id || record.miner_name || Math.random()} // ✅ 确保唯一
              columns={columns}
              dataSource={filteredData}
              scroll={{ x: "max-content" }}
              style={{ marginTop: "15px", width: "100%" }}
            />
          )}
        </div>
        // <Table
        //   columns={columns}
        //   dataSource={filteredData}
        // pagination={{
        //   current: currentPage,
        //   pageSize,
        //   total: tableData.length,
        //   onChange: (page) => setCurrentPage(page),
        // }}
        // />
        // <EditTable
        //   tableData={filteredData}
        //   setTableData={setTableData}
        //   columns={columns}
        //   // @ts-ignore
        //   handleDelete={() => { }}
        //   // @ts-ignore
        //   handleSave={() => { }}
        // />
      )}
    </div>
  );
}
