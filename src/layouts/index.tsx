import { useEffect, useState } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Flex, Layout } from "antd";
import { AppHelmet } from "@/components/helmet";
import { ThemeSwitch } from "@/components/theme-switch";
import Breadcrumb from "./components/bread-crumb";
import Content from "./components/main-content";
import SiderBar from "./components/sider-bar";
import UserAvatar from "./components/user-avatar";
import { setCollapsed, useSelector, useSettingsStore } from "@/stores";
import { useMediaQuery } from "react-responsive";

export default function MainLayout() {
  const { collapsed } = useSettingsStore(useSelector(["collapsed"]));
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // 状态管理 SiderBar 显示与否
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  useEffect(() => {
    if (isMobile) {
      setIsSidebarVisible(false); // 手机端默认关闭 SiderBar
    } else {
      setIsSidebarVisible(true); // 电脑端默认显示 SiderBar
    }
  }, [isMobile]);

  // 设置header阴影
  useEffect(() => {
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

  return (
    <>
      <AppHelmet />
      <Layout>
        {isSidebarVisible && <SiderBar />} {/* 根据状态显示 SiderBar */}
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
            <Breadcrumb />
            <Flex gap={12} className="ml-auto items-center">
              {/*<CustomSkin />*/}
              <ThemeSwitch />
              <UserAvatar />
            </Flex>
          </Layout.Header>
          <Content />
        </Layout>
      </Layout>
    </>
  );
}
