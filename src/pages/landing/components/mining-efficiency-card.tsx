import { useEffect, useState } from "react";
import { FcBullish } from "react-icons/fc";
import { Card, Col, Radio, Row } from "antd";
import * as echarts from "echarts";
import { ReactEcharts } from "@/components/react-echarts";

import { fetchLastestHashRateEfficiency } from "@/pages/mining/api.tsx";

// @ts-ignore
const MiningEfficiencyCard = ({ poolType }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState<boolean>(true); // 加载状态
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
    } finally {
      setLoading(false);
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
        boundaryGap: false,
        axisLabel: {
          color: "#99a1b7", // 字体颜色
          fontSize: 12, // 字体大小
          rotate: 0, //不旋转
          formatter: function (value) {
            // 只保留月-日
            return value.substr(5);
          },
        },
        axisLine: {
          lineStyle: {
            color: "#99a1b7",
          },
        },
      },
      yAxis: {
        type: "value",
        min: 70,
        axisLabel: {
          color: "#99a1b7", // 字体颜色
          fontSize: 12, // 字体大小
        },
        lineStyle: {
          type: "dashed",
          color: "#99a1b7",
          // ...
        },
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
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(75, 155, 220, 0.4)",
              },
              {
                offset: 1,
                color: "rgba(75, 155, 220,0.03)",
              },
            ]),
          },
          lineStyle: {
            width: 3, //默认2
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
      loading={loading}
      // style={{ background: "#f7f9fc" }}
      // size={"small"}
      title={
        <Row align="middle">
          <Col>
            <FcBullish
              style={{ fontSize: "24px", marginRight: "8px", fontWeight: "bold", color: "#1890ff" }}
            />
          </Col>
          <Col>
            <h3 style={{ marginLeft: 2, fontSize: "18px", color: "#333" }}>算力达成率</h3>
          </Col>
        </Row>
      }
      extra={
        <Radio.Group
          value={timeFrame}
          className="filter-button"
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
      <ReactEcharts option={getOption()} style={{ height: 312 }} />
    </Card>
  );
};

export default MiningEfficiencyCard;
