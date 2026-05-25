import { useCallback, useMemo, useState } from "react";
import { ReloadOutlined } from "@ant-design/icons";
import { Button, Radio, Space, Spin, Typography } from "antd";
import { ReactEcharts } from "@/components/react-echarts";
import { FARM_STATUS_COLOR, type FarmStatus } from "../mockData";
import type { OverviewPoint, TimeRange } from "../types";

const { Text } = Typography;

interface OverviewChartProps {
  farmName?: string;
  farmStatus?: FarmStatus;
  data: OverviewPoint[];
  timeRange: TimeRange;
  lastUpdated: string;
  loading?: boolean;
  onTimeRangeChange: (range: TimeRange) => void;
  onRefresh: () => void;
}

const LEGEND_ITEMS = [
  { name: "理论在架数", color: "#1677ff", type: "dashed" as const },
  { name: "在架数", color: "#52c41a", type: "solid" as const },
  { name: "低算力数量", color: "#fa8c16", type: "solid" as const },
  { name: "零算力数量", color: "#ff4d4f", type: "solid" as const },
  { name: "总算力 E", color: "#722ed1", type: "solid" as const },
];

const HASHRATE_SERIES_NAME = "总算力 E";

const DEFAULT_SERIES_VISIBLE = Object.fromEntries(LEGEND_ITEMS.map((item) => [item.name, true])) as Record<
  string,
  boolean
>;

function formatHashrateE(value: number) {
  return `${Number(value).toFixed(2)} E`;
}

export default function OverviewChart({
  farmName,
  farmStatus = "normal",
  data,
  timeRange,
  lastUpdated,
  loading = false,
  onTimeRangeChange,
  onRefresh,
}: OverviewChartProps) {
  const [seriesVisible, setSeriesVisible] = useState(DEFAULT_SERIES_VISIBLE);

  const toggleSeries = useCallback((name: string) => {
    setSeriesVisible((prev) => {
      const next = { ...prev, [name]: !prev[name] };
      if (!Object.values(next).some(Boolean)) return prev;
      return next;
    });
  }, []);

  const option = useMemo(() => {
    const countSeriesVisible = LEGEND_ITEMS.some(
      (item) => item.name !== HASHRATE_SERIES_NAME && seriesVisible[item.name],
    );
    const hashrateSeriesVisible = seriesVisible[HASHRATE_SERIES_NAME];

    const allSeries = [
      {
        name: "理论在架数",
        type: "line" as const,
        yAxisIndex: 0,
        data: data.map((d) => d.theoreticalOnline),
        lineStyle: { type: "dashed" as const, color: "#1677ff", width: 2 },
        symbol: "none",
        smooth: true,
      },
      {
        name: "在架数",
        type: "line" as const,
        yAxisIndex: 0,
        data: data.map((d) => d.online),
        lineStyle: { color: "#52c41a", width: 2 },
        symbol: "circle",
        symbolSize: 4,
        smooth: true,
      },
      {
        name: "低算力数量",
        type: "line" as const,
        yAxisIndex: 0,
        data: data.map((d) => d.lowHashrate),
        lineStyle: { color: "#fa8c16", width: 2 },
        symbol: "circle",
        symbolSize: 4,
        smooth: true,
      },
      {
        name: "零算力数量",
        type: "line" as const,
        yAxisIndex: 0,
        data: data.map((d) => d.zeroHashrate),
        lineStyle: { color: "#ff4d4f", width: 2 },
        symbol: "circle",
        symbolSize: 4,
        smooth: true,
      },
      {
        name: HASHRATE_SERIES_NAME,
        type: "line" as const,
        yAxisIndex: 1,
        data: data.map((d) => d.totalHashrate),
        lineStyle: { color: "#722ed1", width: 2 },
        symbol: "circle",
        symbolSize: 4,
        smooth: true,
      },
    ];

    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255,255,255,0.96)",
        borderColor: "#e8e8e8",
        textStyle: { color: "#333" },
        formatter: (params: unknown) => {
          const items = (Array.isArray(params) ? params : [params]) as Array<{
            axisValue?: string;
            seriesName?: string;
            value?: number;
            marker?: string;
          }>;
          if (items.length === 0) return "";
          const lines = [items[0].axisValue ?? ""];
          for (const item of items) {
            const value = Number(item.value ?? 0);
            const text = item.seriesName === HASHRATE_SERIES_NAME ? formatHashrateE(value) : String(value);
            lines.push(`${item.marker ?? ""}${item.seriesName ?? ""}: ${text}`);
          }
          return lines.join("<br/>");
        },
      },
      legend: { show: false },
      grid: { left: 8, right: 8, top: 16, bottom: 32, containLabel: true },
      xAxis: {
        type: "category",
        data: data.map((d) => d.time),
        axisLine: { lineStyle: { color: "#e8e8e8" } },
        axisLabel: { color: "#8c8c8c", fontSize: 11 },
      },
      yAxis: [
        {
          type: "value",
          name: countSeriesVisible ? "台数" : "",
          show: countSeriesVisible,
          position: "left",
          nameLocation: "middle",
          nameRotate: 90,
          nameGap: 50,
          nameTextStyle: { color: "#8c8c8c", fontSize: 12, align: "center" },
          axisLine: { show: false },
          splitLine: { lineStyle: { color: "#f0f0f0", type: "dashed" } },
          axisLabel: { color: "#8c8c8c" },
        },
        {
          type: "value",
          name: hashrateSeriesVisible ? "E" : "",
          show: hashrateSeriesVisible,
          position: "right",
          nameLocation: "middle",
          nameRotate: -90,
          nameGap: 44,
          nameTextStyle: { color: "#8c8c8c", fontSize: 12, align: "center" },
          axisLine: { show: false },
          splitLine: { show: false },
          axisLabel: {
            color: "#8c8c8c",
            formatter: (value: number) => formatHashrateE(value),
          },
        },
      ],
      series: allSeries.filter((s) => seriesVisible[s.name]),
    };
  }, [data, seriesVisible]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between gap-3 mb-4 min-w-0">
        <h2 className="text-lg font-semibold m-0 flex flex-1 min-w-0 items-center gap-2 overflow-hidden">
          <span className="text-gray-800 shrink-0">运行概览</span>
          {farmName ? (
            <>
              <span className="text-gray-300 shrink-0">|</span>
              <span className="shrink-0" style={{ color: FARM_STATUS_COLOR[farmStatus] }}>
                {farmName}
              </span>
            </>
          ) : null}
        </h2>
        <Space size="middle">
          <Radio.Group
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
            options={[
              { label: "24小时", value: "24h" },
              { label: "7天", value: "7d" },
            ]}
          />
          <Text type="secondary" className="text-xs">
            更新于 {lastUpdated}
          </Text>
          <Button type="text" icon={<ReloadOutlined />} onClick={onRefresh} />
        </Space>
      </div>
      <div className="flex flex-wrap gap-4 mb-3">
        {LEGEND_ITEMS.map((item) => {
          const active = seriesVisible[item.name];
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => toggleSeries(item.name)}
              className={`flex items-center gap-1.5 text-xs border-0 bg-transparent p-0 cursor-pointer transition-opacity ${
                active ? "text-gray-600 opacity-100" : "text-gray-400 opacity-45"
              }`}
              title={active ? "点击隐藏" : "点击显示"}
            >
              <span
                className="inline-block w-5 h-0.5"
                style={{
                  backgroundColor: active && item.type !== "dashed" ? item.color : "transparent",
                  borderTop: `2px ${item.type === "dashed" ? "dashed" : "solid"} ${item.color}`,
                  height: item.type === "dashed" ? 0 : undefined,
                  opacity: active ? 1 : 0.35,
                }}
              />
              <span className={active ? "" : "line-through"}>{item.name}</span>
            </button>
          );
        })}
      </div>
      <Spin spinning={loading}>
        <ReactEcharts option={option} style={{ height: 280, width: "100%" }} />
      </Spin>
    </div>
  );
}
