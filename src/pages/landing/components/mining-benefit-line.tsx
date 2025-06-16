import React, { useEffect, useState } from "react";
import { FcLineChart } from "react-icons/fc";
import { Line } from "@ant-design/charts";
import { Card, Col, Radio, Row, Spin, Statistic, Tooltip } from "antd";
import { ReactEcharts } from "@/components/react-echarts";

import { fetchMiningBenefitLine } from "@/pages/landing/api.ts";

const MiningBenefitCard = ({ poolType }) => {
  const [data, setData] = useState([]);
  const [timeFrame, setTimeFrame] = useState("30");

  const fetchData = async (timeFrame) => {
    try {
      const Result = await fetchMiningBenefitLine(poolType, timeFrame);

      const formattedData = Result.data.map((item) => ({
        time: item.time,
        income_usd: item.income_usd,
        hosting_fee: item.hosting_fee,
        fee_percentage: item.fee_percentage,
      }));

      // 按时间排序
      const sortedData = formattedData.sort((a, b) => new Date(a.time) - new Date(b.time));
      setData(sortedData);

      setData(sortedData);
      // setDataCang(sortedCangData);
    } catch (error) {
      console.error("Error fetching hash rate efficiency:", error);
    }
  };

  useEffect(() => {
    fetchData(timeFrame);
  }, [poolType]);

  const getOption = () => {
    const times = data.map((item) => item.time);
    const income_usd = data.map((item) => item.income_usd);
    const hosting_fee = data.map((item) => item.hosting_fee);
    const fee_percentage = data.map((item) => item.fee_percentage);

    return {
      tooltip: {
        trigger: "axis",
      },
      grid: {
        top: "5%", // 调整为 0% 或更小的值
        right: "5%",
        bottom: "12%",
        left: "10%",
      },
      xAxis: {
        type: "category",
        data: times,
        axisLine: {
          lineStyle: {
            color: "#ccc",
          },
        },
      },

      yAxis: [
        {
          type: "value",
          name: "收入/托管费",
          min: 0,
          splitLine: {
            show: false,
          },
        },
        {
          type: "value",
          name: "费用百分比 (%)",
          min: 0,
          max: 100,
          splitLine: {
            show: false,
          },
          position: "right",
        },
      ],
      series: [
        {
          name: "收入(USD)",
          type: "line",
          data: income_usd,
          smooth: true,
          itemStyle: {
            color: "#4b9bdc",
          },
          lineStyle: {
            width: 1.5,
          },
          showSymbol: false,
        },
        {
          name: "托管费",
          type: "line",
          data: hosting_fee,
          smooth: true,
          itemStyle: {
            color: "#ff6f61",
          },
          lineStyle: {
            width: 1.5,
          },
          showSymbol: false,
        },
        {
          name: "费用百分比",
          type: "line",
          yAxisIndex: 1,
          data: fee_percentage,
          smooth: true,
          itemStyle: {
            color: "#f0ad4e",
          },
          lineStyle: {
            width: 1.5,
          },
          showSymbol: false,
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
    <Card
      bordered={false}
      style={{ background: "#f7f9fc" }}
      size={"small"}
      title={
        <Row align="middle">
          <Col>
            <FcLineChart style={{ fontSize: "20px", marginRight: "5px" }} />
          </Col>
          <Col>
            <h3 style={{ marginLeft: 5, fontSize: "14px" }}>收益+支出</h3>
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
      <ReactEcharts option={getOption()} style={{ height: 180 }} />
    </Card>
  );
};

export default MiningBenefitCard;
