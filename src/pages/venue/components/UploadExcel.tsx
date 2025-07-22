// UploadExcel.tsx
import React, { useState } from "react";
import { UploadOutlined } from "@ant-design/icons";
import { Button, message, Upload } from "antd";
import axios from "axios";

const UploadExcel: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const uploadProps = {
    name: "file", // 后端接收的字段名
    accept: ".xlsx,.xls", // 限制文件类型
    showUploadList: false,
    customRequest: async (options: any) => {
      const { file } = options;

      const formData = new FormData();
      formData.append("file", file);

      // try {
      //   const res = await fetch("http://127.0.0.1:8080/admin-api/event/import", {
      //     method: "POST",
      //     body: formData,
      //   });
      //
      //   const result = await res.json();
      //
      //   if (res.ok) {
      //     message.success("上传成功");
      //     onSuccess(result, file);
      //   } else {
      //     message.error(result.message || "上传失败");
      //     onError(result);
      //   }
      // } catch (err) {
      //   message.error("上传异常");
      //   onError(err);
      // }

      try {
        const token = localStorage.getItem("access_token");
        setLoading(true); // 开始 loading
        const response = await axios.post("https://datastring.cc/admin-api/event/import", formData, {
          headers: {
            "Content-Type": "multipart/form-data", // 确保设置了正确的内容类型
            Authorization: `Bearer ${token}`, // 添加 token 到请求头
          },
        });

        message.success("上传成功");
        return response.data; // 返回服务器响应的数据
      } catch (error) {
        // console.error("上传失败:", error);
        message.error("上传失败");
        throw error; // 抛出错误以便在调用时被捕获
      } finally {
        setLoading(false); // 结束 loading
      }
    },
  };

  return (
    <Upload {...uploadProps}>
      <Button icon={<UploadOutlined />} size="middle" loading={loading}>
        导入事件
      </Button>
    </Upload>
  );
};

export default UploadExcel;
