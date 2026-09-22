import type { PropsWithChildren } from "react";
import { legacyLogicalPropertiesTransformer, StyleProvider } from "@ant-design/cssinjs";
import { ConfigProvider, theme as antdTheme } from "antd";
import enUS from "antd/locale/en_US";
import { useTheme } from "../theme-provider";
import { useSelector, useSettingsStore } from "@/stores";

import zhCN from "antd/locale/zh_CN";

import { getLanguage } from "@/locales";

export function AntdConfigProvider({ children }: PropsWithChildren) {
  const { isDarkMode } = useTheme();
  const { defaultAlgorithm, darkAlgorithm } = antdTheme;
  const { colorPrimary } = useSettingsStore(useSelector(["colorPrimary"]));
  const antdLocale = getLanguage() === "en" ? enUS : zhCN;
  return (
    <StyleProvider hashPriority="high" transformers={[legacyLogicalPropertiesTransformer]}>
      <ConfigProvider
        locale={antdLocale}
        theme={{
          cssVar: true, // 开启 css 变量
          hashed: false, // 如果你的应用中只存在一个版本的 antd，你可以设置为 false 来进一步减小样式体积。
          algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
          token: {
            colorPrimary,
          },
          components: {
            Layout: {
              headerPadding: "0 24px",
              // siderBg: "#141414",
            },
            // Menu: {
            //   darkItemBg: "#141414",
            //   darkSubMenuItemBg: "#141414",
            // },
          },
        }}
        componentSize="large"
      >
        {children}
      </ConfigProvider>
    </StyleProvider>
  );
}
