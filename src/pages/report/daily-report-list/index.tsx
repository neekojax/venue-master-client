import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
// import type { RangePickerProps } from "antd/es/date-picker";
import * as XLSX from "xlsx";

// import dayjs from "dayjs";
import { fetchAllDailyStat } from "@/pages/report/api.tsx";

// const { RangePicker } = DatePicker;

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
}

const App: React.FC = () => {
  const params = useParams<{ venueId: string }>();
  const venueId = params.venueId!;

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
      title: "理论算力(E)",
      dataIndex: "theoreticalPower",
      key: "theoreticalPower",
      width: 125,
      align: "right",
      render: (value: number) => value.toFixed(6),
      sorter: (a, b) => a.theoreticalPower - b.theoreticalPower,
    },
    {
      title: "24小时算力(E)",
      dataIndex: "power24h",
      key: "power24h",
      width: 145,
      align: "right",
      render: (value: number) => value.toFixed(6),
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

  // 拉取数据
  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const reportData = await fetchAllDailyStat(Number(venueId));
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
          }));
          // setData(formattedData);
          setFilteredData(formattedData);
        } else {
          console.error("API 返回无效:", reportData);
        }
      } catch (error) {
        console.error("获取日报数据失败:", error);
      }
    };
    fetchReportData();
  }, [venueId]);

  // 日期筛选
  // 先定义日期范围 state
  // const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>(null);
  // const onDateChange: RangePickerProps["onChange"] = (dates) => {
  //   setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null);
  //   console.log(dateRange, dates)
  //   if (dates) {
  //     const [start, end] = dates;
  //     console.log(start, end)
  //     const filtered = data.filter((item) => {
  //       const d = dayjs(item.date);
  //       // return d.isSameOrAfter(start, "day") && d.isSameOrBefore(end, "day");
  //     });
  //     setFilteredData(filtered);
  //   } else {
  //     setFilteredData(data);
  //   }
  // };

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
      <div className="mx-auto">
        <div
          ref={tableRef}
          className={`mb-6 rounded-lg bg-white p-6 shadow-sm transition-all duration-300 ${
            isTableFixed ? "sticky top-0 z-10" : ""
          }`}
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            {/* <RangePicker onChange={onDateChange} /> */}
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
          />
        </div>
      </div>
    </div>
  );
};

export default App;
