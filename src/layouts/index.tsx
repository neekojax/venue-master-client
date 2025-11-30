import { useEffect, useState } from "react";
import { useMediaQuery } from "react-responsive";
import { AppHelmet } from "@/components/helmet";
import Header from "./components/header";
import Content from "./components/main-content";
import SiderBar from "./components/sider-bar";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { setCollapsed, useSelector, useSettingsStore } from "@/stores";

export default function MainLayout() {
  useAuthRedirect();
  const { collapsed } = useSettingsStore(useSelector(["collapsed"]));
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const isMobile = useMediaQuery({ query: "(max-width: 768px)" });

  useEffect(() => {
    if (isMobile) {
      setIsSidebarVisible(false);
      if (!collapsed) setCollapsed(true);
    } else {
      setIsSidebarVisible(true);
    }
  }, [isMobile]);

  return (
    <>
      <AppHelmet />
      <div className="min-h-screen bg-[#f8fafc]">
        {localStorage.getItem("user_access_level") != "special" && (
          <div className={`${isMobile && !collapsed ? "block" : "hidden"} md:block`}>
            <SiderBar />
          </div>
        )}

        <div
          className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
            localStorage.getItem("user_access_level") == "special" ? "" : collapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          <Header collapsed={collapsed} setCollapsed={setCollapsed} />

          <main className="flex-1 overflow-y-auto">
            <Content />
          </main>
        </div>
      </div>
    </>
  );
}
