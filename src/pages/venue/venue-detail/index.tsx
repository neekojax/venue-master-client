import React, { useEffect, useRef, useState } from "react";
import { CalendarOutlined, CloudOutlined, EnvironmentOutlined, ThunderboltOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import * as echarts from "echarts";
// import { useParams } from "react-router-dom";
import BasicData from "./components/BasicData";

import "./index.css";
type ChartConfig = {
  id: string;
  title: string;
  period: "day" | "month";
};
import { Button, Radio, Table } from "antd";

const VenueDetail: React.FC = () => {
  // const params = useParams<{ venueId: string; }>();
  // const venueId = params.venueId!;

  const [showDaily, setShowDaily] = useState(true);
  const chartRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [charts, setCharts] = useState<ChartConfig[]>([
    { id: "hashrate-chart", title: "算力有效率变化曲线", period: "day" },
    { id: "failure-chart", title: "故障率变化曲线", period: "day" },
    { id: "temperature-chart", title: "高温影响曲线", period: "day" },
    { id: "power-chart", title: "限电影响曲线", period: "day" },
  ]);

  // const chartRefs = useRef<(HTMLDivElement | null)[]>([]);

  const generateChartData = (period: "day" | "month"): string[] => {
    const length = period === "day" ? 30 : 12;
    if (period === "day") {
      return Array.from({ length }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - i);
        return date.toLocaleDateString("zh-CN");
      }).reverse();
    } else {
      return Array.from({ length }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }).reverse();
    }
  };

  const createChartOption = (type: string, dates: string[]): echarts.EChartsOption => {
    const baseOption: echarts.EChartsOption & { series: echarts.SeriesOption[] } = {
      animation: false,
      tooltip: { trigger: "axis" },
      xAxis: { type: "category", data: dates },
      yAxis: { type: "value" },
      series: [
        {
          type: "line",
          smooth: true,
          data: [] as number[],
          lineStyle: { color: "#2563eb" },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(37, 99, 235, 0.2)" },
              { offset: 1, color: "rgba(37, 99, 235, 0)" },
            ]),
          },
        },
      ],
    };

    // ✅ 类型收紧：明确 series[0] 的结构
    const series = baseOption.series[0] as echarts.SeriesOption & {
      data: number[];
      lineStyle: { color: string };
    };

    switch (type) {
      case "hashrate-chart":
        baseOption.yAxis = { min: 95, max: 100 };
        series.data = dates.map(() => Number((95 + Math.random() * 5).toFixed(1)));
        break;

      case "failure-chart":
        baseOption.yAxis = { min: 0, max: 3 };
        series.data = dates.map(() => Number((Math.random() * 2).toFixed(1)));
        series.lineStyle.color = "#dc2626";
        break;

      case "temperature-chart":
        baseOption.yAxis = { min: 0, max: 1 };
        series.data = dates.map(() => Number((Math.random() * 0.5).toFixed(2)));
        series.lineStyle.color = "#ea580c";
        break;

      case "power-chart":
        baseOption.yAxis = { min: 0, max: 2 };
        series.data = dates.map(() => Number((Math.random() * 1.5).toFixed(1)));
        series.lineStyle.color = "#7c3aed";
        break;
    }

    return baseOption;
  };

  const initCharts = () => {
    const chartInstances: Record<string, echarts.ECharts> = {};
    charts.forEach((chart, index) => {
      const el = chartRefs.current[index];
      if (el) {
        const instance = echarts.init(el);
        const dates = generateChartData(chart.period);
        instance.setOption(createChartOption(chart.id, dates));
        chartInstances[chart.id] = instance;
      }
    });

    window.addEventListener("resize", () => {
      Object.values(chartInstances).forEach((instance) => instance.resize());
    });
  };

  useEffect(() => {
    initCharts();
  }, []);

  // 日报数据类型
  interface DailyRecord {
    key: string;
    date: string;
    income: string;
    hashrateEfficiency: string;
    failureRate: string;
    powerLimit: string;
    temperatureImpact: string;
  }

  // 异常事件数据类型
  interface AbnormalRecord {
    key: string;
    site: string;
    duration: string;
    timeRange: string;
    eventType: string;
    affectedMachines: string;
    hashrateImpact: string;
    reason: string;
  }

  const dailyColumns: ColumnsType<DailyRecord> = [
    { title: "日期", dataIndex: "date", key: "date" },
    { title: "收益 (¥)", dataIndex: "income", key: "income", align: "right" },
    { title: "算力有效率", dataIndex: "hashrateEfficiency", key: "hashrateEfficiency", align: "right" },
    { title: "故障率", dataIndex: "failureRate", key: "failureRate", align: "right" },
    { title: "限电影响", dataIndex: "powerLimit", key: "powerLimit", align: "right" },
    { title: "高温影响", dataIndex: "temperatureImpact", key: "temperatureImpact", align: "right" },
  ];

  const abnormalColumns: ColumnsType<AbnormalRecord> = [
    { title: "场地", dataIndex: "site", key: "site" },
    { title: "影响时长", dataIndex: "duration", key: "duration" },
    { title: "时间范围", dataIndex: "timeRange", key: "timeRange" },
    { title: "事件类型", dataIndex: "eventType", key: "eventType" },
    { title: "影响台数", dataIndex: "affectedMachines", key: "affectedMachines", align: "right" },
    { title: "影响算力", dataIndex: "hashrateImpact", key: "hashrateImpact", align: "right" },
    { title: "时间原因", dataIndex: "reason", key: "reason" },
  ];

  const dailyData: DailyRecord[] = [
    {
      key: "1",
      date: "2024-01-20",
      income: "286,521",
      hashrateEfficiency: "98.6%",
      failureRate: "1.4%",
      powerLimit: "0.8%",
      temperatureImpact: "0.2%",
    },
  ];

  const abnormalData: AbnormalRecord[] = [
    {
      key: "1",
      site: "杭州滨江矿场",
      duration: "2小时",
      timeRange: "2025-08-19 14:00-16:00",
      eventType: "电力故障",
      affectedMachines: "126台",
      hashrateImpact: "-1.8%",
      reason: "变电站检修时间",
    },
  ];

  return (
    <div className=" mx-auto  min-h-screen">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-4 mb-3">
          <h1 className="text-3xl font-bold text-gray-900">杭州滨江矿场</h1>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="px-2 py-1 bg-gray-100 rounded-md">矿工号: MW-2025-086</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <EnvironmentOutlined className="text-primary" />
              <span className="text-gray-600">浙江省杭州市滨江区长河街道长江路258号</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarOutlined className="text-primary" />
              <span className="text-gray-600">2025-08-19 星期二</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CloudOutlined className="text-primary" />
              <span className="text-gray-600">当前温度: 26°C</span>
            </div>
            <div className="flex items-center gap-2">
              <ThunderboltOutlined className="text-primary" />
              <span className="text-gray-600">当前湿度: 65%</span>
            </div>
          </div>
        </div>
      </header>

      {/* 算力运行状态 */}
      {/* <div
        className="bg-gray-100 rounded-xl p-8 mb-8"
        style={{
          background: "#fff",
          borderRadius: "4px",
        }}
      >
        <h3 className="text-xl font-bold mb-6 text-gray-800 pl-2">
          <AreaChartOutlined className="mr-2 text-primary" />
          算力运行状态
        </h3>
        <div className="bg-white rounded-lg grid grid-cols-5 gap-4">
          <div className=" p-6 rounded-lg bg-gradient-to-br shadow-demo from-blue-50 to-blue-50 border-2 border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold text-primary">算力有效率</span>
              <AreaChartOutlined className="text-primary text-xl" />
            </div>
            <div className="text-4xl font-bold text-primary">98.6%</div>

          </div>
          {statusCards.map((item, index) => (
            <div key={index} className="shadow-demo p-6 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-semibold">{item.title}</span>
                {item.icon}
              </div>
              <div className="text-2xl font-bold text-gray-800 ">{item.value}</div>
              <div className={`text-sm ${item.textColor || "text-gray-500"} mt-2`}>

              </div>
            </div>
          ))}
        </div>
      </div> */}

      {/* 算力影响分析 */}
      {/* <div
        className="bg-gray-100 rounded-xl p-8 mb-8"
        style={{
          background: "#fff",
          borderRadius: "4px",
        }}
      >
        <h3 className="text-xl font-bold mb-6 text-gray-800 pl-2">
          <ExclamationCircleOutlined className="mr-2 text-red-500" />
          算力影响因素
        </h3>
        <div className="bg-white rounded-lg  grid grid-cols-5 gap-4">
          <div className="p-6 rounded-lg  bg-gradient-to-br shadow-demo from-red-100 to-red-50 border-2 border-red-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg font-semibold text-red-600">算力影响</span>
              <ExclamationCircleOutlined className="text-red-500 text-xl" />
            </div>
            <div className="text-4xl font-bold text-red-500">-2.8%</div>

          </div>
          {impactCards.map((item, index) => (
            <div key={index} className="p-6 shadow-sm shadow-demo rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-semibold">{item.title}</span>
                {item.icon}
              </div>
              <div className="text-2xl  font-bold text-gray-800 ">{item.value}</div>

            </div>
          ))}
        </div>
      </div> */}
      <BasicData />

      {/* 图表区域 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {charts.map((chart, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{chart.title}</h3>
              <Radio.Group
                value={chart.period}
                onChange={(e) => {
                  const newCharts = [...charts];
                  newCharts[index].period = e.target.value;
                  setCharts(newCharts);
                }}
                size="small"
              >
                <Radio.Button value="day">日</Radio.Button>
                <Radio.Button value="month">月</Radio.Button>
              </Radio.Group>
            </div>
            <div ref={(el) => (chartRefs.current[index] = el)} style={{ height: 300 }} />
          </div>
        ))}
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Button type={showDaily ? "primary" : "default"} onClick={() => setShowDaily(true)}>
              经营日报
            </Button>
            <Button type={!showDaily ? "primary" : "default"} onClick={() => setShowDaily(false)}>
              异常事件
            </Button>
          </div>
          <Button type="primary">查看更多</Button>
        </div>

        {showDaily ? (
          <Table columns={dailyColumns} dataSource={dailyData} pagination={false} rowKey="key" />
        ) : (
          <Table columns={abnormalColumns} dataSource={abnormalData} pagination={false} rowKey="key" />
        )}
      </div>
    </div>
  );
};

export default VenueDetail;
