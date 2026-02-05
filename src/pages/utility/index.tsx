import React from "react";
import { ArrowRight, ExternalLink } from "lucide-react";
import { UTILITY_TOOLS } from "./constants";

const UtilityTools: React.FC = () => {
  return (
    <div className="p-2 space-y-4 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-2">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">实用工具中心</h2>
          <p className="text-gray-500 mt-2 text-lg">集成全网算力、难度及收益分析等专业矿工必备工具</p>
        </div>
        {/* <div className="relative group">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="搜索工具 (例如：算力, 计算器...)"
            className="pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[320px] shadow-sm transition-all"
          />
        </div> */}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {UTILITY_TOOLS.map((tool) => (
          <a
            key={tool.id}
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block bg-white border border-gray-100 rounded-2xl p-7 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
          >
            {/* Visual Flair */}
            <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-50 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-500" />

            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-start justify-between mb-6">
                <div className="w-16 h-16 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center p-3 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                  <img src={tool.icon} alt={tool.name} className="w-full h-full object-contain" />
                </div>
                <div className="bg-gray-50 p-2 rounded-lg text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <ExternalLink size={18} />
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors mb-3">
                {tool.name}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-1">{tool.description}</p>

              <div className="flex items-center gap-2 text-sm font-bold text-blue-600">
                <span>立即进入</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default UtilityTools;
