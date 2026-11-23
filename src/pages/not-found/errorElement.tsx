import { useEffect } from "react";
import { useRouteError } from "react-router-dom";
import { Button, Result } from "antd";

import { t } from "@/locales";

export default function RouteErrorPage() {
  const error = useRouteError();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("Route failed to load:", error);
  }, [error]);

  return (
    <Result
      status="error"
      title={t("页面加载失败")}
      extra={
        <Button type="primary" onClick={() => window.location.reload()}>
          {t("刷新")}
        </Button>
      }
    />
  );
}
