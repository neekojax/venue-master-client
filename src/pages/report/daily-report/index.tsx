// 代码已包含 CSS：使用 TailwindCSS , 安装 TailwindCSS 后方可看到布局样式效果
import React, { useEffect, useState } from "react";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Select, Table, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchDailyReport } from "@/pages/report/api.tsx";
interface DataType {
  key: string;
  siteId: string;
  siteName: string;
  btcOutput24h: number;
  theoreticalPower: number;
  power24h: number;
  effectiveRate24h: number;
  effectiveRateT2: number;
  effectiveRateT3: number;
  totalMachines: number;
  totalFailures: number;
  failures24h: number;
  failureRate24h: number;
  failureRateT2: number;
  failureRateT3: number;
  powerImpact: number;
  impactRatio: number;
  outputImpact: number;
  events: string;
}
const App: React.FC = () => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  // 计算昨天的日期，格式为 'YYYY-MM-DD'
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const formattedDate = yesterday.toISOString().split("T")[0]; // 格式化为 'YYYY-MM-DD'

  const [selectedDate, setSelectedDate] = useState<string>(formattedDate);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);

  const [statistics, setStatistics] = useState<any>({}); // 初始化为对象
  const [data, setData] = useState<DataType[]>([]); // 数据状态
  const [filteredData, setFilteredData] = useState<DataType[]>([]); // 筛选后的数据
  const [siteOptions, setSiteOptions] = useState<{ value: string; label: string }[]>([]);

  const columns: ColumnsType<DataType> = [
    {
      title: "场地编号",
      dataIndex: "siteId",
      key: "siteId",
      fixed: "left",
      width: 100,
    },
    {
      title: "场地名",
      dataIndex: "siteName",
      key: "siteName",
      fixed: "left",
      width: 200,
    },
    {
      title: "24小时产出(BTC)",
      dataIndex: "btcOutput24h",
      key: "btcOutput24h",
      width: 160,
      align: "right",
      render: (value) => value.toFixed(4),
      sorter: (a, b) => a.btcOutput24h - b.btcOutput24h,
    },
    {
      title: "理论算力(E)",
      dataIndex: "theoreticalPower",
      key: "theoreticalPower",
      width: 120,
      align: "right",
      render: (value) => value.toFixed(2),
      sorter: (a, b) => a.theoreticalPower - b.theoreticalPower,
    },
    {
      title: "24小时算力(E)",
      dataIndex: "power24h",
      key: "power24h",
      width: 140,
      align: "right",
      render: (value) => value.toFixed(2),
      sorter: (a, b) => a.power24h - b.power24h,
    },
    {
      title: "24小时有效率",
      dataIndex: "effectiveRate24h",
      key: "effectiveRate24h",
      width: 130,
      render: (value) => `${value.toFixed(2)}%`,
      sorter: (a, b) => a.effectiveRate24h - b.effectiveRate24h,
    },
    {
      title: "T-2日有效率",
      dataIndex: "effectiveRateT2",
      key: "effectiveRateT2",
      width: 130,
      render: (value) => `${value.toFixed(2)}%`,
      sorter: (a, b) => a.effectiveRateT2 - b.effectiveRateT2,
    },
    {
      title: "T-3日有效率",
      dataIndex: "effectiveRateT3",
      key: "effectiveRateT3",
      width: 130,
      render: (value) => `${value.toFixed(2)}%`,
      sorter: (a, b) => a.effectiveRateT3 - b.effectiveRateT3,
    },
    {
      title: "托管台数",
      dataIndex: "totalMachines",
      key: "totalMachines",
      width: 100,
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
      render: (value) => value.toLocaleString(),
      sorter: (a, b) => a.totalFailures - b.totalFailures,
    },
    {
      title: "24小时故障数",
      dataIndex: "failures24h",
      key: "failures24h",
      width: 130,
      align: "right",
      render: (value) => value.toLocaleString(),
      sorter: (a, b) => a.failures24h - b.failures24h,
    },
    {
      title: "24小时故障率",
      dataIndex: "failureRate24h",
      key: "failureRate24h",
      width: 130,
      render: (value) => ({
        children: `${(value * 100).toFixed(2)}%`,
        props: {
          style: {
            color: value > 0.05 ? "#ff4d4f" : "inherit",
          },
        },
      }),
      sorter: (a, b) => a.failureRate24h - b.failureRate24h,
    },
    {
      title: "T-2日故障率",
      dataIndex: "failureRateT2",
      key: "failureRateT2",
      width: 130,
      render: (value) => ({
        children: `${(value * 100).toFixed(2)}%`,
        props: {
          style: {
            color: value > 0.05 ? "#ff4d4f" : "inherit",
          },
        },
      }),
      sorter: (a, b) => a.failureRateT2 - b.failureRateT2,
    },
    {
      title: "T-3日故障率",
      dataIndex: "failureRateT3",
      key: "failureRateT3",
      width: 130,
      render: (value) => ({
        children: `${(value * 100).toFixed(2)}%`,
        props: {
          style: {
            color: value > 0.05 ? "#ff4d4f" : "inherit",
          },
        },
      }),
      sorter: (a, b) => a.failureRateT3 - b.failureRateT3,
    },
    {
      title: "影响算力(E)",
      dataIndex: "powerImpact",
      key: "powerImpact",
      width: 130,
      align: "right",
      render: (value) => value.toFixed(2),
      sorter: (a, b) => a.powerImpact - b.powerImpact,
    },
    {
      title: "影响占比",
      dataIndex: "impactRatio",
      key: "impactRatio",
      width: 100,
      render: (value) => `${value.toFixed(2)}%`,
      sorter: (a, b) => a.impactRatio - b.impactRatio,
    },
    {
      title: "影响产出(BTC)",
      dataIndex: "outputImpact",
      key: "outputImpact",
      width: 140,
      align: "right",
      render: (value) => value.toFixed(4),
      sorter: (a, b) => a.outputImpact - b.outputImpact,
    },
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
      const dateToFetch = selectedDate || formattedDate; // formattedDate 是昨天的日期
      try {
        const reportData = await fetchDailyReport(poolType, dateToFetch);

        // 检查 reportData 中的 data 属性是否有效
        if (reportData && reportData.data && reportData.data.dailyReportStatistics) {
          const dailyReportStatistics = reportData.data.dailyReportStatistics;
          const summary = reportData.data.summary;

          // 转换 dailyReportStatistics 为适合的格式
          const formattedData: DataType[] = Object.keys(dailyReportStatistics).map((key) => {
            const venue = dailyReportStatistics[key];
            return {
              key: key,
              siteId: venue.venue_code,
              siteName: venue.venue_name,
              btcOutput24h: venue.btcOutput24h || 0,
              theoreticalPower: venue.theoreticalPower || 0,
              power24h: venue.power24h || 0,
              effectiveRate24h: venue.effectiveRate24h || 0, // 转换为小数形式
              effectiveRateT2: venue.effectiveRateT2 || 0,
              effectiveRateT3: venue.effectiveRateT3 || 0,
              totalMachines: venue.totalMachines || 0,
              totalFailures: venue.totalFailures || 0,
              failures24h: venue.failures24h || 0,
              failureRate24h: venue.failureRate24h || 0,
              failureRateT2: venue.failureRateT2 || 0,
              failureRateT3: venue.failureRateT3 || 0,
              powerImpact: venue.powerImpact || 0,
              impactRatio: venue.impactRatio || 0, // 转换为小数形式
              outputImpact: venue.outputImpact || 0,
              events: venue.events || "",
            };
          });

          // 更新状态
          setData(formattedData);
          setFilteredData(formattedData); // 初始化筛选后的数据

          // 动态生成场地选项
          const options = formattedData.map((site) => ({
            value: site.siteName,
            label: site.siteName,
          }));
          // 过滤掉重复的场地选项
          const uniqueOptions = Array.from(new Map(options.map((item) => [item.value, item])).values());
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
      const filtered = data.filter((item) => selectedSites.includes(item.siteId));
      setFilteredData(filtered);
    } else {
      setFilteredData(data); // 如果没有选择场地，显示所有数据
    }
  }, [selectedSites, data]);

  // 导出数据为 CSV 的函数
  const exportToCSV = () => {
    const csvHeader =
      [
        "场地编号",
        "场地名",
        "24小时产出（BTC）",
        "理论算力（E）",
        "24小时算力（E）",
        "24小时有效率",
        "T-2日有效率",
        "T-3日有效率",
        "托管台数",
        "总故障台数",
        "24小时故障数",
        "24小时故障率",
        "T-2日故障率",
        "T-3日故障率",
        "影响算力（E）",
        "影响占比",
        "影响产出（BTC）",
        "事件描述",
      ].join(",") + "\n";

    const csvRows = filteredData.map((item) =>
      [
        item.siteId,
        item.siteName,
        item.btcOutput24h.toFixed(4),
        item.theoreticalPower.toFixed(2),
        item.power24h.toFixed(2),
        item.effectiveRate24h.toFixed(2) + "%",
        item.effectiveRateT2.toFixed(2) + "%",
        item.effectiveRateT3.toFixed(2) + "%",
        item.totalMachines.toLocaleString(),
        item.totalFailures.toLocaleString(),
        item.failures24h.toLocaleString(),
        item.failureRate24h.toFixed(2) + "%",
        item.failureRateT2.toFixed(2) + "%",
        item.failureRateT3.toFixed(2) + "%",
        item.powerImpact.toFixed(2),
        item.impactRatio.toFixed(2) + "%",
        item.outputImpact.toFixed(4),
        item.events,
      ].join(","),
    );

    const csvString = csvHeader + csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `运营日报_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
              onChange={(date, dateString) => {
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
              <div className="text-sm font-medium text-gray-500">24小时总故障数</div>
              <div className="mt-2 flex items-baseline">
                <span className="text-3xl font-bold text-amber-600">
                  {(statistics.totalFailures24h || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="mb-6 rounded-lg bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <Select
              mode="multiple"
              size={"middle"}
              placeholder="选择场地"
              // className="w-80"
              style={{ minWidth: "300px" }}
              options={siteOptions}
              onChange={setSelectedSites}
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
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            className="custom-table"
          />
        </div>
      </div>
      <style jsx global>{`
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
