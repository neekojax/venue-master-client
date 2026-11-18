import { useMemo, useState } from "react";
import { ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Alert, Button, Card, Col, Form, Input, Row, Select, Space, Statistic, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { fetchMachines, fetchOverview, fetchSiteRankings, fetchSites } from "./api";
import { categoryText } from "./display";
import { categories, renderSeverity, severities, shanghaiTime } from "./display";
import MachineDrawer from "./MachineDrawer";
import { RequestError } from "./RequestError";
import { mapPredictionSiteOptions } from "./siteMapping";
import SiteRankingCharts from "./SiteRankingCharts";
import type { Machine, PredictionFilters, PredictionSession, Scope } from "./types";
import { useSettingsStore } from "@/stores";

import "./prediction.css";

import { t } from "@/locales";
import { useVenueList } from "@/pages/venue/hook/hook";

export default function FaultPrediction() {
  const [sessionId] = useState(() => crypto.randomUUID());
  const poolType = useSettingsStore((state) => state.poolType);
  // CANG 使用预测组织 1，其他运营组织使用组织 2；切换时隔离页面状态。
  const session: PredictionSession = {
    group_id: poolType === "CANG" ? "1" : "2",
    sessionId: `${sessionId}-${poolType}`,
  };
  return <PredictionDashboard key={session.sessionId} session={session} />;
}

export function PredictionDashboard({ session }: { session: PredictionSession }) {
  const [form] = Form.useForm<PredictionFilters>();
  const poolType = useSettingsStore((state) => state.poolType);
  const currentSites = useVenueList(poolType);
  const [siteId, setSiteId] = useState<number>();
  const [filters, setFilters] = useState<PredictionFilters>({});
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedMachine, setSelectedMachine] = useState<Machine>();
  const scope: Scope = { group_id: session.group_id, site_id: siteId };
  // 查询 key 只使用随机会话 ID，隔离不同组织的预测数据。
  const key = ["fault-predictions", session.sessionId];
  const sites = useQuery({
    queryKey: [...key, "sites"],
    queryFn: ({ signal }) => fetchSites(scope, signal),
    retry: false,
  });
  const overview = useQuery({
    queryKey: [...key, "overview", siteId],
    queryFn: ({ signal }) => fetchOverview(scope, signal),
    retry: false,
  });
  const machines = useQuery({
    queryKey: [...key, "machines", siteId, filters, page, limit],
    queryFn: ({ signal }) => fetchMachines(scope, filters, page, limit, signal),
    retry: false,
  });
  const rankings = useQuery({
    queryKey: [...key, "site-rankings", siteId],
    queryFn: ({ signal }) => fetchSiteRankings(scope, signal),
    retry: false,
  });
  const siteOptions = useMemo(
    () => mapPredictionSiteOptions(currentSites.data?.data ?? [], sites.data ?? []),
    [currentSites.data, sites.data],
  );
  const data = overview.data;
  const columns: ColumnsType<Machine> = [
    { title: t("场地"), dataIndex: "site_name", width: 180, ellipsis: true },
    { title: t("当前 IP"), dataIndex: "ip" },
    {
      title: t("MAC / 控制板 SN"),
      key: "identity",
      render: (_, m) => (
        <>
          <div>{m.mac_address || "—"}</div>
          <div className="text-xs text-gray-500">{m.control_board_sn || "—"}</div>
        </>
      ),
    },
    { title: t("等级"), dataIndex: "severity", render: renderSeverity },
    {
      title: t("故障分类"),
      dataIndex: "categories",
      render: (values: string[]) => values?.map(categoryText).join(t("、")) || "—",
    },
    {
      title: t("故障日"),
      dataIndex: "abnormal_days",
      render: (count: number) => t("{{count}} / 7 天", { count }),
    },
    { title: t("告警数"), dataIndex: "log_count" },
    { title: t("最近故障"), dataIndex: "last_seen", render: shanghaiTime },
    {
      title: t("操作"),
      key: "action",
      fixed: "right",
      render: (_, machine) => (
        <Button type="link" size="small" onClick={() => setSelectedMachine(machine)}>
          {t("查看详情")}
        </Button>
      ),
    },
  ];
  const refresh = () => {
    void currentSites.refetch();
    void sites.refetch();
    void overview.refetch();
    void machines.refetch();
    void rankings.refetch();
  };
  return (
    <div className="fault-page fault-prediction flex min-h-full flex-col gap-4">
      <div className="fault-command-header fault-prediction-header flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-5">
        <div>
          <h2 className="m-0 flex items-center gap-2 text-lg font-semibold">
            <span className="h-2 w-2 rounded-full bg-red-500" />
            {t("故障预测")}
            <span className="rounded-md border border-blue-100 bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
              {t("七天分析")}
            </span>
          </h2>
          <p className="mb-0 mt-1.5 text-xs text-gray-500">
            {t("最近七个自然日 · 按故障规则确定排查优先级")}
          </p>
        </div>
        <Space wrap>
          <Select
            aria-label={t("预测场地")}
            loading={currentSites.isLoading || sites.isLoading}
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder={t("全部可访问场地")}
            value={siteId}
            style={{ width: 210 }}
            options={siteOptions}
            onChange={(id: number | undefined) => {
              setSiteId(id);
              setPage(1);
              setSelectedMachine(undefined);
              setFilters({});
              form.resetFields();
            }}
          />
          <Button
            icon={<ReloadOutlined />}
            loading={overview.isFetching || machines.isFetching || rankings.isFetching}
            onClick={refresh}
          >
            {t("刷新")}
          </Button>
        </Space>
      </div>
      <RequestError error={currentSites.error} retry={() => void currentSites.refetch()} />
      <RequestError error={sites.error} retry={() => void sites.refetch()} />
      <RequestError error={overview.error} retry={() => void overview.refetch()} />
      {data && !data.snapshots?.length && (
        <Alert type="warning" showIcon message={t("当前场地范围尚未生成分析快照，不能据此判断无故障。")} />
      )}
      <Row gutter={[16, 16]}>
        {[
          [t("故障台数"), data?.summary.machine_count],
          [t("高风险"), data?.summary.high_count],
          [t("需关注"), data?.summary.medium_count],
          [t("集中故障分组"), data?.summary.cluster_count],
        ].map(([title, value], index) => (
          <Col xs={12} lg={6} key={String(title)}>
            <Card className={`fault-kpi fault-kpi-${index}`} loading={overview.isPending}>
              <span className="fault-kpi-index" aria-hidden="true">
                0{index + 1}
              </span>
              <Statistic title={title} value={value ?? "—"} />
            </Card>
          </Col>
        ))}
      </Row>
      <SiteRankingCharts
        data={rankings.data}
        loading={rankings.isPending}
        error={rankings.error}
        retry={() => void rankings.refetch()}
        overview={data}
        trendLoading={overview.isPending}
        trendError={overview.error}
        retryTrend={() => void overview.refetch()}
      />

      <Card className="fault-table-panel" title={t("预测故障机器")} id="prediction-machines">
        <Form
          form={form}
          layout="inline"
          size="small"
          colon={false}
          className="prediction-machine-filters"
          onValuesChange={(changedValues: Partial<PredictionFilters>) => {
            if (["severity", "category"].some((field) => field in changedValues)) {
              form.submit();
            }
          }}
          onFinish={(values) => {
            setFilters(
              Object.fromEntries(
                Object.entries(values).map(([k, v]) => [
                  k,
                  typeof v === "string" ? v.trim() || undefined : v,
                ]),
              ),
            );
            setPage(1);
          }}
        >
          <Form.Item name="severity" label={t("等级")} className="prediction-filter-select">
            <Select allowClear placeholder={t("全部")} options={severities} />
          </Form.Item>
          <Form.Item name="category" label={t("故障分类")} className="prediction-filter-select">
            <Select allowClear placeholder={t("全部")} options={categories} />
          </Form.Item>
          <Form.Item name="keyword" label={t("设备")} className="prediction-filter-keyword">
            <Input allowClear placeholder={t("IP / MAC / 控制板 SN")} />
          </Form.Item>
          <Form.Item className="prediction-filter-actions">
            <Space size={6}>
              <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                {t("查询")}
              </Button>
              <Button
                type="text"
                onClick={() => {
                  form.resetFields();
                  setFilters({});
                  setPage(1);
                }}
              >
                {t("重置")}
              </Button>
            </Space>
          </Form.Item>
        </Form>
        <RequestError error={machines.error} retry={() => void machines.refetch()} />
        <Table<Machine>
          rowKey="id"
          columns={columns}
          dataSource={machines.data?.list ?? []}
          loading={machines.isFetching}
          scroll={{ x: 1200 }}
          pagination={{
            current: page,
            pageSize: limit,
            pageSizeOptions: [10, 20, 50, 100],
            total: machines.data?.pagination.total ?? 0,
            showSizeChanger: true,
            showTotal: (total) => t("共 {{count}} 个设备标识", { count: total }),
            onChange: (next, size) => {
              setPage(size !== limit ? 1 : next);
              setLimit(size);
            },
          }}
        />
      </Card>
      {selectedMachine && (
        <MachineDrawer
          key={`${session.sessionId}-${selectedMachine.id}`}
          scope={{ ...scope, site_id: selectedMachine.site_id }}
          sessionId={session.sessionId}
          id={selectedMachine.id}
          onClose={() => setSelectedMachine(undefined)}
        />
      )}
    </div>
  );
}
