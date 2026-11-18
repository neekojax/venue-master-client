import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button, Descriptions, Drawer, Space, Spin, Table, Tabs } from "antd";
import { fetchMachine, PredictionError } from "./api";
import { categoryText } from "./display";
import { faultText } from "./display";
import { renderSeverity, shanghaiTime } from "./display";
import { RequestError } from "./RequestError";
import type { Scope } from "./types";

import { t } from "@/locales";

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
  const client = useQueryClient();
  const key = ["fault-predictions", sessionId];
  const detail = useQuery({
    queryKey: [...key, "machine", id, page, limit],
    queryFn: ({ signal }) => fetchMachine(scope, id, page, limit, signal),
    retry: false,
  });
  const data = detail.data;
  const machine = data?.machine;
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
        </Space>
      )}
    </Drawer>
  );
}
