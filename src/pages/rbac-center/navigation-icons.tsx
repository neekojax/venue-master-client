import type { ReactNode } from "react";
import { FaRegChartBar } from "react-icons/fa";
import { MdMonitorHeart } from "react-icons/md";
import { SiNginxproxymanager } from "react-icons/si";
import { WiDaySunny } from "react-icons/wi";
import {
  AppstoreOutlined,
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  CloudDownloadOutlined,
  CloudOutlined,
  ClusterOutlined,
  DatabaseOutlined,
  EnvironmentOutlined,
  FileTextOutlined,
  GlobalOutlined,
  GoldOutlined,
  HistoryOutlined,
  HomeOutlined,
  LineChartOutlined,
  LockOutlined,
  MoneyCollectOutlined,
  MonitorOutlined,
  PieChartOutlined,
  ProductOutlined,
  ProfileOutlined,
  RetweetOutlined,
  SafetyOutlined,
  SwapOutlined,
  ThunderboltOutlined,
  UserOutlined,
  WalletOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { FileText, ShieldCheck, Wrench } from "lucide-react";

export function NavigationIcon({ name }: { name: string }) {
  const icons: Record<string, ReactNode> = {
    首页: <HomeOutlined />,
    算力监控: <MdMonitorHeart />,
    场地管理: <SiNginxproxymanager />,
    报表: <FaRegChartBar />,
    电费监控: <ProductOutlined />,
    实用工具: <Wrench />,
    权限管理: <ShieldCheck />,
    操作日志: <FileText />,
  };
  return (
    <span className="authz-navigation-icon" aria-hidden="true">
      {icons[name] || <AppstoreOutlined />}
    </span>
  );
}

// 权限功能模块的图标；先按 resource key 匹配，再按显示名匹配（覆盖动态推断的模块名）。
const moduleIcons: Record<string, ReactNode> = {
  "*": <SafetyOutlined />,
  authz: <LockOutlined />,
  venue: <EnvironmentOutlined />,
  "venue-environment": <CloudOutlined />,
  weather: <WiDaySunny />,
  event: <FileTextOutlined />,
  "event-analysis": <LineChartOutlined />,
  report: <BarChartOutlined />,
  "week-report": <CalendarOutlined />,
  custody: <DatabaseOutlined />,
  "hosting-record": <HistoryOutlined />,
  "mining-pool": <GoldOutlined />,
  "pool-change": <SwapOutlined />,
  "asset-hashrate-change": <RetweetOutlined />,
  "miner-agent-monitor": <MonitorOutlined />,
  "asset-pool-record": <ProfileOutlined />,
  "asset-site": <ClusterOutlined />,
  "power-consumption": <ProductOutlined />,
  settlement: <MoneyCollectOutlined />,
  "data-summary": <PieChartOutlined />,
  "machine-failure": <WarningOutlined />,
  "network-stat": <GlobalOutlined />,
  "user-subscription": <BellOutlined />,
  "client-version": <CloudDownloadOutlined />,
  profile: <UserOutlined />,
  矿池算力: <ThunderboltOutlined />,
  矿池账户: <WalletOutlined />,
  场地天气: <WiDaySunny />,
  事件日志: <FileTextOutlined />,
  周报编辑: <CalendarOutlined />,
  矿池代理监控: <MonitorOutlined />,
};

export function ModuleIcon({ resource, name }: { resource: string; name: string }) {
  const icon = moduleIcons[resource] || moduleIcons[name] || <AppstoreOutlined />;
  return (
    <span className="authz-module-icon" aria-hidden="true">
      {icon}
    </span>
  );
}
