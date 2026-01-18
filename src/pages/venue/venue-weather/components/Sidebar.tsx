import React from "react";

const Sidebar: React.FC = () => {
  const menuItems = [
    { icon: "fa-house", label: "首页", active: false },
    { icon: "fa-chart-line", label: "算力监控", active: false, hasSub: true },
    { icon: "fa-location-dot", label: "场地管理", active: false, hasSub: true },
    { icon: "fa-file-lines", label: "报表", active: false, hasSub: true },
    { icon: "fa-bolt", label: "电费监控", active: false, hasSub: true },
    { icon: "fa-cloud-sun", label: "天气监控", active: true },
  ];

  return (
    <div className="w-64 bg-[#001529] min-h-screen text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-4 flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-xl font-bold">
          <i className="fas fa-microchip"></i>
        </div>
        <div>
          <h1 className="text-sm font-bold leading-tight">运营管理系统</h1>
          <p className="text-[10px] text-gray-400">OPERATION SYSTEM</p>
        </div>
      </div>

      <nav className="flex-1">
        {menuItems.map((item, idx) => (
          <div
            key={idx}
            className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${item.active ? "bg-blue-600" : "hover:bg-white/5"}`}
          >
            <div className="flex items-center space-x-3">
              <i className={`fas ${item.icon} w-5 text-center text-lg`}></i>
              <span className="text-sm">{item.label}</span>
            </div>
            {item.hasSub && <i className="fas fa-chevron-down text-[10px] opacity-50"></i>}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
