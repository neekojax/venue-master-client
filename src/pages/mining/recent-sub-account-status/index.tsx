import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  DashboardOutlined,
  DisconnectOutlined,
  DownloadOutlined,
  LineChartOutlined,
  TableOutlined,
} from "@ant-design/icons";
import { Alert, Button, Card, Col, Empty, Row, Spin, Statistic, Table, Typography } from "antd";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { toPng } from "html-to-image";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";

import { fetchRecentSubAccountStatus } from "@/pages/mining/api.tsx";

const { Title, Text } = Typography;

type RecentSubAccountStatusItem = {
  Time: string;
  CurrentHashrate: number;
  OnlineMachines: number;
  OfflineMachines: number;
};

type RawRecentSubAccountStatusItem = Record<string, any>;

type LocationState = {
  poolName?: string;
  venueName?: string;
};

function formatHashrate(value: number) {
  const numericValue = Number(value || 0);
  if (Math.abs(numericValue) >= 1000) {
    const converted = numericValue / 1000;
    return {
      value: converted,
      unit: "PH/s",
      text: `${converted.toFixed(2)} PH/s`,
    };
  }

  return {
    value: numericValue,
    unit: "TH/s",
    text: `${numericValue.toFixed(2)} TH/s`,
  };
}

function buildPolyline(values: number[], width: number, height: number, topPadding = 22, bottomPadding = 30) {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const usableHeight = height - topPadding - bottomPadding;

  return values
    .map((value, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = topPadding + ((max - value) / range) * usableHeight;
      return `${x},${y}`;
    })
    .join(" ");
}

async function downloadHistoryWorkbook(
  history: RecentSubAccountStatusItem[],
  poolName?: string,
  summary?: {
    last: RecentSubAccountStatusItem;
    hashrateDelta: number;
    offlineDelta: number;
    maxHashrate: number;
    avgHashrate: number;
  } | null,
) {
  const safeName = (poolName || "recent-sub-account-status").replace(/[\\/:*?"<>|]/g, "-");
  const workbook = new ExcelJS.Workbook();
  const overviewSheet = workbook.addWorksheet("总览");
  const detailSheet = workbook.addWorksheet("详细数据");

  overviewSheet.columns = [
    { header: "项目", key: "label", width: 18 },
    { header: "值", key: "value", width: 22 },
    { header: "项目2", key: "label2", width: 18 },
    { header: "值2", key: "value2", width: 22 },
  ];

  overviewSheet.mergeCells("A1:D1");
  overviewSheet.getCell("A1").value = `${poolName || "子账户"} 历史状态`;
  overviewSheet.getCell("A1").font = { size: 20, bold: true, color: { argb: "1E3A8A" } };
  overviewSheet.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };
  overviewSheet.getRow(1).height = 28;

  if (summary) {
    overviewSheet.getCell("A3").value = "最新算力";
    overviewSheet.getCell("B3").value = formatHashrate(summary.last.CurrentHashrate).text;
    overviewSheet.getCell("C3").value = "平均算力";
    overviewSheet.getCell("D3").value = formatHashrate(summary.avgHashrate).text;

    overviewSheet.getCell("A4").value = "最新在线机器";
    overviewSheet.getCell("B4").value = summary.last.OnlineMachines;
    overviewSheet.getCell("C4").value = "最新离线机器";
    overviewSheet.getCell("D4").value = summary.last.OfflineMachines;

    overviewSheet.getCell("A5").value = "峰值算力";
    overviewSheet.getCell("B5").value = formatHashrate(summary.maxHashrate).text;
    overviewSheet.getCell("C5").value = "记录条数";
    overviewSheet.getCell("D5").value = history.length;

    ["A3", "C3", "A4", "C4", "A5", "C5"].forEach((cell) => {
      overviewSheet.getCell(cell).font = { bold: true, color: { argb: "475569" } };
      overviewSheet.getCell(cell).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "F8FAFC" },
      };
    });
  }

  const chartNode = document.getElementById("recent-status-chart");
  if (chartNode) {
    try {
      const chartDataUrl = await toPng(chartNode as HTMLElement, { cacheBust: true, pixelRatio: 2 });
      const imageId = workbook.addImage({
        base64: chartDataUrl,
        extension: "png",
      });
      overviewSheet.addImage(imageId, {
        tl: { col: 0, row: 5.2 },
        ext: { width: 980, height: 360 },
      });
    } catch (_error) {
      // ignore chart snapshot failure; workbook remains downloadable
    }
  }

  detailSheet.columns = [
    { header: "时间", key: "time", width: 24 },
    { header: "当前算力", key: "hashrate", width: 20 },
    { header: "在线机器", key: "online", width: 14 },
    { header: "离线机器", key: "offline", width: 14 },
  ];

  detailSheet.mergeCells("A1:D1");
  detailSheet.getCell("A1").value = `${poolName || "子账户"} 历史状态详细数据`;
  detailSheet.getCell("A1").font = { size: 16, bold: true, color: { argb: "1E3A8A" } };
  detailSheet.getCell("A1").alignment = { vertical: "middle", horizontal: "left" };
  detailSheet.getRow(1).height = 24;

  const headerRowIndex = 3;
  const headerRow = detailSheet.getRow(headerRowIndex);
  headerRow.values = ["时间", "当前算力", "在线机器", "离线机器"];
  headerRow.font = { bold: true, color: { argb: "0F172A" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "EFF6FF" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 22;

  history
    .slice()
    .reverse()
    .forEach((item, index) => {
      const row = detailSheet.getRow(headerRowIndex + 1 + index);
      row.values = [
        item.Time,
        formatHashrate(item.CurrentHashrate).text,
        item.OnlineMachines,
        item.OfflineMachines,
      ];
      row.getCell(3).font = { color: { argb: "15803D" }, bold: true };
      row.getCell(4).font = { color: { argb: "EA580C" }, bold: true };
      row.height = 20;
    });

  detailSheet.views = [{ state: "frozen", ySplit: headerRowIndex }];

  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${safeName}-history-status.xlsx`);
}

function SvgLineChart({ history }: { history: RecentSubAccountStatusItem[] }) {
  const width = 1180;
  const height = 340;
  const chartLeft = 12;
  const chartRight = 12;
  const chartWidth = width - chartLeft - chartRight;
  const [visibleSeries, setVisibleSeries] = useState({
    hashrate: true,
    online: true,
    offline: true,
  });
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (history.length === 0) {
    return <Empty description="暂无历史状态数据" style={{ padding: "40px 0" }} />;
  }

  const hashrates = history.map((item) => item.CurrentHashrate);
  const online = history.map((item) => item.OnlineMachines);
  const offline = history.map((item) => item.OfflineMachines);
  const labels = history.map((item) => item.Time.slice(5, 16));
  const labelStep = Math.max(1, Math.ceil(labels.length / 8));

  const shiftPoints = (points: string) =>
    points
      .split(" ")
      .map((point) => {
        const [x, y] = point.split(",");
        return `${Number(x) + chartLeft},${y}`;
      })
      .join(" ");

  const hashrateLine = shiftPoints(buildPolyline(hashrates, chartWidth, height));
  const onlineLine = shiftPoints(buildPolyline(online, chartWidth, height));
  const offlineLine = shiftPoints(buildPolyline(offline, chartWidth, height));
  const hashrateArea = `${hashrateLine} ${width - chartRight},${height - 30} ${chartLeft},${height - 30}`;
  const gridYs = [42, 96, 150, 204, 258];
  const hoverPoint =
    hoverIndex === null
      ? null
      : {
          x:
            history.length === 1
              ? chartLeft + chartWidth / 2
              : chartLeft + (hoverIndex / (history.length - 1)) * chartWidth,
          item: history[hoverIndex],
        };

  return (
    <div style={{ overflowX: "auto" }}>
      <div style={{ minWidth: width }}>
        <div
          style={{
            display: "flex",
            gap: 20,
            marginBottom: 12,
            color: "#475569",
            fontSize: 13,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 20,
              flex: 1,
            }}
          >
            <button
              type="button"
              onClick={() => setVisibleSeries((prev) => ({ ...prev, hashrate: !prev.hashrate }))}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: visibleSeries.hashrate ? "#334155" : "#94a3b8",
                opacity: visibleSeries.hashrate ? 1 : 0.5,
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#2563eb" }} />
              当前算力
            </button>
            <button
              type="button"
              onClick={() => setVisibleSeries((prev) => ({ ...prev, online: !prev.online }))}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: visibleSeries.online ? "#334155" : "#94a3b8",
                opacity: visibleSeries.online ? 1 : 0.5,
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
              在线机器
            </button>
            <button
              type="button"
              onClick={() => setVisibleSeries((prev) => ({ ...prev, offline: !prev.offline }))}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: visibleSeries.offline ? "#334155" : "#94a3b8",
                opacity: visibleSeries.offline ? 1 : 0.5,
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f97316" }} />
              离线机器
            </button>
          </div>
        </div>
        <svg
          id="recent-status-chart"
          viewBox={`0 0 ${width} ${height}`}
          style={{ width: "100%", height: 340 }}
          onMouseLeave={() => setHoverIndex(null)}
          onMouseMove={(event) => {
            const svg = event.currentTarget;
            const rect = svg.getBoundingClientRect();
            const relativeX = event.clientX - rect.left;
            const ratio = rect.width > 0 ? relativeX / rect.width : 0;
            const index = Math.min(
              history.length - 1,
              Math.max(0, Math.round(ratio * Math.max(history.length - 1, 0))),
            );
            setHoverIndex(index);
          }}
        >
          <defs>
            <linearGradient id="hashGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(37,99,235,0.18)" />
              <stop offset="100%" stopColor="rgba(37,99,235,0.01)" />
            </linearGradient>
          </defs>

          {gridYs.map((y) => (
            <line
              key={y}
              x1={chartLeft}
              y1={y}
              x2={width - chartRight}
              y2={y}
              stroke="#edf2f7"
              strokeWidth="1"
            />
          ))}

          {visibleSeries.hashrate ? <polygon points={hashrateArea} fill="url(#hashGradient)" /> : null}
          {visibleSeries.hashrate ? (
            <polyline
              points={hashrateLine}
              fill="none"
              stroke="#2563eb"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          ) : null}
          {visibleSeries.online ? (
            <polyline
              points={onlineLine}
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          ) : null}
          {visibleSeries.offline ? (
            <polyline
              points={offlineLine}
              fill="none"
              stroke="#f97316"
              strokeWidth="2.2"
              strokeDasharray="6 4"
              strokeLinejoin="round"
            />
          ) : null}

          {hoverPoint ? (
            <>
              <line
                x1={hoverPoint.x}
                y1={20}
                x2={hoverPoint.x}
                y2={height - 30}
                stroke="#94a3b8"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <g transform={`translate(${Math.min(Math.max(hoverPoint.x - 110, 8), width - 228)}, 8)`}>
                <rect
                  width="220"
                  height="78"
                  rx="10"
                  ry="10"
                  fill="rgba(255,255,255,0.96)"
                  stroke="rgba(148,163,184,0.20)"
                />
                <text x="12" y="20" fontSize="12" fill="#334155">
                  {hoverPoint.item.Time}
                </text>
                <text x="12" y="40" fontSize="12" fill="#2563eb">
                  {`当前算力：${formatHashrate(hoverPoint.item.CurrentHashrate).text}`}
                </text>
                <text x="12" y="58" fontSize="12" fill="#16a34a">
                  {`在线机器：${hoverPoint.item.OnlineMachines}`}
                </text>
                <text x="12" y="74" fontSize="12" fill="#f97316">
                  {`离线机器：${hoverPoint.item.OfflineMachines}`}
                </text>
              </g>
            </>
          ) : null}

          {labels.map((label, index) => {
            if (index !== 0 && index !== labels.length - 1 && index % labelStep !== 0) {
              return null;
            }
            const x =
              labels.length === 1
                ? chartLeft + chartWidth / 2
                : chartLeft + (index / (labels.length - 1)) * chartWidth;
            return (
              <text key={label + index} x={x} y={height - 8} textAnchor="middle" fontSize="11" fill="#94a3b8">
                {label}
              </text>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function toNumber(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = parseFloat(value.replace(/,/g, ""));
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeStatusItem(item: RawRecentSubAccountStatusItem): RecentSubAccountStatusItem {
  return {
    Time: String(item.Time ?? item.time ?? item.last_update ?? item.lastUpdate ?? ""),
    CurrentHashrate: toNumber(
      item.CurrentHashrate ??
        item.currentHashrate ??
        item.current_hashrate ??
        item.current_hash ??
        item.hashrate ??
        0,
    ),
    OnlineMachines: toNumber(
      item.OnlineMachines ?? item.onlineMachines ?? item.online_machines ?? item.online ?? 0,
    ),
    OfflineMachines: toNumber(
      item.OfflineMachines ?? item.offlineMachines ?? item.offline_machines ?? item.offline ?? 0,
    ),
  };
}

export default function RecentSubAccountStatusPage() {
  useAuthRedirect();

  const { venueType, poolId } = useParams();
  const location = useLocation();
  const locationState = (location.state || {}) as LocationState;

  const [history, setHistory] = useState<RecentSubAccountStatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!venueType || !poolId) {
        if (mounted) {
          setLoading(false);
          setLoadError("缺少必要参数");
        }
        return;
      }

      try {
        setLoading(true);
        setLoadError("");
        const result = (await Promise.race([
          fetchRecentSubAccountStatus(venueType, poolId),
          new Promise((_, reject) => setTimeout(() => reject(new Error("接口请求超时")), 15000)),
        ])) as { data?: RawRecentSubAccountStatusItem[] };
        const list = Array.isArray(result?.data) ? result.data : [];
        const normalized = list.map((item) => normalizeStatusItem(item));
        const sorted = normalized.sort(
          (a: RecentSubAccountStatusItem, b: RecentSubAccountStatusItem) =>
            new Date(a.Time).getTime() - new Date(b.Time).getTime(),
        );

        if (mounted) {
          setHistory(sorted);
        }
      } catch (error: any) {
        if (mounted) {
          setHistory([]);
          setLoadError(error?.message || "获取历史状态失败");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [poolId, venueType]);

  const title = locationState.poolName || `子账户 ${poolId || ""}`;
  const summary = useMemo(() => {
    if (history.length === 0) return null;

    const first = history[0];
    const last = history[history.length - 1];
    const hashrateDelta = Number(last.CurrentHashrate || 0) - Number(first.CurrentHashrate || 0);
    const offlineDelta = Number(last.OfflineMachines || 0) - Number(first.OfflineMachines || 0);
    const maxHashrate = Math.max(...history.map((item) => Number(item.CurrentHashrate || 0)));
    const avgHashrate =
      history.reduce((sum, item) => sum + Number(item.CurrentHashrate || 0), 0) / Math.max(history.length, 1);

    return { last, hashrateDelta, offlineDelta, maxHashrate, avgHashrate };
  }, [history]);

  const columns = [
    { title: "时间", dataIndex: "Time", key: "Time", width: 180 },
    {
      title: <span style={{ paddingLeft: 18, display: "inline-block" }}>当前算力(TH/s)</span>,
      dataIndex: "CurrentHashrate",
      key: "CurrentHashrate",
      width: 240,
      onHeaderCell: () => ({
        style: {
          paddingLeft: 28,
          paddingRight: 28,
        },
      }),
      onCell: () => ({
        style: {
          paddingLeft: 28,
          paddingRight: 28,
        },
      }),
      render: (value: number) => (
        <span style={{ display: "inline-block", minWidth: 92, color: "#2563eb", fontWeight: 600 }}>
          {formatHashrate(value).text}
        </span>
      ),
    },
    {
      title: "在线机器",
      dataIndex: "OnlineMachines",
      key: "OnlineMachines",
      width: 120,
      render: (value: number) => <span style={{ color: "#15803d", fontWeight: 600 }}>{value}</span>,
    },
    {
      title: "离线机器",
      dataIndex: "OfflineMachines",
      key: "OfflineMachines",
      width: 120,
      render: (value: number) => <span style={{ color: "#ea580c", fontWeight: 600 }}>{value}</span>,
    },
  ];

  return (
    <div style={{ padding: 24, background: "#f7f9fc", minHeight: "100%", color: "#1f2937" }}>
      <div
        style={{
          marginBottom: 20,
          padding: "32px 34px 28px",
          borderRadius: 24,
          background: "#ffffff",
          border: "1px solid rgba(148, 163, 184, 0.14)",
          boxShadow: "0 18px 40px rgba(30, 64, 175, 0.08)",
        }}
      >
        <Title level={2} style={{ marginTop: 0, marginBottom: 8, color: "#1e3a8a", fontSize: 44 }}>
          {title} 历史状态
        </Title>

        {locationState.venueName ? (
          <Text style={{ color: "#64748b" }}>{`场地：${locationState.venueName}`}</Text>
        ) : null}
      </div>

      {loadError ? (
        <Alert
          style={{ marginTop: 16, marginBottom: 16 }}
          message="接口请求失败"
          description={loadError}
          type="error"
          showIcon
        />
      ) : null}

      <Row gutter={[16, 16]} style={{ marginTop: 16, marginBottom: 16 }}>
        <Col xs={24} sm={12} xl={6}>
          <Card variant="outlined" style={{ borderRadius: 20 }}>
            <Statistic
              title="最新算力"
              value={summary ? formatHashrate(summary.last.CurrentHashrate).value : 0}
              precision={2}
              suffix={summary ? formatHashrate(summary.last.CurrentHashrate).unit : "TH/s"}
              valueStyle={{ color: "#2563eb", fontWeight: 700 }}
              prefix={<DashboardOutlined />}
            />
            <Text style={{ color: summary && summary.hashrateDelta >= 0 ? "#16a34a" : "#dc2626" }}>
              {summary && summary.hashrateDelta >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              {` 较首条记录 ${summary ? formatHashrate(Math.abs(summary.hashrateDelta)).text : "0.00 TH/s"}`}
            </Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card variant="outlined" style={{ borderRadius: 20 }}>
            <Statistic
              title="平均算力"
              value={summary ? formatHashrate(summary.avgHashrate).value : 0}
              precision={2}
              suffix={summary ? formatHashrate(summary.avgHashrate).unit : "TH/s"}
              valueStyle={{ color: "#0f766e", fontWeight: 700 }}
            />
            <Text
              style={{ color: "#64748b" }}
            >{`峰值 ${summary ? formatHashrate(summary.maxHashrate).text : "0.00 TH/s"}`}</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card variant="outlined" style={{ borderRadius: 20 }}>
            <Statistic
              title="最新在线机器"
              value={summary ? summary.last.OnlineMachines : 0}
              valueStyle={{ color: "#15803d", fontWeight: 700 }}
            />
            <Text style={{ color: "#64748b" }}>最新在线机器数量</Text>
          </Card>
        </Col>
        <Col xs={24} sm={12} xl={6}>
          <Card variant="outlined" style={{ borderRadius: 20 }}>
            <Statistic
              title="最新离线机器"
              value={summary ? summary.last.OfflineMachines : 0}
              valueStyle={{ color: "#dc2626", fontWeight: 700 }}
              prefix={<DisconnectOutlined />}
            />
            <Text style={{ color: summary && summary.offlineDelta <= 0 ? "#16a34a" : "#dc2626" }}>
              {summary && summary.offlineDelta <= 0 ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
              {` 较首条记录 ${summary ? Math.abs(summary.offlineDelta) : 0} 台`}
            </Text>
          </Card>
        </Col>
      </Row>

      <Card
        title={
          <span
            style={{
              color: "#0f172a",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <LineChartOutlined style={{ color: "#2563eb" }} />
            最近三天状态趋势
          </span>
        }
        extra={
          <Button
            type="default"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => downloadHistoryWorkbook(history, title, summary)}
          >
            下载 Excel
          </Button>
        }
        style={{ marginBottom: 16, background: "#ffffff", color: "#1f2937" }}
      >
        {loading ? (
          <div style={{ padding: "24px 0", textAlign: "center" }}>
            <Spin />
          </div>
        ) : (
          <SvgLineChart history={history} />
        )}
      </Card>

      <Card
        title={
          <span
            style={{
              color: "#0f172a",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <TableOutlined style={{ color: "#0f766e" }} />
            历史状态明细
          </span>
        }
        style={{ background: "#ffffff", color: "#1f2937" }}
      >
        <Table
          rowKey="Time"
          loading={loading}
          dataSource={history.slice().reverse()}
          columns={columns}
          locale={{ emptyText: "暂无历史状态数据" }}
          style={{ background: "#ffffff" }}
          pagination={{
            position: ["bottomCenter"],
            showSizeChanger: true,
            pageSizeOptions: ["20", "30", "50"],
            defaultPageSize: 20,
          }}
        />
      </Card>
    </div>
  );
}
