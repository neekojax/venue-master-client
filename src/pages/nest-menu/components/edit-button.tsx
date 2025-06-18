import { useEffect, useState } from "react";
import { Button, message } from "antd";
import EditModal from "./edit-modal";
// @ts-ignore
import type { TemplateDataChange, Values } from "../type";
import { useSubmitVenueTemplateChange } from "@/pages/base/hook/hook.ts";

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

export default function EditButton({ data }: EditButtonProps) {
  const [open, setOpen] = useState(false);
  const [templateName, setTemplateName] = useState<string>(data.templateName);
  const mutation = useSubmitVenueTemplateChange();

  useEffect(() => {
    setTemplateName(data.templateName);
  }, [data.templateName]);

  const handleSubmit = (templateData: TemplateDataChange) => {
    mutation.mutate(templateData, {
      onSuccess: () => {
        message.success("模版已成功更新");
        setOpen(false);
      },
      onError: (error) => {
        message.error(`更新失败: ${error.message}`);
      },
    });
  };

  const onCreate = (values: Values) => {
    const templateDataChange: TemplateDataChange = {
      ID: data.key,
      templateNameBefore: templateName,
      templateNameAfter: values.templateName,
      fields: values.fields.map((field: { ID: number }) => {
        // 检查 ID，若为 0 则更新 status 为 "new"
        if (field.ID === 0) {
          return { ...field, status: "new" };
        }
        return field; // 否则保持不变
      }),
    };

    // 调用 handleSubmit
    handleSubmit(templateDataChange);

    return createPromise(values);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const transformDataToValues = (data: any): Values => {
    return {
      templateName: data.templateName || "",
      fields: data.fields.map((field: any) => ({
        ID: field.ID,
        value: field.FieldName || "", // 提供默认值
        status: "default", // 提供默认值
      })),
    };
  };

  return (
    <>
      <Button type="link" size="small" onClick={handleOpen}>
        编辑
      </Button>
      <EditModal
        open={open}
        initialValues={transformDataToValues(data)}
        onCreate={onCreate}
        onCancel={handleClose}
      />
    </>
  );
}
