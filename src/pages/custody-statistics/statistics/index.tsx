import { useEffect, useState } from "react";
import { AiOutlineCalendar } from "react-icons/ai";
import { FaAdn, FaFish, FaList } from "react-icons/fa6";
import { FcCalendar } from "react-icons/fc";
import { GiMining } from "react-icons/gi";
import { DownloadOutlined } from "@ant-design/icons"; // 导入时钟图标
import { Alert, Button, Input, Select, Space, Spin } from "antd";
import EditTable from "@/components/edit-table";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { exportCustodyStatisticsToExcel } from "@/utils/excel";

import { useCustodyStatisticsList } from "@/pages/custody-statistics/hook/hook.ts";

// 初始化时从 localStorage 获取值
const getInitialTimeRange = () => {
  const stored = localStorage.getItem("timeRange");
  console.log("stored", stored);
  return stored ? stored : "all"; // 默认为 'all'
};

const getInitialPoolFilter = () => {
  const stored = localStorage.getItem("poolFilter");
  return stored ? stored : ""; // 默认为空
};

export default function StatisticsPage() {
  useAuthRedirect();

  const [timeRange, setTimeRange] = useState(getInitialTimeRange()); // 默认时间范围
  const [poolFilter, setPoolFilter] = useState(getInitialPoolFilter()); // 默认池过滤
  const { data: statisticsData, error, isLoading } = useCustodyStatisticsList(timeRange);

  // const { data: linksData, error, isLoading: isLoadingFields } = useCustodyInfoList();
  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 新增搜索状态

  useEffect(() => {
    if (statisticsData && statisticsData.data) {
      const newData = statisticsData.data.map(
        (
          item: {
            id: any;
            venue_name: any;
            sub_account_name: any;
            observer_link: any;
            energy_ratio: any;
            basic_hosting_fee: any;
            hourly_computing_power: any;
            total_hosting_fee: any;
            total_income_btc: any;
            total_income_usd: any;
            net_income: any;
            hosting_fee_ratio: any;
            report_date: any;
          },
          index: any,
        ) => ({
          key: item.id, // 使用 ID 作为唯一 key
          serialNumber: index + 1,
          venue_name: item.custody_info.venue_name,
          sub_account_name: item.custody_info.sub_account_name,
          observer_link: item.custody_info.observer_link,
          energy_ratio: item.custody_info.energy_ratio,
          basic_hosting_fee: item.custody_info.basic_hosting_fee,
          hourly_computing_power: item.hourly_computing_power,
          total_hosting_fee: item.total_hosting_fee,
          total_income_btc: item.total_income_btc,
          total_income_usd: item.total_income_usd,
          net_income: item.net_income,
          hosting_fee_ratio: item.hosting_fee_ratio,
          report_date: item.report_date,
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
        width: 40,
        render: (_, record) => {
          const { observer_link } = record;
          // 根据 observer_link 内容返回不同的图标
          if (observer_link.includes("antpool")) {
            return <FaAdn style={{ color: "green", fontSize: 18 }} />;
          } else if (observer_link.includes("f2pool")) {
            return <FaFish style={{ color: "blue", fontSize: 18 }} />;
          } else {
            return <span>{record.serialNumber}</span>; // 如果没有匹配，则返回序号
          }
        },
      },
      {
        title: "场地",
        dataIndex: "venue_name",
        key: "venue_name",
      },
      {
        title: "子账号",
        dataIndex: "sub_account_name",
        key: "sub_account_name",
      },
      {
        title: "收益日期",
        dataIndex: "report_date",
        key: "report_date",
        sorter: (a: any, b: any) => new Date(a.report_date).getTime() - new Date(b.report_date).getTime(), // 确保将日期转换为时间戳进行比较
      },
      {
        title: "能耗比",
        dataIndex: "energy_ratio",
        key: "energy_ratio",
        width: 100,
        render: (text: any) => (
          <span>
            {text} <span style={{ fontSize: "em", color: "#888" }}> J/T</span>
          </span>
        ), // 渲染单位
      },
      {
        title: "基础托管费",
        dataIndex: "basic_hosting_fee",
        key: "basic_hosting_fee",
        render: (text: any) => (
          <span>
            {text} <span style={{ fontSize: "em", color: "#888" }}>$/kwh</span>
          </span>
        ), // 渲染单位
      },
      {
        title: "24小时平均算力",
        dataIndex: "hourly_computing_power",
        key: "hourly_computing_power",
        sorter: (a: any, b: any) => a.hourly_computing_power - b.hourly_computing_power, // 添加排序逻辑
        render: (text: any) => (
          <span>
            {text} <span style={{ fontSize: "em", color: "#888" }}> TH/s</span>
          </span>
        ), // 渲染单位
      },
      {
        title: "总托管费",
        dataIndex: "total_hosting_fee",
        key: "total_hosting_fee",
        sorter: (a: any, b: any) => a.total_hosting_fee - b.total_hosting_fee, // 添加排序逻辑
        render: (text: any) => (
          <span>
            {text} <span style={{ fontSize: "em", color: "#888" }}> USD</span>
          </span>
        ), // 渲染单位
      },
      {
        title: "BTC收益",
        dataIndex: "total_income_btc",
        key: "total_income_btc",
        sorter: (a: any, b: any) => a.total_income_btc - b.total_income_btc, // 添加排序逻辑
        render: (text: any) => (
          <span>
            <span>{text}</span> {/* 数字部分设置为蓝色 */}
            <span style={{ fontSize: "1em", color: "#888" }}> BTC</span> {/* 单位颜色不变 */}
          </span>
        ), // 渲染单位
      },
      {
        title: "USD收益",
        dataIndex: "total_income_usd",
        key: "total_income_usd",
        sorter: (a: any, b: any) => a.total_income_usd - b.total_income_usd, // 添加排序逻辑
      },
      {
        title: "净收益USD",
        dataIndex: "net_income",
        key: "net_income",
        sorter: (a: any, b: any) => a.net_income - b.net_income, // 添加排序逻辑
      },
      {
        title: "托管费占比",
        dataIndex: "hosting_fee_ratio",
        key: "hosting_fee_ratio",
        sorter: (a: any, b: any) => {
          const ratioA = parseFloat(a.hosting_fee_ratio.replace("%", "")); // 去掉 '%' 并转换为数字
          const ratioB = parseFloat(b.hosting_fee_ratio.replace("%", ""));
          return ratioA - ratioB; // 进行数字比较
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
    const matchesPoolFilter = poolFilter ? item.observer_link.includes(poolFilter) : true;

    return matchesSearchTerm && matchesPoolFilter;
  });

  // @ts-ignore
  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}
      >
        <Space size={24}>
          <div style={{ display: "flex", alignItems: "center" }}>
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
                      <FaFish style={{ color: "blue", fontSize: 14, marginRight: 8 }} /> 鱼池
                    </span>
                  ),
                },
              ]}
              value={poolFilter} // 设置选中的值
            />
          </div>
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
                      <AiOutlineCalendar style={{ color: "blue", fontSize: 14, marginRight: 8 }} /> 一天
                    </span>
                  ),
                },
                {
                  value: "3days",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <AiOutlineCalendar style={{ color: "blue", fontSize: 14, marginRight: 8 }} /> 三天
                    </span>
                  ),
                },
                {
                  value: "7days",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <AiOutlineCalendar style={{ color: "blue", fontSize: 14, marginRight: 8 }} /> 一周
                    </span>
                  ),
                },
                {
                  value: "1month",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <AiOutlineCalendar style={{ color: "blue", fontSize: 14, marginRight: 8 }} /> 一个月
                    </span>
                  ),
                },
                {
                  value: "3month",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <AiOutlineCalendar style={{ color: "blue", fontSize: 14, marginRight: 8 }} /> 三个月
                    </span>
                  ),
                },
                {
                  value: "6month",
                  label: (
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <AiOutlineCalendar style={{ color: "blue", fontSize: 14, marginRight: 8 }} /> 半年
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
            placeholder="请输入搜索字段"
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: 250 }} // 设定宽度
            className="text-sm mr-10"
          />
          <Button
            type="text"
            icon={<DownloadOutlined />}
            size="middle"
            className={"text-blue-500"}
            onClick={() => exportCustodyStatisticsToExcel(filteredData)}
          >
            导出
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Spin style={{ marginTop: 20 }} />
      ) : (
        <EditTable
          tableData={filteredData}
          setTableData={setTableData}
          columns={columns}
          handleDelete={() => {}}
          handleSave={() => {}}
        />
      )}
    </div>
  );
}
