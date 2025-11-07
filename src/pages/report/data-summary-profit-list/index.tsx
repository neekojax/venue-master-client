import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, DatePicker, Table } from "antd";
import type { DatePickerProps } from "antd/es/date-picker";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import * as XLSX from "xlsx";
import { useSelector, useSettingsStore } from "@/stores";
import { formatAmount, formatHashrate } from "@/utils/num";

import { fetchDailyVenueHostingStat } from "@/pages/report/api.tsx";
// 必须扩展 dayjs，否则会报 “不存在属性”
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

interface DataType {
  date: string;
  venue_id: number;
  venue_name: string;
  hash: number;
  income_btc: number;
  managed_unit_price: number;
  power_consumption: number;
  maintenance_price: number;
  nominal_power_consumption: number;
  power_consumption_diff: number;
  total_hosting_fee: number;
  total_maintenance_fee: number;
  total_income_usd: number;
  net_income: number;
  hosting_fee_ratio: number;
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

  // 子账户统计表格列配置（已废弃：新结构为按地区扁平数据，直接在主表展示）
  // const subAccountColumns: ColumnsType<SubAccountStat> = [
  //   { title: "地区", dataIndex: "region", key: "region", fixed: "left", width: 120 },
  //   {
  //     title: "24小时产出(BTC)",
  //     dataIndex: "btcOutput24h",
  //     key: "btcOutput24h",
  //     width: 165,
  //     render: (value) => value.toFixed(8),
  //   },
  //   {
  //     title: "理论算力(P)",
  //     dataIndex: "theoreticalPower",
  //     width: 120,
  //     key: "theoreticalPower",
  //     align: "right",
  //     render: (value) => value.toFixed(2),
  //   },
  //   {
  //     title: "24小时算力(P)",
  //     dataIndex: "power24h",
  //     key: "power24h",
  //     width: 145,
  //     align: "right",
  //     render: (value) => value.toFixed(2),
  //   },
  //   {
  //     title: "24小时有效率",
  //     dataIndex: "effectiveRate24h",
  //     key: "effectiveRate24h",
  //     width: 140,
  //     align: "right",
  //     render: (value) => `${value.toFixed(2)}%`,
  //   },
  //   {
  //     title: "在线率",
  //     dataIndex: "onlineRatio",
  //     key: "onlineRatio",
  //     width: 140,
  //     align: "center",
  //     render: (value) => `${value.toFixed(2)}%`,
  //   },
  // ];

  const columns: ColumnsType<DataType> = [
    { title: "日期", dataIndex: "date", key: "date", fixed: "left", width: 120 },
    {
      title: "场地名称",
      dataIndex: "venue_name",
      key: "venue_name",
      fixed: "left",
      width: 250,
      ellipsis: false,
    },
    {
      title: "算力(TH)",
      dataIndex: "hash",
      key: "hash",
      width: 140,
      align: "right",
      render: (value: number) => formatHashrate(value, "TH"),
      sorter: (a, b) => a.hash - b.hash,
    },
    {
      title: "日产出(BTC)",
      dataIndex: "income_btc",
      key: "income_btc",
      width: 160,
      align: "right",
      render: (value: number) => (typeof value === "number" ? value.toFixed(8) : value),
      sorter: (a, b) => a.income_btc - b.income_btc,
    },
    {
      title: "托管单价($)",
      dataIndex: "managed_unit_price",
      key: "managed_unit_price",
      width: 140,
      align: "right",
      render: (value: number) => (typeof value === "number" ? value.toFixed(3) : value),
      sorter: (a, b) => a.managed_unit_price - b.managed_unit_price,
    },
    {
      title: "运维单价($)",
      dataIndex: "maintenance_price",
      key: "maintenance_price",
      width: 140,
      align: "right",
      render: (value: number) => (typeof value === "number" ? value.toFixed(3) : value),
      sorter: (a, b) => a.maintenance_price - b.maintenance_price,
    },
    {
      title: "额定功耗",
      dataIndex: "nominal_power_consumption",
      key: "nominal_power_consumption",
      width: 140,
      align: "right",
      render: (value: number) => (typeof value === "number" ? value.toFixed(2) : value),
      sorter: (a, b) => a.nominal_power_consumption - b.nominal_power_consumption,
    },
    {
      title: "预估功耗",
      dataIndex: "power_consumption",
      key: "power_consumption",
      width: 140,
      align: "right",
      render: (value: number) => (typeof value === "number" ? value.toFixed(2) : value),
      sorter: (a, b) => a.power_consumption - b.power_consumption,
    },
    // {
    //     title: "功耗差",
    //     dataIndex: "power_consumption_diff",
    //     key: "power_consumption_diff",
    //     width: 120,
    //     align: "right",
    //     render: (value: number) => (typeof value === "number" ? value.toFixed(2) : value),
    //     sorter: (a, b) => a.power_consumption_diff - b.power_consumption_diff,
    // },
    {
      title: "总托管费($)",
      dataIndex: "total_hosting_fee",
      key: "total_hosting_fee",
      width: 160,
      align: "right",
      render: (value: number) => formatAmount(value),
      sorter: (a, b) => a.total_hosting_fee - b.total_hosting_fee,
    },
    {
      title: "总维保费($)",
      dataIndex: "total_maintenance_fee",
      key: "total_maintenance_fee",
      width: 160,
      align: "right",
      render: (value: number) => formatAmount(value),
      sorter: (a, b) => a.total_maintenance_fee - b.total_maintenance_fee,
    },
    // {
    //     title: "总收入(USD)",
    //     dataIndex: "total_income_usd",
    //     key: "total_income_usd",
    //     width: 160,
    //     align: "right",
    //     render: (value: number) => formatAmount(value),
    //     sorter: (a, b) => a.total_income_usd - b.total_income_usd,
    // },
    // {
    //     title: "净收入($)",
    //     dataIndex: "net_income",
    //     key: "net_income",
    //     width: 160,
    //     align: "right",
    //     render: (value: number) => (
    //         <span className={value < 0 ? "text-red-600" : "text-green-600"}>{formatAmount(value)}</span>
    //     ),
    //     sorter: (a, b) => a.net_income - b.net_income,
    // },
    // {
    //     title: "托管费占比",
    //     dataIndex: "hosting_fee_ratio",
    //     key: "hosting_fee_ratio",
    //     width: 140,
    //     align: "right",
    //     render: (value: number) => `${(value * 100).toFixed(2)}%`,
    //     sorter: (a, b) => a.hosting_fee_ratio - b.hosting_fee_ratio,
    // },
  ];

  const fetchReportData = async () => {
    setLoading(true); // 👈 开始加载

    try {
      // 检查 selectedDate 是否存在
      if (!selectedDate) {
        console.error("selectedDate is null");
        setLoading(false);
        return;
      }

      const reportData = await fetchDailyVenueHostingStat(selectedDate.format("YYYY-MM-DD"), poolType);
      const newReportData: DataType[] = [];
      if (reportData && Array.isArray(reportData.data)) {
        const mapped: DataType[] = reportData.data.map((item: any) => ({
          date: item.date,
          venue_id: Number(item.venue_id),
          venue_name: item.venue_name ?? "",
          hash: Number(item.hash) || 0,
          income_btc: Number(item.income_btc) || 0,
          managed_unit_price: Number(item.managed_unit_price) || 0,
          power_consumption: Number(item.power_consumption) || 0,
          maintenance_price: Number(item.maintenance_price) || 0,
          nominal_power_consumption: Number(item.nominal_power_consumption) || 0,
          power_consumption_diff: Number(item.power_consumption_diff) || 0,
          total_hosting_fee: Number(item.total_hosting_fee) || 0,
          total_maintenance_fee: Number(item.total_maintenance_fee) || 0,
          total_income_usd: Number(item.total_income_usd) || 0,
          net_income: Number(item.net_income) || 0,
          hosting_fee_ratio: Number(item.hosting_fee_ratio) || 0,
        }));
        newReportData.push(...mapped);
      }
      setFilteredData(newReportData);
    } catch (error) {
      console.error("获取日报数据失败:", error);
    } finally {
      setLoading(false); // 👈 请求结束，关闭加载
    }
  };

  // 日期筛选：改为单个日期而非区间，默认选择一个月前的日期
  // 日期筛选：改为单个日期而非区间，默认选择当前日期的前一天
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs().subtract(1, "day"));

  // 拉取数据
  useEffect(() => {
    if (!selectedDate) {
      console.error("selectedDate is null");
      return;
    }
    fetchReportData();
  }, [venueId, selectedDate]);

  const onDateChange: DatePickerProps["onChange"] = (date) => {
    setSelectedDate(date);
    fetchReportData();
  };

  // 导出 Excel
  const exportToCSV = () => {
    if (!filteredData.length) return;

    // 定义中文列名映射
    const mainDataHeaders = {
      venue_name: "场地名称",
      date: "日期",
      hash: "算力(TH)",
      income_btc: "日产出(BTC)",
      managed_unit_price: "托管单价($)",
      maintenance_price: "运维单价($)",
      nominal_power_consumption: "额定功耗",
      power_consumption: "预估功耗",
      total_hosting_fee: "总托管费($)",
      total_maintenance_fee: "总维保费($)",
    };

    // 准备主数据（只导出表格展示字段，并转换为中文列名）
    const mainData = filteredData.map((item) => {
      const translatedData: any = {};
      Object.keys(mainDataHeaders).forEach((key) => {
        const chineseKey = (mainDataHeaders as any)[key];
        const value = (item as any)[key];
        // if (key === "hash") {
        //   value = typeof value === "number" ? formatHashrate(value, "TH") : value;
        // } else if (key === "income_btc") {
        //   value = typeof value === "number" ? value.toFixed(8) : value;
        // } else if (key === "managed_unit_price" || key === "maintenance_price") {
        //   value = typeof value === "number" ? value.toFixed(3) : value;
        // } else if (key === "nominal_power_consumption" || key === "power_consumption") {
        //   value = typeof value === "number" ? value.toFixed(2) : value;
        // }
        // else if (key === "total_hosting_fee" || key === "total_maintenance_fee") {
        //   value = formatAmount(value);
        // }
        translatedData[chineseKey] = value;
      });
      return translatedData;
    });

    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 设置样式函数
    const setWorksheetStyle = (worksheet: any, headers: string[]) => {
      // 设置列宽
      const colWidths = headers.map(() => ({ wch: 15 })); // 统一设置列宽为15字符
      worksheet["!cols"] = colWidths;

      // 获取工作表范围
      const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

      // 设置表头样式
      for (let col = 0; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (!worksheet[cellAddress]) {
          worksheet[cellAddress] = { v: "", t: "s" };
        }

        worksheet[cellAddress].s = {
          font: {
            name: "微软雅黑",
            sz: 12,
            bold: true,
            color: { rgb: "FFFFFF" },
          },
          fill: {
            fgColor: { rgb: "4472C4" },
          },
          alignment: {
            horizontal: "center",
            vertical: "center",
          },
          border: {
            top: { style: "thin", color: { rgb: "D4D4D4" } },
            bottom: { style: "thin", color: { rgb: "D4D4D4" } },
            left: { style: "thin", color: { rgb: "D4D4D4" } },
            right: { style: "thin", color: { rgb: "D4D4D4" } },
          },
        };
      }

      // 设置数据行样式
      for (let row = 1; row <= range.e.r; row++) {
        for (let col = 0; col <= range.e.c; col++) {
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
          if (!worksheet[cellAddress]) {
            worksheet[cellAddress] = { v: "", t: "s" };
          }

          worksheet[cellAddress].s = {
            font: {
              name: "微软雅黑",
              sz: 10,
            },
            alignment: {
              horizontal: "left",
              vertical: "center",
            },
            border: {
              top: { style: "thin", color: { rgb: "E0E0E0" } },
              bottom: { style: "thin", color: { rgb: "E0E0E0" } },
              left: { style: "thin", color: { rgb: "E0E0E0" } },
              right: { style: "thin", color: { rgb: "E0E0E0" } },
            },
            fill: {
              fgColor: { rgb: row % 2 === 0 ? "F8F9FA" : "FFFFFF" },
            },
          };
        }
      }

      // 设置行高
      const rowHeights = [] as any[];
      rowHeights[0] = { hpt: 25 }; // 表头行高
      for (let i = 1; i <= range.e.r; i++) {
        rowHeights[i] = { hpt: 20 }; // 数据行高
      }
      worksheet["!rows"] = rowHeights;

      // 设置冻结窗格 - 固定表头
      worksheet["!freeze"] = { xSplit: 0, ySplit: 1, topLeftCell: "A2" } as any;
    };

    // 添加主数据sheet
    const mainWorksheet = XLSX.utils.json_to_sheet(mainData);
    const mainHeaderKeys = Object.keys(mainData[0] || {});
    setWorksheetStyle(mainWorksheet, mainHeaderKeys);
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, "数据概览汇总数据");

    // 导出文件
    XLSX.writeFile(workbook, "数据概览汇总数据.xlsx");
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
          <DatePicker
            onChange={onDateChange}
            defaultValue={dayjs().subtract(1, "day")}
            value={selectedDate || undefined}
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
            rowKey={(record) => `${record.date}-${record.venue_id}`}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
