import { Bitcoin, Calculator, Cpu, Database, Globe, Search, TrendingUp, Wrench } from "lucide-react";
import { ChartDataPoint, UtilityTool } from "./types.ts";

export const UTILITY_TOOLS: UtilityTool[] = [
  {
    id: "asset-management",
    name: "资产管理系统",
    description: "全面管理矿机资产，包括入库、分配、状态监控及资产盘点。",
    icon: <Database className="w-6 h-6 text-purple-500" />,
    // color: "bg-purple-50",
    // isSystem: true,
    url: "https://asset.datastring.cc/",
  },

  {
    id: "hashprice",
    name: "Hashprice 指数",
    description: "追踪比特币挖矿单位算力的实时价值 (USD/TH/day)，掌握核心收益指标。",
    // icon: hashrate,
    icon: <TrendingUp className="w-6 h-6 text-amber-500" />,
    url: "https://data.hashrateindex.com/network-data/bitcoin-hashprice-index",
  },

  {
    id: "global-hashrate",
    name: "全网算力",
    description: "查看比特币全网平均算力波动。",
    icon: <Search className="w-6 h-6 text-blue-500" />,
    url: "https://explorer.cloverpool.com/zh-CN/btc/insights-hashrate",
  },
  {
    id: "global-difficulty",
    name: "全网难度趋势",
    description: "预测下一次挖矿难度调整的时间与幅度，辅助运营决策。",
    icon: <Cpu className="w-6 h-6 text-cyan-500" />,
    // icon: "https://cdn-icons-png.flaticon.com/512/2092/2092663.png",
    url: "https://explorer.cloverpool.com/zh-CN/btc/insights-difficulty",
  },
  {
    id: "maintenance",
    name: "维修管理系统",
    description: "记录矿机故障、维修进度及备件消耗，提升设备在线率。",
    icon: <Wrench className="w-6 h-6 text-rose-500" />,
    // color: "bg-rose-50",
    // isSystem: true,
    url: "https://repair.datastring.cc/",
  },
  {
    id: "btc-explorer",
    name: "Cloverpool 浏览器",
    description: "专业、快速的比特币区块浏览器，实时监控区块生成与交易确认情况。",
    // icon: "https://cdn-icons-png.flaticon.com/512/5968/5968260.png",
    icon: <Bitcoin className="w-6 h-6 text-orange-500" />,
    url: "https://explorer.cloverpool.com/zh-CN/btc",
  },
  {
    id: "cryptopanic",
    name: "CryptoPanic 资讯",
    description: "实时聚合全球加密货币行业新闻，掌握影响币价与难度的宏观动态。",
    icon: <Globe className="w-6 h-6 text-indigo-500" />,
    // icon: "https://cdn-icons-png.flaticon.com/512/3067/3067451.png",
    url: "https://cryptopanic.com/",
  },
  {
    id: "mining-calculator",
    name: "挖矿收益计算器",
    description: "基于实时全网难度与币价，快速计算不同型号矿机的每日预估收益。",
    // icon: "https://cdn-icons-png.flaticon.com/512/2652/2652218.png",
    icon: <Calculator className="w-6 h-6 text-emerald-500" />,
    url: "https://explorer.cloverpool.com/zh-CN/btc/mining-calculator",
  },
];

export const PERFORMANCE_DATA: ChartDataPoint[] = [
  { date: "01-05", value: 82 },
  { date: "01-07", value: 78 },
  { date: "01-09", value: 85 },
  { date: "01-11", value: 88 },
  { date: "01-13", value: 84 },
  { date: "01-15", value: 82 },
  { date: "01-17", value: 84 },
  { date: "01-19", value: 88 },
  { date: "01-21", value: 75 },
  { date: "01-23", value: 72 },
  { date: "01-25", value: 68 },
  { date: "01-27", value: 70 },
  { date: "01-29", value: 74 },
  { date: "01-31", value: 72 },
  { date: "02-02", value: 78 },
];
