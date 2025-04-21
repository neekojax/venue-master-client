import { useState } from "react";
import { type FormInstance, Modal } from "antd";

type EditModalProps<T> = {
  open: boolean;
  onCreate: (values: T) => Promise<unknown>;
  onCancel: () => void;
  initialValues: T;
  title: string; // 传入标题以适应不同场景
  FormComponent: React.FC<{ initialValues: T; onFormInstanceReady: (form: FormInstance) => void }>; // 传入表单组件
};

export default function EditModal<T>({
  open,
  onCreate,
  onCancel,
  initialValues,
  title,
  FormComponent,
}: EditModalProps<T>) {
  const [formInstance, setFormInstance] = useState<FormInstance>();
  const [loading, setLoading] = useState(false);

  return (
    <Modal
      title={title} // 使用传入的标题
      open={open}
      destroyOnClose
      maskClosable={false}
      onCancel={onCancel}
      confirmLoading={loading}
      okButtonProps={{ htmlType: "submit" }}
      cancelButtonProps={{ disabled: loading }}
      onOk={async () => {
        try {
          const values = await formInstance?.validateFields();
          setLoading(true);
          await onCreate(values);
          formInstance?.resetFields(); // 重置表单
        } catch (error) {
          console.log("Failed:", error);
        } finally {
          setLoading(false);
        }
      }}
    >
      <FormComponent
        initialValues={initialValues}
        onFormInstanceReady={(form) => {
          setFormInstance(form);
        }}
      />
    </Modal>
  );
}
