import { useState } from "react";
import { type FormInstance, Modal } from "antd";
// @ts-ignore
import type { Values } from "../type";
import EditForm from "./edit-form";

type EditModalProps = {
  open: boolean;
  onCreate: (values: Values) => Promise<unknown>;
  onCancel: () => void;
  initialValues: Values;
};

export default function EditModal({ open, onCreate, onCancel, initialValues }: EditModalProps) {
  const [formInstance, setFormInstance] = useState<FormInstance>();
  const [loading, setLoading] = useState(false);

  return (
    <Modal
      title="编辑模版"
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
          onCreate(values).finally(() => {
            setLoading(false);
            formInstance?.resetFields();
          });
        } catch (error) {
          console.log("Failed:", error);
        }
      }}
    >
      <EditForm
        initialValues={initialValues}
        onFormInstanceReady={(form) => {
          setFormInstance(form);
        }}
      />
    </Modal>
  );
}
