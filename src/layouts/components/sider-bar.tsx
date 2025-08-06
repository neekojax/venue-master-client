import { useEffect, useRef, useState } from "react";
import { FaRegChartBar } from "react-icons/fa";
import { MdMonitorHeart } from "react-icons/md";
import { SiNginxproxymanager } from "react-icons/si";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { HomeOutlined } from "@ant-design/icons"; //<RadiusSettingOutlined />
import { Layout, Menu, type MenuProps } from "antd";
import { useTheme } from "@/components/theme-provider";
// import logo from "../../../public/logo.svg";
import logo from "../../../public/logo_middle.png";
import { ROUTE_PATHS } from "@/constants/common";
import { useSelector, useSettingsStore } from "@/stores";

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
        <img
          src={logo}
          alt="Logo"
          className="size-9"
          style={{ width: "2rem", height: "2rem", borderRadius: "0.5rem" }}
        />{" "}
        {/* 替换为 logo */}
        {collapsed ? null : (
          <span className="text-gradient-ripple" style={{ fontSize: "0.875rem" }}>
            运营管理系统
          </span>
        )}
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
