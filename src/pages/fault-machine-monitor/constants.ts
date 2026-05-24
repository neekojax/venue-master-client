export const FAULT_CODES = [
  "算力板",
  "传感器",
  "温度",
  "电源",
  "老化",
  "内存",
  "网络",
  "频率",
  "扫频",
  "性能",
] as const;

export type FaultCode = (typeof FAULT_CODES)[number];

export const FAULT_CODE_COLOR: Record<FaultCode, string> = {
  算力板: "#1677ff",
  传感器: "#13c2c2",
  温度: "#ff4d4f",
  电源: "#fa8c16",
  老化: "#722ed1",
  内存: "#eb2f96",
  网络: "#8c8c8c",
  频率: "#52c41a",
  扫频: "#2f54eb",
  性能: "#faad14",
};

export const FAULT_CODE_EXPLANATIONS: Record<FaultCode, string[]> = {
  算力板: ["算力板通信超时", "算力板缺失", "算力板温度异常"],
  传感器: ["风扇转速传感器异常", "环境温度传感器读数异常"],
  温度: ["芯片温度过高", "进风口温度过高", "散热不良"],
  电源: ["电源输出电压异常", "电源模块离线"],
  老化: ["设备运行时长超限", "关键部件老化预警"],
  内存: ["内存ECC错误", "内存容量识别异常"],
  网络: ["矿池连接失败", "网络延迟过高", "DNS解析失败"],
  频率: ["工作频率偏离目标值", "降频运行"],
  扫频: ["扫频失败", "频率校准异常"],
  性能: ["算力低于理论值", "性能模式异常"],
};

export const SITE_LINE_COLORS = [
  "#1677ff",
  "#52c41a",
  "#fa8c16",
  "#722ed1",
  "#13c2c2",
  "#eb2f96",
  "#2f54eb",
  "#faad14",
  "#ff4d4f",
  "#8c8c8c",
  "#597ef7",
  "#36cfc9",
];
