import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  ChevronDown,
  ChevronRight,
  FileText,
  Home,
  LayoutDashboard,
  MapPin,
  Server,
  Settings,
  Zap,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
const logo = "/logo_middle.png";
import { ROUTE_PATHS } from "@/constants/common";
import { useSelector, useSettingsStore } from "@/stores";

const SiderItems = () => {
  const showNDPoolType = useSettingsStore((state) => state.poolType);
  return [
    {
      icon: <Home size={20} />,
      label: "首页",
      key: ROUTE_PATHS.landing,
      path: ROUTE_PATHS.landing,
    },
    {
      icon: <Activity size={20} />,
      label: "算力监控",
      key: ROUTE_PATHS.mining,
      children: [
        {
          key: ROUTE_PATHS.miningHashRate,
          label: "实时算力",
          path: ROUTE_PATHS.miningHashRate,
        },
        {
          key: ROUTE_PATHS.miningSetting,
          label: "矿池设置",
          path: ROUTE_PATHS.miningSetting,
        },
      ],
    },
    {
      icon: <MapPin size={20} />,
      label: "场地管理",
      key: ROUTE_PATHS.venue,
      children: [
        ...(showNDPoolType == "CANG"
          ? [
              {
                key: ROUTE_PATHS.venueEnvironment,
                label: "场地环境",
                path: ROUTE_PATHS.venueEnvironment,
              },
              {
                key: ROUTE_PATHS.venueWeather,
                label: "场地天气",
                path: ROUTE_PATHS.venueWeather,
              },
            ]
          : []),
        {
          key: ROUTE_PATHS.eventLog,
          label: "事件日志",
          path: ROUTE_PATHS.eventLog,
        },
        {
          key: ROUTE_PATHS.venueSetting,
          label: "场地设置",
          path: ROUTE_PATHS.venueSetting,
        },
      ],
    },
    {
      icon: <FileText size={20} />,
      label: "报表",
      key: ROUTE_PATHS.report,
      children: [
        ...(showNDPoolType == "CANG"
          ? [
              {
                key: ROUTE_PATHS.dataSummary,
                label: "数据概览",
                path: ROUTE_PATHS.dataSummary,
              },
            ]
          : []),
        ...(showNDPoolType !== "LN" && showNDPoolType !== "ND1" && showNDPoolType !== "ND2"
          ? [
              {
                key: ROUTE_PATHS.dailyReport,
                label: "运营日报",
                path: ROUTE_PATHS.dailyReport,
              },
            ]
          : []),
        ...(showNDPoolType !== "CANG"
          ? [
              {
                key: ROUTE_PATHS.subAccountDailyReport,
                label: "账户日报",
                path: ROUTE_PATHS.subAccountDailyReport,
              },
            ]
          : []),
        {
          key: ROUTE_PATHS.weekReport,
          label: "运营周报",
          path: ROUTE_PATHS.weekReport,
        },
      ].filter(Boolean),
    },
    {
      icon: <Zap size={20} />,
      label: "电费监控",
      key: ROUTE_PATHS.custodyMenu,
      children: [
        {
          key: ROUTE_PATHS.statistics,
          label: "费用统计",
          path: ROUTE_PATHS.statistics,
        },
        ...(showNDPoolType == "CANG"
          ? [
              {
                key: ROUTE_PATHS.venueBill,
                label: "电费参数",
                path: ROUTE_PATHS.venueBill,
              },
            ]
          : []),
      ],
    },
  ];
};

export default function SiderBar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { collapsed } = useSettingsStore(useSelector(["collapsed"]));
  const menuItems = SiderItems();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  // Initialize open menus based on current path
  useEffect(() => {
    const newOpenMenus: Record<string, boolean> = {};
    menuItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child: any) => location.pathname === child.path || location.pathname.startsWith(child.path),
        );
        if (hasActiveChild) {
          newOpenMenus[item.label as string] = true;
        }
      }
    });
    setOpenMenus((prev) => ({ ...prev, ...newOpenMenus }));
  }, [location.pathname]);

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  return (
    <aside
      className={`bg-black text-slate-400 flex flex-col h-screen fixed left-0 top-0 z-50 shadow-xl font-sans transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div
        className={`h-20 flex items-center ${collapsed ? "justify-center px-0" : "px-6"} bg-slate-900/50 border-b border-white/10 transition-all duration-300`}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10 relative overflow-hidden group shrink-0">
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
          <img src={logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
        </div>
        {!collapsed && (
          <div className="ml-3 overflow-hidden whitespace-nowrap">
            <h1 className="font-bold text-white tracking-wide text-sm leading-tight">运营管理系统</h1>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-0.5">
              Operation System
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar py-6">
        <nav className="space-y-1.5 px-3">
          {menuItems.map((item) => (
            <div key={item.key}>
              {item.children && item.children.length > 0 ? (
                <div>
                  <button
                    onClick={() => !collapsed && toggleMenu(item.label as string)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                      openMenus[item.label as string]
                        ? "bg-slate-900 text-white"
                        : "hover:bg-slate-900 hover:text-white"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                    title={collapsed ? (item.label as string) : ""}
                  >
                    <div className={`flex items-center gap-3 ${collapsed ? "justify-center w-full" : ""}`}>
                      {item.icon}
                      {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                    </div>
                    {!collapsed &&
                      (openMenus[item.label as string] ? (
                        <ChevronDown size={14} />
                      ) : (
                        <ChevronRight size={14} />
                      ))}
                  </button>

                  {!collapsed && openMenus[item.label as string] && (
                    <div className="mt-1 mb-2 ml-4 space-y-1 pl-4 border-l border-slate-800">
                      {item.children.map((sub: any) => (
                        <button
                          key={sub.key}
                          onClick={() => handleNavigate(sub.path)}
                          className={`w-full text-left px-4 py-2 text-sm rounded-lg transition-all ${
                            location.pathname === sub.path
                              ? "text-white bg-slate-800"
                              : "text-slate-500 hover:text-white hover:bg-slate-900/50"
                          }`}
                        >
                          {sub.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => handleNavigate(item.path!)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    location.pathname === item.path
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                      : "hover:bg-slate-900 hover:text-white"
                  } ${collapsed ? "justify-center px-2" : ""}`}
                  title={collapsed ? (item.label as string) : ""}
                >
                  {item.icon}
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </button>
              )}
            </div>
          ))}
        </nav>
      </div>

      {!collapsed && (
        <div className="p-4 bg-black border-t border-white/5 text-xs text-center text-slate-600">
          v2.5.0 &copy; 2024 运营管理系统
        </div>
      )}
    </aside>
  );
}
