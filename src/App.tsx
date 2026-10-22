import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { App as AntdApp } from "antd";
import { AntdConfigProvider } from "./components/antd-config-provider";
import { ProgressBar } from "./components/progress-bar";
import { StaticAntd } from "./components/static-antd";
import { ThemeProvider } from "./components/theme-provider";
import { checkLogin } from "./utils/auth";
import { router } from "./router";

export default function App() {
  useEffect(() => {
    // index.tsx 或 main.tsx
    window.addEventListener(
      "error",
      (event: any) => {
        // 专门针对 JS 脚本加载失败的情况
        if (event.target?.tagName === "SCRIPT" && event.target.src?.includes(".js")) {
          // 避免死循环，按「路径」记录标志，单个路由的 chunk 失败只自动重载一次
          const reloadKey = `reload-once:${window.location.pathname}`;
          if (!sessionStorage.getItem(reloadKey)) {
            sessionStorage.setItem(reloadKey, "true");
            window.location.reload();
          }
        }
      },
      true,
    ); // ⚠️ 注意这里必须用捕获阶段 true

    window.addEventListener("unhandledrejection", (event) => {
      if (event.reason?.message?.includes("Failed to fetch dynamically imported module")) {
        console.error("动态模块加载失败:", event.reason);
        const reloadKey = `reload-once:${window.location.pathname}`;
        if (!sessionStorage.getItem(reloadKey)) {
          sessionStorage.setItem(reloadKey, "true");
          window.location.reload();
        }
      }
    });

    // 页面加载时检查一次
    checkLogin();

    // 每隔一定时间检查一次（可选）
    const interval = setInterval(() => {
      checkLogin();
    }, 5000); // 每 5 秒检查一次

    return () => clearInterval(interval);

    // 这里放全局执行的逻辑
  }, []);
  return (
    <ThemeProvider>
      <AntdConfigProvider>
        <AntdApp>
          <StaticAntd />
          <RouterProvider router={router} fallbackElement={<ProgressBar />} />
        </AntdApp>
      </AntdConfigProvider>
    </ThemeProvider>
  );
}
