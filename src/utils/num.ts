type HashUnit = "H" | "KH" | "MH" | "GH" | "TH" | "PH" | "EH";

/**
 * 格式化算力（自动或强制单位转换）
 * @param {number} value 原始数值
 * @param {HashUnit} inputUnit 输入值单位（默认 'H'）
 * @param {number} decimals 保留小数位（默认 2）
 * @param {HashUnit | ""} forceUnit 强制转换到指定单位（如 'TH'、'EH'）
 * @param {boolean} showUnit 是否返回单位（默认 true）
 * @returns {string|number} 格式化后的字符串或纯数值
 */
export const formatHashrate = (
  value: number,
  inputUnit: HashUnit = "H",
  decimals = 2,
  forceUnit: HashUnit | "" = "",
  showUnit = true,
) => {
  if (value === null || value === undefined || isNaN(Number(value))) return "-";

  const units: HashUnit[] = ["H", "KH", "MH", "GH", "TH", "PH", "EH"];
  const map: Record<HashUnit, number> = {
    H: 1,
    KH: 1e3,
    MH: 1e6,
    GH: 1e9,
    TH: 1e12,
    PH: 1e15,
    EH: 1e18,
  };

  // 转为 H/s
  let h = Number(value) * map[inputUnit];

  if (forceUnit) {
    // 强制转换
    const converted = h / map[forceUnit];
    return showUnit ? `${converted.toFixed(decimals)} ${forceUnit}/s` : Number(converted.toFixed(decimals));
  }

  // 自动选择合适单位
  let i = 0;
  while (h >= 1000 && i < units.length - 1) {
    h /= 1000;
    i++;
  }

  return showUnit ? `${h.toFixed(decimals)} ${units[i]}/s` : Number(h.toFixed(decimals));
};

/**
 * 格式化金额（自动单位转换）
 * @param {number | string} value 金额值
 * @param {number} decimals 保留小数位数（默认 2）
 * @param {string} symbol 可选货币符号，如 "¥"、"$"
 * @param {boolean} useKMB 是否使用 K/M/B 单位（默认 true）
 * @returns {string} 格式化后的字符串
 */
export const formatAmount = (value: number | string, decimals = 2, symbol = "", useKMB = true): string => {
  if (value === null || value === undefined || value === "" || isNaN(Number(value))) {
    return "-";
  }

  const num = Number(value);
  // const absNum = Math.abs(num);

  // 自动单位列表
  const units = ["", "K", "M", "B", "T"];
  let i = 0;
  let scaled = num;

  if (useKMB) {
    while (Math.abs(scaled) >= 1000 && i < units.length - 1) {
      scaled /= 1000;
      i++;
    }
  }

  // 格式化数值
  const formatted = scaled.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${symbol}${formatted}${units[i] ? " " + units[i] : ""}`;
};
