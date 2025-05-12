// useAuthRedirect.ts
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import eventBus from "@/components/event-bus";

const useAuthRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleRedirect = (path: any) => {
      navigate(path); // 使用 navigate 进行页面跳转
    };

    eventBus.on("redirect", handleRedirect);

    return () => {
      eventBus.off("redirect", handleRedirect); // 清理事件监听器
    };
  }, [navigate]);
};

export default useAuthRedirect;
