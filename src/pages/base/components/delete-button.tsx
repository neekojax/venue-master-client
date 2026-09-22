import { useState } from "react";
import { Button, message, Modal } from "antd";

import { t } from "@/locales";
import { useSubmitVenueTemplateDelete } from "@/pages/base/hook/hook.ts";

type DeleteButtonProps = {
  data: any;
};

export default function DeleteButton({ data }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);

  const mutation = useSubmitVenueTemplateDelete();

  const onCreate = () => {
    if (data.fields.length > 0) {
      message.error(t("该模版存在字段，不能删除！"));
      return;
    }

    mutation.mutate(data.key, {
      onSuccess: () => {
        message.success(t("模版删除成功"));
        setOpen(false);
      },
      onError: (error) => {
        message.error(t("删除失败: {{message}}", { message: error.message }));
      },
    });
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button type="link" size="small" onClick={handleOpen}>
        {t("删除")}
      </Button>
      <Modal
        title={t("温馨提示")}
        visible={open}
        onOk={onCreate}
        onCancel={handleClose}
        okText={t("确定")}
        cancelText={t("取消")}
      >
        <p>{t("你确定要删除当前项吗？")}</p>
      </Modal>
    </>
  );
}
