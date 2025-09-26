import React, { useState } from "react";
import { InboxOutlined, UploadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import { Alert, Button, message, Modal, Progress, Upload } from "antd";

interface ExcelUploadProps {
  onUpload: (file: File) => Promise<any>;
  accept?: string;
  maxSize?: number; // MB
  disabled?: boolean;
  title?: string;
  description?: string;
}

interface UploadResult {
  success: boolean;
  message: string;
  data?: any;
  errors?: string[];
}

const ExcelUpload: React.FC<ExcelUploadProps> = ({
  onUpload,
  accept = ".xlsx,.xls",
  maxSize = 10,
  disabled = false,
  title = "导入",
  description = "支持.xlsx和.xls格式，文件大小不超过10MB",
}) => {
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [resultModalVisible, setResultModalVisible] = useState(false);

  const beforeUpload = (file: File) => {
    // 检查文件类型
    const isExcel =
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel" ||
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls");

    if (!isExcel) {
      message.error("只能上传Excel文件！");
      return false;
    }

    // 检查文件大小
    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      message.error(`文件大小不能超过${maxSize}MB！`);
      return false;
    }

    return false; // 阻止自动上传
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning("请先选择文件！");
      return;
    }

    const file = fileList[0].originFileObj as File;
    setUploading(true);
    setUploadProgress(0);
    setUploadResult(null);

    try {
      // 模拟上传进度
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await onUpload(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      // 根据返回的数据结构处理结果
      const isSuccess = result.success && result.code === 0;
      const hasErrors = result.data?.error_details && result.data.error_details.length > 0;

      setUploadResult({
        success: isSuccess,
        message: result.message || "导入完成",
        data: result.data,
        errors: hasErrors ? result.data.error_details : [],
      });

      if (isSuccess && !hasErrors) {
        message.success("文件导入成功！");
      } else if (isSuccess && hasErrors) {
        message.warning("文件导入完成，但存在部分错误");
      } else {
        message.error("文件导入失败");
      }

      setResultModalVisible(true);
    } catch (error: any) {
      setUploadResult({
        success: false,
        message: error.message || "上传失败",
        errors: error.errors || [],
      });

      message.error("文件上传失败！");
      setResultModalVisible(true);
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const uploadProps: UploadProps = {
    fileList,
    beforeUpload,
    onChange: ({ fileList: newFileList }) => {
      setFileList(newFileList.slice(-1)); // 只保留最后一个文件
    },
    onRemove: () => {
      setFileList([]);
    },
    accept,
    disabled: disabled || uploading,
  };

  const handleResultModalClose = () => {
    setResultModalVisible(false);
    if (uploadResult?.success) {
      setFileList([]);
    }
  };

  return (
    <div className="excel-upload-container">
      <div style={{ marginBottom: 16 }}>
        <h3>{title}</h3>
        <p style={{ color: "#666", fontSize: "14px" }}>{description}</p>
      </div>

      <Upload.Dragger {...uploadProps} style={{ marginBottom: 16 }}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
        <p className="ant-upload-hint">{description}</p>
      </Upload.Dragger>

      {uploadProgress > 0 && (
        <div style={{ marginBottom: 16 }}>
          <Progress percent={uploadProgress} status={uploading ? "active" : "success"} />
        </div>
      )}

      <div style={{ textAlign: "center" }}>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleUpload}
          loading={uploading}
          disabled={fileList.length === 0 || disabled}
        >
          {uploading ? "上传中..." : "开始上传"}
        </Button>
      </div>

      <Modal
        title="上传结果"
        open={resultModalVisible}
        onCancel={handleResultModalClose}
        footer={[
          <Button key="close" onClick={handleResultModalClose}>
            关闭
          </Button>,
        ]}
      >
        {uploadResult && (
          <div>
            <Alert
              message={uploadResult.message}
              type={
                uploadResult.success
                  ? uploadResult.errors && uploadResult.errors.length > 0
                    ? "warning"
                    : "success"
                  : "error"
              }
              showIcon
              style={{ marginBottom: 16 }}
            />

            {uploadResult.data && (
              <div style={{ marginBottom: 16 }}>
                <h4>导入统计：</h4>
                <div style={{ background: "#f5f5f5", padding: 12, borderRadius: 4 }}>
                  <p>
                    <strong>成功导入：</strong>
                    {uploadResult.data.success_count || 0} 条
                  </p>
                  <p>
                    <strong>失败数量：</strong>
                    {uploadResult.data.failure_count || 0} 条
                  </p>
                  <p>
                    <strong>总计处理：</strong>
                    {(uploadResult.data.success_count || 0) + (uploadResult.data.failure_count || 0)} 条
                  </p>
                </div>
              </div>
            )}

            {uploadResult.errors && uploadResult.errors.length > 0 && (
              <div>
                <h4>错误详情：</h4>
                <div
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    background: "#fff2f0",
                    padding: 12,
                    borderRadius: 4,
                    border: "1px solid #ffccc7",
                  }}
                >
                  {uploadResult.errors.map((error, index) => (
                    <p key={index} style={{ color: "#ff4d4f", margin: "4px 0", fontSize: "14px" }}>
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ExcelUpload;
export type { ExcelUploadProps, UploadResult };
