import { useNavigate } from "react-router-dom";
import { LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Dropdown, type MenuProps } from "antd";
import { ROUTE_PATHS } from "@/constants/common";

import { loginOut } from "@/pages/login/api.ts";

export default function UserAvatar() {
  const navigate = useNavigate();

  const items: MenuProps["items"] = [
    {
      key: "loginOut",
      label: (
        <>
          <LogoutOutlined className="mr-2" /> 退出登录
        </>
      ),
      onClick: () => {
        const token = localStorage.getItem("refresh_token");
        loginOut({ refresh_token: token });
        navigate(ROUTE_PATHS.login);
      },
    },
  ];

  // const randomSeed = Math.floor(Math.random() * 10000); // 生成一个 0 到 9999 的随机种子

  // const apiUrl = `https://api.dicebear.com/9.x/bottts/svg?seed=${randomSeed}`;

  return (
    <Dropdown menu={{ items }} trigger={["click"]}>
      <Avatar
        size={25}
        style={{ backgroundColor: "#E9F3FF" }}
        icon={<UserOutlined style={{ color: "#1B84FF", fontWeight: "bold" }} />}
      />
      {/* <UserOutlined className="cursor-pointer" style={{ fontSize: 50, color: "#1B84FF" }} /> */}
      {/* <Avatar size={50} src={<UserOutlined />} className="cursor-pointer" /> */}
      {/* <Avatar size={50} src={apiUrl} className="cursor-pointer" /> */}
    </Dropdown>
  );
}
