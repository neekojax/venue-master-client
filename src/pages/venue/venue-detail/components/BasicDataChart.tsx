import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
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
import SiteOnlineNote from "@/components/tooltip/SiteOnlineNote.jsx";
// @ts-ignore
import SiteStockWithNote from "@/components/tooltip/SiteStockWithNote.jsx";
import type { VenueStats } from "../types";
import EffectChart from "./EffectChart";
import EfficiencyGauge from "./gauge";
import { useSelector, useSettingsStore } from "@/stores";

import { getVenueDailyStat } from "@/pages/venue/api.tsx";

const App: React.FC<{ data: any; loading: boolean }> = ({ data, loading }) => {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));
  const { venueId } = useParams<{ venueId: string }>();

  console.log("5656", poolType, venueId);

  const [stats, setStats] = useState<VenueStats | null>(null);
  // const [qitaRate, setQitaRate] = useState<string>("");

  // 获取昨日的日期
  const yesterday = new Date(Date.now() - 864e5);
  const formattedDate = yesterday.toISOString().split("T")[0];

  // 获取数据
  const fetchData = async () => {
    try {
      const response = await getVenueDailyStat(poolType, Number(venueId), formattedDate);
      // console.log(response)
      setStats(response.data);
      // const { failureRate24h, impactRatio, limitImpactRate, highTemperatureRate } = response.data;
      // const qitaRate_num = impactRatio - failureRate24h - limitImpactRate - highTemperatureRate;
      // setQitaRate(qitaRate_num.toFixed(2));

      // 处理响应数据
    } catch (error) {
      // 处理错误
      console.log(error);
    }
  };

  useEffect(() => {
    fetchData();
    // setStats(data);
  }, [venueId]);
  // 获取当前日期

  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<EChartsType | null>(null);

  useEffect(() => {
    if (chartRef.current && stats) {
      // 销毁之前的图表实例
      if (chartInstance.current) {
        chartInstance.current.dispose();
      }
      // 初始化echarts实例
      chartInstance.current = echarts.init(chartRef.current);

      // const shangjia = data.totalEstimateOnRackMachines; // 估计在线机器数
      const shangjia = stats.onRackMachines || 0; // 故障机器数
      const zaixian = data.onlineMachines || 0; // 估计离线机器数
      const total = stats.totalMachines || 0; // 总机器数

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
            data: [{ value: total, name: "总数", itemStyle: { color: "#fa8c16" } }],
          },
          {
            name: "在架数",
            type: "pie",
            radius: ["50%", "70%"],
            label: { show: false },
            data: [
              { value: shangjia, name: "在架数", itemStyle: { color: "#1890ff" } },
              { value: total - shangjia, name: "非在架数", itemStyle: { color: "transparent" } },
            ],
          },
          {
            name: "在线数",
            type: "pie",
            radius: ["30%", "45%"],
            label: { show: false },
            data: [
              { value: zaixian, name: "在线", itemStyle: { color: "#52c41a" } },
              { value: shangjia - zaixian, name: "不在线", itemStyle: { color: "transparent" } },
            ],
          },
        ],
      };
      chartInstance.current.setOption(option);

      // 图表响应式
      const handleResize = () => chartInstance.current && chartInstance.current.resize();
      window.addEventListener("resize", handleResize);

      // 清理函数
      return () => {
        window.removeEventListener("resize", handleResize);
        if (chartInstance.current) {
          chartInstance.current.dispose();
          chartInstance.current = null;
        }
      };
    }
    // youxiaosuanli = (data?.totalTheoreticalPower * data?.averageEffectiveRate / 100)?.toFixed(2);
  }, [data, venueId]);

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
                <span key="setting">
                  {/* <SettingOutlined /> */}
                  <CheckCircleOutlined style={{ color: "green", fontSize: 16, marginRight: "10px" }} />
                  <span>在线率：{(stats?.onlineRatio || 0)?.toFixed(2)}%</span>
                </span>,
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
                      textOverflow: "ellipsis",
                    }}
                  >
                    {stats?.totalMachines}
                  </Typography.Text>
                </Col>
                {
                  <Col span={12} style={{ textAlign: "right" }}>
                    <Typography.Text
                      style={{
                        width: 95,
                        display: "inline-block", // 必须加，才能让宽度生效
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <SiteOnlineNote />
                    </Typography.Text>
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
                      {stats?.onRackMachines}
                    </Typography.Text>
                  </Col>
                }
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
                    }}
                  >
                    {stats?.totalFailures}
                  </Typography.Text>
                </Col>
                {
                  <Col span={12} style={{ textAlign: "right" }}>
                    <Typography.Text
                      style={{
                        width: 95,
                        display: "inline-block", // 必须加，才能让宽度生效
                        textAlign: "center",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      <SiteStockWithNote />
                    </Typography.Text>
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
                      {stats?.onlineMachines}
                      {/* {stats?.totalMachines && stats?.onlineRatio
                                            ? (stats.totalMachines * stats.onlineRatio / 100).toFixed(0)
                                            : 0} */}
                    </Typography.Text>
                  </Col>
                }
              </Row>
              <div ref={chartRef} style={{ width: "100%", height: 168, marginTop: 0, marginBottom: 0 }} />
            </Card>
          </Skeleton>
        </Col>
        <Col span={8}>
          <Skeleton loading={loading} active>
            <Card
              title="算力汇总"
              actions={[
                <span key="setting">
                  <SettingOutlined style={{ fontSize: 16, color: "#1890ff", marginRight: "10px" }} />
                  {/* <ThunderboltOutlined style={{ color: 'orange', fontSize: 16, marginRight: '10px' }} /> */}
                  <span>算力有效率：{(stats?.effectiveRate24h || 0)?.toFixed(2)}%</span>
                </span>,
              ]}
            >
              <Row justify="space-between" align="middle">
                <Col span={12} style={{ textAlign: "left" }}>
                  有效算力：{stats?.power24h}
                  &nbsp;&nbsp;PH/S
                </Col>
                <Col span={12} style={{ textAlign: "right" }}>
                  理论算力：{stats?.theoreticalPower?.toFixed(2)}
                  &nbsp;&nbsp;PH/S
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
                    总故障率：{stats?.failureRate24h.toFixed(2)}%
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
