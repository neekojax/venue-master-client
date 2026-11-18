import { BarChartOutlined, EnvironmentOutlined, LineChartOutlined } from "@ant-design/icons";
import { Button, Empty, Popover, Spin, Table, Tooltip } from "antd";
import { ReactEcharts } from "@/components/react-echarts";
import { categoryText } from "./display";
import { RequestError } from "./RequestError";
import type { Overview, SiteRankings } from "./types";

import { t } from "@/locales";

const colors = ["#1677ff", "#36b8b0", "#8b79df", "#f5b544", "#e77f9e"];

export default function SiteRankingCharts({
  data,
  loading,
  error,
  retry,
  overview,
  trendLoading,
  trendError,
  retryTrend,
}: {
  data?: SiteRankings;
  loading: boolean;
  error: Error | null;
  retry: () => void;
  overview?: Overview;
  trendLoading: boolean;
  trendError: Error | null;
  retryTrend: () => void;
}) {
  const rows = (data?.abnormal_top5 ?? [])
    .filter((row) => Number.isFinite(row.machine_count) && row.machine_count > 0)
    .slice(0, 5);
  const total = rows.reduce((sum, row) => sum + row.machine_count, 0);
  const trend = [...(overview?.trend ?? [])].sort((a, b) => a.date.localeCompare(b.date));
  return (
    <section
      className="fault-panel rounded-lg border border-gray-200 bg-white p-4"
      aria-label={t("故障设备分布、趋势与分类")}
    >
      <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-12">
        <div className="fault-chart-panel flex min-w-0 flex-col rounded-lg border border-gray-100 bg-gray-50/80 p-3 lg:col-span-4">
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-gray-200/80 pb-2">
            <h3 className="m-0 flex items-center gap-2 text-xs font-bold text-gray-800">
              <EnvironmentOutlined className="text-gray-500" />
              {t("故障设备 TOP5")}
            </h3>
            {rows.length > 3 ? (
              <Popover
                title={t("故障设备 TOP5 · 完整排名")}
                trigger="click"
                placement="bottomRight"
                content={
                  <Table
                    size="small"
                    rowKey="site_id"
                    pagination={false}
                    style={{ width: "min(360px, calc(100vw - 48px))" }}
                    dataSource={rows.map((row, index) => ({
                      ...row,
                      displayRank: index + 1,
                    }))}
                    columns={[
                      { title: t("排名"), dataIndex: "displayRank", width: 48 },
                      {
                        title: t("场地"),
                        dataIndex: "site_name",
                        ellipsis: true,
                      },
                      {
                        title: t("故障台数"),
                        dataIndex: "machine_count",
                        align: "right",
                        width: 88,
                      },
                    ]}
                  />
                }
              >
                <Button
                  type="link"
                  size="small"
                  className="!h-5 !px-0 !text-[11px]"
                  aria-label={t("查看更多故障设备排名")}
                >
                  {t("更多")}
                </Button>
              </Popover>
            ) : (
              <span className="text-[10px] text-gray-400">{t("场地分布")}</span>
            )}
          </div>
          <RequestError error={error} retry={retry} />
          <Spin spinning={loading}>
            {rows.length ? (
              <>
                <div className="relative mx-auto h-[144px] w-full max-w-[320px]">
                  <ReactEcharts
                    renderer="svg"
                    style={{ height: 144 }}
                    option={{
                      color: colors,
                      tooltip: {
                        trigger: "item",
                        renderMode: "richText",
                        backgroundColor: "#fff",
                        borderColor: "#e5e7eb",
                        padding: 12,
                        formatter: t("{b}\n{c} 个设备标识\nTOP5 内占比：{d}%"),
                      },
                      series: [
                        {
                          name: t("故障设备 TOP5"),
                          type: "pie",
                          radius: ["62%", "82%"],
                          center: ["50%", "50%"],
                          stillShowZeroSum: false,
                          itemStyle: {
                            borderRadius: 6,
                            borderColor: "#f9fafb",
                            borderWidth: 4,
                          },
                          label: { show: false },
                          emphasis: { scaleSize: 5, label: { show: false } },
                          data: rows.map((row) => ({
                            name: row.site_name,
                            value: row.machine_count,
                          })),
                        },
                      ],
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-[24px] font-bold leading-none tracking-tight text-gray-900 tabular-nums">
                      {total.toLocaleString()}
                    </span>
                    <span className="mt-2 text-[11px] text-gray-400">{t("TOP5 设备标识")}</span>
                  </div>
                </div>
                <ol
                  className="m-0 flex list-none flex-col gap-1.5 p-0"
                  aria-label={t("故障设备 TOP5 场地明细")}
                >
                  {rows.slice(0, 3).map((row, index) => {
                    const percent = (row.machine_count / total) * 100;
                    return (
                      <li key={row.site_id} className="rounded-md px-1 py-1 transition-colors hover:bg-white">
                        <div className="mb-1 flex items-center gap-2 text-xs">
                          <span className="w-4 shrink-0 font-mono text-[10px] text-gray-400">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span
                            className="h-2 w-2 shrink-0 rounded-full"
                            style={{ backgroundColor: colors[index] }}
                          />
                          <span
                            className="min-w-0 flex-1 truncate font-medium text-gray-700"
                            title={row.site_name}
                          >
                            {row.site_name}
                          </span>
                          <span className="font-mono font-semibold text-gray-900">
                            {row.machine_count.toLocaleString()}
                          </span>
                          <span className="w-12 text-right font-mono text-[10px] text-gray-400">
                            {percent.toFixed(1)}%
                          </span>
                        </div>
                        <div className="ml-6 h-[3px] overflow-hidden rounded-full bg-gray-200/70">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${percent}%`,
                              backgroundColor: colors[index],
                            }}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </>
            ) : (
              <div className="flex min-h-[240px] items-center justify-center">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={error ? t("场地排名暂不可用") : t("当前范围暂无故障设备场地排名")}
                />
              </div>
            )}
          </Spin>
        </div>
        <div className="fault-chart-panel flex min-w-0 flex-col rounded-lg border border-gray-100 bg-gray-50/80 p-3 lg:col-span-4">
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-gray-200/80 pb-2">
            <h3 className="m-0 flex items-center gap-2 text-xs font-bold text-gray-800">
              <LineChartOutlined className="text-gray-500" />
              {t("故障趋势")}
            </h3>
            <div
              role="group"
              aria-label={t("趋势周期")}
              className="flex shrink-0 items-center gap-2 text-[11px]"
            >
              <button
                type="button"
                aria-pressed="true"
                className="rounded bg-blue-50 px-2 py-0.5 font-medium text-blue-600"
              >
                {t("7日", { context: "period" })}
              </button>
              <span aria-hidden="true" className="text-gray-300">
                |
              </span>
              <Tooltip title={t("待制作")}>
                <span className="inline-flex cursor-not-allowed">
                  <button
                    type="button"
                    disabled
                    aria-label={t("1月（待制作）")}
                    className="pointer-events-none px-1 py-0.5 text-gray-400"
                  >
                    {t("1月", { context: "period" })}
                  </button>
                </span>
              </Tooltip>
            </div>
          </div>
          <RequestError error={trendError} retry={retryTrend} />
          <Spin spinning={trendLoading}>
            {trend.length ? (
              <ReactEcharts
                renderer="svg"
                style={{ height: 240 }}
                option={{
                  color: ["#1677ff", "#36b8b0"],
                  tooltip: {
                    trigger: "axis",
                    renderMode: "richText",
                    backgroundColor: "#fff",
                    borderColor: "#e5e7eb",
                    padding: 12,
                  },
                  legend: {
                    data: [t("故障台数"), t("告警数")],
                    top: 10,
                    right: 10,
                    itemWidth: 14,
                    itemHeight: 7,
                    textStyle: { color: "#6b7280", fontSize: 11 },
                  },
                  grid: {
                    top: 38,
                    left: 8,
                    right: 8,
                    bottom: 8,
                    containLabel: true,
                  },
                  xAxis: {
                    type: "category",
                    boundaryGap: false,
                    data: trend.map((point) => point.date),
                    axisLine: { lineStyle: { color: "#e5e7eb" } },
                    axisTick: { show: false },
                    axisLabel: {
                      color: "#9ca3af",
                      fontSize: 10,
                      margin: 12,
                      formatter: (value: string) => value.slice(5).replace("-", "/"),
                    },
                  },
                  yAxis: {
                    type: "value",
                    minInterval: 1,
                    axisLabel: { color: "#9ca3af", fontSize: 10 },
                    splitLine: {
                      lineStyle: { color: "#e5e7eb", type: "dashed" },
                    },
                  },
                  series: [
                    {
                      name: t("故障台数"),
                      type: "line",
                      symbol: "circle",
                      symbolSize: 6,
                      lineStyle: { width: 2.5 },
                      itemStyle: { borderWidth: 2, borderColor: "#fff" },
                      areaStyle: {
                        color: {
                          type: "linear",
                          x: 0,
                          y: 0,
                          x2: 0,
                          y2: 1,
                          colorStops: [
                            { offset: 0, color: "rgba(22,119,255,0.16)" },
                            { offset: 1, color: "rgba(22,119,255,0.01)" },
                          ],
                        },
                      },
                      data: trend.map((point) => point.machine_count),
                    },
                    {
                      name: t("告警数"),
                      type: "line",
                      symbol: "circle",
                      symbolSize: 5,
                      lineStyle: { width: 2 },
                      data: trend.map((point) => point.log_count),
                    },
                  ],
                }}
              />
            ) : (
              <div className="flex min-h-[240px] items-center justify-center">
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={trendError ? t("趋势数据暂不可用") : t("暂无已识别故障趋势")}
                />
              </div>
            )}
          </Spin>
        </div>
        <div className="fault-chart-panel flex min-w-0 flex-col rounded-lg border border-gray-100 bg-gray-50/80 p-3 lg:col-span-4">
          <div className="mb-2 flex items-center justify-between gap-2 border-b border-gray-200/80 pb-2">
            <h3 className="m-0 flex items-center gap-2 text-xs font-bold text-gray-800">
              <BarChartOutlined className="text-gray-500" />
              {t("故障分类")}
            </h3>
            <span className="text-[10px] text-gray-400">
              {t("{{count}} 类", { count: overview?.categories?.length ?? 0 })}
            </span>
          </div>
          <RequestError error={trendError} retry={retryTrend} />
          <Table
            className="fault-category-table"
            tableLayout="fixed"
            size="small"
            rowKey="category"
            loading={trendLoading}
            pagination={false}
            dataSource={overview?.categories ?? []}
            columns={[
              {
                title: t("类别"),
                dataIndex: "category",
                render: categoryText,
                width: "40%",
              },
              {
                title: t("故障台数"),
                dataIndex: "machine_count",
                align: "right",
                width: "30%",
              },
              {
                title: t("告警数"),
                dataIndex: "log_count",
                align: "right",
                width: "30%",
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
