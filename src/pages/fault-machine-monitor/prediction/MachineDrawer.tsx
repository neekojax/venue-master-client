import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Alert,
  Button,
  Descriptions,
  Drawer,
  Form,
  Input,
  message,
  Select,
  Space,
  Spin,
  Table,
  Tabs,
} from "antd";
import { fetchMachine, PredictionError, updateAlert } from "./api";
import { categoryText } from "./display";
import { faultText } from "./display";
import { renderSeverity, shanghaiTime, statuses } from "./display";
import { RequestError } from "./RequestError";
import type { AlertStatus, AlertUpdate, Scope } from "./types";

import { t } from "@/locales";

type AlertForm = Omit<AlertUpdate, "version" | "fault_id">;
export default function MachineDrawer({
  scope,
  sessionId,
  id,
  onClose,
}: {
  scope: Scope;
  sessionId: string;
  id: number;
  onClose: () => void;
}) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [conflict, setConflict] = useState(false);
  const [form] = Form.useForm<AlertForm>();
  const client = useQueryClient();
  const key = ["fault-predictions", sessionId];
  const detail = useQuery({
    queryKey: [...key, "machine", id, page, limit],
    queryFn: ({ signal }) => fetchMachine(scope, id, page, limit, signal),
    retry: false,
  });
  const data = detail.data;
  const machine = data?.machine;
  const update = useMutation({
    mutationFn: (values: AlertForm) => {
      if (!machine?.alert_id || !machine.alert_version || conflict)
        throw new Error(t("请先刷新详情，取得最新告警版本"));
      return updateAlert(scope, machine.alert_id, {
        ...values,
        owner_name: values.owner_name?.trim() || "",
        note: values.note.trim(),
        version: machine.alert_version,
      });
    },
    onSuccess: async () => {
      message.success(t("告警处理已保存"));
      form.resetFields();
      await client.invalidateQueries({ queryKey: key });
      const latest = await detail.refetch();
      if (latest.isSuccess) {
        form.setFieldsValue({
          status: latest.data.machine.alert_status as AlertStatus,
          owner_name: latest.data.machine.owner_name,
          note: undefined,
        });
      }
    },
    onError: async (error) => {
      if (error instanceof PredictionError && error.status === 409) {
        setConflict(true);
        // 取得最新版本，但必须由用户核对后解锁再次提交，不自动覆盖。
        await detail.refetch();
      } else message.error(error.message);
    },
  });
  const refreshAfterConflict = async () => {
    const result = await detail.refetch();
    if (result.isSuccess) {
      form.resetFields();
      form.setFieldsValue({
        status: result.data.machine.alert_status as AlertStatus,
        owner_name: result.data.machine.owner_name,
        note: undefined,
      });
      setConflict(false);
      update.reset();
    }
  };
  return (
    <Drawer title={t("预测机器详情")} width={900} open onClose={onClose}>
      {detail.isPending && <Spin />}
      <RequestError error={detail.error} retry={() => void detail.refetch()} />
      {detail.error instanceof PredictionError && detail.error.status === 404 && (
        <Button
          onClick={() => {
            void client.invalidateQueries({ queryKey: key });
            onClose();
          }}
        >
          {t("关闭并刷新列表")}
        </Button>
      )}
      {data && machine && (
        <Space direction="vertical" size="large" className="w-full">
          <Descriptions
            bordered
            size="small"
            column={2}
            items={[
              { key: "site", label: t("场地"), children: machine.site_name },
              { key: "ip", label: t("当前 IP"), children: machine.ip || "—" },
              {
                key: "mac",
                label: "MAC",
                children: machine.mac_address || "—",
              },
              {
                key: "sn",
                label: t("控制板 SN"),
                children: machine.control_board_sn || "—",
              },
              {
                key: "basis",
                label: t("识别依据"),
                children: machine.identity_basis === "mac" ? "MAC" : t("控制板 SN"),
              },
              {
                key: "level",
                label: t("等级"),
                children: renderSeverity(machine.severity),
              },
              {
                key: "days",
                label: t("故障日"),
                children: t("{{count}} / 7 天（不要求连续）", {
                  count: machine.abnormal_days,
                }),
              },
              {
                key: "logs",
                label: t("告警数 / 近两小时"),
                children: `${machine.log_count} / ${machine.recent_log_count}`,
              },
              {
                key: "window",
                label: t("分析时间"),
                span: 2,
                children: t("{{start}} 至 {{end}}", {
                  start: shanghaiTime(data.window_start),
                  end: shanghaiTime(data.window_end),
                }),
              },
            ]}
          />
          <Tabs
            items={[
              {
                key: "daily",
                label: t("每日告警"),
                children: (
                  <Table
                    size="small"
                    pagination={{ pageSize: 10 }}
                    rowKey="key"
                    dataSource={data.daily?.map((row, key) => ({ ...row, key })) ?? []}
                    columns={[
                      {
                        title: t("日期"),
                        dataIndex: "date",
                        render: (value: string) => value.slice(0, 10),
                      },
                      {
                        title: t("类别"),
                        dataIndex: "category",
                        render: categoryText,
                      },
                      { title: t("网段"), dataIndex: "network" },
                      { title: t("告警数"), dataIndex: "log_count" },
                    ]}
                  />
                ),
              },
              {
                key: "logs",
                label: t("原始日志"),
                children: (
                  <Table
                    size="small"
                    rowKey="id"
                    loading={detail.isFetching}
                    dataSource={data.logs ?? []}
                    scroll={{ x: 760 }}
                    pagination={{
                      current: page,
                      pageSize: limit,
                      total: data.log_pagination.total,
                      pageSizeOptions: [10, 20, 50, 100],
                      showSizeChanger: true,
                      onChange: (next, size) => {
                        setPage(size !== limit ? 1 : next);
                        setLimit(size);
                      },
                    }}
                    columns={[
                      {
                        title: t("时间"),
                        dataIndex: "log_time",
                        render: shanghaiTime,
                      },
                      { title: t("代码"), dataIndex: "code", render: categoryText },
                      { title: "IP", dataIndex: "ip" },
                      {
                        title: t("解释"),
                        dataIndex: "explanation",
                        render: faultText,
                      },
                    ]}
                    expandable={{
                      expandedRowRender: (log) => (
                        <pre className="whitespace-pre-wrap break-all rounded bg-slate-950 p-3 text-xs text-slate-100">
                          {faultText(log.raw_line ?? t("无原始日志文本"))}
                        </pre>
                      ),
                    }}
                  />
                ),
              },
            ]}
          />
          <Alert
            type="info"
            message={t(
              "当前缺少持续故障、实测算力、老化及框箱数据；不展示相关推断。人工已处理不代表监测确认恢复。",
            )}
          />
          {machine.alert_id != null ? (
            <>
              {conflict && (
                <Alert
                  type="warning"
                  showIcon
                  message={t("告警已被其他人更新，最新状态和版本已加载")}
                  description={t("请重置处理表单，核对最新处理状态后重新填写说明。不会自动重试覆盖。")}
                  action={<Button onClick={() => void refreshAfterConflict()}>{t("核对后重置表单")}</Button>}
                />
              )}
              <Form
                key={`${machine.alert_id}-${machine.alert_version}`}
                form={form}
                layout="vertical"
                initialValues={{
                  status: machine.alert_status as AlertStatus,
                  owner_name: machine.owner_name,
                }}
                onFinish={(values) => update.mutate(values)}
              >
                <h3 className="mb-4 font-semibold">{t("告警处理")}</h3>
                <Form.Item name="status" label={t("处理状态")} rules={[{ required: true }]}>
                  <Select disabled={conflict} options={statuses} />
                </Form.Item>
                <Form.Item
                  name="owner_name"
                  label={t("负责人姓名")}
                  dependencies={["status"]}
                  rules={[
                    { max: 100 },
                    ({ getFieldValue }) => ({
                      validator: (_, value: string | undefined) =>
                        getFieldValue("status") === "processing" && !value?.trim()
                          ? Promise.reject(new Error(t("处理中必须填写负责人")))
                          : Promise.resolve(),
                    }),
                  ]}
                >
                  <Input maxLength={100} disabled={conflict} />
                </Form.Item>
                <Form.Item
                  name="note"
                  label={t("处理说明")}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: t("每次处理都必须填写说明"),
                    },
                    { max: 2000 },
                  ]}
                >
                  <Input.TextArea disabled={conflict} rows={3} maxLength={2000} showCount />
                </Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  disabled={conflict || detail.isError || detail.isFetching}
                  loading={update.isPending}
                >
                  {t("保存处理")}
                </Button>
                <p className="mt-2 text-xs text-gray-500">
                  {t("每次成功提交都会记录处理动作，不自动创建维修单。")}
                </p>
              </Form>
            </>
          ) : (
            <Alert type="info" message={t("该设备暂无可处理告警")} />
          )}
        </Space>
      )}
    </Drawer>
  );
}
