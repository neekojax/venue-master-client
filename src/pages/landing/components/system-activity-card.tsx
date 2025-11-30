import React from "react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { AlertOctagon, CheckCircle2, Inbox, Scroll, Settings } from "lucide-react";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchEventLog } from "@/pages/venue/api.tsx";

interface LogItemProps {
  type: "success" | "error" | "info";
  title: string;
  time: string;
}

const LogItem: React.FC<LogItemProps> = ({ type, title, time }) => {
  const icons = {
    success: <CheckCircle2 size={16} className="text-green-500" />,
    error: <AlertOctagon size={16} className="text-red-500" />,
    info: <Settings size={16} className="text-blue-500" />,
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 rounded-lg px-2 transition-colors cursor-default group">
      <div
        className={`p-1.5 rounded-full ring-1 ring-inset transition-colors ${
          type === "success"
            ? "bg-green-50 ring-green-100"
            : type === "error"
              ? "bg-red-50 ring-red-100"
              : "bg-blue-50 ring-blue-100"
        }`}
      >
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800 truncate group-hover:text-blue-600 transition-colors">
          {title}
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

  const fetchData = async () => {
    try {
      const res = await fetchEventLog(poolType);
      if (res.code === 200 && res.data) {
        setData(res.data.slice(0, 5));
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

  // Determine type based on content
  const getType = (type: string, content: string): "success" | "error" | "info" => {
    if (type?.includes("报警") || content?.includes("报警") || content?.includes("故障")) return "error";
    if (content?.includes("成功") || content?.includes("完成")) return "success";
    return "info";
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
          {[1, 2, 3, 4, 5].map((i) => (
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
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">系统活动</h2>
            <p className="text-xs text-slate-400">最近日志与事件</p>
          </div>
        </div>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md transition-colors">
          查看全部
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {data.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400">
            <div className="p-4 bg-slate-50 rounded-full mb-3">
              <Inbox size={24} />
            </div>
            <span className="text-sm">暂无活动日志</span>
          </div>
        ) : (
          <>
            {data.map((item, index) => (
              <LogItem
                key={index}
                type={getType(item.event_type, item.event_content || item.description)}
                title={item.event_content || item.description || "未知事件"}
                time={item.event_date ? dayjs(item.event_date).fromNow() : ""}
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default SystemActivityCard;
