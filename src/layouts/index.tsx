import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { useLocation } from "react-router-dom";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Flex, Layout } from "antd";
import { AppHelmet } from "@/components/helmet";
import LanguageSwitch from "@/components/language-switch";
import Breadcrumb from "./components/bread-crumb";
import Content from "./components/main-content";
import NetworkEfficiencyCard from "./components/NetworkEfficiencyCard.tsx";
import SiderBar from "./components/sider-bar";
import UserAvatar from "./components/user-avatar";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { setCollapsed, useSelector, useSettingsStore } from "@/stores";
import { setPoolType } from "@/stores"; // 引入自定义选择器

import PoolTypeSelect from "@/layouts/components/pool-type-select.tsx";
import { t } from "@/locales";
import { checkPermission } from "@/service/api/auth";

export default function MainLayout() {
  useAuthRedirect();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  // const [suanlilv, setSuanlilv] = useState<number>(0);
  const [suanlilv, setSuanlilv] = useState<any>({});
  const { collapsed } = useSettingsStore(useSelector(["collapsed"]));
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // 状态管理 SiderBar 显示与否
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });
  const location = useLocation();
  useEffect(() => {
    if (isMobile) {
      setIsSidebarVisible(false); // 手机端默认关闭 SiderBar
    } else {
      setIsSidebarVisible(true); // 电脑端默认显示 SiderBar
    }
  }, [isMobile]);

  // 设置header阴影
  useEffect(() => {
    // 初始从 localStorage 读取
    const localData = localStorage.getItem("suanlilv");
    if (localData) {
      setSuanlilv(JSON.parse(localData));
    }

    const handleScroll = () => {
      const scrollTop = document.scrollingElement?.scrollTop || document.body.scrollTop;
      const className = "shadow-[0_6px_10px_-10px_rgba(0,0,0,0.3)]";
      if (scrollTop > 0) {
        document.getElementById("app-header-bar")?.classList.add(className);
      } else {
        document.getElementById("app-header-bar")?.classList.remove(className);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // 每次路由变化都会调用
    const verify = async () => {
      try {
        const res = await checkPermission();
        const data = res?.data ?? {};
        const domainMap = (data as any)?.domains;
        const organizations: string[] =
          domainMap && typeof domainMap === "object" ? Object.keys(domainMap) : [];
        const assignments: any[] = Array.isArray((data as any)?.assignments) ? (data as any).assignments : [];
        const permissionKeys: string[] = Array.isArray((data as any)?.permissions)
          ? (data as any).permissions
          : [];
        const frontendRouteItems: any[] = Array.isArray((data as any)?.frontend_routes)
          ? (data as any).frontend_routes
          : [];
        const frontend_routes = frontendRouteItems
          .map((item: any) => (typeof item === "string" ? item : item?.path))
          .filter((path: any) => typeof path === "string" && path.length > 0)
          .join(",");
        const access_level = assignments
          .map((item: any) => item?.role_template_id)
          .filter((id: any) => typeof id === "string" && id.length > 0)
          .join(",");
        const apiPermissions: any[] = [];
        const api_permissions_paths = "";
        // console.log(" poolType", poolType);
        // console.log("organizations", organizations);
        // console.log("poolType", poolType);
        // console.log(" organizations.indexOf(poolType)", organizations.indexOf(poolType));
        if (organizations.indexOf(poolType) == -1 || !JSON.stringify(organizations).includes(poolType)) {
          // console.log("organizations", organizations);
          // console.log("poolType", poolType);
          // localStorage.setItem("poolType", organizations[0]);
          setPoolType(organizations[0] === "CANGO" ? "CANG" : organizations[0]);
        }
        localStorage.setItem("api_permissions", JSON.stringify(apiPermissions));
        localStorage.setItem("api_permissions_paths", api_permissions_paths);
        localStorage.setItem("authz_permissions", permissionKeys.join(","));
        localStorage.setItem("authz_policy_version", String((data as any)?.policy_version ?? ""));
        localStorage.setItem("groups", JSON.stringify(organizations));

        // localStorge.setItem("access_level", access_level);
        // if(permissionIdString=="role-venue-ops"){
        //   window.location.href = "/login";
        // }
        // 输出并保存，便于后续使用
        // console.log('permissionIdString', permissionIdString);
        try {
          localStorage.setItem("permission_ids", access_level);
          localStorage.setItem("permission_routes", frontend_routes);
          // 广播权限变更事件，便于侧边栏等组件实时响应
          window.dispatchEvent(
            new CustomEvent("permission_ids_updated", {
              detail: {
                groups: organizations,
                permission_ids: access_level,
                access_level,
                frontend_routes,
                api_permissions_paths,
                authz_permissions: permissionKeys.join(","),
              },
            }),
          );
        } catch (err) {
          console.log("权限广播error", err);
        }

        // const Permission = data.array.forEach();
        // ((item: any) => item.id !== 1);
        // console.log('hasPermission', hasPermission);
        // if () {
        //   window.location.href = "/login";
        //   return;
        // }
        // const hasPermission = data.some((item: any) => item.path === location.pathname);
        // console.log('hasPermission', hasPermission);

        // if (location.pathname === "/login") {
        //   return;
        // }
        // window.location.href = "/login";
        // console.log('权限结果', location.pathname, res);
        // if (location.pathname === "/login") {
        //   return;
        // }

        // if (!res?.data?.length) {
        //   // 没有权限，重定向到登录页
        //   window.location.href = "/login";
        //   return;
        // }
        // if (res?.data?.length === 0) {
        //   // 没有权限，重定向到登录页
        //   window.location.href = "/login";
        //   return;
        // }
      } catch (err) {
        console.error(err);
      }
    };
    verify();
  }, [location.pathname]); // 路径变化触发

  return (
    <>
      <AppHelmet />
      <Layout>
        {localStorage.getItem("user_access_level") != "special" && isSidebarVisible && <SiderBar />}{" "}
        {/* 根据状态显示 SiderBar */}
        <Layout>
          <Layout.Header
            id="app-header-bar"
            className="flex items-center sticky top-0 z-[999] pl-0 bg-white dark:bg-[#001529]"
          >
            {isMobile ? (
              // 手机端按钮
              <Button
                type="text"
                icon={isSidebarVisible ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => setIsSidebarVisible(!isSidebarVisible)} // 切换 SiderBar 状态
                className="mr-2"
              />
            ) : (
              // 电脑端按钮
              <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => {
                  setCollapsed(!collapsed); // 切换 collapsed 状态
                }}
                className="mr-2"
              />
            )}
            {localStorage.getItem("user_access_level") != "special" && <Breadcrumb />}
            <Flex gap={12} className="ml-auto items-center">
              {/*<CustomSkin />*/}
              {/*<ThemeSwitch />*/}
              {/* <NetworkEfficiencyCard value={12345} /> */}
              {localStorage.getItem("user_access_level") != "special" && (
                <>
                  <NetworkEfficiencyCard
                    title={t("昨日全网产出效率：")}
                    value={suanlilv?.BTCNetworkPerEPower}
                    unit="BTC/EH"
                  />
                  <PoolTypeSelect />
                </>
              )}
              <LanguageSwitch />
              <UserAvatar />
            </Flex>
          </Layout.Header>
          <Content />
          {/* <div v-show="">
            检测到系统有新版本发布，请立即刷新页面！
            <Button
              type="primary"
              onClick={() => {
                location.reload();

              }}
            >
              立即刷新
            </Button>
          </div> */}
        </Layout>
      </Layout>
    </>
  );
}
