import { useCallback, useMemo, useState } from "react";
import { ReloadOutlined } from "@ant-design/icons";
import { Button, Radio, Select, Space, Spin, Typography } from "antd";
import { ReactEcharts } from "@/components/react-echarts";
import { FAULT_CODES } from "../constants";
import type { FaultTimeRange, FaultTrendChartData } from "../types";

const { Text } = Typography;

interface FaultTrendChartProps {
  data: FaultTrendChartData;
  timeRange: FaultTimeRange;
  chartCodeFilter?: string;
  loading?: boolean;
  onTimeRangeChange: (range: FaultTimeRange) => void;
  onChartCodeFilterChange: (code?: string) => void;
  onRefresh: () => void;
}

export default function FaultTrendChart({
  data,
  timeRange,
  chartCodeFilter,
  loading = false,
  onTimeRangeChange,
  onChartCodeFilterChange,
  onRefresh,
}: FaultTrendChartProps) {
  const [seriesVisible, setSeriesVisible] = useState<Record<string, boolean>>({});

  const defaultVisible = useMemo(
    () => Object.fromEntries(data.series.map((s) => [s.siteName, true])),
    [data.series],
  );

  const visibleMap = useMemo(() => {
    const merged = { ...defaultVisible, ...seriesVisible };
    return merged;
  }, [defaultVisible, seriesVisible]);

  const toggleSeries = useCallback(
    (name: string) => {
      setSeriesVisible((prev) => {
        const base = { ...defaultVisible, ...prev };
        const next = { ...base, [name]: !base[name] };
        if (!Object.values(next).some(Boolean)) return prev;
        return next;
      });
    },
    [defaultVisible],
  );

  const option = useMemo(() => {
    const activeSeries = data.series.filter((s) => visibleMap[s.siteName] !== false);
    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255,255,255,0.96)",
        borderColor: "#e8e8e8",
        textStyle: { color: "#333" },
      },
      legend: { show: false },
      grid: { left: 8, right: 16, top: 16, bottom: 8, containLabel: true },
      xAxis: {
        type: "category",
        data: data.labels,
        axisLine: { lineStyle: { color: "#e8e8e8" } },
        axisLabel: { color: "#8c8c8c", fontSize: 11 },
      },
      yAxis: {
        type: "value",
        name: "故障条数",
        nameLocation: "middle",
        nameRotate: 90,
        nameGap: 42,
        nameTextStyle: { color: "#8c8c8c", fontSize: 12, align: "center" },
        minInterval: 1,
        axisLine: { show: false },
        splitLine: { lineStyle: { color: "#f0f0f0", type: "dashed" } },
        axisLabel: { color: "#8c8c8c" },
      },
      series: activeSeries.map((s) => ({
        name: s.siteName,
        type: "line" as const,
        data: s.points,
        smooth: true,
        symbol: "circle",
        symbolSize: 5,
        lineStyle: { color: s.color, width: 2 },
        itemStyle: { color: s.color },
      })),
    };
  }, [data, visibleMap]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 min-w-0">
        <h2 className="text-lg font-semibold m-0 text-gray-800 shrink-0">最近故障趋势</h2>
        <Space size="middle" wrap>
          <Select
            size="small"
            style={{ width: 128 }}
            value={chartCodeFilter ?? ""}
            options={[{ label: "全部", value: "" }, ...FAULT_CODES.map((c) => ({ label: c, value: c }))]}
            onChange={(v) => onChartCodeFilterChange(v ? String(v) : undefined)}
          />
          <Radio.Group
            value={timeRange}
            onChange={(e) => onTimeRangeChange(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
            options={[
              { label: "7天", value: "7d" },
              { label: "30天", value: "30d" },
            ]}
          />
          <Text type="secondary" className="text-xs">
            统计至 {data.lastUpdated}
          </Text>
          <Button type="text" icon={<ReloadOutlined />} onClick={onRefresh} />
        </Space>
      </div>

      <Spin spinning={loading}>
        <ReactEcharts option={option} style={{ height: 280, width: "100%" }} />
      </Spin>

      <div className="mt-3 pt-3 border-t border-gray-100 max-h-28 overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-2">
          {data.series.map((item) => {
            const active = visibleMap[item.siteName] !== false;
            return (
              <button
                key={item.siteId}
                type="button"
                onClick={() => toggleSeries(item.siteName)}
                className={`flex items-center gap-1.5 text-xs border-0 bg-transparent p-0 cursor-pointer transition-opacity min-w-0 text-left ${
                  active ? "text-gray-600 opacity-100" : "text-gray-400 opacity-45"
                }`}
                title={active ? "点击隐藏" : "点击显示"}
              >
                <span
                  className="inline-block w-5 h-0.5 shrink-0"
                  style={{
                    backgroundColor: active ? item.color : "transparent",
                    borderTop: `2px solid ${item.color}`,
                    opacity: active ? 1 : 0.35,
                  }}
                />
                <span className={`truncate ${active ? "" : "line-through"}`}>{item.siteName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
