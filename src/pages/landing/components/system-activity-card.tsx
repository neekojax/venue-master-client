import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "antd";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  AlertOctagon,
  CheckCircle2,
  CloudLightning,
  Inbox,
  Power,
  Scroll,
  Settings,
  Thermometer,
  Wifi,
  Wrench,
  Zap,
} from "lucide-react";
import { ROUTE_PATHS } from "@/constants/common";
import { useSelector, useSettingsStore } from "@/stores";
import { getTimeDifference } from "@/utils/date";

import { fetchEventLogWithFilter } from "@/pages/venue/api.tsx";

dayjs.extend(relativeTime);

interface LogItemProps {
  eventTypeLabel: string;
  icon: React.ReactNode;
  tone: "success" | "error" | "info" | "warning" | "primary" | "neutral";
  title: string;
  venueName: string;
  impactCount: string;
  impactDuration: string;
  time: string;
}

const LogItem: React.FC<LogItemProps> = ({
  eventTypeLabel,
  icon,
  tone,
  title,
  venueName,
  impactCount,
  impactDuration,
  time,
}) => {
  const impactCountNum = Number(impactCount || 0);
  const toneStyles = {
    success: "bg-green-50 ring-green-100 text-green-500",
    error: "bg-red-50 ring-red-100 text-red-500",
    warning: "bg-amber-50 ring-amber-100 text-amber-500",
    primary: "bg-blue-50 ring-blue-100 text-blue-500",
    info: "bg-cyan-50 ring-cyan-100 text-cyan-500",
    neutral: "bg-slate-50 ring-slate-100 text-slate-500",
  };
  const impactCountStyles =
    impactCountNum >= 500
      ? "text-red-600 bg-red-50 border-red-200"
      : impactCountNum >= 100
        ? "text-amber-600 bg-amber-50 border-amber-200"
        : "text-slate-500 bg-slate-100 border-slate-200";

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg px-2 transition-colors cursor-default group">
      <Tooltip title={eventTypeLabel} placement="top">
        <div className={`p-1.5 rounded-full ring-1 ring-inset transition-colors ${toneStyles[tone]}`}>
          {icon}
        </div>
      </Tooltip>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">
            {title}
          </div>
        </div>
        <div className="mt-1 space-y-1 text-[11px] text-slate-400 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="shrink-0">场地</span>
            <span className="truncate">{venueName || "未知场地"}</span>
            <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
              {eventTypeLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`shrink-0 px-1.5 py-0.5 rounded-full border font-semibold ${impactCountStyles}`}>
              影响 {impactCount || "0"} 台
            </span>
            <span className="shrink-0">·</span>
            <span className="truncate">影响时长 {impactDuration || "--"}</span>
          </div>
        </div>
      </div>
      <div className="text-xs text-slate-400 whitespace-nowrap font-medium">{time}</div>
    </div>
  );
};

const SystemActivityCard = () => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getLogText = (item: any) =>
    item?.event_reason ||
    item?.event_content ||
    item?.resolution_measures ||
    item?.log_type ||
    item?.description ||
    item?.content ||
    "未知事件";

  const getLogTime = (item: any) => item?.event_date || item?.created_at || item?.createdAt || "";
  const getImpactDuration = (item: any) => getTimeDifference(item?.start_time, item?.end_time);
  const getVenueName = (item: any) =>
    item?.venue_info?.venue_name ||
    item?.venue_name ||
    item?.venue ||
    item?.site_name ||
    item?.siteName ||
    "";
  const getImpactCount = (item: any) => String(item?.impact_count ?? item?.impactCount ?? 0);

  const fetchData = async () => {
    try {
      const res: any = await fetchEventLogWithFilter(poolType, { page: 1, pageSize: 10 });
      if ((res.success === true || res.code === 0) && res.data) {
        const latestLogs = [...(res.data?.data || res.data || [])]
          .sort((a, b) => {
            const aTime = dayjs(a.event_date || a.created_at || a.createdAt || 0).valueOf();
            const bTime = dayjs(b.event_date || b.created_at || b.createdAt || 0).valueOf();
            return bTime - aTime;
          })
          .slice(0, 10);
        setData(latestLogs);
      }
    } catch (error) {
      console.error("Failed to fetch event logs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [poolType]);

  const getEventMeta = (item: any) => {
    const rawType = String(item?.event_type || item?.log_type || item?.type || "");
    const content = getLogText(item);
    const joined = `${rawType} ${content}`;

    if (joined.includes("限电")) {
      return { eventTypeLabel: "限电", tone: "warning" as const, icon: <Zap size={16} /> };
    }
    if (joined.includes("高温")) {
      return { eventTypeLabel: "高温", tone: "error" as const, icon: <Thermometer size={16} /> };
    }
    if (joined.includes("极端天气")) {
      return { eventTypeLabel: "极端天气", tone: "info" as const, icon: <CloudLightning size={16} /> };
    }
    if (joined.includes("日常维护") || joined.includes("维护")) {
      return { eventTypeLabel: "日常维护", tone: "success" as const, icon: <Wrench size={16} /> };
    }
    if (joined.includes("设备故障") || joined.includes("故障")) {
      return { eventTypeLabel: "设备故障", tone: "error" as const, icon: <AlertOctagon size={16} /> };
    }
    if (joined.includes("网络")) {
      return { eventTypeLabel: "网络", tone: "primary" as const, icon: <Wifi size={16} /> };
    }
    if (joined.includes("电力")) {
      return { eventTypeLabel: "电力", tone: "primary" as const, icon: <Power size={16} /> };
    }
    if (content.includes("成功") || content.includes("完成")) {
      return {
        eventTypeLabel: rawType || "其他",
        tone: "success" as const,
        icon: <CheckCircle2 size={16} />,
      };
    }
    return { eventTypeLabel: rawType || "其他", tone: "neutral" as const, icon: <Settings size={16} /> };
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col animate-pulse">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg"></div>
            <div className="w-24 h-6 bg-slate-100 rounded"></div>
          </div>
        </div>
        <div className="space-y-4 flex-1 mt-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-slate-100"></div>
              <div className="flex-1 h-8 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 h-full flex flex-col hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 rounded-xl ring-1 ring-blue-100/50">
            <Scroll size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">异常事件</h2>
            <p className="text-xs text-slate-400">最新事件日志</p>
          </div>
        </div>
        <Link
          to={ROUTE_PATHS.eventLog}
          className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors"
        >
          查看全部
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <div className="p-4 bg-slate-50 rounded-full mb-3">
              <Inbox size={24} />
            </div>
            <span className="text-sm">暂无异常事件</span>
          </div>
        ) : (
          <>
            {data.map((item, index) => (
              <LogItem
                key={index}
                {...getEventMeta(item)}
                title={getLogText(item)}
                venueName={getVenueName(item)}
                impactCount={getImpactCount(item)}
                impactDuration={getImpactDuration(item)}
                time={getLogTime(item) ? dayjs(getLogTime(item)).fromNow() : ""}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default SystemActivityCard;
