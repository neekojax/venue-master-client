import React, { useEffect, useRef } from "react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FireOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Skeleton, Typography } from "antd";
import type { EChartsType } from "echarts";
import * as echarts from "echarts";
// @ts-ignore
// import SiteOnlineNote from "@/components/tooltip/SiteOnlineNote.jsx";
// @ts-ignore
// import SiteStockWithNote from "@/components/tooltip/SiteStockWithNote.jsx";
import type { VenueStats } from "../types";
import EffectChart from "./EffectChart";
import EfficiencyGauge from "./gauge";

const App: React.FC<{ stats: VenueStats; loading: boolean }> = ({ stats, loading }) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<EChartsType | null>(null);
  const isInitializing = useRef<boolean>(false);

  // 监听 stats 变化，当数据更新且 DOM 已挂载时初始化图表
  useEffect(() => {
    console.log("stats && chartRef.current", stats, chartRef.current);
    if (stats && chartRef.current) {
      // 使用 setTimeout 确保 DOM 已完全渲染
      const timer = setTimeout(() => {
        initChart();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [stats, loading]);

  // 使用 ResizeObserver 监听元素尺寸变化（只在组件挂载时设置一次）
  useEffect(() => {
    if (!chartRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      if (chartInstance.current) {
        chartInstance.current.resize();
      }
    });
    resizeObserver.observe(chartRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [loading]);

  // 组件卸载时清理图表实例
  useEffect(() => {
    return () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [loading]);
  // 获取当前日期
  const initChart = () => {
    // 防止重复初始化
    if (isInitializing.current) {
      console.log("Chart is already initializing, skipping...");
      return;
    }

    // 确保 DOM 元素已挂载且数据已加载
    if (!chartRef.current) {
      console.warn("chartRef.current is null, DOM element not yet mounted");
      return;
    }

    if (!stats) {
      console.warn("stats is null or undefined");
      return;
    }

    console.log("Initializing chart with valid ref and stats");
    isInitializing.current = true;

    try {
      // 销毁之前的图表实例
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
      // 初始化echarts实例
      chartInstance.current = echarts.init(chartRef.current);

      // const shangjia = data.totalEstimateOnRackMachines; // 估计在线机器数
      const failures = stats.totalFailures || 0; // 故障机器数
      // const zaixian = stats.onlineMachines || 0; // 在线机器数
      const total = stats.totalMachines || 0; // 总机器数

      // 调试信息
      // console.log("图表数据:", { total, shangjia, zaixian, stats });

      // 数据验证
      // const validZaixian = Math.min(zaixian, total); // 确保在线数不超过总数
      const validFailures = Math.min(failures, total); // 确保故障数不超过总数

      const option = {
        tooltip: { trigger: "item" },
        grid: {
          top: -10,
          bottom: 0,
          left: 0,
          right: 0,
        },
        series: [
          {
            name: "总数",
            type: "pie",
            radius: ["75%", "95%"],
            // label: { },
            label: { show: false, position: "center", formatter: "{b}\n{c}" },
            data: [{ value: total, name: "总数", itemStyle: { color: "#1890ff" } }],
          },
          {
            name: "故障数",
            type: "pie",
            radius: ["50%", "70%"],
            label: { show: false },
            data: [
              { value: validFailures, name: "故障数", itemStyle: { color: "#fa8c16" } },
              {
                value: Math.max(0, total - validFailures),
                name: "故障数",
                itemStyle: { color: "transparent" },
              },
            ],
          },
          // {
          //   name: "在线数",
          //   type: "pie",
          //   radius: ["25%", "45%"],
          //   label: { show: false },
          //   data: [
          //     { value: validZaixian, name: "在线", itemStyle: { color: "#52c41a" } },
          //     {
          //       value: Math.max(0, total - validZaixian),
          //       name: "不在线",
          //       itemStyle: { color: "transparent" },
          //     },
          //   ],
          // },
        ],
      };
      chartInstance.current.setOption(option);
      // console.log("Chart initialized successfully");
    } catch (error) {
      console.error("Error initializing chart:", error);
    } finally {
      isInitializing.current = false;
    }
  };

  return (
    <>
      <Row gutter={16} v-else style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Skeleton loading={loading} active>
            <Card
              title="机器汇总"
              actions={[
                <span key="setting">
                  <CloseCircleOutlined style={{ color: "red", fontSize: 16, marginRight: "10px" }} />
                  <span>故障率：{(stats?.totalFailuresRate || 0)?.toFixed(2)}%</span>
                </span>,
                // <span key="setting">
                //   {/* <SettingOutlined /> */}
                //   <CheckCircleOutlined style={{ color: "green", fontSize: 16, marginRight: "10px" }} />
                //   <span>在线率：{(stats?.onlineRatio || 0)?.toFixed(2)}%</span>
                // </span>,
              ]}
            >
              <Row justify="space-between" align="middle">
                <Col span={12} style={{ textAlign: "left" }}>
                  <Typography.Text
                    style={{
                      width: 80,
                      display: "inline-block", // 必须加，才能让宽度生效
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    托管台数：
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      width: 80,
                      display: "inline-block", // 必须加，才能让宽度生效
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      fontSize: 13,
                      color: "rgb(127, 128, 130)", //rgb(127, 128, 130)
                      textOverflow: "ellipsis",
                    }}
                  >
                    {stats?.totalMachines}
                  </Typography.Text>
                </Col>
                {
                  // <Col span={12} style={{ textAlign: "right" }}>
                  //   <Typography.Text
                  //     style={{
                  //       width: 95,
                  //       display: "inline-block", // 必须加，才能让宽度生效
                  //       textAlign: "center",
                  //       whiteSpace: "nowrap",
                  //       overflow: "hidden",
                  //       textOverflow: "ellipsis",
                  //     }}
                  //   >
                  //     <SiteOnlineNote />
                  //   </Typography.Text>
                  //   <Typography.Text
                  //     style={{
                  //       width: 80,
                  //       display: "inline-block", // 必须加，才能让宽度生效
                  //       textAlign: "left",
                  //       whiteSpace: "nowrap",
                  //       overflow: "hidden",
                  //       textOverflow: "ellipsis",
                  //     }}
                  //   >
                  //     {stats?.onRackMachines}
                  //   </Typography.Text>
                  // </Col>
                }
                <Col span={12} style={{ textAlign: "right" }}>
                  <Typography.Text
                    style={{
                      width: 80,
                      display: "inline-block", // 必须加，才能让宽度生效
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    故障台数：
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      width: 80,
                      display: "inline-block", // 必须加，才能让宽度生效
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: 13,
                      color: "rgb(127, 128, 130)", //rgb(127, 128, 130)
                    }}
                  >
                    {stats?.totalFailures}
                  </Typography.Text>
                </Col>
                {
                  // <Col span={12} style={{ textAlign: "right" }}>
                  //   <Typography.Text
                  //     style={{
                  //       width: 95,
                  //       display: "inline-block", // 必须加，才能让宽度生效
                  //       textAlign: "center",
                  //       whiteSpace: "nowrap",
                  //       overflow: "hidden",
                  //       textOverflow: "ellipsis",
                  //     }}
                  //   >
                  //     <SiteStockWithNote />
                  //   </Typography.Text>
                  //   <Typography.Text
                  //     style={{
                  //       width: 80,
                  //       display: "inline-block", // 必须加，才能让宽度生效
                  //       textAlign: "left",
                  //       whiteSpace: "nowrap",
                  //       overflow: "hidden",
                  //       textOverflow: "ellipsis",
                  //     }}
                  //   >
                  //     {stats?.onlineMachines}
                  //     {/* {stats?.totalMachines && stats?.onlineRatio
                  //                           ? (stats.totalMachines * stats.onlineRatio / 100).toFixed(0)
                  //                           : 0} */}
                  //   </Typography.Text>
                  // </Col>
                }
              </Row>
              <div ref={chartRef} style={{ width: "100%", height: 190, marginTop: 20, marginBottom: 0 }} />
            </Card>
          </Skeleton>
        </Col>
        <Col span={8}>
          <Skeleton loading={loading} active>
            <Card
              title="算力汇总"
              actions={[
                <span key="setting">
                  {/* <SettingOutlined /> */}
                  <CheckCircleOutlined style={{ color: "green", fontSize: 16, marginRight: "10px" }} />
                  <span>在架有效率：{(stats?.onlineRatio || 0)?.toFixed(2)}%</span>
                </span>,
                <span key="setting">
                  <SettingOutlined style={{ fontSize: 16, color: "#1890ff", marginRight: "10px" }} />
                  {/* <ThunderboltOutlined style={{ color: 'orange', fontSize: 16, marginRight: '10px' }} /> */}
                  <span>算力有效率：{(stats?.effectiveRate24h || 0)?.toFixed(2)}%</span>
                </span>,
              ]}
            >
              <Row justify="space-between" align="middle">
                <Col span={12} style={{ textAlign: "left" }}>
                  <Typography.Text
                    style={{
                      width: 80,
                      display: "inline-block", // 必须加，才能让宽度生效
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    有效算力：
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      width: 80,
                      display: "inline-block", // 必须加，才能让宽度生效
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      fontSize: 13,
                      color: "rgb(127, 128, 130)", //rgb(127, 128, 130)
                      textOverflow: "ellipsis",
                    }}
                  >
                    {stats?.power24h} PH/S
                  </Typography.Text>
                </Col>

                <Col span={12} style={{ textAlign: "right" }}>
                  <Typography.Text
                    style={{
                      width: 100,
                      display: "inline-block", // 必须加，才能让宽度生效
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    在架理论算力：
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      width: 80,
                      display: "inline-block", // 必须加，才能让宽度生效
                      textAlign: "right",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: 13,
                      color: "rgb(127, 128, 130)", //rgb(127, 128, 130)
                    }}
                  >
                    {stats?.onRackHashRate?.toFixed(2)} PH/S
                  </Typography.Text>
                </Col>
                <Col span={12} style={{ textAlign: "left" }}>
                  <Typography.Text
                    style={{
                      width: 80,
                      display: "inline-block", // 必须加，才能让宽度生效
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    理论算力：
                  </Typography.Text>
                  <Typography.Text
                    style={{
                      width: 80,
                      display: "inline-block", // 必须加，才能让宽度生效
                      textAlign: "left",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: 13,
                      color: "rgb(127, 128, 130)", //rgb(127, 128, 130)
                    }}
                  >
                    {stats?.theoreticalPower?.toFixed(2)} PH/S
                  </Typography.Text>
                </Col>
              </Row>
              <EfficiencyGauge effective={stats?.power24h || 0} theoretical={stats?.theoreticalPower || 0} />
            </Card>
          </Skeleton>
        </Col>
        <Col span={8}>
          <Skeleton loading={loading} active>
            <Card title="影响占比">
              <div style={{ height: "20px" }}></div>
              <EffectChart data={stats || undefined} />
              <div
                style={{
                  marginTop: 25,
                  marginBottom: -20,
                  display: "flex",
                  flexWrap: "wrap", // 允许换行
                  // gap: 12,          // 子元素间距
                  borderTop: "1px solid #e8e8e8",
                }}
              >
                <Row justify="space-between" align="middle" style={{ padding: 12 }}>
                  <Col span={12} style={{ textAlign: "left" }}>
                    <WarningOutlined style={{ color: "#faad14", marginRight: 8 }} />
                    {/* <CheckCircleOutlined style={{ color: 'green', fontSize: 16, marginRight: 8 }} /> */}
                    影响占比：{stats?.impactRatio?.toFixed(2)}%
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    <CloseCircleOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
                    总故障率：{stats?.totalFailuresRate.toFixed(2)}%
                  </Col>
                  <Col span={12} style={{ textAlign: "left" }}>
                    <ThunderboltOutlined style={{ color: "#faad14", marginRight: 8 }} />
                    {/* <CheckCircleOutlined style={{ color: 'green', fontSize: 16, marginRight: 8 }} /> */}
                    限电占比：{stats?.limitImpactRate?.toFixed(2)}%
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    <FireOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
                    高温占比：{stats?.highTemperatureRate.toFixed(2)}%
                  </Col>
                </Row>
                <div></div>
              </div>
            </Card>
          </Skeleton>
        </Col>
      </Row>
    </>
  );
};

export default App;
