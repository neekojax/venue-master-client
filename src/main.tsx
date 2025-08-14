import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ConfigProvider } from "antd";
import { ErrorBoundary } from "./components/error-boundary";
import App from "./App";

import "antd/dist/reset.css"; // 这是必要的重置样式
import "./styles/index.css";
import "./styles/light.css";
import "./styles/dark.css";
import "./styles/table.css";
import "./styles/radio.css";
import "./styles/custom-select.css";
import "./styles/extend.css";

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
