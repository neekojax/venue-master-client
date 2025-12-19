// 工具函数：保留两位小数并加 %
export const formatPercent = (value?: number | string | null, decimal: number = 2) => {
  if (value === null || value === undefined || value === "") return "--";
  const num = Number(value);
  if (isNaN(num)) return "--";

  return `${Math.abs(num).toFixed(decimal)}%`;
};

export const getNumberColor = (num?: number | null): string => {
  if (num === null || num === undefined || isNaN(num)) return "text-gray-400"; // 无效
  if (num > 0) return "text-green-500"; // 正数
  if (num < 0) return "text-red-500"; // 负数
  return "text-gray-500"; // 等于0
};

export const getIconColor = (title?: string | null): string => {
  if (title == "高温影响率") {
    return "text-orange-500";
  } else if (title == "总故障率") {
    return "text-red-500";
  } else if (title == "限电影响率") {
    return "text-yellow-500";
  }
  return "text-blue-500";
};

// 数字/1000 取3位小数
export const formatDivide1000 = (value: number | string): string => {
  if (value == null || value === "") return "-"; // 空值处理
  const num = Number(value);
  if (isNaN(num)) return "-"; // 非数字处理
  return (num / 1000).toFixed(3);
};

export const formatThousands = (value?: number | string | null): string => {
  if (value === null || value === undefined || value === "") return "--";
  const num = Number(value);
  if (isNaN(num)) return "--";
  return num.toLocaleString();
};
