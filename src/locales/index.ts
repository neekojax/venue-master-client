import { initReactI18next } from "react-i18next";
import dayjs from "dayjs";
import i18n, { type TOptions } from "i18next";
import en from "./en.json";

import "dayjs/locale/zh-cn";

/** 语言持久化的 localStorage key（唯一事实来源） */
export const LANGUAGE_STORAGE_KEY = "app-language";

export type Language = "zh" | "en";

/** 支持的语言列表 */
export const LANGUAGES: { value: Language; label: string }[] = [
  { value: "zh", label: "简体中文" },
  { value: "en", label: "English" },
];

/** 读取当前语言（默认中文） */
export function getLanguage(): Language {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "en" || saved === "zh") return saved;
  } catch {
    // localStorage 不可用时忽略
  }
  return "zh";
}

/**
 * 初始化 i18next：
 * 采用「中文原文即 key」的自然键方案：
 * - keySeparator: false —— key 中允许包含 `. \` 等任意字符
 * - nsSeparator: false  —— 同上
 * - zh 语言包为空，缺失 key 时直接回退显示 key 本身（即中文原文）
 * - en 语言包提供「中文原文 -> 英文」映射
 */
i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: {} },
    en: { translation: en },
  },
  lng: getLanguage(),
  fallbackLng: "zh",
  keySeparator: false,
  nsSeparator: false,
  returnEmptyString: false,
  interpolation: {
    // React 已防 XSS，无需转义
    escapeValue: false,
  },
});

/** dayjs 语言联动（antd 日期组件依赖） */
export function syncDayjsLocale(lang: Language) {
  dayjs.locale(lang === "en" ? "en" : "zh-cn");
}
syncDayjsLocale(getLanguage());

/** 同步 <html lang> 属性 */
export function syncDocumentLang(lang: Language) {
  document.documentElement.lang = lang === "en" ? "en" : "zh-CN";
}
syncDocumentLang(getLanguage());

/**
 * 全局翻译函数（中文原文作为 key）。
 * 用法：t("昨日产出")、t("共{{count}}条", { count: 3 })
 */
export function t(key: string, options?: TOptions): string {
  return i18n.t(key, options);
}

/** 切换语言：持久化 + 切换 i18next/dayjs + 刷新页面（保证所有非 hook 的 t() 生效） */
export function setLanguage(lang: Language) {
  if (lang === getLanguage()) return;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // ignore
  }
  i18n.changeLanguage(lang);
  syncDayjsLocale(lang);
  syncDocumentLang(lang);
  window.location.reload();
}
