export type SettlementQueryParam = {
  name: { [key: string]: string[] }; // 使用索引签名定义 map
  start: string; // 开始时间，字符串格式
  end: string; // 结束时间，字符串格式
};
