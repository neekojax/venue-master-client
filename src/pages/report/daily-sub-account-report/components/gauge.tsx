import { useEffect, useRef } from "react";
import * as echarts from "echarts";

const EfficiencyGauge = (props: { effective: number; theoretical: number }) => {
  const chartRef = useRef(null);
  const { effective, theoretical } = props;

  //  effective: effective, theoretical: theoretical/
  const efficiency = theoretical > 0 ? (effective / theoretical) * 100 : 0;
  console.log(efficiency);

  useEffect(() => {
    const chart = echarts.init(chartRef.current);

    const option = {
      series: [
        {
          type: "gauge",
          startAngle: 210,
          endAngle: -30,
          min: 0,
          max: 100,
          splitNumber: 5,
          radius: "90%", // 放大仪表盘，默认是75%左右
          center: ["50%", "55%"], // 图居中，竖向偏下点，留出空间给数字
          axisLine: {
            lineStyle: {
              width: 15, // 线宽加粗一点
              color: [
                [0.6, "#ff4d4f"],
                [0.8, "#fa8c16"],
                [1, "#52c41a"],
              ],
            },
          },
          pointer: { width: 8 }, // 指针变粗一点
          detail: {
            valueAnimation: true,
            formatter: "{value}%",
            fontSize: 20,
            offsetCenter: [0, 80], // 文字往下偏移60px，和仪表盘有间距
          },
          data: [{ value: efficiency.toFixed(2) }],
        },
      ],
    };
    chart.setOption(option);

    // 组件卸载时销毁图表实例
    return () => {
      chart.dispose();
    };
  }, [efficiency]);

  return <div ref={chartRef} style={{ height: 200, width: "100%" }} />;
};

export default EfficiencyGauge;
