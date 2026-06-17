import { Col, Row, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { WeeklyReportRow } from "./weeklyMock";

const columns: ColumnsType<WeeklyReportRow> = [
  {
    title: "周次",
    dataIndex: "weekLabel",
    key: "weekLabel",
    fixed: "left",
    width: 160,
    render: (_value, record) => (
      <div>
        <div className="font-medium text-slate-800">{`第${record.weekNo}周`}</div>
        <div className="text-xs text-slate-400">
          {record.startDate} ~ {record.endDate}
        </div>
      </div>
    ),
  },
  {
    title: "理论算力(PH/s)",
    dataIndex: "theoreticalHashrate",
    key: "theoreticalHashrate",
    width: 140,
    render: (value) => <span className="font-medium text-slate-700">{value.toFixed(2)}</span>,
  },
  {
    title: "实际算力(PH/s)",
    dataIndex: "actualHashrate",
    key: "actualHashrate",
    width: 140,
    render: (value) => <span className="font-semibold text-blue-600">{value.toFixed(2)}</span>,
  },
  {
    title: "算力有效率",
    dataIndex: "hashEffectiveRate",
    key: "hashEffectiveRate",
    width: 130,
    render: (value) => (
      <Tag color={value >= 95 ? "green" : value >= 90 ? "gold" : "red"}>{value.toFixed(2)}%</Tag>
    ),
  },
  { title: "产出(BTC)", dataIndex: "incomeBtc", key: "incomeBtc", width: 120, render: (v) => v.toFixed(4) },
  {
    title: "产出效率",
    dataIndex: "incomeEfficiency",
    key: "incomeEfficiency",
    width: 120,
    render: (v) => v.toFixed(4),
  },
  {
    title: "净有效率",
    dataIndex: "netEffectiveRate",
    key: "netEffectiveRate",
    width: 120,
    render: (v) => (
      <span
        className={`font-semibold ${v >= 90 ? "text-emerald-600" : v >= 85 ? "text-amber-600" : "text-rose-600"}`}
      >
        {v.toFixed(2)}%
      </span>
    ),
  },
  {
    title: "故障数",
    dataIndex: "faultCount",
    key: "faultCount",
    width: 100,
    render: (v) => <span className="font-medium text-amber-600">{v}</span>,
  },
  {
    title: "故障率",
    dataIndex: "faultRate",
    key: "faultRate",
    width: 100,
    render: (v) => (
      <span
        className={`font-medium ${v >= 0.8 ? "text-rose-600" : v >= 0.5 ? "text-amber-600" : "text-emerald-600"}`}
      >
        {v.toFixed(2)}%
      </span>
    ),
  },
  { title: "待修数", dataIndex: "pendingCount", key: "pendingCount", width: 100 },
  {
    title: "待修率",
    dataIndex: "pendingRate",
    key: "pendingRate",
    width: 100,
    render: (v) => `${v.toFixed(2)}%`,
  },
  { title: "报废数", dataIndex: "scrapCount", key: "scrapCount", width: 100 },
  {
    title: "高温影响率",
    dataIndex: "highTemperatureImpactRate",
    key: "highTemperatureImpactRate",
    width: 120,
    render: (v) => (
      <span
        className={`font-medium ${v >= 3 ? "text-rose-600" : v >= 2 ? "text-amber-600" : "text-emerald-600"}`}
      >
        {v.toFixed(2)}%
      </span>
    ),
  },
  {
    title: "限电影响率",
    dataIndex: "limitImpactRate",
    key: "limitImpactRate",
    width: 120,
    render: (v) => (
      <span
        className={`font-medium ${v >= 2 ? "text-violet-600" : v >= 1 ? "text-amber-600" : "text-emerald-600"}`}
      >
        {v.toFixed(2)}%
      </span>
    ),
  },
  { title: "本周上架", dataIndex: "weeklyOnlineCount", key: "weeklyOnlineCount", width: 100 },
  { title: "本周下架", dataIndex: "weeklyOfflineCount", key: "weeklyOfflineCount", width: 100 },
];

export default function WeeklyBusinessReport({ data }: { data: WeeklyReportRow[] }) {
  const summary = data.reduce(
    (acc, row) => {
      acc.hashEffectiveRate += row.hashEffectiveRate;
      acc.faultRate += row.faultRate;
      acc.highTemperatureImpactRate += row.highTemperatureImpactRate;
      acc.limitImpactRate += row.limitImpactRate;
      return acc;
    },
    {
      hashEffectiveRate: 0,
      faultRate: 0,
      highTemperatureImpactRate: 0,
      limitImpactRate: 0,
    },
  );
  const divisor = Math.max(data.length, 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">运营周报</h3>
          <p className="text-sm text-slate-500">最近 10 周核心经营指标趋势与结果汇总</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">近10周</span>
      </div>
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70">
        <Row gutter={[12, 12]}>
          <Col xs={24} sm={12} xl={6}>
            <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white px-4 py-3">
              <div className="text-xs text-slate-500">平均算力有效率</div>
              <div className="mt-1 text-2xl font-semibold text-blue-600">
                {(summary.hashEffectiveRate / divisor).toFixed(2)}%
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <div className="rounded-xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white px-4 py-3">
              <div className="text-xs text-slate-500">平均故障率</div>
              <div className="mt-1 text-2xl font-semibold text-amber-600">
                {(summary.faultRate / divisor).toFixed(2)}%
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-orange-50 to-white px-4 py-3">
              <div className="text-xs text-slate-500">平均高温影响率</div>
              <div className="mt-1 text-2xl font-semibold text-orange-600">
                {(summary.highTemperatureImpactRate / divisor).toFixed(2)}%
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12} xl={6}>
            <div className="rounded-xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white px-4 py-3">
              <div className="text-xs text-slate-500">平均限电影响率</div>
              <div className="mt-1 text-2xl font-semibold text-violet-600">
                {(summary.limitImpactRate / divisor).toFixed(2)}%
              </div>
            </div>
          </Col>
        </Row>
      </div>
      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ x: 1900 }}
        rowKey="key"
        size="middle"
        rowClassName={(_, index) => (index % 2 === 0 ? "bg-white" : "bg-slate-50/50")}
        className="weekly-report-table"
      />
    </div>
  );
}
