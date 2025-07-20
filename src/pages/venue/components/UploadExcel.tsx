// UploadExcel.tsx
import React from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload } from "antd";

const UploadExcel: React.FC = () => {
  const uploadProps = {
    name: "file", // 后端接收的字段名
    accept: ".xlsx,.xls", // 限制文件类型
    showUploadList: false,
    customRequest: async (options: any) => {
      const { file, onSuccess, onError } = options;

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("https://datastring.cc/admin-api/event/import", {
          method: "POST",
          body: formData,
        });

        const result = await res.json();

        if (res.ok) {
          message.success("上传成功");
          onSuccess(result, file);
        } else {
          message.error(result.message || "上传失败");
          onError(result);
        }
      } catch (err) {
        message.error("上传异常");
        onError(err);
      }
    },
  };

  return (
    <Upload {...uploadProps}>
      <Button icon={<UploadOutlined />}>上传 Excel 文件</Button>
    </Upload>
  );
};

export default UploadExcel;
