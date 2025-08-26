import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConfigProvider } from "antd";
import { ErrorBoundary } from "./components/error-boundary";
import App from "./App";

// import { setupGlobalErrorHandler } from "./utils/errorHandler";
import "antd/dist/reset.css"; // 这是必要的重置样式
import "./styles/index.css";
import "./styles/light.css";
import "./styles/dark.css";
import "./styles/table.css";
import "./styles/radio.css";
import "./styles/custom-select.css";
import "./styles/extend.css";

// setupGlobalErrorHandler();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10_000, // 数据变得 "陈旧"（stale）的时间 10s
      refetchOnWindowFocus: false, // 窗口聚焦时重新获取数据
      refetchOnReconnect: false, // 网络重新连接时重新获取数据
      retry: false, // 失败时重试
    },
  },
});

// 假设你的当前版本号
// const CURRENT_VERSION = "1.0.4";

// // 获取 localStorage 中的版本号
// const storedVersion = localStorage.getItem("APP_VERSION");

// // 获取所有 cookies 的函数
// function getAllCookies(): string[] {
//   return document.cookie.split(";").map((c) => c.trim());
// }

// // 删除所有 cookies
// function clearAllCookies() {
//   const cookies = getAllCookies();
//   for (const cookie of cookies) {
//     const eqPos = cookie.indexOf("=");
//     const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
//     document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
//   }
// }

// // 判断是否有版本号
// if (!storedVersion) {
//   // 没有版本号，第一次访问，写入版本号
//   localStorage.setItem("APP_VERSION", CURRENT_VERSION);
// } else if (storedVersion !== CURRENT_VERSION) {
//   // 版本号不同，说明是新版本
//   clearAllCookies(); // 清除所有 cookies
//   localStorage.setItem("APP_VERSION", CURRENT_VERSION); // 更新版本号
//   window.location.reload(); // 刷新页面
// } else {
//   // 版本号一致，无操作
//   console.log("版本号一致，无需处理");
// }

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ConfigProvider
          theme={{
            // algorithm: MappingAlgorithm.Light,
            token: {
              colorPrimary: "#1890ff", // 主色调：亮蓝
              colorInfo: "#1890ff", // 信息色
              colorSuccess: "#52c41a", // 成功绿
              colorWarning: "#faad14", // 警告橙
              colorError: "#ff4d4f", // 错误红
              colorText: "#1f1f1f", // 主文本色
              colorBgContainer: "#ffffff", // 主容器背景色
              colorBorder: "#d9d9d9", // 边框色
            },
          }}
        >
          <App />
        </ConfigProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </HelmetProvider>
  </ErrorBoundary>,
);
