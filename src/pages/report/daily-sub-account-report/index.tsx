// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useEffect, useRef, useState } from "react";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Select, Table, Tag, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import * as XLSX from "xlsx";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchSubAccountDailyReport } from "@/pages/report/api.tsx";
// import { ReportUpdateParam } from "@/pages/report/type.tsx";

interface DataType {
  key: string;
  accountId: string;
  venueName: string;
  accountName: string;
  btcOutput24h: number;
  theoreticalPower: number;
  power24h: number;
  effectiveRate24h: number;
  totalMachines: number;
  totalFailures: number;
  failures24h: number;
  failureRate24h: number;
  powerImpact: number;
  impactRatio: number;
  outputImpact: number;
  limitImpactRate: number;
  highTemperatureRate: number;
  events: string;
}
const App: React.FC = () => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const tableRef = useRef<HTMLDivElement>(null);
  const [isTableFixed, setIsTableFixed] = useState(false);
  // const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (tableRef.current) {
        const tableTop = tableRef.current.getBoundingClientRect().top;
        setIsTableFixed(tableTop <= 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 计算昨天的日期，格式为 'YYYY-MM-DD'
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const formattedDate = yesterday.toISOString().split("T")[0]; // 格式化为 'YYYY-MM-DD'

  const [selectedDate, setSelectedDate] = useState<string | string[]>(formattedDate);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const handleSitesChange = (value: string[]) => {
    setSelectedSites(value);
  };

  const [statistics, setStatistics] = useState<any>({}); // 初始化为对象
  const [data, setData] = useState<DataType[]>([]); // 数据状态
  const [filteredData, setFilteredData] = useState<DataType[]>([]); // 筛选后的数据
  const [siteOptions, setSiteOptions] = useState<{ value: string; label: string }[]>([]);
  // const [accountOptions, setAccountOptions] = useState<{ value: string; label: string }[]>([]);
  const [pageSize, setPageSize] = useState(20); // 新增状态管理页大小

  // const save = async (record: DataType, text: string) => {
  //   try {
  //     const date = selectedDate || formattedDate; // formattedDate 是昨天的日期
  //     // 调用接口，启动数据保存
  //     const updatedData: ReportUpdateParam = {
  //       venue_name: record.siteName,
  //       total_failures: Number(text),
  //     };
  //     const res = await updateReport(poolType, date, updatedData);
  //     // console.log("success", res);
  //     // console.log("res.success", res.success);
  //     if (res.success) {
  //       message.success("更新成功");
  //       // console.log(res); // 更改值
  //       setData((data) =>
  //         data.map((item) => (item.key === record.key ? { ...item, totalFailures: Number(text) } : item)),
  //       );
  //     }
  //   } catch (errInfo) {
  //     console.log("Save failed:", errInfo);
  //   }
  // };

  const columns: ColumnsType<DataType> = [
    // {
    //   title: "场地编号",
    //   dataIndex: "siteId",
    //   key: "siteId",
    //   fixed: "left",
    //   width: 100,
    // },
    {
      title: "场地名",
      dataIndex: "venueName",
      key: "venueName",
      fixed: "left",
      width: 200,
      render: (text: string) => {
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
              {text}
            </div>
          </Tooltip>
        );
      },
      sorter: (a, b) => a.venueName.localeCompare(b.venueName),
      defaultSortOrder: "ascend", // 默认升序
    },
    {
      title: "账户名",
      dataIndex: "accountName",
      key: "accountName",
      fixed: "left",
      width: 120,
    },
    {
      title: "24小时产出(BTC)",
      dataIndex: "btcOutput24h",
      key: "btcOutput24h",
      width: 165,
      align: "right",
      render: (value) => value.toFixed(8),
      sorter: (a, b) => a.btcOutput24h - b.btcOutput24h,
    },
    {
      title: "理论算力(E)",
      dataIndex: "theoreticalPower",
      key: "theoreticalPower",
      width: 125,
      align: "right",
      render: (value) => value.toFixed(6),
      sorter: (a, b) => a.theoreticalPower - b.theoreticalPower,
    },
    {
      title: "24小时算力(E)",
      dataIndex: "power24h",
      key: "power24h",
      width: 145,
      align: "right",
      render: (value) => value.toFixed(6),
      sorter: (a, b) => a.power24h - b.power24h,
    },
    {
      title: "24小时有效率",
      dataIndex: "effectiveRate24h",
      key: "effectiveRate24h",
      width: 140,
      align: "right",
      render: (value) => `${value.toFixed(2)}%`,
      sorter: (a, b) => a.effectiveRate24h - b.effectiveRate24h,
    },
    {
      title: "托管台数",
      dataIndex: "totalMachines",
      key: "totalMachines",
      width: 105,
      align: "right",
      render: (value) => value.toLocaleString(),
      sorter: (a, b) => a.totalMachines - b.totalMachines,
    },
    {
      title: "总故障台数",
      dataIndex: "totalFailures",
      key: "totalFailures",
      width: 120,
      align: "right",
      render: (text) => {
        return <span>{text}</span>;
      },
      // render: (text, record) => {
      //   const isEditing = hoveredRow === record.key;
      //   return isEditing ? (
      //     <Input
      //       size="small"
      //       style={{ padding: "0 5px", margin: 0, height: "22px" }}
      //       // onChange={(e) => save(record, e.target.value)}
      //       onPressEnter={(e) => save(record, e.target.value)}
      //       onBlur={(e) => save(record, e.target.value)}
      //       defaultValue={text}
      //     />
      //   ) : (
      //     <span>{text}</span>
      //   );
      // },
      // onCell: (record) => ({
      //   onMouseEnter: () => setHoveredRow(record.key),
      //   onMouseLeave: () => setHoveredRow(null),
      // }),
      // render: (value) => value.toLocaleString(),
      sorter: (a, b) => a.totalFailures - b.totalFailures,
    },
    {
      title: "总故障率",
      dataIndex: "totalFailures",
      key: "totalMachines",
      width: 100,
      align: "right",
      render: (val, record) => {
        if (Number(record.totalMachines) === 0) {
          return <span>0%</span>;
        }
        const total_gzl = ((val / record.totalMachines) * 100).toFixed(2);
        return <span>{`${total_gzl}%`}</span>;
      },
    },
    {
      title: "24小时故障数",
      dataIndex: "failures24h",
      key: "failures24h",
      width: 138,
      align: "right",
      render: (value) => value.toLocaleString(),
      sorter: (a, b) => a.failures24h - b.failures24h,
    },
    {
      title: "24小时故障率",
      dataIndex: "failureRate24h",
      key: "failureRate24h",
      width: 138,
      render: (value) => ({
        children: `${value.toFixed(2)}%`,
        props: {
          style: {
            color: value > 20 ? "#ff4d4f" : "inherit",
          },
        },
      }),
      sorter: (a, b) => a.failureRate24h - b.failureRate24h,
    },
    {
      title: "影响算力(E)",
      dataIndex: "powerImpact",
      key: "powerImpact",
      width: 130,
      align: "right",
      render: (value) => value.toFixed(6),
      sorter: (a, b) => a.powerImpact - b.powerImpact,
    },
    {
      title: "影响占比",
      dataIndex: "impactRatio",
      key: "impactRatio",
      width: 105,
      render: (value) => `${value.toFixed(2)}%`,
      sorter: (a, b) => a.impactRatio - b.impactRatio,
    },
    {
      title: "影响产出(BTC)",
      dataIndex: "outputImpact",
      key: "outputImpact",
      width: 145,
      align: "right",
      render: (value) => value.toFixed(8),
      sorter: (a, b) => a.outputImpact - b.outputImpact,
    },
    {
      title: "限电影响",
      dataIndex: "limitImpactRate",
      key: "limitImpactRate",
      width: 140,
      align: "right",
      // render: (value) => value.toFixed(8),
      render: (value) => `${value.toFixed(2)}%`,
      sorter: (a, b) => a.limitImpactRate - b.limitImpactRate,
    },
    {
      title: "高温影响",
      dataIndex: "highTemperatureRate",
      key: "highTemperatureRate",
      width: 140,
      align: "right",
      // render: (value) => value.toFixed(8),
      render: (value) => `${value.toFixed(2)}%`,
      sorter: (a, b) => a.highTemperatureRate - b.highTemperatureRate,
    },
    // {
    //   title: "限电算力",
    //   dataIndex: "limitImpactRate",
    //   key: "limitImpactRate",
    //   width: 140,
    //   align: "right",
    //   // render: (value) => value.toFixed(8),
    //   render: (value, record) => {
    //     const result = record.theoreticalPower * 1e6 * value / 100;
    //     return result.toFixed(2) + "TH/s";
    //     //`${value.toFixed(2)}%`,
    //   }
    // },
    // {
    //   title: "高温算力",
    //   dataIndex: "highTemperatureRate",
    //   key: "highTemperatureRate",
    //   width: 140,
    //   align: "right",
    //   // render: (value) => value.toFixed(8),
    //   render: (value, record) => {
    //     const result = record.theoreticalPower * 1e6 * value / 100;
    //     return result.toFixed(2) + "TH/s";
    //     //`${value.toFixed(2)}%`,
    //   }
    // },
    {
      title: "事件描述",
      dataIndex: "events",
      key: "events",
      width: 400,
      render: (text) => (
        <Tooltip title={text}>
          <div className="line-clamp-2">{text}</div>
        </Tooltip>
      ),
    },
  ];

  useEffect(() => {
    const fetchReportData = async () => {
      const dateToFetch = Array.isArray(selectedDate) ? selectedDate[0] : selectedDate; // formattedDate 是昨天的日期
      try {
        const reportData = await fetchSubAccountDailyReport(poolType, dateToFetch);

        // 检查 reportData 中的 data 属性是否有效
        if (reportData && reportData.data && reportData.data.dailyReportStatistics) {
          const dailyReportStatistics = reportData.data.dailyReportStatistics;
          const summary = reportData.data.summary;

          // 转换 dailyReportStatistics 为适合的格式
          const formattedData: DataType[] = Object.keys(dailyReportStatistics).map((key) => {
            const venue = dailyReportStatistics[key];
            // console.log(venue);
            return {
              key: key,
              venueName: venue.venue_name,
              accountId: venue.account_id,
              accountName: venue.account_name,
              btcOutput24h: venue.btcOutput24h || 0,
              theoreticalPower: venue.theoreticalPower || 0,
              power24h: venue.power24h || 0,
              effectiveRate24h: venue.effectiveRate24h || 0, // 转换为小数形式
              totalMachines: venue.totalMachines || 0,
              totalFailures: venue.totalFailures || 0,
              failures24h: venue.failures24h || 0,
              failureRate24h: venue.failureRate24h || 0,
              powerImpact: venue.powerImpact || 0,
              impactRatio: venue.impactRatio || 0, // 转换为小数形式
              outputImpact: venue.outputImpact || 0,
              limitImpactRate: venue.limitImpactRate || 0,
              highTemperatureRate: venue.highTemperatureRate || 0,
              // "限电影响": item.limitImpactRate,
              // "高温影响": item.highTemperatureRate,
              events: venue.events || "",
            };
          });

          // 更新状态
          setData(formattedData);
          setFilteredData(formattedData); // 初始化筛选后的数据

          // 动态生成场地选项
          // const options = formattedData.map((site) => ({
          //   value: site.venueName,
          //   label: site.venueName,
          // }));

          const accountOptions = formattedData.map((site) => ({
            value: site.accountName,
            label: site.accountName,
          }));
          // 过滤掉重复的场地选项
          const uniqueOptions = Array.from(
            new Map(accountOptions.map((item) => [item.value, item])).values(),
          );
          setSiteOptions(uniqueOptions);

          setStatistics({
            averageEfficiency: summary.averageEffectiveRate || 0,
            totalBtcOutput: summary.totalBtcOutput || 0,
            totalFailures24h: summary.totalFailures24h || 0,
            totalImpactOutput: summary.totalImpactOutput || 0,
            totalMachines: summary.totalMachines || 0,
            totalPower24h: summary.totalPower24h || 0,
            totalPowerImpact: summary.totalPowerImpact || 0,
            totalTheoreticalPower: summary.totalTheoreticalPower || 0,
          });
        } else {
          console.error("API 返回的 dailyReportStatistics 无效:", reportData);
        }
      } catch (error) {
        console.error("获取日报数据失败:", error);
      }
    };

    fetchReportData();
  }, [selectedDate, poolType]);

  useEffect(() => {
    // 筛选数据
    if (selectedSites.length > 0) {
      console.log(selectedSites);
      const filtered = data.filter((item) => selectedSites.includes(item.accountName));
      // setFilteredData(filtered);
      setFilteredData(filtered.sort((a, b) => a.accountName.localeCompare(b.accountName))); // 按 accountName 排序
    } else {
      // setFilteredData(data); // 如果没有选择场地，显示所有数据
      setFilteredData(data.sort((a, b) => a.accountName.localeCompare(b.accountName))); // 按 siteName 排序
    }
  }, [selectedSites, data]);

  // 导出数据为 CSV 的函数
  const exportToCSV = () => {
    const data = filteredData.map((item) => ({
      场地名: item.venueName,
      账户名: item.accountName,
      "24小时产出（BTC）": item.btcOutput24h.toFixed(8),
      "理论算力（E）": item.theoreticalPower.toFixed(6),
      "24小时算力（E）": item.power24h.toFixed(8),
      "24小时有效率": item.effectiveRate24h.toFixed(2) + "%",
      托管台数: item.totalMachines.toLocaleString(),
      总故障台数: item.totalFailures.toLocaleString(),
      总故障率:
        Number(item.totalFailures) > 0 && Number(item.totalMachines) > 0
          ? ((Number(item.totalFailures) / Number(item.totalMachines)) * 100).toFixed(2) + "%"
          : "0%",
      // 总故障率: ((item.totalFailures / item.totalMachines) * 100).toFixed(2) + "%",
      "24小时故障数": item.failures24h.toLocaleString(),
      "24小时故障率": item.failureRate24h.toFixed(2) + "%",
      "影响算力（E）": item.powerImpact.toFixed(8),
      影响占比: item.impactRatio.toFixed(2) + "%",
      "影响产出（BTC）": item.outputImpact.toFixed(8),
      限电影响: item.limitImpactRate + "%",
      高温影响: item.highTemperatureRate + "%",
      限电算力: ((item.theoreticalPower * 1e6 * item.limitImpactRate) / 100).toFixed(2) + "Th/s", //record.theoreticalPower * 1e6 * value / 100
      高温算力: ((item.theoreticalPower * 1e6 * item.highTemperatureRate) / 100).toFixed(2) + "Th/s", //item.highTemperatureRate,
      事件描述: item.events,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    // 设置表头样式
    const headerStyle = {
      fill: {
        fgColor: { rgb: "00BFFF" }, // 背景色：亮蓝色
      },
      font: {
        color: { rgb: "FFFFFF" }, // 字体颜色：白色
        bold: true, // 粗体
      },
    };

    // 应用样式到表头
    const ref = worksheet["!ref"];
    if (ref) {
      // 确保 ref 是有效的
      const range = XLSX.utils.decode_range(ref);
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) continue;
        worksheet[cellAddress].s = headerStyle;
      }
    }

    // 设置列宽
    const columnWidths = [
      // { wch: 10 }, // 场地编号
      { wch: 30 }, // 场地名
      { wch: 20 }, // 24小时产出（BTC）
      { wch: 20 }, // 理论算力（E）
      { wch: 20 }, // 24小时算力（E）
      { wch: 15 }, // 24小时有效率
      { wch: 15 }, // T-2日有效率
      { wch: 15 }, // T-3日有效率
      { wch: 15 }, // 托管台数
      { wch: 15 }, // 总故障台数
      { wch: 15 }, // 24小时故障数
      { wch: 15 }, // 24小时故障率
      { wch: 15 }, // T-2日故障率
      { wch: 15 }, // T-3日故障率
      { wch: 20 }, // 影响算力（E）
      { wch: 15 }, // 影响占比
      { wch: 15 }, // 影响产出（BTC）

      { wch: 15 }, // 限电影响
      { wch: 15 }, // 高温影响
      { wch: 15 }, // 限电算力
      { wch: 15 }, // 高温算力
      { wch: 15 }, // ***遗漏

      { wch: 50 }, // 事件描述
    ];

    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "运营日报");
    XLSX.writeFile(workbook, `运营日报_${selectedDate}.xlsx`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              运营日报
              <span className="text-sm text-gray-500 ml-2"> ({selectedDate || formattedDate})</span>
            </h1>
            <DatePicker
              className="w-40"
              placeholder="选择日期"
              onChange={(_: any, dateString: string | string[]) => {
                setSelectedDate(dateString);
              }}
            />
          </div>
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm">
              <div className="text-sm font-medium text-gray-500">平均有效率</div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-blue-600">
                  {" "}
                  {(statistics.averageEfficiency || 0).toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm">
              <div className="text-sm font-medium text-gray-500">24小时产出（BTC）</div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-blue-600">
                  {" "}
                  {(statistics.totalBtcOutput || 0).toFixed(4)}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-sm">
              <div className="text-sm font-medium text-gray-500">总理论算力（E）</div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-green-600">
                  {(statistics.totalTheoreticalPower || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-sm">
              <div className="text-sm font-medium text-gray-500">24小时总算力（E）</div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-green-600">
                  {(statistics.totalPower24h || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-sm">
              <div className="text-sm font-medium text-gray-500">总影响算力（E）</div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-purple-600">
                  {(statistics.totalPowerImpact || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-sm">
              <div className="text-sm font-medium text-gray-500">总影响产出（BTC）</div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-purple-600">
                  {(statistics.totalImpactOutput || 0).toFixed(4)}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-sm">
              <div className="text-sm font-medium text-gray-500">托管台数</div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-amber-600">
                  {(statistics.totalMachines || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-sm">
              <div className="text-sm font-medium text-gray-500">总故障数</div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-amber-600">
                  {(statistics.totalFailures24h || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div
          ref={tableRef}
          className={`mb-6 rounded-lg bg-white p-6 shadow-sm transition-all duration-300 ${isTableFixed ? "sticky top-0 z-10" : ""}`}
        >
          <div className="mb-6 flex items-center justify-between">
            {/* <Select
              mode="multiple"
              size={"middle"}
              placeholder="选择场地"
              // className="w-80"
              style={{ minWidth: "200px" }}
              options={siteOptions}
              onChange={handleSitesChange}
              maxTagCount={3}
            />
            &nbsp;&nbsp; */}
            <Select
              mode="multiple"
              size={"middle"}
              placeholder="选择账户"
              // className="w-80"
              style={{ minWidth: "200px" }}
              options={siteOptions}
              onChange={handleSitesChange}
              maxTagCount={3}
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={exportToCSV}
              className="!rounded-button"
            >
              导出报表
            </Button>
          </div>
          <Table
            columns={columns}
            dataSource={filteredData}
            scroll={{ x: 1500 }}
            sticky={true}
            pagination={{
              pageSize: pageSize, // 使用动态 pageSize
              showSizeChanger: true,
              onShowSizeChange: (size) => {
                setPageSize(size); // 更新 pageSize 状态
              },
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            className="custom-table"
          />
        </div>
      </div>
      <style>{`
        .ant-table-wrapper {
          height: 100%;
          overflow: auto;
        }

        .ant-table {
          height: 100%;
        }

        .custom-table .ant-table-thead > tr > th {
          background-color: #f5f5f5;
          font-weight: 600;
        }

        .custom-table .ant-table-tbody > tr:hover > td {
          background-color: #f0f7ff;
        }

        .custom-table .ant-table-tbody > tr:nth-child(even) {
          background-color: #fafafa;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
export default App;
