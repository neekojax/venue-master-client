import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "antd";

import { t } from "@/locales";

interface Props {
  editing?: boolean;
  inline?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export default function ReasonActionButton({ editing, inline, disabled, onClick }: Props) {
  return (
    <Button
      type={inline ? "link" : "primary"}
      size={inline ? "small" : "middle"}
      className={inline ? "!px-0" : undefined}
      icon={editing ? <EditOutlined aria-hidden /> : <PlusOutlined aria-hidden />}
      disabled={disabled}
      onClick={onClick}
    >
      {editing ? t("编辑原因") : t("填写原因")}
    </Button>
  );
}
