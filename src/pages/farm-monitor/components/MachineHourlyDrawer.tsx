import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Drawer, Empty, Spin, Table } from "antd";
import { ReactEcharts } from "@/components/react-echarts";
import { fetchMachineHourlyHistory, type HourlySample, type MachineHour } from "../hashrate-comparison-api";
import { convertUTCToLocal } from "@/utils/date";

import { t } from "@/locales";

interface Props {
  organization: string;
  siteCode: string;
  agentCode: string;
  ip: string;
  onClose: () => void;
}

function beijing(value: string) {
  return convertUTCToLocal(value, "YYYY-MM-DD HH:mm:ss", false, "Asia/Shanghai");
}

function rate(sample: HourlySample | null) {
  return sample == null ? "—" : sample.ths.toLocaleString(undefined, { maximumFractionDigits: 3 });
}

function poolRate(row: MachineHour) {
  switch (row.antpoolIssue) {
    case "no_source":
      return t("无矿池来源");
    case "ambiguous_source":
      return t("矿池来源不唯一");
    case "ambiguous_ip":
      return t("IP 归属冲突");
    default:
      return rate(row.antpool);
  }
}

function sampleCell(sample: HourlySample | null, value: string) {
  return (
    <div className="tabular-nums">
      <div>{value}</div>
      {sample && (
        <time dateTime={sample.collectedAt} className="whitespace-nowrap text-xs text-gray-500">
          {beijing(sample.collectedAt).slice(11)}
        </time>
      )}
    </div>
  );
}

export default function MachineHourlyDrawer({ organization, siteCode, agentCode, ip, onClose }: Props) {
  const query = useQuery({
    queryKey: ["machine-hourly-history", organization, siteCode, agentCode, ip],
    queryFn: ({ signal }) => fetchMachineHourlyHistory(organization, siteCode, agentCode, ip, signal),
    staleTime: 30_000,
  });
  const history = query.data;
  const hours = history?.hours;
  const option = useMemo(
    () => ({
      color: ["#1677ff", "#16856e"],
      legend: { top: 0 },
      tooltip: {
        trigger: "axis",
        confine: true,
        renderMode: "richText",
        // 横轴表示整点，浮层显示各端真实的采集时刻。
        formatter: (items: { dataIndex: number; seriesId: string }[]) => {
          const row = hours?.[items[0]?.dataIndex];
          if (!row) return "";
          const lines = [`${beijing(row.hour).slice(0, 16)} · ${t("北京时间")}`];
          for (const item of items) {
            const isMiner = item.seriesId === "miner";
            const sample = isMiner ? row.miner : row.antpool;
            const name = isMiner ? t("矿机") : "AntPool";
            const value = sample
              ? `${rate(sample)} TH/s · ${beijing(sample.collectedAt).slice(11)}`
              : isMiner
                ? "—"
                : poolRate(row);
            lines.push(`${name}  ${value}`);
          }
          return lines.join("\n");
        },
      },
      grid: { left: 55, right: 15, top: 54, bottom: 40 },
      xAxis: {
        type: "category",
        data: hours?.map((h) => beijing(h.hour).slice(0, 16)),
        axisLabel: { hideOverlap: true, formatter: (label: string) => label.slice(5) },
      },
      yAxis: { type: "value", name: "TH/s" },
      series: (["miner", "antpool"] as const).map((source) => ({
        id: source,
        name: source === "miner" ? t("矿机") : "AntPool",
        type: "line",
        connectNulls: false,
        showAllSymbol: true,
        symbolSize: 4,
        data: hours?.map((h) => h[source]?.ths ?? null),
      })),
    }),
    [hours],
  );
  const latestFirst = useMemo(() => hours?.slice().reverse(), [hours]);
  const retry = (
    <Button size="small" onClick={() => void query.refetch()}>
      {t("重试")}
    </Button>
  );
  const status = history?.antpoolStatus;
  const warning =
    status === "unavailable"
      ? t("AntPool 小时明细暂时无法读取")
      : status === "disabled"
        ? t("矿机服务未启用 AntPool 连接")
        : status === "ambiguous_binding"
          ? t("Agent 绑定不唯一，无法定位 AntPool 场地")
          : "";
  return (
    <Drawer open onClose={onClose} width="min(920px, 100vw)" title={`${ip} · ${t("最近 7 天小时算力")}`}>
      <div className="flex flex-col gap-4">
        <div className="text-sm text-gray-600">
          {siteCode} · {agentCode}
        </div>
        {query.isLoading && <Spin />}
        {query.isError && <Alert type="error" showIcon message={query.error.message} action={retry} />}
        {history && (
          <>
            <div className="text-sm">
              {t("北京时间")} · {history.hours.length > 0 && beijing(history.hours[0].hour)} —{" "}
              {beijing(history.asOf)}
              <div className="text-gray-500">{t("每小时取各端最后一次有效采集，空缺表示未取得读数。")}</div>
            </div>
            {warning && (
              <Alert
                type="warning"
                showIcon
                message={warning}
                action={status === "unavailable" ? retry : undefined}
              />
            )}
            {hours?.some((h) => h.miner || h.antpool) ? (
              <ReactEcharts option={option} renderer="svg" style={{ height: 290 }} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("当前时段无可展示的算力样本")} />
            )}
            <Table<MachineHour>
              size="small"
              rowKey="hour"
              dataSource={latestFirst}
              pagination={{ defaultPageSize: 24, showSizeChanger: false }}
              columns={[
                {
                  title: t("小时（北京时间）"),
                  dataIndex: "hour",
                  render: (v: string) => beijing(v).slice(0, 16),
                },
                {
                  title: (
                    <>
                      {t("矿机 (TH/s)")}
                      <div className="font-normal text-xs">{t("矿机采集时间")}</div>
                    </>
                  ),
                  align: "right",
                  render: (_, h) => sampleCell(h.miner, rate(h.miner)),
                },
                {
                  title: (
                    <>
                      AntPool (TH/s)<div className="font-normal text-xs">{t("AntPool 采集时间")}</div>
                    </>
                  ),
                  align: "right",
                  render: (_, h) => sampleCell(h.antpool, poolRate(h)),
                },
              ]}
            />
          </>
        )}
      </div>
    </Drawer>
  );
}
