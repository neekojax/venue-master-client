import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Button, message } from "antd";
import EditModal from "../edit-modal/index.tsx";

type AddButtonProps<T> = {
  label: string; // 按钮的标签文本
  initialValues: T; // 初始值，能够根据外部传入的类型进行调整
  onSubmit: (values: T) => Promise<void>; // 提交处理函数
  FormComponent: React.FC<{ initialValues: T; onFormInstanceReady: (form: any) => void }>; // 传入表单组件
};

const AddButton = <T,>({ label, initialValues, onSubmit, FormComponent }: AddButtonProps<T>) => {
  const [open, setOpen] = useState(false);

  const handleModalOpen = () => setOpen(true);
  const handleModalClose = () => setOpen(false);

  const handleSubmit = async (values: T) => {
    try {
      await onSubmit(values);
      message.success(`${label}成功`);
      handleModalClose();
    } catch (error) {
      // @ts-ignore
      message.error(`${label}失败: ${error.message}`);
    }
  };

  return (
    <>
      <Button
        type="primary"
        danger
        size="middle"
        icon={<PlusOutlined style={{ color: "white" }} />}
        style={{
          backgroundColor: "#40A9FF",
          borderColor: "#40A9FF",
          color: "#FFFFFF",
        }}
        onClick={handleModalOpen}
      >
        {label}
      </Button>
      <EditModal
        open={open}
        initialValues={initialValues}
        onCreate={handleSubmit}
        onCancel={handleModalClose}
        title={label}
        FormComponent={FormComponent} // 传递表单组件
      />
    </>
  );
};

export default AddButton;
