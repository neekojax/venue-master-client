import { CheckOutlined, GlobalOutlined } from "@ant-design/icons";
import { Dropdown } from "antd";

import { getLanguage, type Language, LANGUAGES, setLanguage } from "@/locales";

/** 头部中英文切换按钮 */
export default function LanguageSwitch() {
  const current = getLanguage();
  const items = LANGUAGES.map((lang) => ({
    key: lang.value,
    label: (
      <div className="flex items-center justify-between gap-6 px-1 min-w-[120px]">
        <span>{lang.label}</span>
        {current === lang.value && <CheckOutlined style={{ color: "#2d8cf0" }} />}
      </div>
    ),
    onClick: () => setLanguage(lang.value as Language),
  }));

  return (
    <Dropdown menu={{ items, selectedKeys: [current] }} trigger={["click"]} placement="bottomRight">
      <div
        title="Language / 语言"
        className="flex items-center gap-1.5 rounded-full bg-blue-50/70 px-2.5 py-1.5 cursor-pointer hover:bg-blue-100/70 transition-colors text-sm font-medium text-slate-700"
      >
        <GlobalOutlined style={{ color: "#2d8cf0" }} />
        <span className="hidden sm:block">{current === "en" ? "EN" : "中文"}</span>
      </div>
    </Dropdown>
  );
}
