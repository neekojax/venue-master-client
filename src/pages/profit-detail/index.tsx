import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Col, DatePicker, Row, Statistic, Table } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { BarChart, GaugeChart } from "echarts/charts";
import { DataZoomComponent, TitleComponent } from "echarts/components";
import * as echarts from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { ReactEcharts } from "@/components/react-echarts";
import { ROUTE_PATHS } from "@/constants/common.ts";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchIncomeStatisticsHistory } from "@/pages/profit-detail/api.tsx";

const { RangePicker } = DatePicker;
echarts.use([TitleComponent, GaugeChart, CanvasRenderer, BarChart, DataZoomComponent]);

export default function ProfitDetailPage() {
  useAuthRedirect();

  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const [statisticsHistory, setStatisticsHistory] = useState<any>(null); // 状态数据

  // const [setLoading] = useState<boolean>(true); // 加载状态
  // const [error, setError] = useState<string | null>(null); // 错误信息

  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>(
    (() => {
      const yesterday = dayjs().subtract(10, "day").startOf("day"); // 昨天的开始时间
      const today = dayjs().startOf("day"); // 今天的开始时间
      return [yesterday, today];
    })(),
  );

  const navigate = useNavigate();

  const handlePoolClick = (poolName: any) => {
    navigate(ROUTE_PATHS.poolProfitHistory(poolName));
  };

  const fetchData = async (poolType: string) => {
    try {
      const start = dateRange[0]
        ? dateRange[0].format("YYYY-MM-DD")
        : dayjs().subtract(1, "day").format("YYYY-MM-DD");
      const end = dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
      const hashCompletionRateResult = await fetchIncomeStatisticsHistory(poolType, start, end);

      setStatisticsHistory(hashCompletionRateResult.data); // 假设返回数据在 result.data 中
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      /* empty */
    }
    // finally {
    // setLoading(false);
    // }
  };

  useEffect(() => {
    fetchData(poolType);
  }, [poolType, dateRange]);

  const columns = [
    {
      title: "矿池名称",
      dataIndex: "pool_name",
      key: "pool_name",
      render: (
        text:
          | string
          | number
          | boolean
          | React.ReactElement<any, string | React.JSXElementConstructor<any>>
          | Iterable<React.ReactNode>
          | React.ReactPortal
          | null
          | undefined,
        record: { pool_name: any },
      ) => (
        <a
          onClick={() => handlePoolClick(record.pool_name)} // 点击事件
          style={{ color: "#252F4A", cursor: "pointer" }} // 视觉提示
        >
          {text}
        </a>
      ),
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
      render: (text: number) => text.toFixed(2) + " %", // 格式化数字
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

  const gaugeChartOptions = {
    grid: {
      top: "0%", // 调整为 0% 或更小的值
      right: "0%",
      bottom: "5%",
      left: "5%",
    },
    series: [
      {
        type: "gauge",
        startAngle: 180,
        endAngle: 0,
        center: ["50%", "75%"],
        radius: "100%",
        min: 0,
        max: 100,
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
          length: "25%",
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
          formatter: function () {
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
          formatter: function (value: number) {
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

  const today = new Date(); // 获取当前日期
  today.setHours(0, 0, 0, 0); // 将时间部分设置为00:00:00, 以便进行比较

  const totalData = statisticsHistory?.data2
    .filter((item: { date: string | number | Date }) => new Date(item.date).getTime() < today.getTime()) // 过滤掉日期大于等于今天的数据
    .sort(
      (a: { date: string | number | Date }, b: { date: string | number | Date }) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    ); // 按日期升序排序

  const formatNumberCN = (value: any) => {
    if (value >= 1e8) {
      return (value / 1e8).toFixed(2) + "亿";
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(2) + "百万";
    } else if (value >= 1e4) {
      return (value / 1e4).toFixed(2) + "万";
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(2) + "千";
    } else if (value >= 1e2) {
      return (value / 1e2).toFixed(2) + "百";
    } else {
      const retValue = value.toFixed(2);
      // return value.toFixed(2);
      if (Number(retValue) === parseInt(retValue)) {
        // value = parseInt(value);
        return parseInt(retValue);
      } else {
        return retValue;
      }
    }
  };
  const option = {
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        crossStyle: {
          color: "#464646",
          fontSize: 12,
        },
      },
    },
    grid: {
      top: "25%", // 调整为 0% 或更小的值
      right: "15%",
      bottom: "12%",
      left: "10%",
    },
    legend: {
      data: ["收入 (BTC)", "收入 (USD)", "托管费用"],
      top: "-3%",
      icon: "circle", // 图标形状：可选值有 'circle'、'rect'、'roundRect'、'triangle'、'diamond'、'pin'、'arrow' 或自定义路径
      textStyle: {
        fontSize: 12, // 字体大小
        color: "#464646", // 字体颜色
      },
      itemWidth: 8, // 图标宽度
      itemHeight: 8, // 图标高度
      itemGap: 10, // 图例之间的间距
    },
    // legend: {
    //   // Try 'horizontal'
    //   orient: 'vertical',
    //   right: 10,
    //   top: 'center'
    // },
    xAxis: {
      type: "category",
      axisLine: {
        show: false, // 🔴隐藏 x 轴上的折线（轴线）
      },
      axisLabel: {
        show: true, // 是否显示文字
        // 字体颜色
        // color: "#464646",
        color: "#99a1b7", // 字体颜色
        fontSize: 10,
        formatter: function (value: any) {
          // 只保留月-日
          return value.substr(5);
        },
      },
      data: totalData?.map((item: { date: any }) => item.date), // 使用过滤后的日期
    },
    yAxis: [
      {
        type: "value",
        name: "收入 (BTC)",
        position: "left",
        axisLabel: {
          formatter: "{value}",
          fontSize: 10,
          color: "#99a1b7", // 字体颜色
        },
      },
      {
        type: "value",
        name: "金额 (USD)",
        position: "right",
        splitLine: {
          show: false, // ✅ 关闭背景横线
        },
        axisLabel: {
          fontSize: 10,
          color: "#99a1b7", // 字体颜色
          formatter: function (value: number) {
            return formatNumberCN(value);
          },
          // formatter: "${value}",
        },
      },
    ],
    series: [
      {
        name: "收入 (BTC)",
        type: "line",
        symbol: "none",
        // type: "bar",
        // barWidth: 10,
        data: totalData?.map((item: { income_btc: any }) => item.income_btc), // 使用过滤后的收入数据
        itemStyle: {
          color: "#58D9F9",
        },
        yAxisIndex: 0,
        smooth: true, // 使用平滑曲线
      },
      {
        name: "收入 (USD)",
        type: "line",
        symbol: "none",
        // type: "bar",
        data: totalData?.map((item: { income_usd: any }) => item.income_usd), // 使用过滤后的收入数据
        itemStyle: {
          color: "#FDDD60",
        },
        yAxisIndex: 1,
        // barWidth: 10,
        smooth: true, // 使用平滑曲线
      },
      {
        name: "托管费用",
        type: "line",
        symbol: "none",
        // type: "bar",
        // barWidth: 10,
        data: totalData?.map((item: { hosting_fee: any }) => item.hosting_fee), // 使用过滤后的托管费用数据
        itemStyle: {
          color: "#FF6E76",
          barWidth: 2,
        },
        yAxisIndex: 1,
        smooth: true, // 使用平滑曲线
      },
    ],
  };

  return (
    <div>
      <RangePicker
        value={dateRange}
        // @ts-ignore
        onChange={onDateChange}
        style={{ width: "280px", fontSize: "12px" }} // 可以调整宽度
      />
      <div style={{ marginBottom: "20px", marginTop: "20px" }}>
        {/* <Card loading={loading} style={}> */}
        <Row gutter={24} style={{ display: "flex" }}>
          <Col span={8}>
            <Card title={"统计数据"}>
              <Row gutter={24} style={{ height: "200px" }}>
                <Col span={24} style={{ marginBottom: "20px" }}>
                  <Statistic
                    title="总收益BTC"
                    value={statisticsHistory?.total_income_btc}
                    valueStyle={{ fontSize: "16px", fontWeight: "bold" }}
                  />
                  {/*<h2 style={{ color: "black", fontSize: "16px", marginBottom: "12px" }}>*/}
                  {/*  总收入 (BTC): {statisticsHistory?.total_income_btc.toFixed(8)} BTC*/}
                  {/*</h2>*/}
                </Col>
                <Col span={24} style={{ marginBottom: "20px" }}>
                  <Statistic
                    title="总收益($)"
                    value={statisticsHistory?.total_income_usd}
                    valueStyle={{ fontSize: "16px", fontWeight: "bold" }}
                  />
                  {/*<h2 style={{ color: "black", fontSize: "16px", marginBottom: "12px" }}>*/}
                  {/*  总收入 (USD): ${statisticsHistory?.total_income_usd.toFixed(2)}*/}
                  {/*</h2>*/}
                </Col>
                <Col span={24} style={{ marginBottom: "20px" }}>
                  <Statistic
                    title="总托管费用($)"
                    value={statisticsHistory?.total_hosting_fee}
                    valueStyle={{ fontSize: "16px", fontWeight: "bold" }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
          <Col span={8}>
            <Card title={"托管费占比"}>
              <ReactEcharts option={gaugeChartOptions} style={{ height: "200px", width: "100%" }} />
            </Card>
          </Col>
          <Col span={8}>
            <Card title={"曲线图"}>
              <ReactEcharts option={option} style={{ height: "200px", width: "100%" }} />
            </Card>
          </Col>
        </Row>
        {/* </Card> */}
      </div>
      <Table
        dataSource={statisticsHistory?.data}
        columns={columns}
        rowKey="pool_name" // 使用矿池名称作为唯一标识
        style={{ marginTop: "20px" }}
        pagination={{
          position: ["bottomCenter"], // 将分页器位置设置为底部居中
          showSizeChanger: true, // 允许用户改变每页显示的条目数
          pageSizeOptions: ["10", "20", "30", "50"], // 每页显示条目的选项
          defaultPageSize: 10, // 默认每页显示的条目数
        }}
      />
    </div>
  );
}
