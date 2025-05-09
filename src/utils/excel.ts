import * as XLSX from "xlsx"; // 导入 xlsx 库

export const exportCustodyStatisticsToExcel = (data: any) => {
  // 创建一个工作簿
  const workbook = XLSX.utils.book_new();

  // 自定义表头
  const customHeader = [
    { header: "场地", key: "venue_name" },
    { header: "子账号", key: "sub_account_name" },
    { header: "收益日期", key: "report_date" },
    { header: "能耗比（J/T）", key: "energy_ratio" },
    { header: "基础托管费（$/kwh）", key: "basic_hosting_fee" },
    { header: "24小时平均算力（TH/s）", key: "hourly_computing_power" },
    { header: "总托管费", key: "total_hosting_fee" },
    { header: "BTC收益（BTC）", key: "total_income_btc" },
    { header: "USD收益（USD）", key: "total_income_usd" },
    { header: "净收益（USD）", key: "net_income" },
    { header: "托管费占比", key: "hosting_fee_ratio" },
  ];

  // 处理数据并生成工作表
  const formattedData = data.map((item: any) => ({
    venue_name: item.venue_name,
    sub_account_name: item.sub_account_name,
    report_date: item.report_date,
    energy_ratio: item.energy_ratio,
    basic_hosting_fee: item.basic_hosting_fee,
    hourly_computing_power: item.hourly_computing_power,
    total_hosting_fee: item.total_hosting_fee,
    total_income_btc: item.total_income_btc,
    total_income_usd: item.total_income_usd,
    net_income: item.net_income,
    hosting_fee_ratio: item.hosting_fee_ratio,
  }));

  // 将自定义表头和数据合并
  const worksheetData = [
    customHeader.map((field) => field.header),
    ...formattedData.map((item: { [x: string]: any }) => customHeader.map((field) => item[field.key])),
  ];

  // 生成工作表
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // 设置列宽度
  // 设置每一列的宽度
  worksheet["!cols"] = [
    { wch: 20 }, // 场地
    { wch: 20 }, // 子账号
    { wch: 20 }, // 收益日期
    { wch: 20 }, // 能耗比
    { wch: 20 }, // 基础托管费
    { wch: 25 }, // 24小时平均算力
    { wch: 20 }, // 总托管费
    { wch: 20 }, // BTC收益
    { wch: 20 }, // USD收益
    { wch: 20 }, // 净收益USD
    { wch: 15 }, // 托管费占比
  ];

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, "托管费统计");

  // 获取当前日期并格式化为 YYYY-MM-DD
  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0]; // 获取日期部分

  // 生成文件名
  const fileName = `托管统计_${formattedDate}.xlsx`;

  // 导出 Excel 文件
  XLSX.writeFile(workbook, fileName);
};
