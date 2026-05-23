import { useMemo, useState } from "react";
import { ArrowDownOutlined, SearchOutlined } from "@ant-design/icons";
import { Input, Spin, Tooltip, Typography } from "antd";
import { FARM_MONITOR_TOP_HEIGHT } from "../constants";
import type { FarmSite } from "../mockData";
import { formatTotalHashrateE } from "../utils";

const { Text } = Typography;

const DOT_ACTIVE = "#52c41a";
const DOT_ZERO = "#ff4d4f";

function siteDotColor(hashrate: number) {
  return hashrate > 0 ? DOT_ACTIVE : DOT_ZERO;
}

interface FarmSiteListProps {
  sites: FarmSite[];
  selectedId: string | null;
  loading?: boolean;
  onSelect: (id: string | null) => void;
}

export default function FarmSiteList({ sites, selectedId, loading, onSelect }: FarmSiteListProps) {
  const [keyword, setKeyword] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  const filteredSites = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const list = kw ? sites.filter((s) => s.name.toLowerCase().includes(kw)) : [...sites];
    list.sort((a, b) => (sortDesc ? b.hashrate - a.hashrate : a.hashrate - b.hashrate));
    return list;
  }, [sites, keyword, sortDesc]);

  return (
    <div
      className="w-[260px] shrink-0 flex flex-col bg-white rounded-lg border border-gray-200 overflow-hidden isolate"
      style={{ height: FARM_MONITOR_TOP_HEIGHT }}
    >
      <div className="px-4 pt-4 pb-3 border-b border-gray-100 shrink-0">
        <div className="mb-3">
          <div className="text-base font-semibold text-gray-800 leading-tight">场地列表</div>
          <Text type="secondary" className="text-xs">
            {sites.length} 个场地
          </Text>
        </div>
        <Input
          allowClear
          size="middle"
          placeholder="搜索场地名称"
          prefix={<SearchOutlined className="text-gray-300" />}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>

      <div className="flex items-center justify-between px-4 py-2 text-xs text-gray-400 border-b border-gray-50 shrink-0">
        <span>场地名称</span>
        <button
          type="button"
          className="flex items-center gap-0.5 text-gray-500 hover:text-blue-500 border-0 bg-transparent cursor-pointer p-0"
          onClick={() => setSortDesc((v) => !v)}
        >
          总算力
          <ArrowDownOutlined
            className="text-[10px] transition-transform"
            style={{ transform: sortDesc ? "none" : "rotate(180deg)" }}
          />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Spin />
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-sm">暂无匹配场地</div>
        ) : (
          filteredSites.map((site) => {
            const active = selectedId === site.id;
            return (
              <button
                key={site.id}
                type="button"
                onClick={() => onSelect(site.id)}
                className={`w-full flex items-center gap-2.5 py-2.5 text-left border-0 border-b border-gray-100 cursor-pointer transition-colors ${
                  active
                    ? "bg-[#e6f4ff] pl-[13px] pr-4 border-l-[3px] border-l-[#1677ff]"
                    : "bg-white hover:bg-gray-50 pl-4 pr-4 border-l-[3px] border-l-transparent"
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: siteDotColor(site.hashrate) }}
                />
                <Tooltip title={site.name} placement="topLeft" mouseEnterDelay={0.3}>
                  <span
                    className={`flex-1 min-w-0 block truncate text-sm ${
                      active ? "text-[#1677ff] font-medium" : "text-gray-700"
                    }`}
                  >
                    {site.name}
                  </span>
                </Tooltip>
                <span
                  className={`shrink-0 text-xs font-medium tabular-nums ${
                    active ? "text-[#1677ff]" : "text-gray-800"
                  }`}
                >
                  {formatTotalHashrateE(site.hashrate)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
