import { useEffect, useState } from "react";
import { Card, Col, Radio, Row } from "antd";
import { ReactEcharts } from "@/components/react-echarts";

import { fetchLastestHashRate } from "@/pages/mining/api.tsx";

const MiningHashCard = () => {
  const [dataNs, setDataNs] = useState([]);
  const [dataCang, setDataCang] = useState([]);
  const [timeFrame, setTimeFrame] = useState("7");

  const fetchData = async (timeFrame: string) => {
    try {
      const nsResult = await fetchLastestHashRate("NS", timeFrame);
      const cangResult = await fetchLastestHashRate("CANG", timeFrame);

      const formattedNsData = nsResult.data?.map((item: { date: any; day_hash_rate: any }) => ({
        date: item.date,
        hash: item.day_hash_rate,
      }));

      const formattedCangData = cangResult.data?.map((item: { date: any; day_hash_rate: any }) => ({
        date: item.date,
        hash: item.day_hash_rate,
      }));

      const sortedNsData = formattedNsData.sort(
        (a: { date: string | number | Date }, b: { date: string | number | Date }) =>
          // @ts-ignore
          new Date(a.date) - new Date(b.date),
      );
      const sortedCangData = formattedCangData.sort(
        (a: { date: string | number | Date }, b: { date: string | number | Date }) =>
          // @ts-ignore
          new Date(a.date) - new Date(b.date),
      );

      setDataNs(sortedNsData);
      setDataCang(sortedCangData);

      console.log(sortedNsData);
    } catch (error) {
      console.error("Error fetching hash rate efficiency:", error);
    }
  };

  useEffect(() => {
    fetchData("7");
  }, []);

  const getOption = () => {
    // @ts-ignore
    const dates = dataNs.map((item) => item.date);
    // @ts-ignore
    const nsDayHashRate = dataNs.map((item) => item.hash);
    // @ts-ignore
    const cangDayHashRate = dataCang.map((item) => item.hash);

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
        min: 100,
        name: "PH/s",
        nameLocation: "end", // 单位位置
        nameTextStyle: {
          color: "#ccc  ", // 单位颜色
          fontSize: 14, // 单位字体大小
        },
      },
      series: [
        {
          name: "NS",
          type: "line",
          data: nsDayHashRate,
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
          data: cangDayHashRate,
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

  // @ts-ignore
  const handleTimeFrameChange = (e) => {
    const newTimeFrame = e.target.value;
    setTimeFrame(newTimeFrame); // 更新 timeFrame 状态
    fetchData(newTimeFrame); // 每次时间范围变化时获取新的数据
  };

  return (
    <Card bordered={false} className="card-wapper">
      <Row justify="space-between" align="middle">
        <Col>
          <h3 style={{ margin: 0 }}>日算力</h3>
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

export default MiningHashCard;
