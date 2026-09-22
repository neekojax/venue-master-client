import React, { useState } from "react";
import { AlertTriangle, BarChart3, LayoutList } from "lucide-react";
import AnalysisView from "./components/EventImpactAnalysis";
import EventLogsView from "./components/EventLogNew";

import { t } from "@/locales";

const EventImpactAnalysis: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"analysis" | "logs">("logs");

  return (
    <div className="flex flex-col h-full bg-white px-3 sm:px-4">
      {/* --- Unified Header Area --- */}
      <div className="bg-white border-b border-gray-200 px-6 pt-5 pb-0 flex flex-col justify-between shrink-0 z-30 gap-4 shadow-[0_2px_4px_rgba(0,0,0,0.02)]">
        <div>
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-orange-500" size={24} />
            {t("事件管理中心")}
          </h1>
          <p className="text-xs text-gray-500 mt-1 ml-8">{t("全方位监控、分析与管理场地突发事件")}</p>
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
            <LayoutList size={16} />
            {t("事件日志")}
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
            <BarChart3 size={16} />
            {t("事件影响分析")}
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
