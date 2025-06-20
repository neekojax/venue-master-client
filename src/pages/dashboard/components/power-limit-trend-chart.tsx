import { AiOutlineThunderbolt } from "react-icons/ai"; // 新图标
import { Card, Col, Row } from "antd";
import { ReactEcharts } from "@/components/react-echarts";

const PowerLimitationTrendChart = () => {
  const generatePowerLimitationData = () => {
    const data = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const limitationRate = Math.floor(Math.random() * 11); // 生成0到10之间的随机数

      data.push({
        date: date.toISOString().split("T")[0], // 格式化日期为 YYYY-MM-DD
        limitationRate: limitationRate,
      });
    }

    return data.reverse(); // 反转数组，使得最新日期在前
  };

  const data = generatePowerLimitationData(); // 生成最近60天的限电率数据

  const getOption = () => {
    const dates = data.map((item) => item.date);
    const limitationRates = data.map((item) => item.limitationRate);

    return {
      tooltip: {
        trigger: "axis",
      },
      grid: {
        top: "5%",
        right: "5%",
        bottom: "12%",
        left: "5%",
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLine: {
          lineStyle: {
            color: "#ccc",
          },
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: 10, // 限电率的最大值设为10
        splitLine: {
          show: false,
        },
      },
      series: [
        {
          type: "line",
          data: limitationRates,
          smooth: true,
          itemStyle: {
            color: "#4799dd", // 更换为橙
          },
          lineStyle: {
            width: 1.5,
          },
          showSymbol: false,
        },
      ],
    };
  };

  return (
    <Card
      bordered={false}
      // className="card-wapper"
      style={{ border: "none" }}
      size={"small"}
      title={
        <Row align="middle">
          <Col>
            <AiOutlineThunderbolt style={{ fontSize: "20px", marginRight: "5px" }} /> {/* 新图标 */}
          </Col>
          <Col>
            <h3 style={{ marginLeft: 5, fontSize: "14px" }}>限电率曲线</h3>
          </Col>
        </Row>
      }
    >
      <ReactEcharts option={getOption()} style={{ height: 180 }} />
    </Card>
  );
};

export default PowerLimitationTrendChart;
