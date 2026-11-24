import { useState } from "react";
import { CheckOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Select } from "antd";
import type { BoundSiteItem } from "../types";

import { t } from "@/locales";

interface Props {
  sites: BoundSiteItem[];
  value: string;
  loading: boolean;
  onChange: (siteCode: string) => void;
}

export default function ComparisonSiteSelect({ sites, value, loading, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const words = query.split(/\s+/).filter(Boolean);
  const options = sites.map((site) => ({
    label: site.site_name?.trim() || site.site_code,
    value: site.site_code,
  }));
  const selectedName = options.find((option) => option.value === value)?.label;
  const selectedTitle = selectedName && selectedName !== value ? `${selectedName} · ${value}` : value;
  let matches = options;
  if (words.length) {
    matches = options.filter((option) => {
      const text = `${option.label} ${option.value}`.toLowerCase();
      return words.every((word) => text.includes(word));
    });
  }

  const escapedWords = words.map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const pattern = words.length && matches.length ? new RegExp(`(${escapedWords.join("|")})`, "i") : null;
  function highlight(text: string) {
    if (!pattern) return text;
    return text.split(pattern).map((part, index) =>
      index % 2 ? (
        <mark key={index} className="rounded-sm bg-blue-100 text-blue-900">
          {part}
        </mark>
      ) : (
        part
      ),
    );
  }

  const hint = t("搜索场地名称或代码");
  return (
    <div className="hashrate-filter-field hashrate-site-filter">
      <label htmlFor="hashrate-site">{t("场地")}</label>
      <Select
        id="hashrate-site"
        title={open ? undefined : selectedTitle || undefined}
        size="middle"
        classNames={{ popup: { root: "hashrate-site-menu" } }}
        showSearch
        virtual={false}
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setSearch("");
        }}
        prefix={<EnvironmentOutlined aria-hidden />}
        searchValue={search}
        onSearch={setSearch}
        filterOption={false}
        options={matches}
        value={value || undefined}
        onChange={onChange}
        loading={loading}
        placeholder={open ? hint : t("请选择场地")}
        listHeight={280}
        labelRender={({ label, value: code }) =>
          open ? (
            <span className="text-gray-500">{hint}</span>
          ) : (
            <span className="flex min-w-0 items-center gap-2">
              <span className="hashrate-site-name min-w-0" dir="rtl">
                <bdi>{label}</bdi>
              </span>
              {label !== code && <span className="hashrate-selected-code">{code}</span>}
            </span>
          )
        }
        optionRender={({ data }) => (
          <span className="flex items-center justify-between gap-3 py-1">
            <span className="min-w-0 whitespace-normal [overflow-wrap:anywhere]">
              <span className="block text-sm font-medium leading-5">{highlight(data.label)}</span>
              {data.label !== data.value && (
                <span className="block font-mono text-xs font-normal leading-5 text-slate-500">
                  {highlight(data.value)}
                </span>
              )}
            </span>
            {data.value === value && <CheckOutlined aria-hidden className="shrink-0 text-blue-600" />}
          </span>
        )}
        popupRender={(menu) => (
          <>
            {menu}
            {matches.length > 0 && (
              <div className="border-t border-slate-100 px-3 py-1.5 text-xs text-slate-500" role="status">
                {words.length
                  ? t("匹配 {{count}} 个场地", { count: matches.length })
                  : t("共 {{total}} 个场地", { total: sites.length })}
              </div>
            )}
          </>
        )}
        notFoundContent={
          <span role="status">
            {sites.length ? t("暂无匹配场地") : loading ? t("正在加载场地") : t("暂无可查询场地")}
          </span>
        }
      />
    </div>
  );
}
