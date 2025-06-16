import React, { useEffect, useState } from "react";
import { Card, Col, DatePicker, Row, Statistic, Table } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { GaugeChart } from "echarts/charts";
import { TitleComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { ReactEcharts } from "@/components/react-echarts";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchIncomeStatisticsHistory } from "@/pages/profit-detail/api.tsx";

const { RangePicker } = DatePicker;
echarts.use([TitleComponent, GaugeChart, CanvasRenderer]);

export default function ProfitDetailPage() {
  useAuthRedirect();

  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const [statisticsHistory, setStatisticsHistory] = useState<any>(null); // 状态数据

  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  const [error, setError] = useState<string | null>(null); // 错误信息

  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>(
    (() => {
      const yesterday = dayjs().subtract(1, "day").startOf("day"); // 昨天的开始时间
      const today = dayjs().startOf("day"); // 今天的开始时间
      return [yesterday, today];
    })(),
  );

  const fetchData = async (poolType: string) => {
    try {
      const start = dateRange[0]
        ? dateRange[0].format("YYYY-MM-DD")
        : dayjs().subtract(1, "day").format("YYYY-MM-DD");
      const end = dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
      const hashCompletionRateResult = await fetchIncomeStatisticsHistory(poolType, start, end);

      // // 排序数据，确保最新的日期在前面
      // const sortedData = hashCompletionRateResult.data?.sort(
      //   (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      // );
      setStatisticsHistory(hashCompletionRateResult.data); // 假设返回数据在 result.data 中

      console.log(hashCompletionRateResult.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(poolType);
  }, [poolType, dateRange]);

  const columns = [
    {
      title: "矿池名称",
      dataIndex: "pool_name",
      key: "pool_name",
    },
    {
      title: "收入 (BTC)",
      dataIndex: "income_btc",
      key: "income_btc",
      render: (text: number) => text.toFixed(8), // 格式化数字
    },
    {
      title: "收入 (USD)",
      dataIndex: "income_usd",
      key: "income_usd",
      render: (text: number) => text.toFixed(2), // 格式化数字
    },
    {
      title: "托管费用",
      dataIndex: "hosting_fee",
      key: "hosting_fee",
      render: (text: number) => text.toFixed(2), // 格式化数字
    },
    {
      title: "托管比例",
      dataIndex: "hosting_ratio",
      key: "hosting_ratio",
      render: (text: number) => text.toFixed(2), // 格式化数字
    },
  ];

  const onDateChange = (dates: Dayjs[]) => {
    if (dates && dates[0] && dates[1]) {
      const startDate = dates[0];
      const endDate = dates[1];
      setDateRange([startDate, endDate]);
    } else {
      setDateRange([null, null]);
    }
  };

  // const gaugeChartOptions = {
  //   title: {
  //     text: "总托管比例",
  //     left: "center",
  //     top: "10%",
  //     textStyle: {
  //       fontSize: 12,
  //     },
  //   },
  //   series: [
  //     {
  //       type: "gauge",
  //       progress: {
  //         show: true,
  //         width: 12,
  //       },
  //       axisLine: {
  //         lineStyle: {
  //           width: 12,
  //           color: [
  //             [0.2, "#67e0e3"], // 绿色部分
  //             [0.95, "#ffdb5c"], // 黄色部分
  //             [1, "#ff5c5c"], // 红色部分
  //           ],
  //         },
  //       },
  //       axisTick: {
  //         show: true,
  //         splitNumber: 5,
  //         lineStyle: {
  //           color: "#999",
  //           width: 2,
  //         },
  //       },
  //       splitLine: {
  //         show: true,
  //         length: 15,
  //         lineStyle: {
  //           color: "#999",
  //           width: 3,
  //         },
  //       },
  //       axisLabel: {
  //         distance: 25,
  //         color: "#333",
  //         fontSize: 20,
  //       },
  //       anchor: {
  //         show: true,
  //         showAbove: true,
  //         size: 25,
  //         itemStyle: {
  //           borderWidth: 10,
  //         },
  //       },
  //       title: {
  //         show: false,
  //       },
  //       detail: {
  //         valueAnimation: true,
  //         fontSize: 40,
  //         offsetCenter: [0, "70%"],
  //         formatter: "{value}",
  //       },
  //       data: [
  //         {
  //           value: statisticsHistory?.total_hosting_ratio || 50, // 使用统计值或默认值
  //         },
  //       ],
  //     },
  //   ],
  // };

  const gaugeChartOptions = {
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "75%"],
        radius: "90%",
        min: 0,
        max: 1,
        splitNumber: 8,
        axisLine: {
          lineStyle: {
            width: 6,
            color: [
              [0.5, "#58D9F9"], //#FF6E76
              [0.9, "#FDDD60"],
              [1, "#FF6E76"],
            ],
          },
        },
        pointer: {
          icon: "path://M12.8,0.7l12,40.1H0.7L12.8,0.7z",
          length: "12%",
          width: 6,
          offsetCenter: [0, "-60%"],
          itemStyle: {
            color: "auto",
          },
        },
        axisTick: {
          length: 10,
          lineStyle: {
            color: "auto",
            width: 1,
          },
        },
        splitLine: {
          length: 12,
          lineStyle: {
            color: "auto",
            width: 2,
          },
        },
        axisLabel: {
          color: "#464646",
          fontSize: 20,
          distance: -60,
          rotate: "tangential",
          formatter: function (value) {
            return "";
          },
        },
        title: {
          offsetCenter: [0, "-10%"],
          fontSize: 20,
        },
        detail: {
          fontSize: 30,
          offsetCenter: [0, "-35%"],
          valueAnimation: true,
          formatter: function (value) {
            return Math.round(value) + "";
          },
          color: "inherit",
        },
        data: [
          {
            value: statisticsHistory?.total_hosting_ratio || 50,
            // name: "Grade Rating",
          },
        ],
      },
    ],
  };

  return (
    <div>
      <RangePicker
        value={dateRange}
        onChange={onDateChange}
        style={{ width: "280px", fontSize: "12px" }} // 可以调整宽度
      />
      <div style={{ marginBottom: "20px" }}>
        <Card title="统计数据" bordered={false}>
          <Row gutter={16}>
            <Col span={8}>
              <h2 style={{ color: "#1890ff" }}>
                总收入 (BTC): {statisticsHistory?.total_income_btc.toFixed(8)} BTC
              </h2>
            </Col>
            <Col span={8}>
              <h2 style={{ color: "#1890ff" }}>
                总收入 (USD): ${statisticsHistory?.total_income_usd.toFixed(2)}
              </h2>
            </Col>
            <Col span={8}>
              <h2 style={{ color: "#1890ff" }}>
                总托管费用: ${statisticsHistory?.total_hosting_fee.toFixed(2)}
              </h2>
            </Col>
          </Row>
        </Card>
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <ReactEcharts option={gaugeChartOptions} style={{ height: "250px", width: "100%" }} />
        </div>
      </div>
      <Table
        dataSource={statisticsHistory?.data}
        columns={columns}
        rowKey="pool_name" // 使用矿池名称作为唯一标识
        style={{ marginTop: "20px" }}
      />
    </div>
  );
}
