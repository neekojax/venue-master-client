import React, { useState } from "react";
import { AlertTriangle, BarChart3, LayoutList } from "lucide-react";
import AnalysisView from "./components/EventImpactAnalysis";
import EventLogsView from "./components/EventLog";

const EventImpactAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"analysis" | "logs">("analysis");

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* --- Unified Header Area --- */}
      <div className="bg-white border-b border-gray-200 px-6 pt-5 pb-0 flex flex-col justify-between shrink-0 z-30 gap-4 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={24} />
            事件管理中心
          </h1>
          <p className="text-xs text-gray-500 mt-1 ml-8">全方位监控、分析与管理场地突发事件</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8 mt-2">
          <button
            onClick={() => setActiveTab("logs")}
            className={`
               pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2
               ${activeTab === "logs" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
             `}
          >
            <LayoutList size={16} />
            事件日志
          </button>
          <button
            onClick={() => setActiveTab("analysis")}
            className={`
               pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2
               ${activeTab === "analysis" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
             `}
          >
            <BarChart3 size={16} />
            事件影响分析
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        {activeTab === "analysis" ? <AnalysisView /> : <EventLogsView />}
      </div>
    </div>
  );
};

export default EventImpactAnalysis;
