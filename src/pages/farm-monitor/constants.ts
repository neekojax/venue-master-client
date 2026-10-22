/** 运行概览区 + 数据统计区 的固定总高度（px） */
export const FARM_MONITOR_TOP_HEIGHT = 572;

/** 场地名展示最大字符数，超出用 .. 省略 */
export const MAX_FARM_NAME_LENGTH = 10;

export function formatFarmName(name: string, maxLength = MAX_FARM_NAME_LENGTH) {
  if (name.length <= maxLength) return name;
  return `${name.slice(0, maxLength)}..`;
}
