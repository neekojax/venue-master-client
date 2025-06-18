import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchPoolProfitHistory } from "@/pages/pool-profit-history/api.tsx";
import { Card, Table } from "antd";
import { ReactEcharts } from "@/components/react-echarts";

export default function PoolProfitHistoryPage() {
  useAuthRedirect();

  const { poolName } = useParams(); // 获取 poolName 参数

  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const [history, setHistory] = useState<any>(null); // 状态数据

  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  const [error, setError] = useState<string | null>(null); // 错误信息

  const fetchData = async (poolType: string) => {
    try {
      const historyResult = await fetchPoolProfitHistory(poolType, poolName);

      setHistory(historyResult.data); // 假设返回数据在 result.data 中
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(poolType);
  }, [poolType]);

  const sortedData = history?.data?.sort((a, b) => new Date(a.date) - new Date(b.date));

  // 定义 ECharts 配置
  const option = {
    // title: {
    //   text: "矿池收益图",
    // },
    tooltip: {
      trigger: "axis",
    },
    legend: {
      data: ["BTC 收益", "USD 收益"],
    },
    xAxis: {
      type: "category",
      data: sortedData?.map(item => item.date),
    },
    yAxis: [
      {
        type: "value",
        name: "BTC 收益",
        position: "left",
      },
      {
        type: "value",
        name: "USD 收益",
        position: "right",
      },
    ],
    series: [
      {
        name: "BTC 收益",
        type: "line",
        data: sortedData?.map(item => item.income_btc),
        yAxisIndex: 0,
        symbol: "none",
      },
      {
        name: "USD 收益",
        type: "line",
        data: sortedData?.map(item => item.income_usd),
        yAxisIndex: 1,
        symbol: "none",
      },
    ],
  };

  // Ant Design 表格列定义
  const columns = [
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "BTC 收益",
      dataIndex: "income_btc",
      key: "income_btc",
    },
    {
      title: "USD 收益",
      dataIndex: "income_usd",
      key: "income_usd",
    },
    {
      title: "托管费用",
      dataIndex: "hosting_fee",
      key: "hosting_fee",
    },
    {
      title: "托管比率",
      dataIndex: "hosting_ratio",
      key: "hosting_ratio",
    },
  ];

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>{history?.pool_name}</h1>
      <h2 style={{ fontSize: "20px", color: "#555" }}>历史总收益 (BTC): {history ? history.total_income_btc : 0}</h2>
      <Card title = "历史收益曲线" style={{ marginTop: "20px" }}>
        <ReactEcharts option={option} style={{ height: "400px", width: "100%", marginBottom: "20px" }} />
      </Card>

      <Card title="每日收益详情" style={{ marginTop: "20px" }}>
        <Table
          dataSource={sortedData?.slice().reverse()}
          columns={columns}
          rowKey="date"
          style={{ marginTop: "20px", borderRadius: "8px", overflow: "hidden" }}
          pagination={{
            position: ["bottomCenter"], // 将分页器位置设置为底部居中
            showSizeChanger: true, // 允许用户改变每页显示的条目数
            pageSizeOptions: ["20", "30", "50"], // 每页显示条目的选项
            defaultPageSize: 10, // 默认每页显示的条目数
          }}
        />
      </Card>
    </div>
  );
}
