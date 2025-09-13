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
