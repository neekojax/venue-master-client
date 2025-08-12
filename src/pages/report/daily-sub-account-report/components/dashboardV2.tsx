import React, { useEffect, useRef } from "react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FireOutlined,
  SettingOutlined,
  ThunderboltOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Typography } from "antd";
import type { EChartsType } from "echarts";
import * as echarts from "echarts";
import EfficiencyGauge from "./gauge";

// const MultiProgress = ({ values, colors }) => {
//   const total = values.reduce((a, b) => a + b, 0);
//   return (
//     <div style={{ display: 'flex', width: '100%', height: 20, borderRadius: 4, overflow: 'hidden' }}>
//       {values.map((v, i) => (
//         <div
//           key={i}
//           style={{
//             width: `${(v / total * 100).toFixed(2)}%`,
//             backgroundColor: colors[i],
//           }}
//           title={`${(v / total * 100).toFixed(2)}%`}
//         >

//           {i === 2 && (
//             <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 12, textAlign: 'right' }} >
//               {/* {`${(v / total * 100).toFixed(2)}%`} */}
//               {v} %
//             </div>
//           )}
//           <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }} >
//             {/* {`${(v / total * 100).toFixed(2)}%`} */}
//             {v} %
//           </div>
//         </div>
//       ))}
//     </div>

//   );
// };

// const MultiProgress = ({ values, colors }) => {
//   const total = values.reduce((a, b) => a + b, 0);

//   return (
//     <div style={{ width: '100%' }}>
//       <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
//         {values.map((v, i) => (
//           <div
//             key={i}
//             style={{
//               width: `${(v / total) * 100}%`,
//               fontWeight: 'bold',
//               fontSize: 12,
//               color: '#000',
//               textAlign: 'center',
//               whiteSpace: 'nowrap',
//               overflow: 'hidden',
//               textOverflow: 'ellipsis',
//             }}
//             title={`${(v / total * 100).toFixed(2)}%`}
//           >
//             {v} %
//           </div>
//         ))}
//       </div>

//       <div style={{ display: 'flex', width: '100%', height: 20, borderRadius: 4, overflow: 'hidden' }}>
//         {values.map((v, i) => (
//           <div
//             key={i}
//             style={{
//               width: `${(v / total) * 100}%`,
//               backgroundColor: colors[i],
//               borderTopLeftRadius: i === 0 ? 4 : 0,
//               borderBottomLeftRadius: i === 0 ? 4 : 0,
//               borderTopRightRadius: i === values.length - 1 ? 4 : 0,
//               borderBottomRightRadius: i === values.length - 1 ? 4 : 0,
//             }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// const MultiProgress = ({ values, colors }) => {
//   const total = values.reduce((a, b) => a + b, 0);

//   // 计算每个百分比（避免四舍五入误差）
//   const percents = values.map(v => (v / total) * 100);

//   return (
//     <div style={{ width: '100%' }}>
//       {/* 文字部分 */}
//       <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 4, gap: 8 }}>
//         {values.map((v, i) => (
//           <div
//             key={i}
//             style={{
//               fontWeight: 'bold',
//               fontSize: 12,
//               color: '#000',
//               whiteSpace: 'nowrap',
//               minWidth: 30,
//               textAlign: 'center',
//             }}
//             title={`${(percents[i]).toFixed(2)}%`}
//           >
//             {v} %
//           </div>
//         ))}
//       </div>

//       {/* 进度条部分 */}
//       <div style={{ display: 'flex', width: '100%', height: 20, borderRadius: 4, overflow: 'hidden' }}>
//         {percents.map((p, i) => (
//           <div
//             key={i}
//             style={{
//               width: `${p}%`,
//               backgroundColor: colors[i],
//               borderTopLeftRadius: i === 0 ? 4 : 0,
//               borderBottomLeftRadius: i === 0 ? 4 : 0,
//               borderTopRightRadius: i === percents.length - 1 ? 4 : 0,
//               borderBottomRightRadius: i === percents.length - 1 ? 4 : 0,
//               transition: 'width 0.3s ease',
//             }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

// const MultiProgress = ({ values, colors }) => {
//   const total = values.reduce((a, b) => a + b, 0);

//   // 计算每个百分比
//   const percents = values.map(v => (v / total) * 100);

//   // 对应文字对齐方式
//   const textAligns = ['left', 'center', 'right'];

//   return (
//     <div style={{ width: '100%' }}>
//       {/* 文字部分 */}
//       <div style={{ display: 'flex', marginBottom: 4, width: '100%' }}>
//         {values.map((v, i) => (
//           <div
//             key={i}
//             style={{
//               width: `${percents[i]}%`,
//               fontWeight: 'bold',
//               fontSize: 12,
//               color: '#000',
//               whiteSpace: 'nowrap',
//               textAlign: textAligns[i] || 'center',
//               paddingLeft: i === 0 ? 4 : 0,
//               paddingRight: i === values.length - 1 ? 4 : 0,
//               boxSizing: 'border-box',
//             }}
//             title={`${percents[i].toFixed(2)}%`}
//           >
//             {v} %
//           </div>
//         ))}
//       </div>

//       {/* 进度条部分 */}
//       <div style={{ display: 'flex', width: '100%', height: 20, borderRadius: 4, overflow: 'hidden' }}>
//         {percents.map((p, i) => (
//           <div
//             key={i}
//             style={{
//               width: `${p}%`,
//               backgroundColor: colors[i],
//               borderTopLeftRadius: i === 0 ? 4 : 0,
//               borderBottomLeftRadius: i === 0 ? 4 : 0,
//               borderTopRightRadius: i === percents.length - 1 ? 4 : 0,
//               borderBottomRightRadius: i === percents.length - 1 ? 4 : 0,
//               transition: 'width 0.3s ease',
//             }}
//           />
//         ))}
//       </div>
//     </div>
//   );
// };

const MultiProgress = (props: { values: number[]; colors: string[] }) => {
  const { values, colors } = props;
  const total = props.values.reduce((a: number, b: number) => a + b, 0);

  const percents = props.values.map((v: number) => (v / total) * 100);

  // // 假设4个数据，对应文字对齐方式（多了默认center）
  // const textAligns = ['left', 'center', 'right'];

  return (
    <div style={{ width: "100%" }}>
      {/* 文字部分 */}
      <div style={{ display: "flex", marginBottom: 4, width: "100%" }}>
        {values.map((v, i) => {
          return (
            <div
              key={i}
              style={{
                width: `${percents[i]}%`,
                fontWeight: "bold",
                fontSize: 14,
                color: "#000",
                whiteSpace: "nowrap",
                textAlign: i == 0 ? "left" : i == 1 ? "center" : i == 2 ? "right" : "center",
                paddingLeft: i === 0 ? 4 : 0,
                paddingRight: i === values.length - 1 ? 4 : 0,
                boxSizing: "border-box",
                visibility: i === 3 ? "hidden" : "visible", // 第4个隐藏
              }}
              title={`${percents[i].toFixed(2)}%`}
            >
              {v}%
            </div>
          );
        })}
      </div>

      {/* 进度条部分 */}
      <div style={{ display: "flex", width: "100%", height: 20, borderRadius: 4, overflow: "hidden" }}>
        {percents.map((p, i) => (
          <div
            key={i}
            style={{
              width: `${p}%`,
              backgroundColor: colors[i],
              borderTopLeftRadius: i === 0 ? 4 : 0,
              borderBottomLeftRadius: i === 0 ? 4 : 0,
              borderTopRightRadius: i === percents.length - 1 ? 4 : 0,
              borderBottomRightRadius: i === percents.length - 1 ? 4 : 0,
              transition: "width 0.3s ease",
            }}
          />
        ))}
      </div>
    </div>
  );
};

const App: React.FC<{ data: any }> = ({ data }) => {
  // const chartRef = useRef(null);
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<EChartsType | null>(null);
  // const chartRef = useRef<EChartsType | null>(null);

  // const chartRef: EChartsType | null = null;
  // const chartInstance = useRef(null);
  // const chartInstance: EChartsType | null = null;
  // const chartInstance = useRef<EChartsType | null>(null);
  const guzhanglv = (data.totalFailures24h / data.totalMachines) * 100;
  const yingxiangZhanbi = (data.totalPowerImpact / data.totalTheoreticalPower) * 100;
  // let youxiaosuanli = 0
  useEffect(() => {
    if (chartRef.current) {
      // 初始化echarts实例
      chartInstance.current = echarts.init(chartRef.current);

      const shangjia = data.totalEstimateOnRackMachines; // 估计在线机器数
      const zaixian = data.totalEstimateOnlineMachines; // 估计离线机器数
      const total = data.totalMachines; //其他机器数

      // const failureCount = data.totalFailures24h;
      // const otherCount = data.totalMachines - onlineCount - failureCount; //其他机器数

      // const option = {
      //   tooltip: {
      //     trigger: 'item',
      //     formatter: '{b}: {c} ({d}%)',
      //   },
      //   legend: {
      //     bottom: 10,
      //     left: 'center',
      //     data: ['在线机器', '故障机器', '其他机器'],
      //   },
      //   color: ['#52c41a', '#ff4d4f', '#faad14'], // 绿色，红色，黄色
      //   series: [
      //     {
      //       name: '机器状态',
      //       type: 'pie',
      //       radius: ['50%', '70%'], // 环形图
      //       avoidLabelOverlap: false,
      //       label: {
      //         show: true,
      //         position: 'inside',
      //         formatter: '{d}%',
      //         fontWeight: 'bold',
      //         color: '#fff',
      //       },
      //       labelLine: {
      //         show: false,
      //       },
      //       data: [
      //         { value: onlineCount, name: '在架机器' },
      //         { value: failureCount, name: '故障机器' },
      //         // { value: otherCount, name: '机器' },
      //       ],
      //       graphic: [
      //         {
      //           type: 'text',
      //           left: 'center',
      //           top: '45%',
      //           style: {
      //             text: `总机器数\n${data.totalMachines}`,
      //             textAlign: 'center',
      //             fill: '#000',
      //             fontSize: 20,
      //             fontWeight: 'bold',
      //           },
      //         },
      //         {
      //           type: 'text',
      //           left: 'center',
      //           top: '75%',
      //           style: {
      //             text: `正常机器数: ${onlineCount}  故障机器数: ${failureCount}  其他机器数: ${otherCount}`,
      //             textAlign: 'center',
      //             fill: '#333',
      //             fontSize: 14,
      //           },
      //         },
      //         {
      //           type: 'text',
      //           left: 'center',
      //           top: '85%',
      //           style: {
      //             text: `故障率: ${guzhanglv?.toFixed(2)}%`,
      //             textAlign: 'center',
      //             fill: '#333',
      //             fontSize: 14,
      //           },
      //         },
      //       ],
      //     },
      //   ],
      // };

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
            radius: ["80%", "100%"],
            // label: { },
            label: { show: false, position: "center", formatter: "{b}\n{c}" },
            data: [{ value: total, name: "总数", itemStyle: { color: "#fa8c16" } }],
          },
          {
            name: "在架数",
            type: "pie",
            radius: ["55%", "75%"],
            label: { show: false },
            data: [
              { value: shangjia, name: "在架", itemStyle: { color: "#1890ff" } },
              { value: total - shangjia, name: "未在架", itemStyle: { color: "transparent" } },
            ],
          },
          {
            name: "在线数",
            type: "pie",
            radius: ["30%", "50%"],
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

      // return () => {
      // window.removeEventListener('resize', handleResize);
      // chartInstance.current && chartInstance.current.dispose();
      // };
    }
    // youxiaosuanli = (data?.totalTheoreticalPower * data?.averageEffectiveRate / 100)?.toFixed(2);
  }, [data]);
  // youxiaosuanli = (data?.totalTheoreticalPower * data?.averageEffectiveRate / 100)?.toFixed(2);

  return (
    <Row gutter={16}>
      <Col span={8}>
        <Card
          title="机器汇总"
          bordered={false}
          actions={[
            <span key="setting">
              <CloseCircleOutlined style={{ color: "red", fontSize: 16, marginRight: "10px" }} />
              <span>故障率：{((data.totalFailures24h / data.totalMachines) * 100)?.toFixed(2)}%</span>
            </span>,
            <span key="setting">
              {/* <SettingOutlined /> */}
              <CheckCircleOutlined style={{ color: "green", fontSize: 16, marginRight: "10px" }} />
              <span>在线率：{data.totalOnlineRatio?.toFixed(2)}%</span>
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
                {data?.totalMachines}
              </Typography.Text>
            </Col>
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
                在架台数：
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
                {data?.totalEstimateOnRackMachines}
              </Typography.Text>
            </Col>
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
                {data?.totalFailures24h}
              </Typography.Text>
            </Col>
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
                在线台数：
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
                {(data?.totalEstimateOnlineMachines || 0).toFixed(0)}
              </Typography.Text>
            </Col>
          </Row>
          <div ref={chartRef} style={{ width: "100%", height: 168, marginTop: 0, marginBottom: 0 }} />
        </Card>
      </Col>
      <Col span={8}>
        <Card
          title="算力汇总"
          bordered={false}
          actions={[
            <span key="setting">
              <SettingOutlined style={{ fontSize: 16, color: "#1890ff", marginRight: "10px" }} />
              {/* <ThunderboltOutlined style={{ color: 'orange', fontSize: 16, marginRight: '10px' }} /> */}
              <span>算力有效率：{(data?.averageEffectiveRate || 0)?.toFixed(2)}%</span>
            </span>,
          ]}
        >
          <Row justify="space-between" align="middle">
            <Col span={12} style={{ textAlign: "left" }}>
              有效算力：{((data?.totalTheoreticalPower * data?.averageEffectiveRate) / 100)?.toFixed(2)}
              &nbsp;&nbsp;EH/S
            </Col>
            <Col span={12} style={{ textAlign: "right" }}>
              理论算力：{data?.totalTheoreticalPower?.toFixed(2)}
              &nbsp;&nbsp;EH/S
            </Col>
          </Row>
          <EfficiencyGauge
            effective={(data?.totalTheoreticalPower * data?.averageEffectiveRate) / 100}
            theoretical={data?.totalTheoreticalPower}
          />
        </Card>
      </Col>
      <Col span={8}>
        <Card title="影响占比">
          <div style={{ height: "20px" }}></div>
          <MultiProgress
            values={[Number(yingxiangZhanbi?.toFixed(2))]} // 三个值
            colors={["#52c41a", "#ff4d4f", "#faad14"]} // 绿色、红色、黄色
          />

          <div style={{ height: "50px" }}></div>
          <MultiProgress
            values={[
              Number(guzhanglv?.toFixed(2)),
              Number(data.totalLimitImpactRatio?.toFixed(2)),
              Number(data.totalHighTemperatureImpactRatio?.toFixed(2)),
              yingxiangZhanbi -
                Number(guzhanglv?.toFixed(2)) -
                Number(data.totalLimitImpactRatio?.toFixed(2)) -
                Number(data.totalHighTemperatureImpactRatio?.toFixed(2)),
            ]} // 三个值
            colors={["#1890ff", "#ff4d4f", "#faad14"]} // 绿色、红色、黄色
          />

          <div
            style={{
              marginTop: 60,
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
                影响占比：{yingxiangZhanbi?.toFixed(2)}%
              </Col>
              <Col span={12} style={{ textAlign: "right" }}>
                <CloseCircleOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
                总故障率：{guzhanglv?.toFixed(2)}%
              </Col>
              <Col span={12} style={{ textAlign: "left" }}>
                <ThunderboltOutlined style={{ color: "#faad14", marginRight: 8 }} />
                {/* <CheckCircleOutlined style={{ color: 'green', fontSize: 16, marginRight: 8 }} /> */}
                限电占比：{data.totalLimitImpactRatio?.toFixed(2)}%
              </Col>
              <Col span={12} style={{ textAlign: "right" }}>
                <FireOutlined style={{ color: "#ff4d4f", marginRight: 8 }} />
                高温占比：{data.totalHighTemperatureImpactRatio?.toFixed(2)}%
              </Col>
            </Row>
            <div></div>
          </div>
        </Card>
      </Col>
    </Row>
  );
};

export default App;
