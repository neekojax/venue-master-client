import React, { useEffect, useState } from "react";
import { Line } from "@ant-design/charts";
import { Card, Col, Radio, Row, Spin, Statistic, Tooltip } from "antd";
import { ReactEcharts } from "@/components/react-echarts";

import { fetchLastestHashRateEfficiency } from "@/pages/mining/api.tsx";

const MiningPoolCard = () => {
  const [dataNs, setDataNs] = useState([]);
  const [dataCang, setDataCang] = useState([]);
  const [timeFrame, setTimeFrame] = useState("7");

  const fetchData = async (timeFrame) => {
    try {
      const nsResult = await fetchLastestHashRateEfficiency("NS", timeFrame);
      const cangResult = await fetchLastestHashRateEfficiency("CANG", timeFrame);

      const formattedNsData = nsResult.data?.map(item => ({
        date: item.date,
        efficiency: item.efficiency,
      }));

      const formattedCangData = cangResult.data?.map(item => ({
        date: item.date,
        efficiency: item.efficiency,
      }));

      const sortedNsData = formattedNsData.sort((a, b) => new Date(a.date) - new Date(b.date));
      const sortedCangData = formattedCangData.sort((a, b) => new Date(a.date) - new Date(b.date));

      setDataNs(sortedNsData);
      setDataCang(sortedCangData);
    } catch (error) {
      console.error("Error fetching hash rate efficiency:", error);
    }
  };

  useEffect(() => {
    fetchData(7);
  }, []);

  const getOption = () => {
    const dates = dataNs.map(item => item.date);
    const nsEfficiencies = dataNs.map(item => item.efficiency);
    const cangEfficiencies = dataCang.map(item => item.efficiency);

    return {
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["NS", "CANG"],
        top: "1%",
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
      },
      series: [
        {
          name: "NS",
          type: "line",
          data: nsEfficiencies,
          smooth: true,
          itemStyle: {
            color: "#4CAF50", // NS 线条颜色
          },
          lineStyle: {
            width: 2,
          },
          showSymbol: false, // 不显示圆点
        },
        {
          name: "CANG",
          type: "line",
          data: cangEfficiencies,
          smooth: true,
          itemStyle: {
            color: "#4b9bdc", // CANG 线条颜色
          },
          lineStyle: {
            width: 2,
          },
          showSymbol: false, // 不显示圆点
        },
      ],
    };
  };

  const handleTimeFrameChange = (e) => {
    const newTimeFrame = e.target.value;
    setTimeFrame(newTimeFrame); // 更新 timeFrame 状态
    fetchData(newTimeFrame); // 每次时间范围变化时获取新的数据
  };

  return (
    <Card bordered={false} style={{ background: "#f7f9fc" }}>
      <Row justify="space-between" align="middle">
        <Col>
          <h3 style={{ margin: 0 }}>算力达成率</h3>
        </Col>
        <Col>
          <Radio.Group
            value={timeFrame}
            onChange={handleTimeFrameChange}
            style={{ marginBottom: "16px", fontSize: "12px" }}
            size="middle"
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
        </Col>
      </Row>
      <ReactEcharts option={getOption()} style={{ height: 300 }} />
    </Card>
  );
};

export default MiningPoolCard;
