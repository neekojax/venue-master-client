import { FcRefresh } from "react-icons/fc";
import { Card, Col, Row } from "antd";
import { ReactEcharts } from "@/components/react-echarts";

const MiningRepairTrendChart = () => {
  const generateRepairData = () => {
    const data = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i); // 获取最近的日期
      const repairNum = Math.floor(Math.random() * (70 - 30 + 1)) + 30; // 生成30到70之间的随机数

      data.push({
        date: date.toISOString().split("T")[0], // 格式化日期为 YYYY-MM-DD
        repairNum: repairNum,
      });
    }

    return data.reverse(); // 反转数组，使得最新日期在前
  };

  const data = generateRepairData(); // 生成最近60天的维修数据

  const getOption = () => {
    const dates = data.map((item) => item.date);
    const efficiencies = data.map((item) => item.repairNum);

    return {
      tooltip: {
        trigger: "axis",
      },
      grid: {
        top: "5%", // 调整为 0% 或更小的值
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
        min: 20,
        splitLine: {
          show: false, // 隐藏 y 轴的网格线
        },
      },
      series: [
        {
          // name: poolType,
          type: "line",
          data: efficiencies,
          smooth: true,
          itemStyle: {
            color: "#87CEEB", // 更淡的蓝色
          },
          lineStyle: {
            width: 1.5,
          },
          showSymbol: false, // 不显示圆点
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
            <FcRefresh style={{ fontSize: "20px", marginRight: "5px" }} />
          </Col>
          <Col>
            <h3 style={{ marginLeft: 5, fontSize: "14px" }}>维修态曲线</h3>
          </Col>
        </Row>
      }
    >
      <ReactEcharts option={getOption()} style={{ height: 180 }} />
    </Card>
  );
};

export default MiningRepairTrendChart;
