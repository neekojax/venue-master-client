import { useState } from "react";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { useQueryClient } from "@tanstack/react-query";
import { Button, DatePicker, Form, Input, InputNumber, message, Modal, Popconfirm, Select } from "antd";
import dayjs, { type Dayjs } from "dayjs";
import type { DailyAbnormalReason } from "../abnormal-history-api";

import { t } from "@/locales";
import {
  useCreateAnomalyManagementReport,
  useDeleteAnomalyManagementRecord,
  useUpdateAnomalyManagement,
} from "@/pages/fault-machine-monitor/hook";

interface Props {
  record?: DailyAbnormalReason;
  venueType: string;
  siteName: string;
  date?: string;
  abnormalCount?: number;
}
interface Values {
  logDate: Dayjs;
  reason: string;
  owner: string;
  abnormalCount: number;
  status: string;
}

export default function AbnormalReasonButton({
  venueType,
  siteName,
  date,
  abnormalCount = 0,
  record,
}: Props) {
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm<Values>();
  const mutation = useCreateAnomalyManagementReport(venueType);
  const updateMutation = useUpdateAnomalyManagement(venueType);
  const deleteMutation = useDeleteAnomalyManagementRecord(venueType);
  const busy = mutation.isPending || updateMutation.isPending || deleteMutation.isPending;
  const queryClient = useQueryClient();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: ["daily-abnormal-history", venueType, siteName] });
  const remove = async () => {
    if (!record || busy) return;
    try {
      await deleteMutation.mutateAsync(String(record.id));
      message.success(t("删除成功"));
      await refresh();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("操作失败"));
    }
  };

  const save = async () => {
    let values: Values;
    try {
      values = await form.validateFields();
    } catch {
      return;
    }
    try {
      if (record) {
        await updateMutation.mutateAsync({
          id: String(record.id),
          reason: values.reason.trim(),
          abnormalCount: values.abnormalCount,
          status: values.status,
        });
      } else
        await mutation.mutateAsync({
          siteName,
          logDate: values.logDate.format("YYYY-MM-DD"),
          reason: values.reason.trim(),
          owner: values.owner.trim(),
          abnormalCount: values.abnormalCount,
          status: values.status,
        });
      setOpen(false);
      message.success(record ? t("异常记录已更新") : t("异常处理记录已添加"));
      await refresh();
    } catch (error) {
      message.error(error instanceof Error ? error.message : t("操作失败"));
    }
  };

  return (
    <>
      <Button
        type={date ? "link" : "primary"}
        size={date ? "small" : "middle"}
        icon={record ? <EditOutlined /> : <PlusOutlined />}
        disabled={!siteName || !venueType || busy}
        onClick={() => {
          form.resetFields();
          form.setFieldsValue({
            logDate: date ? dayjs(date) : dayjs().subtract(1, "day"),
            reason: record?.reason ?? "",
            owner: record?.owner ?? "",
            abnormalCount: record?.affectedMachineCount ?? abnormalCount,
            status: record?.status ?? "pending",
          });
          setOpen(true);
        }}
      >
        {record ? t("编辑") : t("填写原因")}
      </Button>
      {record && (
        <Popconfirm
          title={t("确认删除？")}
          onConfirm={remove}
          okText={t("删除")}
          cancelText={t("取消")}
          disabled={busy}
          okButtonProps={{ loading: deleteMutation.isPending }}
        >
          <Button type="link" size="small" danger disabled={busy}>
            {t("删除")}
          </Button>
        </Popconfirm>
      )}
      <Modal
        forceRender
        open={open}
        title={record ? t("编辑") : t("填写原因")}
        onCancel={() => {
          if (!busy) setOpen(false);
        }}
        onOk={() => void save()}
        confirmLoading={busy}
        okText={t("保存")}
        cancelText={t("取消")}
        cancelButtonProps={{ disabled: busy }}
        maskClosable={!busy}
        closable={!busy}
      >
        <p className="mb-4 text-blue-700">{siteName}</p>
        <Form form={form} layout="vertical" disabled={busy}>
          <Form.Item name="logDate" label={t("日期")} rules={[{ required: true }]}>
            <DatePicker disabled={Boolean(date)} allowClear={false} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            name="reason"
            label={t("异常原因")}
            rules={[{ required: true, whitespace: true, message: t("异常原因不能为空") }]}
          >
            <Input.TextArea rows={4} placeholder={t("请输入异常原因、处理背景或需要跟进的说明")} />
          </Form.Item>
          <Form.Item
            name="owner"
            label={t("负责人")}
            rules={record ? [] : [{ required: true, whitespace: true, message: t("请输入经办负责人") }]}
          >
            <Input disabled={Boolean(record)} />
          </Form.Item>
          <Form.Item
            name="abnormalCount"
            label={t("影响台数")}
            rules={[
              { required: true, message: t("请输入影响台数") },
              { type: "integer", min: 0 },
            ]}
          >
            <InputNumber min={0} precision={0} style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item name="status" label={t("状态")} rules={[{ required: true }]}>
            <Select
              options={[
                { value: "pending", label: t("待排查") },
                { value: "monitoring", label: t("观察中") },
                { value: "resolved", label: t("处理中") },
                { value: "fixed", label: t("已修复") },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
