import { useNavigate } from "react-router-dom";
import { EditFilled, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, type MenuProps } from "antd";
import Cookies from "js-cookie";
import { ROUTE_PATHS } from "@/constants/common";

import { loginOut } from "@/pages/login/api.ts";

export default function UserAvatar() {
  const navigate = useNavigate();
  const username = localStorage.getItem("user") || localStorage.getItem("username") || "用户";
  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? { text: "上午好", textClass: "text-sky-600", bgClass: "bg-sky-50" }
      : hour < 18
        ? { text: "下午好", textClass: "text-amber-600", bgClass: "bg-amber-50" }
        : { text: "晚上好", textClass: "text-violet-600", bgClass: "bg-violet-50" };

  const items: MenuProps["items"] = [
    {
      key: "profile",
      label: (
        <div className={`min-w-0 rounded-xl px-3 py-2 ${greeting.bgClass}`}>
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-[11px] font-medium ${greeting.textClass}`}>欢迎回来</span>
            <span className="text-[11px] text-slate-300">·</span>
            <span className={`text-[11px] font-medium ${greeting.textClass}`}>{greeting.text}</span>
            <span className="text-sm font-semibold text-slate-800 truncate">{username}</span>
          </div>
        </div>
      ),
      disabled: true,
    },
    { type: "divider" },
    {
      key: "password",
      label: (
        <>
          <EditFilled className="mr-2" /> 修改密码
        </>
      ),
      onClick: () => {
        navigate("/user");
        // const token = localStorage.getItem("refresh_token");
        // loginOut({ refresh_token: token });
        // navigate(ROUTE_PATHS.login);
      },
    },
    {
      key: "logout",
      label: (
        <>
          <LogoutOutlined className="mr-2" /> 退出登录
        </>
      ),
      onClick: () => {
        const token = Cookies.get("refresh_token");
        loginOut({ refresh_token: token });
        navigate(ROUTE_PATHS.login);
      },
    },
  ];

  // const randomSeed = Math.floor(Math.random() * 10000); // 生成一个 0 到 9999 的随机种子

  // const apiUrl = `https://api.dicebear.com/9.x/bottts/svg?seed=${randomSeed}`;

  return (
    <Dropdown menu={{ items }} trigger={["click"]} overlayStyle={{ minWidth: 280 }}>
      <div className="flex items-center gap-2 rounded-full bg-blue-50/70 px-2 py-1 pr-3 cursor-pointer hover:bg-blue-100/70 transition-colors">
        <Avatar
          size={25}
          style={{ backgroundColor: "#E9F3FF" }}
          icon={<UserOutlined style={{ color: "#2d8cf0", fontWeight: "bold" }} />}
        />
        <span className="hidden sm:block max-w-[120px] truncate text-sm font-medium text-slate-700">
          {username}
        </span>
      </div>
      {/* <UserOutlined className="cursor-pointer" style={{ fontSize: 50, color: "#2d8cf0" }} /> */}
      {/* <Avatar size={50} src={<UserOutlined />} className="cursor-pointer" /> */}
      {/* <Avatar size={50} src={apiUrl} className="cursor-pointer" /> */}
    </Dropdown>
  );
}
