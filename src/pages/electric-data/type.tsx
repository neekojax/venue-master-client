export type SettlementQueryParam = {
  type: string;
  name: { [key: string]: string[] }; // 使用索引签名定义 map
  start: string; // 开始时间，字符串格式
  end: string; // 结束时间，字符串格式
};

export const PRICE_TYPE_REAL_TIME = "realTime"; // 实时价格
export const PRICE_TYPE_T1 = "t1"; // T-1价格

export type SettlementQueryWithPageParam = {
  type: string;
  name: { [key: string]: string[] }; // 使用索引签名定义 map
  start: string; // 开始时间，字符串格式
  end: string; // 结束时间，字符串格式
  price: string;
  page: number;
  page_size: number;
};