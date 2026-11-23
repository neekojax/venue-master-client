import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { DailyData, DataItem, WeeklyReportSnapshot, WeeklyReportSummary } from "./components/types";

import { t } from "@/locales";

interface ReportColumn {
  label: string;
  width: number;
  format?: string;
  tuned?: boolean;
  notes?: boolean;
}

const hashFormat = "#,##0.000";
const rateFormat = "0.00%";
const metrics: ReportColumn[] = [
  { label: "理论算力 (PH/s)", width: 19, format: hashFormat },
  { label: "变频理论算力 (PH/s)", width: 22, format: hashFormat, tuned: true },
  { label: "实际算力 (PH/s)", width: 19, format: hashFormat },
  { label: "产出效率(BTC/EH)", width: 19, format: "0.0000" },
  { label: "24小时有效率", width: 17, format: rateFormat },
  { label: "变频24小时有效率", width: 20, format: rateFormat, tuned: true },
  { label: "净有效率", width: 15, format: rateFormat },
  { label: "故障数", width: 12 },
  { label: "故障率", width: 13, format: rateFormat },
  { label: "待修率", width: 13, format: rateFormat },
  { label: "净故障率", width: 15, format: rateFormat },
  { label: "报废数", width: 12 },
  { label: "高温影响率", width: 16, format: rateFormat },
  { label: "限电影响率", width: 16, format: rateFormat },
  { label: "低功耗影响率", width: 18, format: rateFormat },
  { label: "撤场比例", width: 15, format: rateFormat },
  { label: "云算力比例", width: 15, format: rateFormat },
];

const venueColumn = { label: "场地名称", width: 42 };
const tuningColumn = { label: "是否变频", width: 14 };
const weeklyColumns: ReportColumn[] = [
  venueColumn,
  tuningColumn,
  ...metrics,
  { label: "本周上架", width: 14 },
  { label: "本周下架", width: 14 },
  { label: "关机币价", width: 16, format: "#,##0.00" },
  { label: "事件原因", width: 44, notes: true },
  { label: "跟进事项", width: 36, notes: true },
  { label: "处理进度", width: 32, notes: true },
];
const dailyColumns: ReportColumn[] = [
  venueColumn,
  { label: "日期", width: 16, format: "yyyy-mm-dd" },
  tuningColumn,
  ...metrics,
  { label: "上架数量", width: 14 },
  { label: "下架数量", width: 14 },
];

function isTuned(row: DataItem | DailyData) {
  return Number(row.IsOverclocked ?? row.isOverclocked ?? row.is_overclocked ?? 0) === 1;
}

function percent(value?: number) {
  return value == null ? null : value / 100;
}

function plainText(html?: string) {
  if (!html) return "";
  const decoder = document.createElement("textarea");
  decoder.innerHTML = html;
  const template = document.createElement("template");
  template.innerHTML = decoder.value;
  template.content.querySelectorAll("style, script").forEach((node) => node.remove());
  template.content.querySelectorAll("br, p, li, div").forEach((node) => node.after("\n"));
  return template.content.textContent?.trim() ?? "";
}

function fill(argb: string): ExcelJS.Fill {
  return { type: "pattern", pattern: "solid", fgColor: { argb } };
}

function addColumnHeaders(sheet: ExcelJS.Worksheet, columns: ReportColumn[]) {
  const header = sheet.addRow(columns.map((col) => t(col.label)));
  header.height = 36;
  header.font = { bold: true, size: 10, color: { argb: "FF233753" } };
  header.alignment = { vertical: "middle", horizontal: "center", wrapText: true };
  header.eachCell((cell, index) => {
    cell.fill = fill(columns[index - 1].tuned ? "FFCFE4FB" : "FFE8EEF4");
  });
}

function addReportSheet(
  workbook: ExcelJS.Workbook,
  name: string,
  columns: ReportColumn[],
  frozenColumns: number,
  period: string,
) {
  const sheet = workbook.addWorksheet(name, {
    views: [{ state: "frozen", xSplit: frozenColumns, ySplit: 2, showGridLines: false }],
  });
  sheet.columns = columns.map(({ width, format }) => ({ width, style: format ? { numFmt: format } : {} }));
  const band = sheet.getRow(1);
  if (frozenColumns > 1) sheet.mergeCells(1, 1, 1, frozenColumns);
  sheet.mergeCells(1, frozenColumns + 1, 1, Math.min(columns.length, frozenColumns + 5));
  band.getCell(1).value = name;
  band.getCell(frozenColumns + 1).value = period;
  band.height = 32;
  band.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } };
  band.fill = fill("FF233753");
  band.alignment = { horizontal: "left", vertical: "middle", indent: 1 };

  addColumnHeaders(sheet, columns);
  return sheet;
}

function styleDataRow(row: ExcelJS.Row, columns: ReportColumn[], tuned: boolean) {
  row.alignment = { vertical: "middle" };
  row.height = 21;
  if (row.number % 2 === 0) row.fill = fill("FFF5F8FB");
  row.eachCell((cell, index) => {
    const col = columns[index - 1];
    if (col.tuned && tuned) cell.font = { bold: true, color: { argb: "FF205E97" } };
    if ((index === 1 && typeof cell.value === "string") || col.notes) {
      cell.alignment = { vertical: "middle", wrapText: true };
      const lines = cell.text.split("\n").reduce((total, line) => {
        const width = line.replace(/[\u0100-\uFFFF]/g, "xx").length;
        return total + Math.max(1, Math.ceil(width / (col.width - 2)));
      }, 0);
      row.height = Math.max(row.height, Math.min(409, lines * 16 + 5));
    }
  });
}

function addSummarySheet(workbook: ExcelJS.Workbook, period: string, summary?: WeeklyReportSummary) {
  const columns: ReportColumn[] = [
    { label: "指标名称", width: 34 },
    { label: "本期数值", width: 30, format: rateFormat },
    { label: "较上周变化（百分点）", width: 32, format: "+0.00;-0.00;0.00" },
  ];
  const sheet = addReportSheet(workbook, t("周报汇总"), columns, 1, period);
  if (!summary) {
    sheet.addRow([t("暂无汇总数据")]);
    return sheet;
  }
  const rows: [string, number | undefined, number?][] = [
    ["平均算力有效率", summary.TotalHashEffectiveRate, summary.WeeklyHashEffectiveRateChange],
    ["总故障率", summary.TotalFailureRate, summary.WeeklyFailureRateChange],
    ["高温影响率", summary.TotalHighTemperatureImpactRate, summary.WeeklyHighTemperatureImpactRateChange],
    ["限电影响率", summary.TotalLimitImpactRate, summary.WeeklyLimitImpactRateChange],
    ["低功耗比例", summary.TotalLowPowerImpactRate],
    ["电力影响率", summary.TotalPowerEventImpactRate ?? summary.TotalWithdrawImpactRate],
    ["设备故障影响率", summary.TotalDeviceFaultImpactRate ?? summary.TotalCloudPowerRate],
  ];
  for (const [label, value, change] of rows) {
    const row = sheet.addRow([t(label), percent(value), change]);
    styleDataRow(row, columns, false);
  }
  return sheet;
}

function addDailyRates(sheet: ExcelJS.Worksheet, report: WeeklyReportSnapshot) {
  const columns = [
    { label: "日期", width: 34, format: "yyyy-mm-dd" },
    { label: "算力有效率", width: 30, format: rateFormat },
    { label: "故障率", width: 32, format: rateFormat },
    { label: "故障数", width: 16, format: "#,##0" },
  ] satisfies ReportColumn[];
  sheet.getColumn(4).width = columns[3].width;
  sheet.addRow([]).height = 8;
  const title = sheet.addRow([t("每日指标")]);
  sheet.mergeCells(title.number, 1, title.number, columns.length);
  title.height = 24;
  title.font = { bold: true, color: { argb: "FFFFFFFF" } };
  title.fill = fill("FF233753");
  title.alignment = { vertical: "middle", horizontal: "left", indent: 1 };
  addColumnHeaders(sheet, columns);

  const efficiencyByDate = new Map(
    report.hashEffectiveRates.map((point) => [point.date, point.effectiveRate]),
  );
  const failuresByDate = new Map(report.failureRates.map((point) => [point.date, point]));
  const end = Date.parse(report.endDate);
  for (let time = Date.parse(report.startDate); time <= end; time += 86_400_000) {
    const day = new Date(time);
    const date = day.toISOString().slice(0, 10);
    const failure = failuresByDate.get(date);
    const row = sheet.addRow([
      day,
      percent(efficiencyByDate.get(date)),
      percent(failure?.failureRate),
      failure?.failure,
    ]);
    columns.forEach((column, i) => {
      row.getCell(i + 1).numFmt = column.format;
    });
    styleDataRow(row, columns, false);
  }
}

export async function downloadWeeklyReport(report: WeeklyReportSnapshot) {
  const { sites, summary, poolType, startDate, endDate } = report;
  const workbook = new ExcelJS.Workbook();
  const period = [
    poolType,
    startDate + " – " + endDate,
    t("{{length}} 个场地", { length: sites.length }),
  ].join("    ·    ");
  const overview = addSummarySheet(workbook, period, summary);
  addDailyRates(overview, report);
  const weekly = addReportSheet(workbook, t("场地周汇总"), weeklyColumns, 1, period);
  const daily = addReportSheet(workbook, t("逐日明细"), dailyColumns, 2, period);
  for (const site of [...sites].sort((a, b) => a.venue_name.localeCompare(b.venue_name))) {
    const tuned = isTuned(site);
    const siteRow = weekly.addRow([
      site.venue_name,
      t(tuned ? "是" : "否"),
      site.average_thermal_power,
      tuned ? site.average_overclock_theoretical_power : site.average_thermal_power,
      site.average_power_24h,
      site.output_efficiency,
      percent(site.average_hash_effective_rate),
      percent(tuned ? site.average_overclock_hash_effective_rate : site.average_hash_effective_rate),
      percent(site.forecast_hash_efficiency),
      site.average_failure,
      percent(site.average_failure_rate),
      percent(site.average_pending_repair_rate),
      percent(site.average_net_failure_rate),
      site.average_scrap,
      percent(site.average_high_temperature_impact_rate),
      percent(site.average_limit_impact_rate),
      percent(site.average_low_power_impact_rate),
      percent(site.average_withdraw_impact_rate),
      percent(site.average_cloud_power_rate),
      site.week_shelved,
      site.week_unshelved,
      site.shutdown_price,
      plainText(site.event_reason),
      plainText(site.follow_up),
      plainText(site.progress),
    ]);
    styleDataRow(siteRow, weeklyColumns, tuned);
    const days = [...(site.daily_items ?? [])].sort((a, b) => a.Date.localeCompare(b.Date));
    for (const day of days) {
      const dayTuned = isTuned(day);
      const row = daily.addRow([
        site.venue_name,
        new Date(day.Date + "T00:00:00Z"),
        t(dayTuned ? "是" : "否"),
        day.TheoreticalPower,
        dayTuned ? day.OverclockTheoreticalPower : day.TheoreticalPower,
        day.Power24h == null ? null : day.Power24h / 1000,
        day.OutputEfficiency,
        percent(day.HashEffectiveRate),
        percent(dayTuned ? day.OverclockHashEffectiveRate : day.HashEffectiveRate),
        percent(day.ForecastHashEfficiency),
        day.Failure,
        percent(day.FailureRate),
        percent(day.PendingRepairRate),
        percent(day.NetFailureRate),
        day.Scrap,
        percent(day.HighTemperatureImpactRate),
        percent(day.LimitImpactRate),
        percent(day.low_power_impact_rate),
        percent(day.withdraw_impact_rate),
        percent(day.cloud_power_rate),
        day.Shelved,
        day.Unshelved,
      ]);
      styleDataRow(row, dailyColumns, dayTuned);
    }
  }
  for (const sheet of [weekly, daily]) {
    sheet.autoFilter = {
      from: { row: 2, column: 1 },
      to: { row: sheet.rowCount, column: sheet.columnCount },
    };
  }
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(
    new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
    t("运营周报") + "_" + poolType + "_" + startDate + "_" + endDate + ".xlsx",
  );
}
