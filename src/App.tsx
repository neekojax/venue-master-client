import { RouterProvider } from "react-router-dom";
import { App as AntdApp } from "antd";
import { AntdConfigProvider } from "./components/antd-config-provider";
import { StaticAntd } from "./components/static-antd";
import { ThemeProvider } from "./components/theme-provider";
import { router } from "./router";

export default function App() {
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
