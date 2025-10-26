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
import { formatHashrate } from "@/utils/num";

import { fetchEfficiencyMachineStat } from "@/pages/report/api.tsx";
// 必须扩展 dayjs，否则会报 “不存在属性”
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;

interface DataType {
  date: string;
  region: string;
  DailyOutput: number;
  TheoreticalHashrate: number;
  EffectivePower: number;
  Efficiency: number;
  TotalMachine: number;
  TotalFailure: number;
  NewFailure: number;
  NewFailureRate: number;
  CumulativeOutput?: number;
  Category?: string;
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
      title: "地区",
      dataIndex: "region",
      key: "region",
      fixed: "left",
      width: 120,
      // filterMultiple: true,
      filters: [
        { text: "北美", value: "北美" },
        { text: "埃塞俄比亚", value: "埃塞俄比亚" },
        { text: "巴拉圭", value: "巴拉圭" },
        { text: "阿曼", value: "阿曼" },
      ],
      onFilter: (value, record) => record.region === value,
    },
    {
      title: "托管台数",
      dataIndex: "TotalMachine",
      key: "TotalMachine",
      width: 165,
      align: "right",
      render: (value: number) => value.toLocaleString(),
      sorter: (a, b) => a.TotalMachine - b.TotalMachine,
    },
    {
      title: "理论算力",
      dataIndex: "TheoreticalHashrate",
      key: "TheoreticalHashrate",
      width: 125,
      align: "right",
      render: (value: number) => {
        return formatHashrate(value, "PH");
      },
      sorter: (a, b) => a.TheoreticalHashrate - b.TheoreticalHashrate,
    },
    {
      title: "24H算力",
      dataIndex: "EffectivePower",
      key: "EffectivePower",
      width: 145,
      align: "right",
      render: (value: number) => {
        return formatHashrate(value, "TH");
      },
      // render: (value: number) => value.toFixed(2),
      sorter: (a, b) => a.EffectivePower - b.EffectivePower,
    },
    {
      title: "24H有效率",
      dataIndex: "Efficiency",
      key: "Efficiency",
      width: 140,
      align: "right",
      render: (value: number) => `${value.toFixed(2)}%`,
      sorter: (a, b) => a.Efficiency - b.Efficiency,
    },
    {
      title: "日产出(BTC)",
      dataIndex: "DailyOutput",
      key: "DailyOutput",
      width: 165,
      align: "right",
      render: (value: number) => value.toFixed(8),
      sorter: (a, b) => a.DailyOutput - b.DailyOutput,
    },
    {
      title: "总故障台数",
      dataIndex: "TotalFailure",
      key: "TotalFailure",
      width: 120,
      align: "right",
      render: (value: number) => value.toLocaleString(),
      sorter: (a, b) => a.TotalFailure - b.TotalFailure,
    },
    {
      title: "总故障率",
      dataIndex: "TotalFailure",
      key: "TotalFailure",
      width: 120,
      align: "right",
      render: (value: number, record: DataType) => {
        return `${((value / record.TotalMachine) * 100).toFixed(2)}%`;
      },
      sorter: (a, b) => a.TotalFailure - b.TotalFailure,
    },
    {
      // title: "24小时故障数",
      title: "新增故障台数",
      dataIndex: "NewFailure",
      key: "NewFailure",
      width: 138,
      align: "right",
      render: (value: number) => value.toLocaleString(),
      sorter: (a, b) => a.NewFailure - b.NewFailure,
    },
    {
      // title: "24小时故障率",
      title: "新增故障率",
      dataIndex: "NewFailureRate",
      key: "NewFailureRate",
      width: 138,
      render: (value: number) => `${value.toFixed(2)}%`,
      sorter: (a, b) => a.NewFailureRate - b.NewFailureRate,
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

      const reportData = await fetchEfficiencyMachineStat(
        dateRange[0].format("YYYY-MM-DD"),
        dateRange[1].format("YYYY-MM-DD"),
        poolType,
      );
      const newReportData: DataType[] = [];
      if (reportData && Array.isArray(reportData.data)) {
        reportData.data.forEach((item: any) => {
          if (item && item.stats_map) {
            const regions = Object.keys(item.stats_map || {});
            regions.forEach((region) => {
              const power = item.stats_map?.[region]?.power_stats || {};
              const machine = item.stats_map?.[region]?.machine_stats || {};
              newReportData.push({
                date: item.date,
                region,
                DailyOutput: Number(power.DailyOutput) || 0,
                TheoreticalHashrate: Number(power.TheoreticalHashrate) || 0,
                EffectivePower: Number(power.EffectivePower) || 0,
                Efficiency: Number(power.Efficiency) || 0,
                TotalMachine: Number(machine.TotalMachine) || 0,
                TotalFailure: Number(machine.TotalFailure) || 0,
                NewFailure: Number(machine.NewFailure) || 0,
                NewFailureRate:
                  machine.NewFailureRate != null
                    ? Number(machine.NewFailureRate)
                    : machine.TotalMachine
                      ? (Number(machine.NewFailure) / Number(machine.TotalMachine)) * 100
                      : 0,
                CumulativeOutput: power.CumulativeOutput != null ? Number(power.CumulativeOutput) : undefined,
              });
            });
          } else {
            // 兼容新扁平结构
            newReportData.push({
              date: item.date || item.Date || "",
              region: item.region || item.Category || "",
              DailyOutput: Number(item.DailyOutput) || 0,
              TheoreticalHashrate: Number(item.TheoreticalHashrate) || 0,
              EffectivePower: Number(item.EffectivePower) || 0,
              Efficiency: Number(item.Efficiency) || 0,
              TotalMachine: Number(item.TotalMachine) || 0,
              TotalFailure: Number(item.TotalFailure) || 0,
              NewFailure: Number(item.NewFailure) || 0,
              NewFailureRate: Number(item.NewFailureRate) || 0,
              CumulativeOutput: item.CumulativeOutput != null ? Number(item.CumulativeOutput) : undefined,
              Category: item.Category,
            });
          }
        });
      }
      setFilteredData(newReportData);
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
  };

  // 导出 Excel
  const exportToCSV = () => {
    if (!filteredData.length) return;

    // 定义中文列名映射
    const mainDataHeaders = {
      date: "日期",
      region: "地区",
      TotalMachine: "托管台数",
      TheoreticalHashrate: "理论算力",
      EffectivePower: "24小时算力(P)",
      Efficiency: "24小时有效率",
      DailyOutput: "日产出(BTC)",
      TotalFailure: "总故障数",
      CumulativeOutput: "总故障数率",
      NewFailure: "新增故障台数",
      NewFailureRate: "新增故障台数率",
    };

    // 准备主数据（转换为中文列名）
    const mainData = filteredData.map((item) => {
      const translatedData: any = {};
      Object.keys(item).forEach((key) => {
        const chineseKey = (mainDataHeaders as any)[key] || key;
        let value = (item as any)[key];
        // 处理 TotalFailureRate 特殊情况
        if (key === "CumulativeOutput") {
          value =
            typeof value === "number"
              ? `${((item.TotalFailure / item.TotalMachine) * 100).toFixed(2)}%`
              : value;
        } else if (key === "TheoreticalHashrate") {
          value = typeof value === "number" ? formatHashrate(value, "PH") : value;
        } else if (
          key.toLowerCase().includes("rate") ||
          key.toLowerCase().includes("ratio") ||
          key.toLowerCase().includes("Efficiency")
        ) {
          value = typeof value === "number" ? `${value.toFixed(2)}%` : value;
        } else if (key === "EffectivePower") {
          value = typeof value === "number" ? formatHashrate(value, "TH") : value;
        }
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
          <RangePicker
            onChange={onDateChange}
            defaultValue={[dayjs().subtract(1, "months"), dayjs()]}
            disabledDate={(current, { from }) => {
              if (!from) return false;
              // 限制最大选择范围为2个月
              const maxRange = 2;
              const diffMonths = Math.abs(current.diff(from, "month", true));
              return diffMonths > maxRange;
            }}
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
            rowKey={(record) => `${record.date}-${record.region}`}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
