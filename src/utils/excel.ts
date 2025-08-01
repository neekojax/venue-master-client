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

export const exportElectricDataToExcel = (data: any) => {
  // 创建一个工作簿
  const workbook = XLSX.utils.book_new();

  // 自定义表头
  const customHeader = [
    { header: "电站名称", key: "name" },
    { header: "电站类型", key: "type" },
    { header: "限定时间范围", key: "time_range" },
    { header: "限定时长（分钟）", key: "time_length" },
  ];

  // 处理数据并生成工作表
  const formattedData = data.map((item: any) => ({
    name: item.name,
    type: item.type,
    time_range: item.time_range,
    time_length: item.time_length,
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
    { wch: 40 }, // 收益日期
    { wch: 20 }, // 能耗比
  ];

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, "限电记录");

  // 获取当前日期并格式化为 YYYY-MM-DD
  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0]; // 获取日期部分

  // 生成文件名
  const fileName = `限电记录_${formattedDate}.xlsx`;

  // 导出 Excel 文件
  XLSX.writeFile(workbook, fileName);
};

export const exportElectricDataToExcelT = (data: any) => {
  // 创建一个工作簿
  const workbook = XLSX.utils.book_new();

  // 自定义表头
  const customHeader = [
    { header: "电站名称", key: "name" },
    { header: "限定时间范围", key: "time_range" },
    { header: "限定时长（小时）", key: "time_length" },
  ];

  // 处理数据并生成工作表
  const formattedData = data.map((item: any) => ({
    name: item.name,
    time_range: item.time_range,
    time_length: item.time_length,
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
    { wch: 40 }, // 收益日期
    { wch: 20 }, // 能耗比
  ];

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, "限电记录");

  // 获取当前日期并格式化为 YYYY-MM-DD
  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0]; // 获取日期部分

  // 生成文件名
  const fileName = `限电记录_${formattedDate}.xlsx`;

  // 导出 Excel 文件
  XLSX.writeFile(workbook, fileName);
};

export const exportElectricAverageToExcel = (data: any) => {
  // 创建一个工作簿
  const workbook = XLSX.utils.book_new();

  // 自定义表头
  const customHeader = [
    { header: "电站名称", key: "name" },
    { header: "电站类型", key: "type" },
    { header: "时间范围", key: "time_range" },
    { header: "平均电价（US$ Cent/KWH）", key: "average" },
  ];

  // 处理数据并生成工作表
  const formattedData = data.map((item: any) => ({
    name: item.name,
    type: item.type,
    time_range: item.time_range,
    average: item.average,
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
    { wch: 40 }, // 收益日期
    { wch: 20 }, // 能耗比
  ];

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, "平均电价");

  // 获取当前日期并格式化为 YYYY-MM-DD
  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0]; // 获取日期部分

  // 生成文件名
  const fileName = `平均电价_${formattedDate}.xlsx`;

  // 导出 Excel 文件
  XLSX.writeFile(workbook, fileName);
};

export const exportElectricBasicToExcel = (data: any) => {
  // 创建一个工作簿
  const workbook = XLSX.utils.book_new();

  // 自定义表头
  const customHeader = [
    { header: "电站名称", key: "name" },
    { header: "电站类型", key: "type" },
    { header: "时间范围", key: "time" },
    { header: "电价（US$ Cent/KWH）", key: "price" },
  ];

  // 处理数据并生成工作表
  const formattedData = data.map((item: any) => ({
    name: item.name,
    type: item.type,
    time: item.time,
    price: item.price,
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
    { wch: 40 }, // 收益日期
    { wch: 20 }, // 能耗比
  ];

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, "电价信息");

  // 获取当前日期并格式化为 YYYY-MM-DD
  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0]; // 获取日期部分

  // 生成文件名
  const fileName = `电价信息_${formattedDate}.xlsx`;

  // 导出 Excel 文件
  XLSX.writeFile(workbook, fileName);
};

export const exportHashRateToExcel = (data: any) => {
  // 创建一个工作簿
  const workbook = XLSX.utils.book_new();
  // 自定义表头
  const customHeader = [
    { header: "场地", key: "pool_name" },
    { header: "实时算力", key: "current_hash" },
    { header: "在线", key: "online" },
    { header: "离线", key: "offline" },
    { header: "24小时算力", key: "last_hash" },
    { header: "上次结算算力", key: "last_settlement_hash" },
    { header: "理论算力", key: "theoretical" },
    { header: "算力达成率", key: "last_hash_rate_effective" },
    { header: "上次结算收益BTC", key: "last_settlement_profit_btc" },
    { header: "上次结算收益FB", key: "last_settlement_profit_fb" },
    { header: "上次结算时间", key: "last_settlement_date" },
    { header: "刷新时间", key: "update_time" },
    { header: "链接", key: "link" },
  ];

  // 处理数据并生成工作表
  const formattedData = data.map((item: any) => ({
    pool_name: item.pool_name,
    current_hash: item.current_hash,
    online: item.online,
    offline: item.offline,

    last_hash: item.last_hash,
    last_settlement_hash: item.last_settlement_hash,
    theoretical: item.theoretical,
    last_hash_rate_effective: item.last_hash_rate_effective,

    last_settlement_profit_btc: item.last_settlement_profit_btc,
    last_settlement_profit_fb: item.last_settlement_profit_fb,
    last_settlement_date: item.last_settlement_date,
    update_time: item.update_time,
    link: item.link,
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
    { wch: 40 },
    { wch: 20 },
    { wch: 10 },
    { wch: 10 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, "哈希记录");

  // 获取当前日期并格式化为 YYYY-MM-DD
  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0]; // 获取日期部分

  // 生成文件名
  const fileName = `哈希记录_${formattedDate}.xlsx`;

  // 导出 Excel 文件
  XLSX.writeFile(workbook, fileName);
};

export const exportMiningPoolListToExcel = (data: any) => {
  // 创建一个工作簿
  const workbook = XLSX.utils.book_new();
  // 自定义表头

  const customHeader = [
    { header: "账户", key: "pool_name" },
    { header: "主体类型", key: "pool_type" },
    { header: "场地类型", key: "pool_category" },
    { header: "所属国家", key: "country" },
    { header: "理论算力", key: "theoretical_hashrate" },
    { header: "能耗比(J/T)", key: "energy_ratio" },
    { header: "基础托管费($/kwh)", key: "basic_hosting_fee" },
    { header: "链接", key: "link" },
  ];

  // 处理数据并生成工作表
  const formattedData = data.map((item: any) => ({
    pool_name: item.pool_name,
    pool_type: item.pool_type,
    pool_category: item.pool_category,
    country: item.country,
    theoretical_hashrate: item.theoretical_hashrate,
    energy_ratio: item.energy_ratio,
    basic_hosting_fee: item.basic_hosting_fee,
    link: item.link,
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
    { wch: 40 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
    { wch: 20 },
  ];

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, "矿池列表");

  // 获取当前日期并格式化为 YYYY-MM-DD
  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0]; // 获取日期部分

  // 生成文件名
  const fileName = `矿池列表_${formattedDate}.xlsx`;

  // 导出 Excel 文件
  XLSX.writeFile(workbook, fileName);
};

export const exportMiningPoolMonthRecordToExcel = (data: any) => {
  // 创建工作簿
  const workbook = XLSX.utils.book_new();

  // 定义静态表头
  const staticHeaders = [
    "场地名/编码",
    "机器数量",
    "理论算力",
    "昨日故障率",
    "3月故障率",
    "4月故障率",
    "4月故障率",
  ];

  // 生成动态列标题和对应数据
  const monthRows = data.monthEfficiencys.map((month: any) => [
    `${new Date(month.time).getMonth() + 1}月算力达成率`, // 动态列标题
    month.efficiency, // 对应的数据
  ]);

  // 完整的行数据
  const rowData = [
    [data.name], // 场地名/编码
    ["N/A"], // 机器数量
    [data.theoreticalHashRate], // 理论算力
    ["N/A"], // 昨日故障率
    ["N/A"], // 3月故障率
    ["N/A"], // 4月故障率
    ["N/A"], // 4月故障率
    // 将动态生成的月份行添加到 rowData
    ...monthRows,
  ];

  // 将静态表头与数据合并
  const fullHeaders = [...staticHeaders.map((header) => [header, "N/A"]), ...monthRows];

  // 将数据转换为工作表
  const worksheet = XLSX.utils.aoa_to_sheet(fullHeaders.concat(rowData));

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, "矿池数据");

  // 导出 Excel 文件
  XLSX.writeFile(workbook, "矿池数据.xlsx");
};
