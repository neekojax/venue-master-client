import React, { useState } from "react";
import { AlertTriangle, BarChart3, LayoutList } from "lucide-react";
import AnalysisView from "./components/EventImpactAnalysis";
import EventLogsView from "./components/EventLogNew";

const EventImpactAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"analysis" | "logs">("logs");

  return (
    <div className="flex flex-col h-full bg-white px-3 sm:px-4">
      {/* --- Unified Header Area --- */}
      <div className="border-b border-gray-200 px-2 sm:px-3 py-5 flex flex-col sm:flex-row sm:items-start sm:justify-between shrink-0 gap-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={24} />
          <div>
            <h1 className="text-xl font-bold text-gray-900">事件管理中心</h1>
            <p className="text-xs text-gray-500 mt-1">统一查看、跟进与复盘场地突发事件</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 shrink-0 sm:ml-auto" role="tablist" aria-label="事件管理视图">
          <button
            role="tab"
            aria-selected={activeTab === "logs"}
            onClick={() => setActiveTab("logs")}
            className={`
               px-2 pt-1 pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2
               ${activeTab === "logs" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
             `}
          >
            <LayoutList size={16} aria-hidden="true" />
            事件日志
          </button>
          <span aria-hidden="true" className="h-3 w-px bg-gray-200 mb-2" />
          <button
            role="tab"
            aria-selected={activeTab === "analysis"}
            onClick={() => setActiveTab("analysis")}
            className={`
               px-2 pt-1 pb-3 text-sm font-medium border-b-2 transition-all flex items-center gap-2
               ${activeTab === "analysis" ? "border-blue-600 text-blue-600" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"}
             `}
          >
            <BarChart3 size={16} aria-hidden="true" />
            事件影响分析
          </button>
        </div>
      </div>

      <div className="flex-1 min-w-0 relative pt-4">
        {activeTab === "analysis" ? <AnalysisView /> : <EventLogsView />}
      </div>
    </div>
  );
};

export default EventImpactAnalysis;
