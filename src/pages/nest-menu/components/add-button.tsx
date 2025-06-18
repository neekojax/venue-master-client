import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import EditModal from "./edit-modal";

import { useSubmitVenueTemplateNew } from "@/pages/base/hook/hook.ts";
import type { TemplateDataNew, Values } from "@/pages/base/type.ts";
type EditButtonProps = {
  data: any;
};

const createPromise = (data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, 1000);
  });
};

export default function AddLink({ data }: EditButtonProps) {
  const [open, setOpen] = useState(false);

  const mutation = useSubmitVenueTemplateNew();

  const handleSubmit = (templateData: TemplateDataNew) => {
    mutation.mutate(templateData, {
      onSuccess: () => {
        message.success("模版已成功新增");
        setOpen(false);
      },
      onError: (error) => {
        message.error(`新增失败: ${error.message}`);
      },
    });
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const onCreate = (values: Values) => {
    const templateDataNew: TemplateDataNew = {
      ID: 0,
      templateName: values.templateName,
      fields: values.fields,
    };

    // 调用 handleSubmit
    handleSubmit(templateDataNew);

    return createPromise(values);
  };

  return (
    <>
      <Button
        type="primary"
        danger
        size="middle"
        icon={<PlusOutlined style={{ color: "white" }} />}
        style={{
          backgroundColor: "#40A9FF", // 设置背景颜色
          borderColor: "#40A9FF", // 设置边框颜色
          color: "#FFFFFF", // 设置文字颜色
        }}
        onClick={handleOpen}
      >
        添加观察者链接
      </Button>
      <EditModal open={open} initialValues={data} onCreate={onCreate} onCancel={handleClose} />
    </>
  );
}
