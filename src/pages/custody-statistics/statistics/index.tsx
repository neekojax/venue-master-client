import { useEffect, useState } from "react";
import { AiOutlineCalendar } from "react-icons/ai";
import { FaList } from "react-icons/fa6";
import { FcCalendar } from "react-icons/fc";
import { Link } from "react-router-dom";
// import { GiMining } from "react-icons/gi";
import { ExportOutlined, SearchOutlined } from "@ant-design/icons"; // 导入时钟图标
import { Alert, Button, Input, Select, Space, Spin, Table, Tag, Tooltip } from "antd";
// import EditTable from "@/components/edit-table";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";
import { exportCustodyStatisticsToExcel } from "@/utils/excel";

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

  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const [timeRange, setTimeRange] = useState(getInitialTimeRange()); // 默认时间范围
  const [poolFilter, setPoolFilter] = useState(getInitialPoolFilter()); // 默认池过滤
  const { data: statisticsData, error, isLoading } = useCustodyStatisticsList(timeRange, poolType);

  // const { data: linksData, error, isLoading: isLoadingFields } = useCustodyInfoList();
  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 新增搜索状态

  useEffect(() => {
    if (statisticsData && statisticsData.data) {
      const newData = statisticsData.data.map(
        (
          item: {
            date: any;
            venue_id: any;
            venue_name: any;
            hash: any;
            income_btc: any;
            managed_unit_price: any;
            power_consumption: any;
            total_hosting_fee: any;
            total_income_usd: any;
            net_income: any;
            hosting_fee_ratio: any;
          },
          index: any,
        ) => ({
          key: item.venue_id, // 使用场地ID作为唯一 key
          serialNumber: index + 1,
          venue_name: item.venue_name,
          // sub_account_name: item.sub_account_name,
          // observer_link: item.observer_link,
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
    }
  }, [statisticsData]);

  // 表头定义
  useEffect(() => {
    setColumns([
      {
        // title: "序号", // 使用英文标题
        dataIndex: "serialNumber",
        key: "serialNumber",
        width: 35,
        render: (_: any, record: { serialNumber?: any }) => {
          return <span>{record.serialNumber}</span>;
        },
      },
      {
        title: "场地名",
        dataIndex: "venue_name",
        key: "venue_name",
        width: 150,
        // render: (text: any) => (
        //   <Tooltip
        //     title={text}
        //     placement="top"
        //     overlayInnerStyle={{ color: "white" }}
        //     style={{ color: "white" }}
        //   >
        //     <div
        //       style={{
        //         width: "100%",
        //         overflow: "hidden",
        //         color: "#333",
        //         textOverflow: "ellipsis",
        //         whiteSpace: "nowrap",
        //       }}
        //     >
        //       {text}
        //     </div>
        //   </Tooltip>
        // ),
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
                  width: "100%",
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
                <Link to={`/venue/detail/${record.key}`} className="text-blue-500 hover:underline">
                  {text}
                </Link>
              </div>
            </Tooltip>
          );
        },
      },
      // {
      //   title: "子账号",
      //   dataIndex: "sub_account_name",
      //   key: "sub_account_name",
      // },

      // {
      //   title: "基础托管费",
      //   dataIndex: "basic_hosting_fee",
      //   key: "basic_hosting_fee",
      //   render: (text: any) => (
      //     <span>
      //       {text} <span style={{ fontSize: "em" }}>$/kwh</span>
      //     </span>
      //   ), // 渲染单位
      // },
      {
        title: "24h平均算力",
        dataIndex: "hash",
        key: "hash",
        // width: 140,
        width: "15%",
        sorter: (a: any, b: any) => a.hash - b.hash, // 添加排序逻辑
        render: (text: any) => (
          <span>
            <span style={{ color: "#1677ff" }}>{text.toFixed(2)}</span>
            <span style={{ marginLeft: 4, color: "rgba(0,0,0,0.45)" }}>TH/s</span>
          </span>
        ), // 渲染单位
      },
      // {
      //   title: "总托管费",
      //   dataIndex: "total_hosting_fee",
      //   key: "total_hosting_fee",
      //   sorter: (a: any, b: any) => a.total_hosting_fee - b.total_hosting_fee, // 添加排序逻辑
      //   render: (text: any) => (
      //     <span>
      //       {text} <span style={{ fontSize: "em" }}> USD</span>
      //     </span>
      //   ), // 渲染单位
      // },
      {
        title: "收益(BTC/USD/净USD)",
        dataIndex: "total_income_btc",
        key: "total_income_btc",
        // width: 280,
        width: "30%",
        sorter: (a: any, b: any) => a.total_income_btc - b.total_income_btc, // 添加排序逻辑
        render: (text: any, record: any) => (
          <span>
            <span style={{ color: "#1677ff" }}>{text.toFixed(8)}</span>
            <span style={{ marginLeft: 4, color: "rgba(0,0,0,0.45)" }}>BTC</span>
            <span style={{ marginLeft: 12, color: "#1677ff" }}>{record.total_income_usd.toFixed(2)}</span>
            <span style={{ marginLeft: 4, color: "rgba(0,0,0,0.45)" }}>USD</span>
            <span style={{ marginLeft: 12, color: "#1677ff" }}>{record.net_income.toFixed(2)}</span>
            <span style={{ marginLeft: 4, color: "rgba(0,0,0,0.45)" }}>USD</span>
          </span>
        ), // 渲染单位
      },
      {
        title: "托管费(单价/能耗)",
        dataIndex: "energy_ratio",
        key: "energy_ratio",
        // width: 100,
        width: "20%",
        render: (text: any, record: any) => (
          <span>
            <Tag color="gold">{record.basic_hosting_fee} $/kwh</Tag>
            <Tag color="green">{text} kW</Tag>
          </span>
        ),
      },
      {
        title: "总托管费",
        dataIndex: "hosting_fee_ratio",
        key: "hosting_fee_ratio",
        // width: 200,
        width: "10%",
        render: (text: any, record: any) => (
          <span>
            {/* <span style={{ color: "#3498DB" }}> {record.basic_hosting_fee}</span>{" "}
            <span className="text-sm text-gray-500">$/kwh</span> /{" "} */}
            <span style={{ display: "none" }}>{text.toFixed(2)}</span>
            <span style={{ color: "#3498DB" }}>{record.total_hosting_fee.toFixed(2)}</span>
            <span className="text-sm text-gray-500"> usd</span>
          </span>
        ), // 渲染单位
      },
      // {
      //   title: "BTC收益",
      //   dataIndex: "total_income_btc",
      //   key: "total_income_btc",
      //   sorter: (a: any, b: any) => a.total_income_btc - b.total_income_btc, // 添加排序逻辑
      //   render: (text: any) => (
      //     <span>
      //       <span>{text}</span> {/* 数字部分设置为蓝色 */}
      //       <span style={{ fontSize: "1em" }}> BTC</span> {/* 单位颜色不变 */}
      //     </span>
      //   ), // 渲染单位
      // },
      // {
      //   title: "USD收益",
      //   dataIndex: "total_income_usd",
      //   key: "total_income_usd",
      //   sorter: (a: any, b: any) => a.total_income_usd - b.total_income_usd, // 添加排序逻辑
      // },
      // {
      //   title: "净收益USD",
      //   dataIndex: "net_income",
      //   key: "net_income",
      //   sorter: (a: any, b: any) => a.net_income - b.net_income, // 添加排序逻辑
      // },
      {
        title: "托管费占比",
        dataIndex: "hosting_fee_ratio",
        key: "hosting_fee_ratio",
        // width: 100,
        width: "10%",
        sorter: (a: any, b: any) => a.hosting_fee_ratio - b.hosting_fee_ratio,
        render: (text: any) => (
          <span style={{ color: "green" }}>
            {typeof text === "number" ? `${text.toFixed(2)}%` : `${text}%`}
          </span>
        ), // 渲染单位
      },
      {
        title: "收益日期",
        dataIndex: "report_date",
        key: "report_date",
        width: "10%",
        sorter: (a: any, b: any) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime(), // 确保将日期转换为时间戳进行比较
        render: (text: any) => {
          const date = new Date(text);
          const month = date.getMonth() + 1;
          const day = date.getDate();
          return `${month}-${day}`;

          // return moment(text).format("MM-DD");
        },
      },

      // {
      //   title: "操作",
      //   valueType: "option",
      //   key: "operation",
      // },
    ]);
  }, []);

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
    localStorage.setItem("timeRange", value); // 存储到本地存储
  };

  // 搜索处理函数
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePoolFilterChange("");
    setSearchTerm(e.target.value);
  };

  // 池选择处理函数
  const handlePoolFilterChange = (value: string) => {
    setPoolFilter(value);
  };

  // 根据搜索词过滤数据
  const filteredData = tableData.filter((item: { [s: string]: unknown } | ArrayLike<unknown>) => {
    // return Object.values(item).some((value) =>
    //   String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    // );
    const matchesSearchTerm = Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase()),
    );

    // 根据选定的池进行过滤
    // @ts-ignore
    const matchesPoolFilter = poolFilter ? false : true;

    return matchesSearchTerm && matchesPoolFilter;
  });

  // @ts-ignore
  return (
    <div style={{ padding: "20px" }}>
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
                {
                  value: "3month",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <AiOutlineCalendar style={{ color: "#252F4A", fontSize: 14, marginRight: 8 }} /> 三个月
                    </span>
                  ),
                },
                {
                  value: "6month",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <AiOutlineCalendar style={{ color: "#252F4A", fontSize: 14, marginRight: 8 }} /> 半年
                    </span>
                  ),
                },
              ]}
              value={timeRange} // 设置选中的值
            />
          </div>
        </Space>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Input
            prefix={<SearchOutlined style={{ color: "rgba(0, 0, 0, 0.25)", fontSize: 18 }} />}
            placeholder="请输入搜索字段"
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: 250 }} // 设定宽度
            className="text-sm mr-10"
          />
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
        <Table
          pagination={{
            position: ["bottomCenter"],
            showSizeChanger: true,
            pageSizeOptions: ["10", "20", "30", "50"],
            defaultPageSize: 20,
            showTotal: (total) => `共 ${total} 条`,
            total: filteredData?.length,
            onChange: () => {
              const tableBody = document.querySelector(".ant-table-body");
              if (tableBody) {
                tableBody.scrollTop = 0;
              }
            },
          }}
          rowKey={(record: any) => record.key}
          columns={columns}
          dataSource={filteredData}
          scroll={{ x: "max-content" }}
          style={{ marginTop: "15px", width: "100%" }}
        />
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
