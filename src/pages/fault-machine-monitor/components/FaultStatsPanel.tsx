import { useMemo, useState } from "react";
import {
  AlertOutlined,
  BarChartOutlined,
  EnvironmentOutlined,
  LineChartOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { Button, DatePicker, Radio, Spin } from "antd";
import dayjs from "dayjs";
import { ReactEcharts } from "@/components/react-echarts";
import {
  type CodeDistributionItem,
  formatFrequencyTooltip,
  type FrequencyPoint,
  type SiteDistributionItem,
} from "../statsUtils";
import type { FaultStatsTimeMode } from "../types";

interface FaultStatsPanelProps {
  timeMode: FaultStatsTimeMode;
  selectedDate: string;
  timeLabel: string;
  loading?: boolean;
  siteDistribution: SiteDistributionItem[];
  frequencyPoints: FrequencyPoint[];
  codeDistribution: CodeDistributionItem[];
  selectedSiteCode?: string;
  selectedSiteName?: string;
  selectedSiteCount: number;
  onTimeModeChange: (mode: FaultStatsTimeMode) => void;
  onSelectedDateChange: (date: string) => void;
  onSiteSelect: (siteCode: string, siteName: string) => void;
  onRefresh: () => void;
}

export default function FaultStatsPanel({
  timeMode,
  selectedDate,
  timeLabel,
  loading = false,
  siteDistribution,
  frequencyPoints,
  codeDistribution,
  selectedSiteCode,
  selectedSiteName,
  selectedSiteCount,
  onTimeModeChange,
  onSelectedDateChange,
  onSiteSelect,
  onRefresh,
}: FaultStatsPanelProps) {
  const [hoveredCodeIndex, setHoveredCodeIndex] = useState<number | null>(null);

  const lineOption = useMemo(() => {
    return {
      tooltip: {
        trigger: "axis",
        backgroundColor: "rgba(255,255,255,0.98)",
        borderColor: "#e8e8e8",
        padding: [10, 12],
        extraCssText: "box-shadow:0 4px 12px rgba(0,0,0,0.08);",
        formatter: (params: unknown) => {
          const items = (Array.isArray(params) ? params : [params]) as Array<{
            axisValue?: string;
            dataIndex?: number;
          }>;
          if (!items.length) return "";
          const idx = items[0].dataIndex ?? -1;
          return formatFrequencyTooltip(frequencyPoints[idx], items[0].axisValue);
        },
      },
      grid: { left: 8, right: 16, top: 20, bottom: 8, containLabel: true },
      xAxis: {
        type: "category",
        data: frequencyPoints.map((p) => p.label),
        axisLine: { lineStyle: { color: "#e8e8e8" } },
        axisLabel: {
          color: "#8c8c8c",
          fontSize: 11,
          interval: frequencyPoints.length > 12 ? "auto" : 0,
          rotate: frequencyPoints.length > 12 ? 35 : 0,
        },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        name: "异常条数",
        nameLocation: "middle",
        nameRotate: 90,
        nameGap: 42,
        nameTextStyle: { color: "#8c8c8c", fontSize: 12 },
        splitLine: { lineStyle: { color: "#f0f0f0", type: "dashed" } },
        axisLabel: { color: "#8c8c8c" },
      },
      series: [
        {
          type: "line",
          data: frequencyPoints.map((p) => p.count),
          smooth: true,
          symbol: "circle",
          symbolSize: 6,
          lineStyle: { color: "#1677ff", width: 2.5 },
          itemStyle: { color: "#1677ff" },
          areaStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: "rgba(22, 119, 255, 0.25)" },
                { offset: 1, color: "rgba(22, 119, 255, 0)" },
              ],
            },
          },
        },
      ],
    };
  }, [frequencyPoints]);

  const pieOption = useMemo(() => {
    const activeIndex = hoveredCodeIndex;
    return {
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c} 条 ({d}%)",
      },
      series: [
        {
          type: "pie",
          radius: ["48%", "72%"],
          center: ["50%", "50%"],
          avoidLabelOverlap: false,
          label: { show: false },
          data: codeDistribution.map((item, index) => ({
            name: item.code,
            value: item.count,
            itemStyle: {
              color: item.color,
              opacity: activeIndex === null || activeIndex === index ? 1 : 0.35,
            },
          })),
        },
      ],
    };
  }, [codeDistribution, hoveredCodeIndex]);

  const pieCenterText = useMemo(() => {
    if (hoveredCodeIndex !== null && codeDistribution[hoveredCodeIndex]) {
      const item = codeDistribution[hoveredCodeIndex];
      return { main: `${item.percentage}%`, sub: item.code };
    }
    return { main: `${selectedSiteCount}`, sub: "异常条数" };
  }, [codeDistribution, hoveredCodeIndex, selectedSiteCount]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-100">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold m-0 text-gray-800 flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" aria-hidden />
            运维监控大盘
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
              数据实时更新
            </span>
            {selectedSiteName ? (
              <span className="text-xs font-normal text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                {selectedSiteName}
              </span>
            ) : null}
          </h2>
          <p className="text-xs text-gray-500 mt-1.5 mb-0 leading-relaxed max-w-3xl">
            智能汇总及动态监测所辖各矿池设备的在线运行异常
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Radio.Group
            value={timeMode}
            onChange={(e) => onTimeModeChange(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            size="small"
            options={[
              { label: "24小时内", value: "24h" },
              { label: "按特定日期", value: "customDate" },
            ]}
          />
          {timeMode === "customDate" ? (
            <DatePicker
              size="small"
              value={dayjs(selectedDate)}
              onChange={(d) => {
                if (d) onSelectedDateChange(d.format("YYYY-MM-DD"));
              }}
              allowClear={false}
              disabledDate={(current) => current && current > dayjs().endOf("day")}
            />
          ) : null}
          <Button type="text" icon={<ReloadOutlined />} onClick={onRefresh} />
        </div>
      </div>

      <Spin spinning={loading} tip="加载中...">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* 场地分布 */}
          <div className="lg:col-span-3 bg-gray-50/80 rounded-lg border border-gray-100 p-4 flex flex-col min-h-[360px]">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/80">
              <h3 className="text-xs font-bold text-gray-800 m-0 flex items-center gap-1.5">
                <EnvironmentOutlined className="text-gray-500" />
                场地分布
              </h3>
              <span className="text-[10px] text-gray-400">点击切换场地</span>
            </div>
            <div className="space-y-2 flex-1 max-h-[280px] overflow-y-auto pr-1">
              {siteDistribution.length === 0 ? (
                <div className="text-xs text-gray-400 text-center py-8">暂无数据</div>
              ) : (
                siteDistribution.map((dist) => {
                  const isSelected = dist.siteCode === selectedSiteCode;
                  return (
                    <button
                      key={dist.siteCode}
                      type="button"
                      onClick={() => onSiteSelect(dist.siteCode, dist.siteName)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-blue-50 border-blue-200 shadow-sm"
                          : "bg-transparent border-transparent hover:bg-white"
                      }`}
                    >
                      <div className="flex justify-between items-center text-xs mb-1.5 gap-2">
                        <span className="font-semibold flex items-center gap-2 min-w-0">
                          <span
                            className={`w-2 h-2 rounded-full shrink-0 ${isSelected ? "bg-blue-600" : "bg-gray-300"}`}
                          />
                          <span className={`truncate ${isSelected ? "text-blue-900" : "text-gray-700"}`}>
                            {dist.siteName}
                          </span>
                        </span>
                        <span
                          className={`shrink-0 font-mono text-[11px] ${isSelected ? "text-blue-700" : "text-gray-800"}`}
                        >
                          {dist.count} 条 (在架 {dist.siteOnShelfRatio}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200/70 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isSelected ? "bg-blue-600" : "bg-gray-400"}`}
                          style={{ width: `${Math.min(dist.siteOnShelfRatio, 100)}%` }}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            <div className="bg-gray-800 text-white rounded-lg p-3 mt-4 flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <AlertOutlined className="text-rose-400 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-gray-400 truncate">
                    {selectedSiteName ?? "当前场地"} 异常计次
                  </div>
                  <div className="text-base font-bold font-mono">{selectedSiteCount} 条</div>
                </div>
              </div>
              <span className="text-[10px] bg-gray-700 px-2 py-1 rounded shrink-0">{timeLabel}</span>
            </div>
          </div>

          {/* 异常频次变化曲线 */}
          <div className="lg:col-span-6 bg-gray-50/80 rounded-lg border border-gray-100 p-4 flex flex-col min-h-[360px]">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200/80">
              <h3 className="text-xs font-bold text-gray-800 m-0 flex items-center gap-1.5">
                <LineChartOutlined className="text-gray-500" />
                异常频次变化曲线
              </h3>
              <span className="text-[10px] text-gray-400 font-mono">
                {timeMode === "24h" ? "近24小时" : timeLabel}
              </span>
            </div>
            {frequencyPoints.every((p) => p.count === 0) ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-xs min-h-[240px]">
                <BarChartOutlined className="text-3xl mb-2 text-gray-300" />
                该时段暂无异常记录
              </div>
            ) : (
              <ReactEcharts option={lineOption} style={{ height: 260, width: "100%" }} />
            )}
          </div>

          {/* 异常原因分布 */}
          <div className="lg:col-span-3 bg-gray-50/80 rounded-lg border border-gray-100 p-4 flex flex-col min-h-[360px]">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-gray-200/80">
              <h3 className="text-xs font-bold text-gray-800 m-0 flex items-center gap-1.5">
                <BarChartOutlined className="text-gray-500" />
                异常原因分布
              </h3>
              <span className="text-[10px] text-gray-400">{codeDistribution.length} 类</span>
            </div>
            {codeDistribution.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-400 min-h-[240px]">
                暂无故障编码数据
              </div>
            ) : (
              <div className="flex flex-col flex-1 gap-3">
                <div className="relative h-[140px]">
                  <ReactEcharts option={pieOption} style={{ height: 140, width: "100%" }} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg font-bold text-gray-900 font-mono leading-none">
                      {pieCenterText.main}
                    </span>
                    <span className="text-[10px] text-gray-400 mt-1 max-w-[72px] truncate text-center">
                      {pieCenterText.sub}
                    </span>
                  </div>
                </div>
                <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1">
                  {codeDistribution.map((item, idx) => (
                    <div
                      key={item.code}
                      className={`flex items-center justify-between text-[11px] px-1 py-0.5 rounded cursor-default ${
                        hoveredCodeIndex === idx ? "bg-white" : ""
                      }`}
                      onMouseEnter={() => setHoveredCodeIndex(idx)}
                      onMouseLeave={() => setHoveredCodeIndex(null)}
                    >
                      <span className="flex items-center gap-1.5 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-gray-700 truncate font-medium">{item.code}</span>
                      </span>
                      <span className="font-mono font-semibold text-gray-900 shrink-0 ml-1">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Spin>
    </div>
  );
}
