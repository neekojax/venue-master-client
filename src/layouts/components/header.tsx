import React, { useEffect, useState } from "react";
import { Bell, Menu } from "lucide-react";
import PoolTypeSelect from "./pool-type-select";
import UserAvatar from "./user-avatar";

interface HeaderProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ collapsed, setCollapsed }) => {
  const [suanlilv, setSuanlilv] = useState<any>({});

  useEffect(() => {
    const localData = localStorage.getItem("suanlilv");
    if (localData) {
      setSuanlilv(JSON.parse(localData));
    }
  }, []);

  return (
    <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 sticky top-0 z-40 w-full">
      <div className="flex items-center gap-4">
        <button
          className="p-2 hover:bg-slate-100 rounded-full lg:hidden"
          onClick={() => setCollapsed(!collapsed)}
        >
          <Menu size={20} className="text-slate-600" />
        </button>
        <div className="hidden md:flex items-center text-sm text-slate-500">
          <span className="hover:text-blue-600 cursor-pointer">首页</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {localStorage.getItem("user_access_level") != "special" && (
          <div className="hidden md:flex items-center bg-slate-50 rounded-lg border border-slate-200 px-3 py-1.5">
            <span className="text-xs text-slate-500 mr-2">昨日全网产出效率:</span>
            <span className="text-sm font-bold text-blue-600">{suanlilv?.BTCNetworkPerEPower} BTC/EH</span>
          </div>
        )}

        {localStorage.getItem("user_access_level") != "special" && <PoolTypeSelect />}

        <div className="h-8 w-[1px] bg-slate-200 mx-1"></div>

        <button className="p-2 hover:bg-slate-100 rounded-full text-slate-500 relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>

        <UserAvatar />
      </div>
    </header>
  );
};

export default Header;
