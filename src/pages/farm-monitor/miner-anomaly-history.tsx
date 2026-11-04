import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, DatePicker, Empty, Form, Pagination, Space, Spin, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs, { type Dayjs } from "dayjs";
import { ReactEcharts } from "@/components/react-echarts";
import { fetchOtherPoolMachineAnomalyHistory } from "./miner-anomaly-history-api";
import type { OtherPoolMachineAnomalyHistoryItem, OtherPoolMachineAnomalyMachine } from "./types";
import { ROUTE_PATHS } from "@/constants/common";
import useAuthRedirect from "@/hooks/useAuthRedirect";
import { useSettingsStore } from "@/stores";
import { useSelector } from "@/stores/selectors";
import { getAbnormalStatsDate } from "@/utils";

import { t } from "@/locales";

const { RangePicker } = DatePicker;
const DATE_FORMAT = "YYYY-MM-DD";
const DEFAULT_PAGE_SIZE = 30;

interface FilterValues {
  dateRange: [Dayjs, Dayjs];
}

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function validDate(value: string | null, fallback: string) {
  return value && dayjs(value).isValid() ? dayjs(value).format(DATE_FORMAT) : fallback;
}

export default function MinerAnomalyHistoryPage() {
  useAuthRedirect();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form] = Form.useForm<FilterValues>();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const siteName = searchParams.get("siteName")?.trim() ?? "";
  const siteCode = searchParams.get("siteCode")?.trim() ?? "";
  const defaultEndDate = getAbnormalStatsDate().format(DATE_FORMAT);
  const defaultStartDate = dayjs(defaultEndDate).subtract(29, "day").format(DATE_FORMAT);
  const startDate = validDate(searchParams.get("startDate"), defaultStartDate);
  const endDate = validDate(searchParams.get("endDate"), defaultEndDate);
  const page = positiveInteger(searchParams.get("page"), 1);
  const pageSize = Math.min(365, positiveInteger(searchParams.get("pageSize"), DEFAULT_PAGE_SIZE));

  useEffect(() => {
    form.setFieldsValue({ dateRange: [dayjs(startDate), dayjs(endDate)] });
  }, [endDate, form, startDate]);

  const historyQuery = useQuery({
    queryKey: ["other-pool-machine-anomaly-history", poolType, siteName, startDate, endDate, page, pageSize],
    queryFn: ({ signal }) =>
      fetchOtherPoolMachineAnomalyHistory(poolType, siteName, startDate, endDate, page, pageSize, signal),
    enabled: Boolean(poolType && siteName),
  });

  const rows = useMemo(() => historyQuery.data?.list ?? [], [historyQuery.data?.list]);
  const chartRows = useMemo(() => [...rows].reverse(), [rows]);
  const chartOption = useMemo(
    () => ({
      tooltip: { trigger: "axis" },
      legend: { data: [t("异常机器数"), t("异常矿工号数")], top: 0 },
      grid: { left: 50, right: 24, top: 45, bottom: 45 },
      xAxis: {
        type: "category",
        data: chartRows.map((item) => item.businessDate),
        axisLabel: { rotate: chartRows.length > 12 ? 30 : 0 },
      },
      yAxis: { type: "value", minInterval: 1 },
      series: [
        {
          name: t("异常机器数"),
          type: "line",
          smooth: true,
          data: chartRows.map((item) => item.abnormalCount),
          itemStyle: { color: "#ff4d4f" },
          areaStyle: { color: "rgba(255,77,79,0.08)" },
        },
        {
          name: t("异常矿工号数"),
          type: "line",
          smooth: true,
          data: chartRows.map((item) => item.minerCodeTotal),
          itemStyle: { color: "#1677ff" },
        },
      ],
    }),
    [chartRows],
  );

  const updateSearchParams = (updates: Record<string, string>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => next.set(key, value));
    setSearchParams(next);
  };

  const columns: ColumnsType<OtherPoolMachineAnomalyHistoryItem> = [
    {
      title: t("业务日期"),
      dataIndex: "businessDate",
      key: "businessDate",
      width: 130,
      fixed: "left",
    },
    {
      title: t("统计窗口"),
      key: "window",
      width: 190,
      render: (_, row) => (
        <div className="text-xs leading-5 text-gray-600">
          <div>{row.windowStart || "-"}</div>
          <div>{row.windowEnd || "-"}</div>
        </div>
      ),
    },
    {
      title: t("异常机器数"),
      dataIndex: "abnormalCount",
      key: "abnormalCount",
      width: 120,
      align: "right",
      render: (value: number) => <span className="font-semibold text-red-500">{value}</span>,
    },
    {
      title: t("异常矿工号数"),
      dataIndex: "minerCodeTotal",
      key: "minerCodeTotal",
      width: 130,
      align: "right",
    },
    {
      title: t("异常矿工号明细"),
      key: "minerCodeData",
      minWidth: 360,
      render: (_, row) => {
        const details = row.minerCodeData.length
          ? row.minerCodeData
          : row.minerCodes.map((minerCode) => ({ minerCode, abnormalCount: 0 }));
        return details.length ? (
          <div className="flex flex-wrap gap-1.5">
            {details.map((item) => (
              <Tag key={item.minerCode} color="blue" className="!m-0">
                {item.minerCode}
                {item.abnormalCount > 0 ? ` · ${item.abnormalCount} ${t("台")}` : ""}
              </Tag>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        );
      },
    },
  ];

  const machineColumns: ColumnsType<OtherPoolMachineAnomalyMachine> = [
    {
      title: "MAC",
      dataIndex: "mac",
      key: "mac",
      width: 220,
      render: (value: string) => value || "-",
    },
    {
      title: t("控制板 SN"),
      dataIndex: "controlBoardSN",
      key: "controlBoardSN",
      width: 240,
      render: (value: string) => value || "-",
    },
    {
      title: t("异常矿工号"),
      dataIndex: "minerCodes",
      key: "minerCodes",
      render: (minerCodes: string[]) =>
        minerCodes.length ? (
          <div className="flex flex-wrap gap-1.5">
            {minerCodes.map((minerCode) => (
              <Tag key={minerCode} color="blue" className="!m-0">
                {minerCode}
              </Tag>
            ))}
          </div>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
  ];

  const goBack = () => {
    const params = new URLSearchParams();
    if (siteCode) params.set("siteCode", siteCode);
    navigate(`${ROUTE_PATHS.farmMonitor}${params.size ? `?${params}` : ""}`);
  };

  return (
    <div className="min-h-full bg-[#f5f5f7] -m-4 p-4 md:p-6">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Button icon={<ArrowLeftOutlined />} onClick={goBack}>
              {t("返回矿机监控")}
            </Button>
            <div className="min-w-0">
              <h1 className="m-0 truncate text-xl font-semibold text-gray-900">{t("异常矿工历史")}</h1>
              <div className="mt-1 truncate text-sm text-gray-500">
                {siteName || t("未选择场地")} · {poolType || "-"}
              </div>
            </div>
          </div>
          <Button
            icon={<ReloadOutlined />}
            loading={historyQuery.isFetching}
            disabled={!siteName}
            onClick={() => void historyQuery.refetch()}
          >
            {t("刷新")}
          </Button>
        </header>

        {!siteName ? <Alert type="warning" showIcon message={t("请从矿机监控选择场地后进入")} /> : null}

        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <Form<FilterValues>
            form={form}
            layout="inline"
            onFinish={(values) => {
              const range = values.dateRange;
              updateSearchParams({
                startDate: range[0].format(DATE_FORMAT),
                endDate: range[1].format(DATE_FORMAT),
                page: "1",
              });
            }}
          >
            <Form.Item name="dateRange" label={t("业务日期范围")} rules={[{ required: true }]}>
              <RangePicker
                allowClear={false}
                format={DATE_FORMAT}
                disabledDate={(current) => current.isAfter(dayjs(), "day")}
              />
            </Form.Item>
            <Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  {t("查询")}
                </Button>
                <Button
                  onClick={() => {
                    form.setFieldsValue({
                      dateRange: [dayjs(defaultStartDate), dayjs(defaultEndDate)],
                    });
                    updateSearchParams({
                      startDate: defaultStartDate,
                      endDate: defaultEndDate,
                      page: "1",
                    });
                  }}
                >
                  {t("重置")}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </section>

        {historyQuery.isError ? (
          <Alert
            type="error"
            showIcon
            message={t("获取异常矿工历史失败")}
            description={historyQuery.error.message}
          />
        ) : null}

        <Spin spinning={historyQuery.isLoading}>
          <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="m-0 text-base font-semibold text-gray-900">{t("每日异常矿工趋势")}</h2>
              <span className="text-xs text-gray-400">{t("仅展示当前页数据")}</span>
            </div>
            {rows.length ? (
              <ReactEcharts option={chartOption} style={{ height: 300, width: "100%" }} />
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t("暂无异常矿工历史")} />
            )}
          </section>

          <section className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 mt-0 text-base font-semibold text-gray-900">{t("异常矿工历史明细")}</h2>
            <Table<OtherPoolMachineAnomalyHistoryItem>
              rowKey="businessDate"
              columns={columns}
              dataSource={rows}
              loading={historyQuery.isFetching && !historyQuery.isLoading}
              scroll={{ x: 1050 }}
              locale={{ emptyText: t("暂无异常矿工历史") }}
              pagination={false}
              expandable={{
                rowExpandable: (row) => row.machineData.length > 0,
                expandedRowRender: (row) => (
                  <Table<OtherPoolMachineAnomalyMachine>
                    rowKey={(machine) => `${machine.mac}-${machine.controlBoardSN}`}
                    columns={machineColumns}
                    dataSource={row.machineData}
                    pagination={false}
                    size="small"
                    locale={{ emptyText: t("暂无异常矿工历史") }}
                  />
                ),
              }}
            />
            <div className="mt-4 flex justify-end">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={historyQuery.data?.total ?? 0}
                showSizeChanger
                pageSizeOptions={[10, 20, 30, 50, 100]}
                onChange={(nextPage, nextPageSize) =>
                  updateSearchParams({
                    page: String(nextPageSize === pageSize ? nextPage : 1),
                    pageSize: String(nextPageSize),
                  })
                }
              />
            </div>
          </section>
        </Spin>
      </div>
    </div>
  );
}
