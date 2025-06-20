import { useEffect, useState } from "react";
import { FcBullish } from "react-icons/fc";
import { Card, Col, Radio, Row } from "antd";
import { ReactEcharts } from "@/components/react-echarts";

import { fetchLastestHashRateEfficiency } from "@/pages/mining/api.tsx";

// @ts-ignore
const MiningEfficiencyCard = ({ poolType }) => {
  const [data, setData] = useState([]);
  // const [dataCang, setDataCang] = useState([]);
  const [timeFrame, setTimeFrame] = useState("90");

  const fetchData = async (timeFrame: string) => {
    try {
      const Result = await fetchLastestHashRateEfficiency(poolType, timeFrame);

      const formattedData = Result.data?.map((item: { date: any; efficiency: any }) => ({
        date: item.date,
        efficiency: item.efficiency,
      }));

      const sortedData = formattedData.sort(
        (a: { date: string | number | Date }, b: { date: string | number | Date }) =>
          // @ts-ignore
          new Date(a.date) - new Date(b.date),
      );

      setData(sortedData);
    } catch (error) {
      console.error("Error fetching hash rate efficiency:", error);
    }
  };

  useEffect(() => {
    fetchData(timeFrame);
  }, [poolType]);

  const getOption = () => {
    // @ts-ignore
    const dates = data.map((item) => item.date);
    // @ts-ignore
    const efficiencies = data.map((item) => item.efficiency);

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
        min: 70,
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
            color: "#4b9bdc", // NS 线条颜色 #4b9bdc "#4CAF50",
          },
          lineStyle: {
            width: 1.5,
          },
          showSymbol: false, // 不显示圆点
        },
      ],
    };
  };

  // @ts-ignore
  const handleTimeFrameChange = (e) => {
    const newTimeFrame = e.target.value;
    setTimeFrame(newTimeFrame); // 更新 timeFrame 状态
    fetchData(newTimeFrame); // 每次时间范围变化时获取新的数据
  };

  return (
    <Card
      bordered={false}
      className="card-wapper"
      // style={{ background: "#f7f9fc" }}
      size={"small"}
      title={
        <Row align="middle">
          <Col>
            <FcBullish style={{ fontSize: "20px", marginRight: "5px" }} />
          </Col>
          <Col>
            <h3 style={{ marginLeft: 5, fontSize: "14px" }}>算力达成率</h3>
          </Col>
        </Row>
      }
      extra={
        <Radio.Group
          value={timeFrame}
          onChange={handleTimeFrameChange}
          style={{ fontSize: "10px" }}
          size="small"
        >
          <Radio.Button value="7" className={`radio-button ${timeFrame === "7" ? "active" : ""}`}>
            7天
          </Radio.Button>
          <Radio.Button value="30" className={`radio-button ${timeFrame === "30" ? "active" : ""}`}>
            30天
          </Radio.Button>
          <Radio.Button value="90" className={`radio-button ${timeFrame === "90" ? "active" : ""}`}>
            90天
          </Radio.Button>
        </Radio.Group>
      }
    >
      <ReactEcharts option={getOption()} style={{ height: 355 }} />
    </Card>
  );
};

export default MiningEfficiencyCard;
