import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { DownloadOutlined } from "@ant-design/icons";
import { Button, DatePicker, message, Progress, Table, Tag } from "antd";
import type { RangePickerProps } from "antd/es/date-picker";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import * as XLSX from "xlsx";
import { useSelector, useSettingsStore } from "@/stores";

import {
  fetchAllDailyStatTask,
  fetchAllDailyStatTaskResult,
  submitAllDailyStatTask,
} from "@/pages/report/api.tsx";
// 必须扩展 dayjs，否则会报 “不存在属性”
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const { RangePicker } = DatePicker;
interface SubAccountStat {
  pool_name: string;
  btcOutput24h: number;
  theoreticalPower: number;
  power24h: number;
  impactMachine: number;
  effectiveRate24h: number;
  totalMachines: number;
  totalFailures: number;
  totalFailuresRate: number;
  failures24h: number;
  failureRate24h: number;
  impactRatio: number;
  limitImpactRate: number;
  highTemperatureRate: number;
  onlineRatio: number;
}
interface DataType {
  date: string;
  btcOutput24h: number;
  theoreticalPower: number;
  power24h: number;
  impactMachine: number;
  effectiveRate24h: number;
  totalMachines: number;
  totalFailures: number;
  totalFailuresRate: number;
  failures24h: number;
  failureRate24h: number;
  impactRatio: number;
  limitImpactRate: number;
  highTemperatureRate: number;
  onlineRatio: number;
  subAccountStats: SubAccountStat[];
}

interface DailyStatTaskPayload {
  taskId: string;
  status: "pending" | "running" | "success" | "failed";
  progress: number;
  totalDays: number;
  resultCount: number;
  startDate: string;
  endDate: string;
  errorMessage: string;
}

const TASK_STATUS_TEXT: Record<DailyStatTaskPayload["status"], string> = {
  pending: "等待执行",
  running: "执行中",
  success: "执行成功",
  failed: "执行失败",
};

const TASK_STATUS_COLOR_MAP: Record<DailyStatTaskPayload["status"], string> = {
  pending: "default",
  running: "processing",
  success: "green",
  failed: "red",
};

const formatDailyRecords = (rawList: any[] = []): DataType[] =>
  rawList.map((venue: any) => ({
    date: venue.date || "",
    btcOutput24h: venue.btcOutput24h || 0,
    theoreticalPower: venue.theoreticalPower || 0,
    power24h: venue.power24h || 0,
    effectiveRate24h: venue.effectiveRate24h || 0,
    totalMachines: venue.totalMachines || 0,
    totalFailures: venue.totalFailures || 0,
    impactMachine: venue.impactMachine || 0,
    failures24h: venue.failures24h || 0,
    failureRate24h: venue.failureRate24h || 0,
    impactRatio: venue.impactRatio || 0,
    onlineRatio: venue.onlineRatio || 0,
    limitImpactRate: venue.limitImpactRate || 0,
    highTemperatureRate: venue.highTemperatureRate || 0,
    subAccountStats: venue.subAccountStats || [],
    totalFailuresRate: venue.totalFailuresRate || 0,
  }));

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
  const [taskInfo, setTaskInfo] = useState<DailyStatTaskPayload | null>(null);
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const pollTimerRef = useRef<number | null>(null);
  const requestSerialRef = useRef(0);

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current != null) {
      window.clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

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

  useEffect(() => {
    return () => {
      clearPollTimer();
    };
  }, [clearPollTimer]);

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
    {
      title: "在架有效率",
      dataIndex: "onlineRatio",
      key: "onlineRatio",
      width: 140,
      align: "center",
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
      width: 140,
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: "影响占比",
      dataIndex: "impactRatio",
      key: "impactRatio",
      width: 120,
      render: (value) => `${value.toFixed(2)}%`,
    },
    {
      title: "限电影响",
      dataIndex: "limitImpactRate",
      key: "limitImpactRate",
      width: 140,
      render: (value) => `${value.toFixed(2)}%`,
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
      title: "在架有效率",
      dataIndex: "onlineRatio",
      key: "onlineRatio",
      width: 140,
      align: "center",
      render: (value) => `${value.toFixed(2)}%`,
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

  // 日期筛选
  // 先定义日期范围 state，默认为最近1个月
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(1, "months"),
    dayjs(),
  ]);

  const fetchTaskResult = useCallback(
    async (taskId: string, requestSerial: number) => {
      const result = await fetchAllDailyStatTaskResult(poolType, taskId);

      if (requestSerial !== requestSerialRef.current) {
        return;
      }

      setFilteredData(formatDailyRecords(result?.data));
    },
    [poolType],
  );

  const pollTaskStatus = useCallback(
    async (taskId: string, requestSerial: number) => {
      try {
        const response = await fetchAllDailyStatTask(poolType, taskId);

        if (requestSerial !== requestSerialRef.current) {
          return;
        }

        const task = response?.data as DailyStatTaskPayload | undefined;
        if (!task) {
          throw new Error("任务状态返回为空");
        }

        setTaskInfo(task);

        if (task.status === "success") {
          await fetchTaskResult(taskId, requestSerial);
          setLoading(false);
          return;
        }

        if (task.status === "failed") {
          throw new Error(task.errorMessage || "日报任务执行失败");
        }

        pollTimerRef.current = window.setTimeout(() => {
          pollTaskStatus(taskId, requestSerial);
        }, 2000);
      } catch (error: any) {
        if (requestSerial !== requestSerialRef.current) {
          return;
        }
        setLoading(false);
        message.error(error.message || "获取日报任务状态失败");
      }
    },
    [fetchTaskResult, poolType],
  );

  const fetchReportData = useCallback(async () => {
    if (!dateRange) {
      setLoading(false);
      return;
    }

    requestSerialRef.current += 1;
    const requestSerial = requestSerialRef.current;
    clearPollTimer();
    setIsSubmittingTask(true);
    setLoading(true);
    setFilteredData([]);
    setTaskInfo(null);

    try {
      const submitResult = await submitAllDailyStatTask(
        poolType,
        Number(venueId),
        dateRange[0].format("YYYY-MM-DD"),
        dateRange[1].format("YYYY-MM-DD"),
      );

      if (requestSerial !== requestSerialRef.current) {
        return;
      }

      const task = submitResult?.data?.task as DailyStatTaskPayload | undefined;
      if (!task?.taskId) {
        throw new Error("日报任务提交失败");
      }

      setIsSubmittingTask(false);
      setTaskInfo(task);

      if (task.status === "success") {
        await fetchTaskResult(task.taskId, requestSerial);
        setLoading(false);
        return;
      }

      if (task.status === "failed") {
        throw new Error(task.errorMessage || "日报任务执行失败");
      }

      pollTimerRef.current = window.setTimeout(() => {
        pollTaskStatus(task.taskId, requestSerial);
      }, 2000);
    } catch (error) {
      setIsSubmittingTask(false);
      message.error((error as Error).message || "获取日报数据失败");
      setTaskInfo(null);
      setFilteredData([]);
      clearPollTimer();
      setLoading(false);
    }
  }, [clearPollTimer, dateRange, fetchTaskResult, pollTaskStatus, poolType, venueId]);

  // 拉取数据
  useEffect(() => {
    if (dateRange) {
      fetchReportData();
    }
  }, [dateRange, fetchReportData]);

  const onDateChange: RangePickerProps["onChange"] = (dates) => {
    setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null);
  };

  // 新增：重置按钮处理
  const handleReset = () => {
    const defaultStart = dayjs().subtract(1, "months");
    const defaultEnd = dayjs();
    clearPollTimer();
    setIsSubmittingTask(false);
    setDateRange([defaultStart, defaultEnd]);
    setTaskInfo(null);
    setFilteredData([]); // 立即清空，触发表格重新渲染，随后 useEffect 会重新拉取
  };

  const visibleTaskInfo = taskInfo;
  const shouldShowTaskPanel =
    isSubmittingTask ||
    visibleTaskInfo?.status === "pending" ||
    visibleTaskInfo?.status === "running" ||
    visibleTaskInfo?.status === "failed";
  const progressPercent = visibleTaskInfo
    ? Math.min(
        100,
        Math.max(
          0,
          visibleTaskInfo.totalDays > 0 ? (visibleTaskInfo.progress / visibleTaskInfo.totalDays) * 100 : 0,
        ),
      )
    : 0;

  // 导出 Excel
  const exportToCSV = () => {
    if (!filteredData.length) return;

    // 定义中文列名映射
    const mainDataHeaders = {
      date: "日期",
      btcOutput24h: "24小时产出(BTC)",
      theoreticalPower: "理论算力(P)",
      power24h: "24小时算力(P)",
      impactMachine: "在架算力(P)",
      effectiveRate24h: "24小时有效率",
      totalMachines: "托管台数",
      onlineRatio: "在架有效率",
      totalFailures: "总故障数",
      totalFailuresRate: "总故障率",
      failures24h: "24小时故障数",
      failureRate24h: "24小时故障率",
      impactRatio: "影响占比",
      limitImpactRate: "限电影响",
      highTemperatureRate: "高温影响",
    };

    const subAccountHeaders = {
      date: "日期",
      pool_name: "矿池名称",
      btcOutput24h: "24小时产出(BTC)",
      theoreticalPower: "理论算力(P)",
      power24h: "24小时算力(P)",
      impactMachine: "在架算力(P)",
      effectiveRate24h: "24小时有效率",
      totalMachines: "托管台数",
      onlineRatio: "在架有效率",
      totalFailures: "总故障数",
      totalFailuresRate: "总故障率",
      failures24h: "24小时故障数",
      failureRate24h: "24小时故障率",
      impactRatio: "影响占比",
      limitImpactRate: "限电影响",
      highTemperatureRate: "高温影响",
    };

    // 准备主数据（排除subAccountStats字段并转换为中文列名）
    const mainData = filteredData.map(({ subAccountStats, ...rest }) => {
      // console.log("subAccountStats", subAccountStats.length);
      const translatedData: any = {};

      Object.keys(rest).forEach((key) => {
        const chineseKey = mainDataHeaders[key as keyof typeof mainDataHeaders] || key;
        let value = null;

        if (key == "impactMachine") {
          value = (
            ((rest["totalMachines"] - rest["totalFailures"] - rest["impactMachine"]) *
              rest["theoreticalPower"]) /
            rest["totalMachines"]
          ).toFixed(2); // （托管台数-总故障数-不可抗力）*理论算力/托管台数
          // console.log("impactMachine >> value", value);
        } else {
          value = (rest as any)[key];
        }
        // value = (rest as any)[key];

        // 为包含rate、Rate、ratio、Ratio的字段添加百分号
        if (key.toLowerCase().includes("rate") || key.toLowerCase().includes("ratio")) {
          value = typeof value === "number" ? `${value.toFixed(2)}%` : value;
        }
        // console.log("key", key, "values", value);

        translatedData[chineseKey] = value;
      });
      // console.log("translatedData", translatedData);
      return translatedData;
    });

    // 准备子账户数据（展开所有子账户数据并添加日期信息，转换为中文列名）
    const subAccountData: any[] = [];
    filteredData.forEach((item) => {
      item.subAccountStats.forEach((subAccount) => {
        const translatedSubAccount: any = {};
        // 添加日期
        translatedSubAccount[subAccountHeaders.date] = item.date;
        // 转换其他字段
        Object.keys(subAccount).forEach((key) => {
          const chineseKey = subAccountHeaders[key as keyof typeof subAccountHeaders] || key;
          // let value = (subAccount as any)[key];

          let value = null;

          if (key == "impactMachine") {
            value = (
              ((subAccount["totalMachines"] - subAccount["totalFailures"] - subAccount["impactMachine"]) *
                subAccount["theoreticalPower"]) /
              subAccount["totalMachines"]
            ).toFixed(2); // （托管台数-总故障数-不可抗力）*理论算力/托管台数
            // console.log("impactMachine >> value", value);
          } else {
            value = (subAccount as any)[key];
          }

          // 为包含rate、Rate、ratio、Ratio的字段添加百分号
          // console.log("key.toLowerCase()", key.toLowerCase());
          if (key.toLowerCase().includes("rate") || key.toLowerCase().includes("ratio")) {
            value = typeof value === "number" ? `${value.toFixed(2)}%` : value;
          }
          translatedSubAccount[chineseKey] = value;
        });
        subAccountData.push(translatedSubAccount);
      });
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
      const rowHeights = [];
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
    // 工作表命名：当前场地名 + 日期时间（Excel 工作表名最多 31 字符，且不能包含 : \ / ? * [ ]）
    const ts = dayjs().format("YYYYMMDD_HHmm");
    const rawSheetName = `${venueName || "未命名场地"}-${ts}`;
    // 仅保留必须的转义（反斜杠与中括号），移除对 "/", "?", "*" 的不必要转义
    const safeSheetName = rawSheetName.replace("/[\\/:?*[]]/g", "-").slice(0, 31);
    XLSX.utils.book_append_sheet(workbook, mainWorksheet, safeSheetName);

    // 添加子账户数据sheet
    const subAccountWorksheet = XLSX.utils.json_to_sheet(subAccountData);
    const subAccountHeaderKeys = Object.keys(subAccountData[0] || {});
    setWorksheetStyle(subAccountWorksheet, subAccountHeaderKeys);
    XLSX.utils.book_append_sheet(workbook, subAccountWorksheet, "子账户详细数据");

    // 导出文件
    XLSX.writeFile(workbook, safeSheetName + ".xlsx");
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
          <div className="flex items-center gap-2">
            <RangePicker
              value={dateRange}
              onChange={onDateChange}
              disabledDate={(current, { from }) => {
                if (!from) return false;
                // 限制最大选择范围为2个月
                const maxRange = 2;
                const diffMonths = Math.abs(current.diff(from, "month", true));
                return diffMonths > maxRange;
              }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleReset} className="!rounded-button">
              重置
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={exportToCSV}
              disabled={!filteredData.length}
              className="!rounded-button"
            >
              导出报表
            </Button>
          </div>
        </div>
        {shouldShowTaskPanel ? (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-slate-900">日报生成状态</span>
              {visibleTaskInfo ? (
                <>
                  <Tag color={TASK_STATUS_COLOR_MAP[visibleTaskInfo.status]}>
                    {TASK_STATUS_TEXT[visibleTaskInfo.status]}
                  </Tag>
                  <span className="text-sm text-slate-600">
                    已处理 {visibleTaskInfo.progress}/{visibleTaskInfo.totalDays} 天
                  </span>
                  {visibleTaskInfo.status !== "failed" ? (
                    <span className="text-sm text-slate-500">系统每 2 秒自动刷新一次状态</span>
                  ) : null}
                </>
              ) : (
                <>
                  <Tag color="processing">提交中</Tag>
                  <span className="text-sm text-slate-600">正在提交日报任务，请稍候...</span>
                </>
              )}
            </div>
            {visibleTaskInfo ? (
              <>
                <Progress
                  percent={Number(progressPercent.toFixed(0))}
                  status={visibleTaskInfo.status === "failed" ? "exception" : "active"}
                  strokeColor={visibleTaskInfo.status === "failed" ? "#dc2626" : "#1677ff"}
                  showInfo={false}
                />
                {visibleTaskInfo.errorMessage ? (
                  <div className="mt-2 text-sm text-rose-600">错误信息：{visibleTaskInfo.errorMessage}</div>
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
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
