import { Alert, Button } from "antd";
import { faultText } from "./display";

import { t } from "@/locales";

export function RequestError({ error, retry }: { error: Error | null; retry: () => void }) {
  return error ? (
    <Alert
      className="mb-4"
      type="error"
      showIcon
      message={faultText(error.message)}
      action={
        <Button size="small" onClick={retry}>
          {t("重试")}
        </Button>
      }
    />
  ) : null;
}
