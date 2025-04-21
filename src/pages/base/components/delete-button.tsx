import { useState } from "react";
import { Button, Modal, message } from "antd";
import { useSubmitVenueTemplateDelete } from "@/pages/base/hook/hook.ts";

type DeleteButtonProps = {
  data: any;
};

export default function DeleteButton({ data }: DeleteButtonProps) {
  const [open, setOpen] = useState(false);

  const mutation = useSubmitVenueTemplateDelete();

  const onCreate = () => {
    if (data.fields.length > 0) {
      message.error("该模版存在字段，不能删除！");
      return;
    }

    mutation.mutate(data.key, {
      onSuccess: () => {
        message.success("模版删除成功");
        setOpen(false);
      },
      onError: (error) => {
        message.error(`删除失败: ${error.message}`);
      },
    });
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <Button type="link" size="small" onClick={handleOpen}>
        删除
      </Button>
      <Modal
        title="温馨提示"
        visible={open}
        onOk={onCreate}
        onCancel={handleClose}
        okText="确定"
        cancelText="取消"
      >
        <p>你确定要删除当前项吗？</p>
      </Modal>
    </>
  );
}
