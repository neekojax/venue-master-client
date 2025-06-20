import { useEffect, useState } from "react";
import { FcLineChart } from "react-icons/fc";
import { Card, Col, Radio, Row } from "antd";
import * as echarts from "echarts";
import { ReactEcharts } from "@/components/react-echarts";

import { fetchMiningBenefitLine } from "@/pages/landing/api.ts";

// @ts-ignore
const MiningBenefitCard = ({ poolType }) => {
  const [data, setData] = useState([]);
  const [timeFrame, setTimeFrame] = useState("30");

  const fetchData = async (timeFrame: string) => {
    try {
      const Result = await fetchMiningBenefitLine(poolType, timeFrame);

      const formattedData = Result.data.map(
        (item: { time: any; income_usd: any; hosting_fee: any; fee_percentage: any }) => ({
          time: item.time,
          income_usd: item.income_usd,
          hosting_fee: item.hosting_fee,
          fee_percentage: item.fee_percentage,
        }),
      );

      // 按时间排序
      const sortedData = formattedData.sort(
        (a: { time: string | number | Date }, b: { time: string | number | Date }) =>
          // @ts-ignore
          new Date(a.time) - new Date(b.time),
      );
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
    // @ts-ignore
    const times = data.map((item) => item.time);
    // @ts-ignore
    const income_usd = data.map((item) => item.income_usd);
    // @ts-ignore
    const hosting_fee = data.map((item) => item.hosting_fee);
    // @ts-ignore
    const fee_percentage = data.map((item) => item.fee_percentage);

    const formatNumberCN = (value) => {
      if (value >= 1e8) {
        return (value / 1e8).toFixed(2) + "亿";
      } else if (value >= 1e6) {
        return (value / 1e6).toFixed(2) + "百万";
      } else if (value >= 1e4) {
        return (value / 1e4).toFixed(2) + "万";
      } else {
        return value.toFixed(2);
      }
    };

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

      yAxis: [
        {
          type: "value",
          name: "收入/托管费",
          min: 0,
          axisLabel: {
            color: "#99a1b7", // 字体颜色
            fontSize: 12, // 字体大小
            formatter: function (value) {
              return formatNumberCN(value);
            },
          },
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
            width: 3,
          },
          showSymbol: false,
        },
        {
          name: "托管费",
          type: "line",
          data: hosting_fee,
          smooth: true,
          itemStyle: {
            color: "#ff6f61", // #ff6f61
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(255,111,97, 0.4)",
              },
              {
                offset: 1,
                color: "rgba(255,111,97,0.03)",
              },
            ]),
          },
          lineStyle: {
            width: 3,
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
            color: "#f0ad4e", // #f0ad4e
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: "rgba(240,173,78, 0.4)",
              },
              {
                offset: 1,
                color: "rgba(240,173,78,0.03)",
              },
            ]),
          },
          lineStyle: {
            width: 3,
          },
          showSymbol: false,
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
      className="card-wapper"
      bordered={false}
      // style={{ background: "#f7f9fc" }}
      size={"small"}
      title={
        <Row align="middle">
          <Col>
            <FcLineChart style={{ fontSize: "20px", marginRight: "5px" }} />
          </Col>
          <Col>
            <h3 style={{ marginLeft: 2, fontSize: "18px", color: "#333" }}>收益+支出</h3>
          </Col>
        </Row>
      }
      extra={
        <Radio.Group
          value={timeFrame}
          onChange={handleTimeFrameChange}
          style={{ fontSize: "10px", border: "none" }}
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
      <ReactEcharts option={getOption()} style={{ height: 315 }} />
    </Card>
  );
};

export default MiningBenefitCard;
