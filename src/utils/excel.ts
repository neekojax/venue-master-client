import dayjs from "dayjs";
import * as XLSX from "xlsx"; // 导入 xlsx 库

export const exportCustodyStatisticsToExcel = (data: any) => {
  // 创建一个工作簿
  const workbook = XLSX.utils.book_new();

  // 自定义表头（对齐数据库返回字段）
  const customHeader = [
    { header: "收益日期", key: "report_date" },
    { header: "场地ID", key: "venue_id" },
    { header: "场地名", key: "venue_name" },
    { header: "24h算力（TH/s）", key: "hash" },
    { header: "BTC收益（BTC）", key: "total_income_btc" },
    { header: "USD收益（USD）", key: "total_income_usd" },
    { header: "净收益（USD）", key: "net_income" },
    { header: "单价（$/kwh）", key: "basic_hosting_fee" },
    { header: "预估能耗", key: "power_consumption" },
    { header: "实际能耗", key: "nominal_power_consumption" },
    { header: "能耗差异", key: "power_consumption_diff" },
    { header: "总托管费（USD）", key: "total_hosting_fee" },
    { header: "托管费占比（%）", key: "hosting_fee_ratio" },
  ];

  // 处理数据并生成工作表（映射数据库字段）
  const formattedData = data.map((item: any) => ({
    report_date: item.report_date,
    venue_id: item.venue_id,
    venue_name: item.venue_name,
    hash: item.hash,
    total_income_btc: item.total_income_btc,
    basic_hosting_fee: item.basic_hosting_fee,
    power_consumption: item.power_consumption,
    nominal_power_consumption: item.nominal_power_consumption,
    power_consumption_diff: item.power_consumption_diff + "%",
    total_hosting_fee: item.total_hosting_fee,
    total_income_usd: item.total_income_usd,
    net_income: item.net_income,
    hosting_fee_ratio: item.hosting_fee_ratio.toFixed(2) + "%",
  }));

  // 将自定义表头和数据合并
  const worksheetData = [
    customHeader.map((field) => field.header),
    ...formattedData.map((item: { [x: string]: any }) => customHeader.map((field) => item[field.key])),
  ];

  // 生成工作表
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // 设置列宽度（与表头数量一致）
  worksheet["!cols"] = [
    { wch: 12 }, // 收益日期
    { wch: 10 }, // 场地ID
    { wch: 30 }, // 场地
    { wch: 18 }, // 算力
    { wch: 18 }, // BTC收益
    { wch: 20 }, // USD收益
    { wch: 20 }, // 净收益USD
    { wch: 18 }, // 基础托管费
    { wch: 16 }, // 能耗
    { wch: 16 }, // 标称能耗
    { wch: 14 }, // 能耗差值
    { wch: 20 }, // 总托管费
    { wch: 14 }, // 托管费占比
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
    { header: "场地", key: "venue_name" },
    { header: "子账号", key: "pool_name" },
    { header: "实时算力", key: "current_hash" },
    { header: "在线", key: "online" },
    { header: "离线", key: "offline" },
    // { header: "24小时算力", key: "last_hash" },
    // { header: "上次结算算力", key: "last_settlement_hash" },
    { header: "理论算力", key: "theoretical" },
    { header: "算力达成率", key: "last_hash_rate_effective" },
    // { header: "上次结算收益BTC", key: "last_settlement_profit_btc" },
    // { header: "上次结算收益FB", key: "last_settlement_profit_fb" },
    // { header: "上次结算时间", key: "last_settlement_date" },
    { header: "刷新时间", key: "update_time" },
    { header: "链接", key: "link" },
  ];

  // 处理数据并生成工作表
  const formattedData = data.map((item: any) => ({
    venue_name: item.venue_name,
    pool_name: item.pool_name,
    current_hash: item.current_hash,
    online: item.online,
    offline: item.offline,

    // last_hash: item.last_hash,
    // last_settlement_hash: item.last_settlement_hash,
    theoretical: item.theoretical,
    last_hash_rate_effective: item.last_hash_rate_effective,

    // last_settlement_profit_btc: item.last_settlement_profit_btc,
    // last_settlement_profit_fb: item.last_settlement_profit_fb,
    // last_settlement_date: item.last_settlement_date,
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
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    localStorage.getItem(`mining-hash_poolCategory`) || "主矿池" + "_实时算力",
  );

  // 获取当前日期并格式化为 YYYY-MM-DD
  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0]; // 获取日期部分

  // 生成文件名
  const fileName =
    (localStorage.getItem(`mining-hash_poolCategory`) || "主矿池") + `_实时算力_${formattedDate}.xlsx`;

  // 导出 Excel 文件
  XLSX.writeFile(workbook, fileName);
};

export const exportMiningPoolListToExcel = (data: any) => {
  // 创建一个工作簿
  const workbook = XLSX.utils.book_new();
  const StatusColumn = ({ status }: { status: number }) => {
    let statusText = "";
    // let statusStyle = {};

    if (status === 1) {
      statusText = "活跃";
      // statusStyle = { color: "green" }; // 活跃状态，绿色
    } else if (status === 0) {
      statusText = "暂停";
      // statusStyle = { color: "red" }; // 暂停状态，红色
    } else if (status === 2) {
      statusText = "已撤场";
      // statusStyle = { color: "orange" }; // 已撤场状态，红色
    }

    return { statusText };
  };
  // 自定义表头

  const customHeader = [
    { header: "场地", key: "venue_name" },
    { header: "子账户", key: "pool_name" },
    // { header: "主体类型", key: "pool_type" },
    { header: "场地类型", key: "pool_category" },
    { header: "所属国家", key: "country" },
    {
      header: "托管机器",
      key: "hosted_machine",
    },
    {
      header: "状态",
      key: "status",
      // render: (_text: any, record: { status: unknown }) => StatusColumn({ status: record.status }).statusText,
    },

    { header: "理论算力（PH/s）", key: "theoretical_hashrate" },
    {
      header: "散热模式",
      key: "heat_diss_mode",

      // render: (value: number) => {
      //   if (value === 1) {
      //     return <Tag color="green">风冷</Tag>;
      //   }
      //   if (value === 2) {
      //     return <Tag color="geekblue">水冷</Tag>;
      //   }
      //   return <Tag color="default">未知</Tag>;
      // },
    },

    // { header: "能耗比(J/T)", key: "energy_ratio" },
    // { header: "基础托管费($/kwh)", key: "basic_hosting_fee" },
    { header: "链接", key: "link" },
  ];

  // 处理数据并生成工作表
  const formattedData = data.map((item: any) => ({
    venue_name: item.venue_name,
    pool_name: item.pool_name,
    // pool_type: item.pool_type,
    pool_category: item.pool_category,
    country: item.country,
    hosted_machine: item.hosted_machine,
    status: StatusColumn({ status: item.status }).statusText,
    theoretical_hashrate: item.theoretical_hashrate,
    heat_diss_mode: item.heat_diss_mode === 1 ? "风冷" : item.heat_diss_mode === 2 ? "水冷" : "未知",
    // energy_ratio: item.energy_ratio,
    // basic_hosting_fee: item.basic_hosting_fee,
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
  XLSX.utils.book_append_sheet(
    workbook,
    worksheet,
    localStorage.getItem(`mining-hash_poolCategory`) || "主矿池" + "_矿池列表",
  );

  // 获取当前日期并格式化为 YYYY-MM-DD
  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0]; // 获取日期部分

  // 生成文件名
  const fileName =
    (localStorage.getItem(`mining-hash_poolCategory`) || "主矿池") + `_矿池列表_${formattedDate}.xlsx`;

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

export const exportPowerConsumptionToExcel = (data: any[]) => {
  // 创建一个工作簿
  const workbook = XLSX.utils.book_new();

  // 自定义表头（功耗账单）
  const customHeader = [
    { header: "场地名称", key: "siteName" },
    { header: "账单开始", key: "start_time" },
    { header: "账单结束", key: "end_time" },
    { header: "总功耗 (kWh)", key: "power_consumption" },
  ];

  // 处理数据并生成工作表
  const formattedData = (data || []).map((item: any) => ({
    siteName: item.siteName,
    start_time: item.start_time ? dayjs(item.start_time).toDate() : null,
    end_time: item.end_time ? dayjs(item.end_time).toDate() : null,
    power_consumption: item.power_consumption,
  }));

  // 将自定义表头和数据合并
  const worksheetData = [
    customHeader.map((field) => field.header),
    ...formattedData.map((item: { [x: string]: any }) => customHeader.map((field) => item[field.key])),
  ];

  // 生成工作表
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  if (worksheet["!ref"]) {
    const range = XLSX.utils.decode_range(worksheet["!ref"] as string);
    for (let R = range.s.r + 1; R <= range.e.r; R++) {
      for (const C of [1, 2]) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = (worksheet as any)[addr];
        if (cell && (cell.t === "d" || cell.t === "n")) {
          cell.z = "yyyy-mm-dd hh:mm:ss";
        }
      }
    }
  }
  // 设置列宽度
  worksheet["!cols"] = [
    { wch: 30 }, // 场地名称
    { wch: 20 }, // 账单开始
    { wch: 20 }, // 账单结束
    { wch: 16 }, // 总功耗
  ];

  // 将工作表添加到工作簿
  XLSX.utils.book_append_sheet(workbook, worksheet, "总功耗账单");

  // 获取当前日期并格式化为 YYYY-MM-DD
  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0];

  // 生成文件名
  const fileName = `总功耗账单_${formattedDate}.xlsx`;

  // 导出 Excel 文件
  XLSX.writeFile(workbook, fileName, { cellDates: true });
};

export const exportHostingRecordToExcel = (data: any[]) => {
  const workbook = XLSX.utils.book_new();

  // 声明导出行的类型，使 header 的 key 成为该类型的键
  type HostingRecordExportRow = {
    siteName: string;
    start_time: Date | string | null;
    end_time: Date | string | null;
    hosting_price: number | string;
    maintenance_price: number | string;
  };
  type HeaderKey = keyof HostingRecordExportRow;

  const customHeader: Array<{ header: string; key: HeaderKey }> = [
    { header: "场地名称", key: "siteName" },
    { header: "账单开始", key: "start_time" },
    { header: "账单结束", key: "end_time" },
    { header: "托管单价（USD）", key: "hosting_price" },
    { header: "运维单价（USD）", key: "maintenance_price" },
  ];

  const formattedData: HostingRecordExportRow[] = (data || []).map((item: any) => ({
    siteName: String(item?.siteName ?? ""),
    start_time: item?.start_time ? dayjs(item.start_time).toDate() : null,
    end_time: item?.end_time ? dayjs(item.end_time).toDate() : null,
    hosting_price:
      typeof item?.hosting_price === "number" ? item.hosting_price : String(item?.hosting_price ?? ""),
    maintenance_price:
      typeof item?.maintenance_price === "number"
        ? item.maintenance_price
        : String(item?.maintenance_price ?? ""),
  }));

  const worksheetData = [
    customHeader.map((f) => f.header),
    ...formattedData.map((row) => customHeader.map((f) => row[f.key])),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
  if (worksheet["!ref"]) {
    const range = XLSX.utils.decode_range(worksheet["!ref"] as string);
    for (let R = range.s.r + 1; R <= range.e.r; R++) {
      for (const C of [1, 2]) {
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = (worksheet as any)[addr];
        if (cell && (cell.t === "d" || cell.t === "n")) {
          cell.z = "yyyy-mm-dd hh:mm:ss";
        }
      }
    }
  }
  worksheet["!cols"] = [
    { wch: 30 }, // 场地名称
    { wch: 20 }, // 账单开始
    { wch: 20 }, // 账单结束
    { wch: 18 }, // 托管单价
    { wch: 18 }, // 运维单价
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, "托管运维单价");

  const date = new Date();
  const formattedDate = date.toISOString().split("T")[0];
  const fileName = `托管运维单价_${formattedDate}.xlsx`;
  XLSX.writeFile(workbook, fileName, { cellDates: true });
};

// 通用：根据内容自适应列宽（中文与数字按字符数近似计算）
const autoFitColsByContent = (rows: any[][], options?: { min?: number; max?: number; padding?: number }) => {
  const min = options?.min ?? 8;
  const max = options?.max ?? 40;
  const padding = options?.padding ?? 2;
  const colCount = rows[0]?.length ?? 0;
  const widths: { wch: number }[] = new Array(colCount).fill(0).map(() => ({ wch: min }));

  for (let r = 0; r < rows.length; r++) {
    const row = rows[r];
    for (let c = 0; c < colCount; c++) {
      const cell = row?.[c];
      let str = "";
      if (cell == null) {
        str = "";
      } else if (cell instanceof Date) {
        // 以导出的日期显示格式估算列宽
        str = dayjs(cell).format("YYYY-MM-DD HH:mm:ss");
      } else {
        str = String(cell);
      }
      // 近似考虑中文宽度：用长度即可，必要时可替换更精确宽度算法
      const len = str.length + padding;
      if (len > widths[c].wch) {
        widths[c].wch = Math.min(Math.max(len, min), max);
      }
    }
  }
  return widths;
};

// 事件日志导出（XLSX）：列宽根据内容自适应
export const exportEventLogsToExcel = (
  data: Array<{
    venue_info: {
      venue_name: string;
    };
    pool_info: {
      pool_name: string;
    };
    is_sleep: number; // 0 未休眠 1 已休眠
    // log_date: string;
    log_type: string;
    start_time: string;
    end_time: string | null;
    impact_count: number;
    event_reason: string;
    resolution_measures: string;
    created_at: string;
    updated_at: string;
  }>,
  sheetName = "事件日志",
  fileName = `事件日志_${new Date().toISOString().split("T")[0]}.xlsx`,
) => {
  const workbook = XLSX.utils.book_new();

  // 与页面展示一致的表头（去除无对应字段的“记录人”）
  const headers = [
    "场地",
    "子账户",
    "是否休眠",
    "事件类型",
    // "日期",
    "开始时间",
    "结束时间",
    "影响时长（小时）",
    "影响台数",
    "事件原因",
    "解决措施",
    "创建时间",
    "更新时间",
  ];

  const rows: any[][] = [
    headers,
    ...data.map((item) => [
      item.venue_info.venue_name ?? "",
      // item.ven venue_name ?? "",
      item.pool_info.pool_name ?? "",
      item.is_sleep === 1 ? "已休眠" : "未休眠", // 0 未休眠 1 已休眠
      item.log_type ?? "",
      // item.log_date ?? "",
      item.start_time ? dayjs(item.start_time).toDate() : null,
      item.end_time ? dayjs(item.end_time).toDate() : null,
      item.end_time ? (dayjs(item.end_time).diff(dayjs(item.start_time), "minute") / 60).toFixed(2) : "--",
      item.impact_count ?? "",
      item.event_reason ?? "",
      item.resolution_measures ?? "",
      item.created_at ? dayjs(item.created_at).toDate() : null,
      item.updated_at ? dayjs(item.updated_at).toDate() : null,
    ]),
  ];

  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  // 设置“开始时间”和“结束时间”两列为日期显示格式
  if (worksheet["!ref"]) {
    const range = XLSX.utils.decode_range(worksheet["!ref"] as string);
    for (let R = range.s.r + 1; R <= range.e.r; R++) {
      for (const C of [4, 5, 10, 11]) {
        // 0:场地,1:事件类型,2:开始时间,3:结束时间
        const addr = XLSX.utils.encode_cell({ r: R, c: C });
        const cell = (worksheet as any)[addr];
        if (cell && (cell.t === "d" || cell.t === "n")) {
          cell.z = "yyyy-mm-dd hh:mm:ss";
        }
      }
    }
  }
  worksheet["!cols"] = autoFitColsByContent(rows, { min: 10, max: 50, padding: 2 });

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName, { cellDates: true });
};
