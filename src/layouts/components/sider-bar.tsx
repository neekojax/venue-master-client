import { useEffect, useRef, useState } from "react";
import { BiLoaderCircle } from "react-icons/bi";
import { MdMonitorHeart } from "react-icons/md";
import { SiNginxproxymanager } from "react-icons/si";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HomeOutlined, ProductOutlined, RadiusSettingOutlined } from "@ant-design/icons"; //<RadiusSettingOutlined />
import { Layout, Menu, type MenuProps } from "antd";
import { useTheme } from "@/components/theme-provider";
import logo from "../../../public/logo.svg";
import { ROUTE_PATHS } from "@/constants/common";
import { useSelector, useSettingsStore } from "@/stores";
import { FaRegChartBar } from "react-icons/fa";

// 递归函数，找到匹配的菜单项
const findSelectedKeys = (items: MenuProps["items"], pathname: string, path: string[] = []) => {
  const selectedKeys: string[] = [];
  let openKeys: string[] = [];

  const travel = (items: MenuProps["items"], pathname: string, path: string[]) => {
    for (const item of items!) {
      if (item!.key === pathname) {
        selectedKeys.push(item!.key);
        openKeys = [...path];
        return;
      }
      if ((item as any).children) {
        path.push(item!.key as string);
        travel((item as any).children, pathname, path);
        path.pop();
      }
    }
  };

  travel(items, pathname, path);
  return { selectedKeys, openKeys };
};

const items: MenuProps["items"] = [
  // {
  //   icon: <HomeOutlined />,
  //   label: <Link to={ROUTE_PATHS.dashboard}>首页改版</Link>,
  //   key: ROUTE_PATHS.dashboard,
  // },
  {
    icon: <HomeOutlined />,
    label: <Link to={ROUTE_PATHS.landing}>首页</Link>,
    key: ROUTE_PATHS.landing,
  },
  {
    icon: <MdMonitorHeart />,
    label: "算力监控",
    key: ROUTE_PATHS.mining,
    children: [
      {
        key: ROUTE_PATHS.miningHashRate,
        label: <Link to={ROUTE_PATHS.miningHashRate}>实时算力</Link>,
      },
      {
        key: ROUTE_PATHS.miningSetting,
        label: <Link to={ROUTE_PATHS.miningSetting}>矿池设置</Link>,
      },
    ],
  },
  {
    icon: <SiNginxproxymanager />,
    label: "场地管理",
    key: ROUTE_PATHS.venue,
    children: [
      {
        key: ROUTE_PATHS.miningSiteData,
        label: <Link to={ROUTE_PATHS.miningSiteData}>运行指标</Link>,
      },
      {
        key: ROUTE_PATHS.eventLog,
        label: <Link to={ROUTE_PATHS.eventLog}>事件日志</Link>,
      },
      {
        key: ROUTE_PATHS.venueSetting,
        label: <Link to={ROUTE_PATHS.venueSetting}>场地设置</Link>,
      },
    ],
  },
  {
    icon: <FaRegChartBar />,
    label: "报表",
    key: ROUTE_PATHS.report,
    children: [
      {
        key: ROUTE_PATHS.dailyReport,
        label: <Link to={ROUTE_PATHS.dailyReport}>运营日报</Link>,
      },
    ],
  },
  {
    icon: <ProductOutlined />,
    label: "电费监控",
    key: ROUTE_PATHS.custodyMenu,
    children: [
      // {
      //   key: ROUTE_PATHS.setting,
      //   label: <Link to={ROUTE_PATHS.setting}>基础设置</Link>,
      // },
      {
        key: ROUTE_PATHS.statistics,
        // label: "信息统计"
        label: <Link to={ROUTE_PATHS.statistics}>费用统计</Link>,
      },
      {
        key: ROUTE_PATHS.dailyAveragePrice,
        // label: "BTC均价"
        label: <Link to={ROUTE_PATHS.dailyAveragePrice}>BTC均价</Link>,
      },
    ],
  },
  {
    icon: <BiLoaderCircle />,
    label: "电网数据",
    key: ROUTE_PATHS.electric,
    children: [
      {
        key: ROUTE_PATHS.electricLimit,
        label: <Link to={ROUTE_PATHS.electricLimit}>限电记录</Link>,
      },
      {
        key: ROUTE_PATHS.electricAverage,
        label: <Link to={ROUTE_PATHS.electricAverage}>平均电价</Link>,
      },
      {
        key: ROUTE_PATHS.electricBasic,
        label: <Link to={ROUTE_PATHS.electricBasic}>基础数据</Link>,
      },
    ],
  },
  // {
  //   icon: <MenuOutlined />,
  //   label: "收益管理",
  //   key: ROUTE_PATHS.nestMenu,
  //   children: [
  //     {
  //       key: ROUTE_PATHS.link,
  //       label: <Link to={ROUTE_PATHS.link}>观察者链接</Link>,
  //     },
  //     {
  //       key: ROUTE_PATHS.report,
  //       label: <Link to={ROUTE_PATHS.report}>收益记录</Link>,
  //     },
  //   ],
  // },
  {
    icon: <RadiusSettingOutlined />,
    label: <Link to={ROUTE_PATHS.base}>模版管理</Link>,
    key: ROUTE_PATHS.base,
  },
];

export default function SiderBar() {
  const location = useLocation();
  const navigate = useNavigate();

  const firstRenderRef = useRef(true);

  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const { collapsed } = useSettingsStore(useSelector(["collapsed"]));

  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (location.pathname === "/") return;

    const { selectedKeys, openKeys } = findSelectedKeys(items, location.pathname);
    setSelectedKeys(selectedKeys);
    // 首次渲染时，设置默认值
    if (firstRenderRef.current) {
      setOpenKeys(openKeys);
    }
    // 将首次渲染标记设置为false
    firstRenderRef.current = false;
  }, [location.pathname]);

  return (
    <Layout.Sider
      trigger={null}
      collapsible
      collapsed={collapsed}
      theme={isDarkMode ? "dark" : "light"}
      className="h-screen overflow-auto !sticky top-0 left-0 start-0"
      style={{
        width: "265px !important",
      }}
    >
      <Link
        className="font-bold text-xl hover:text-current h-16 flex justify-center items-center gap-2 text-nowrap"
        to="/"
      >
        {/*<PandaIcon className="size-9" />*/}
        <img src={logo} alt="Logo" className="size-9" /> {/* 替换为 logo */}
        {collapsed ? null : <span className="text-gradient-ripple">运营管理系统</span>}
      </Link>
      {/* <div className="aside"> */}
      <Menu
        theme={isDarkMode ? "dark" : "light"}
        mode="inline"
        items={items}
        selectedKeys={selectedKeys}
        onSelect={({ selectedKeys }) => {
          setSelectedKeys(selectedKeys);
        }}
        openKeys={openKeys}
        onOpenChange={(openKeys) => setOpenKeys(openKeys)}
        className="!border-e-0"
        onClick={({ key }) => navigate(key)} // ✅ 跳转页面
      />
      {/* </div> */}
    </Layout.Sider>
  );
}
