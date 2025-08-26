import { useEffect } from "react";
import { RouterProvider, useLocation } from "react-router-dom";
import { App as AntdApp } from "antd";
import { AntdConfigProvider } from "./components/antd-config-provider";
import { StaticAntd } from "./components/static-antd";
import { ThemeProvider } from "./components/theme-provider";
import { router } from "./router";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    console.log("路由切换到:", location.pathname);
    // index.tsx 或 main.tsx
    window.addEventListener(
      "error",
      (event: any) => {
        // 专门针对 JS 脚本加载失败的情况
        // alert(event.target?.tagName)
        console.log(event.target?.tagName);
        if (event.target?.tagName === "SCRIPT" && event.target.src?.includes(".js")) {
          console.error("检测到 JS 资源加载失败:", event.target.src);

          // 避免死循环，加个标志
          if (!sessionStorage.getItem("reload-once")) {
            sessionStorage.setItem("reload-once", "true");
            window.location.reload();
          }
        }
      },
      true,
    ); // ⚠️ 注意这里必须用捕获阶段 true

    window.addEventListener("unhandledrejection", (event) => {
      alert(event.reason?.message);
      if (event.reason?.message?.includes("Failed to fetch dynamically imported module")) {
        console.error("动态模块加载失败:", event.reason);

        if (!sessionStorage.getItem("reload-once")) {
          sessionStorage.setItem("reload-once", "true");
          window.location.reload();
        }
      }
    });

    // 这里放全局执行的逻辑
  }, [location]);
  return (
    <ThemeProvider>
      <AntdConfigProvider>
        <AntdApp>
          <StaticAntd />
          <RouterProvider
            router={router}
            future={{
              v7_startTransition: true,
            }}
          />
        </AntdApp>
      </AntdConfigProvider>
    </ThemeProvider>
  );
}

// 在入口文件 index.tsx 或 App.tsx 中设置
// const resizeFont = () => {
//   const baseSize = window.innerWidth / 100;
//   document.documentElement.style.fontSize = baseSize / 16 + 'rem';
// };
// window.addEventListener('resize', resizeFont);
// resizeFont(); // 初始化
