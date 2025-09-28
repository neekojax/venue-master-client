import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Table } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import * as XLSX from "xlsx";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchAllDailyStat } from "@/pages/report/api.tsx";
// 必须扩展 dayjs，否则会报 “不存在属性”
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;
interface SubAccountStat {
  pool_name: string;
  btcOutput24h: number;
  theoreticalPower: number;
  power24h: number;
  effectiveRate24h: number;
  totalMachines: number;
  totalFailures: number;
  totalFailuresRate: number;
  failures24h: number;
  failureRate24h: number;
  impactRatio: number;
  limitImpactRate: number;
  highTemperatureRate: number;
}
interface DataType {
  date: string;
  btcOutput24h: number;
  theoreticalPower: number;
  power24h: number;
  effectiveRate24h: number;
  totalMachines: number;
  totalFailures: number;
  failures24h: number;
  failureRate24h: number;
  impactRatio: number;
  limitImpactRate: number;
  highTemperatureRate: number;
  subAccountStats: SubAccountStat[];
}

const App: React.FC = () => {
  const params = useParams<{ venueId: string; venueName: string }>();
  const venueId = params.venueId!;
  const venueName = params.venueName!;
  const [loading, setLoading] = useState(false); // 👈 加载状态
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const tableRef = useRef<HTMLDivElement>(null);
  const [isTableFixed, setIsTableFixed] = useState(false);

  // const [data, setData] = useState<DataType[]>([]);

  const [filteredData, setFilteredData] = useState<DataType[]>([]);
  const [pageSize, setPageSize] = useState(20);

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

  // 子账户统计表格列配置
  const subAccountColumns: ColumnsType<SubAccountStat> = [
    { title: "矿池名称", dataIndex: "pool_name", key: "pool_name", fixed: "left", width: 120 },
    {
      title: "24小时产出(BTC)",
      dataIndex: "btcOutput24h",
      key: "btcOutput24h",
      width: 165,
      render: (value) => value.toFixed(8),
    },
    {
      title: "理论算力(P)",
      dataIndex: "theoreticalPower",
      width: 120,
      key: "theoreticalPower",
      align: "right",
      render: (value) => value.toFixed(2),
    },
    {
      title: "24小时算力(P)",
      dataIndex: "power24h",
      key: "power24h",
      width: 145,
      align: "right",
      render: (value) => value.toFixed(2),
    },
    {
      title: "24小时有效率",
      dataIndex: "effectiveRate24h",
      key: "effectiveRate24h",
      width: 140,
      align: "right",
      render: (value) => `${value.toFixed(2)}%`,
    },
    { title: "托管台数", dataIndex: "totalMachines", key: "totalMachines", width: 105 },
    { title: "总故障数", dataIndex: "totalFailures", key: "totalFailures", width: 120 },
    {
      title: "总故障率",
      dataIndex: "totalFailuresRate",
      key: "totalFailuresRate",
      width: 120,
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: "24小时故障数",
      dataIndex: "failures24h",
      key: "failures24h",
      width: 138,
      align: "right",
      render: (value) => value.toLocaleString(),
    },
    {
      title: "24小时故障率",
      dataIndex: "failureRate24h",
      key: "failureRate24h",
      width: 138,
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: "影响占比",
      dataIndex: "impactRatio",
      key: "impactRatio",
      width: 105,
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: "限电影响",
      dataIndex: "limitImpactRate",
      key: "limitImpactRate",
      width: 140,
      align: "right",
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: "高温影响",
      dataIndex: "highTemperatureRate",
      key: "highTemperatureRate",
      width: 140,
      align: "right",
      render: (value) => `${value.toFixed(2)}%`,
    },
  ];

  const columns: ColumnsType<DataType> = [
    { title: "日期", dataIndex: "date", key: "date", fixed: "left", width: 120 },
    {
      title: "24小时产出(BTC)",
      dataIndex: "btcOutput24h",
      key: "btcOutput24h",
      width: 165,
      align: "right",
      render: (value: number) => value.toFixed(8),
      sorter: (a, b) => a.btcOutput24h - b.btcOutput24h,
    },
    {
      title: "理论算力(P)",
      dataIndex: "theoreticalPower",
      key: "theoreticalPower",
      width: 125,
      align: "right",
      render: (value: number) => value.toFixed(2),
      sorter: (a, b) => a.theoreticalPower - b.theoreticalPower,
    },
    {
      title: "24小时算力(P)",
      dataIndex: "power24h",
      key: "power24h",
      width: 145,
      align: "right",
      render: (value: number) => value.toFixed(2),
      sorter: (a, b) => a.power24h - b.power24h,
    },
    {
      title: "24小时有效率",
      dataIndex: "effectiveRate24h",
      key: "effectiveRate24h",
      width: 140,
      align: "right",
      render: (value: number) => `${value.toFixed(2)}%`,
      sorter: (a, b) => a.effectiveRate24h - b.effectiveRate24h,
    },
    {
      title: "托管台数",
      dataIndex: "totalMachines",
      key: "totalMachines",
      width: 105,
      align: "right",
      render: (value: number) => value.toLocaleString(),
      sorter: (a, b) => a.totalMachines - b.totalMachines,
    },
    {
      title: "总故障台数",
      dataIndex: "totalFailures",
      key: "totalFailures",
      width: 120,
      align: "right",
      render: (value: number) => value.toLocaleString(),
      sorter: (a, b) => a.totalFailures - b.totalFailures,
    },
    {
      title: "总故障率",
      key: "totalFailureRate",
      width: 120,
      align: "right",
      render: (_, record) => {
        const rate = record.totalMachines
          ? ((record.totalFailures / record.totalMachines) * 100).toFixed(2)
          : "0.00";
        return <span>{rate}%</span>;
      },
    },
    {
      title: "24小时故障数",
      dataIndex: "failures24h",
      key: "failures24h",
      width: 138,
      align: "right",
      render: (value: number) => value.toLocaleString(),
      sorter: (a, b) => a.failures24h - b.failures24h,
    },
    {
      title: "24小时故障率",
      dataIndex: "failureRate24h",
      key: "failureRate24h",
      width: 138,
      render: (value: number) => `${value.toFixed(2)}%`,
      sorter: (a, b) => a.failureRate24h - b.failureRate24h,
    },
    {
      title: "影响占比",
      dataIndex: "impactRatio",
      key: "impactRatio",
      width: 105,
      render: (value: number) => `${value.toFixed(2)}%`,
      sorter: (a, b) => a.impactRatio - b.impactRatio,
    },
    {
      title: "限电影响",
      dataIndex: "limitImpactRate",
      key: "limitImpactRate",
      width: 140,
      render: (value: number) => `${value.toFixed(2)}%`,
      sorter: (a, b) => a.limitImpactRate - b.limitImpactRate,
    },
    {
      title: "高温影响",
      dataIndex: "highTemperatureRate",
      key: "highTemperatureRate",
      width: 140,
      render: (value: number) => `${value.toFixed(2)}%`,
      sorter: (a, b) => a.highTemperatureRate - b.highTemperatureRate,
    },
  ];

  const fetchReportData = async () => {
    setLoading(true); // 👈 开始加载
    try {
      // 检查 dateRange 是否存在
      if (!dateRange) {
        console.error("dateRange is null");
        setLoading(false);
        return;
      }

      const reportData = await fetchAllDailyStat(
        poolType,
        Number(venueId),
        dateRange[0].format("YYYY-MM-DD"),
        dateRange[1].format("YYYY-MM-DD"),
      );
      if (reportData && reportData.data) {
        const formattedData: DataType[] = reportData.data.map((venue: any) => ({
          date: venue.date || "",
          btcOutput24h: venue.btcOutput24h || 0,
          theoreticalPower: venue.theoreticalPower || 0,
          power24h: venue.power24h || 0,
          effectiveRate24h: venue.effectiveRate24h || 0,
          totalMachines: venue.totalMachines || 0,
          totalFailures: venue.totalFailures || 0,
          failures24h: venue.failures24h || 0,
          failureRate24h: venue.failureRate24h || 0,
          impactRatio: venue.impactRatio || 0,
          limitImpactRate: venue.limitImpactRate || 0,
          highTemperatureRate: venue.highTemperatureRate || 0,
          subAccountStats: venue.subAccountStats || [],
        }));
        // setData(formattedData);
        // 应用默认的日期筛选（最近1个月）
        const defaultStart = dayjs().subtract(1, "months");
        const defaultEnd = dayjs();
        const defaultFiltered = formattedData.filter((item) => {
          const d = dayjs(item.date);
          return d.isValid() && d.isSameOrAfter(defaultStart, "day") && d.isSameOrBefore(defaultEnd, "day");
        });
        setFilteredData(defaultFiltered);
      } else {
        console.error("API 返回无效:", reportData);
      }
    } catch (error) {
      console.error("获取日报数据失败:", error);
    } finally {
      setLoading(false); // 👈 请求结束，关闭加载
    }
  };

  // 日期筛选
  // 先定义日期范围 state，默认为最近1个月
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(1, "months"),
    dayjs(),
  ]);

  // 拉取数据
  useEffect(() => {
    // 检查 dateRange 是否存在
    if (!dateRange) {
      console.error("dateRange is null");
      return;
    }
    fetchReportData();
  }, [venueId, dateRange]);

  const onDateChange: RangePickerProps["onChange"] = (dates) => {
    setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null);
    console.log(dateRange, dates);
    fetchReportData();
    // if (dates) {
    //   const [start, end] = dates;
    //   // console.log(start, end)
    //   const filtered = data.filter((item) => {
    //     const d = dayjs(item.date);
    //     // console.log(d.isValid())
    //     return d.isValid() && d.isSameOrAfter(start, "day") && d.isSameOrBefore(end, "day");
    //   });
    //   fetchReportData();
    //   // setFilteredData(filtered);
    // } else {
    //   fetchReportData();
    //   // setFilteredData(data);
    // }
  };

  // 导出 CSV
  const exportToCSV = () => {
    if (!filteredData.length) return;
    const worksheet = XLSX.utils.json_to_sheet(filteredData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "日报数据");
    XLSX.writeFile(workbook, "日报数据.xlsx");
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="mb-0">
        <div className="flex items-center gap-4 mb-3">
          <h1 className="text-3xl font-bold text-gray-900">{venueName}</h1>
        </div>
      </header>

      <div
        ref={tableRef}
        className={`mb-6 rounded-lg bg-white p-6 shadow-sm transition-all duration-300 ${
          isTableFixed ? "sticky top-0 z-10" : ""
        }`}
      >
        <div className="mb-6 flex items-center justify-between gap-4">
          <RangePicker onChange={onDateChange} defaultValue={[dayjs().subtract(1, "months"), dayjs()]} />
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={exportToCSV}
            className="!rounded-button"
          >
            导出报表
          </Button>
        </div>
        <div className="mx-auto">
          <Table
            loading={loading} // 👈 表格自带 loading 效果
            columns={columns}
            dataSource={filteredData}
            scroll={{ x: 1200 }}
            sticky={true}
            pagination={{
              pageSize,
              showSizeChanger: true,
              onShowSizeChange: (_, size) => setPageSize(size),
              showQuickJumper: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
            className="custom-table"
            rowKey="date"
            expandable={{
              expandedRowRender: (record) => (
                <div style={{ margin: 0 }}>
                  <h4 style={{ marginBottom: 16 }}>子账户统计详情</h4>
                  <Table<SubAccountStat>
                    columns={subAccountColumns}
                    dataSource={record.subAccountStats}
                    pagination={false}
                    scroll={{ x: 1500 }}
                    rowKey="pool_name"
                    size="small"
                  />
                </div>
              ),
              rowExpandable: (record) => record.subAccountStats && record.subAccountStats.length > 0,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
