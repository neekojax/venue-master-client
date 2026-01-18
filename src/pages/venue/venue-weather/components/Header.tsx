import React from "react";

const Header: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <span>首页</span>
        <i className="fas fa-chevron-right text-[10px] opacity-30"></i>
        <span className="text-gray-900 font-medium">天气监控</span>
      </div>

      <div className="flex items-center space-x-6">
        <div className="bg-[#f5f5f5] px-3 py-1.5 rounded text-xs flex items-center space-x-4">
          <span className="text-gray-500">
            昨日全网产出效率: <b className="text-blue-600">BTC/EH</b>
          </span>
          <div className="flex items-center space-x-2 bg-blue-600 text-white px-2 py-0.5 rounded cursor-pointer">
            <span>KZ</span>
            <i className="fas fa-globe text-[10px]"></i>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-gray-500">
          <div className="relative cursor-pointer">
            <i className="far fa-bell text-lg"></i>
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="flex items-center space-x-2 cursor-pointer">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <i className="fas fa-user"></i>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
