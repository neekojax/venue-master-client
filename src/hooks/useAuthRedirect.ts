// useAuthRedirect.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/constants/common";
import { useEventListener } from "@/hooks/use-event-listener.ts";

const useAuthRedirect = () => {
  const navigate = useNavigate();

  // 处理 token 变更的函数
  const handleTokenChange = () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate(ROUTE_PATHS.login); // 如果没有 token，直接重定向
    }
  };

  // 使用 useEventListener 来监听 storage 事件
  useEventListener("storage", handleTokenChange);

  // 初始检查
  useEffect(() => {
    handleTokenChange();
  }, [navigate]);
};

export default useAuthRedirect;
