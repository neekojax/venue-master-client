import { JSXElementConstructor, ReactElement, ReactNode, ReactPortal, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Table } from "antd";
import { ReactEcharts } from "@/components/react-echarts";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchHashRateHistoryByPoolName } from "@/pages/pool-hash-history/api.tsx";

export default function PoolHashHistoryPage() {
  useAuthRedirect();

  const { poolName } = useParams(); // 获取 poolName 参数

  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const [history, setHistory] = useState<any>(null); // 状态数据

  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  // const [error, setError] = useState<string | null>(null); // 错误信息

  const fetchData = async (poolType: string) => {
    try {
      const historyResult = await fetchHashRateHistoryByPoolName(poolType, poolName);

      setHistory(
        historyResult?.data?.sort(
          (a: { date: string | number | Date }, b: { date: string | number | Date }) =>
            // @ts-ignore
            new Date(a.date) - new Date(b.date),
        ),
      ); // 假设返回数据在 result.data 中
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(poolType);
  }, [poolType]);

  const getOption = () => {
    const dates = history?.map((item: { date: any }) => item.date);
    const hashRates = history?.map((item: { hash_rate: any }) => item.hash_rate);
    const theoreticalHashes = history?.map(
      (item: { settlement_theoretical_hash: any }) => item.settlement_theoretical_hash,
    );

    return {
      tooltip: {
        trigger: "axis",
      },
      legend: {
        data: ["结算算力", "理论算力"],
      },
      xAxis: {
        type: "category",
        data: dates,
        axisLabel: {
          rotate: 45, // Rotate X axis labels
        },
      },
      yAxis: {
        type: "value",
        name: "哈希（PH/s）",
        nameLocation: "end",
        nameGap: 20,
      },
      series: [
        {
          name: "结算算力",
          type: "line",
          data: hashRates,
          smooth: true,
          itemStyle: {
            color: "#ff5733", // Custom color
          },
          symbol: "none",
        },
        {
          name: "理论算力",
          type: "line",
          data: theoreticalHashes,
          smooth: true,
          itemStyle: {
            color: "#33c1ff", // Custom color
          },
          symbol: "none",
        },
      ],
    };
  };

  const columns = [
    {
      title: "结算日期",
      dataIndex: "date",
      key: "date",
    },
    {
      title: "结算算力",
      dataIndex: "hash_rate",
      key: "hash_rate",
      render: (
        text:
          | string
          | number
          | boolean
          | ReactElement<any, string | JSXElementConstructor<any>>
          | Iterable<ReactNode>
          | ReactPortal
          | null
          | undefined,
      ) => <span>{text} PH/s</span>, // Display unit
    },
    {
      title: "理论算力",
      dataIndex: "settlement_theoretical_hash",
      key: "settlement_theoretical_hash",
      render: (
        text:
          | string
          | number
          | boolean
          | ReactElement<any, string | JSXElementConstructor<any>>
          | Iterable<ReactNode>
          | ReactPortal
          | null
          | undefined,
      ) => <span>{text} PH/s</span>, // Display unit
    },
    {
      title: "算力达成率",
      dataIndex: "hash_completion_rate",
      key: "hash_completion_rate",
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
      <h1 style={{ fontSize: "24px", marginBottom: "10px" }}>{poolName}</h1>
      <div style={{ marginTop: "20px" }}>
        <Card title="历史算力曲线" loading={loading}>
          <ReactEcharts option={getOption()} style={{ height: "400px", width: "100%" }} />
        </Card>
        <Card title="历史算力数据" style={{ marginTop: "20px" }}>
          <Table
            dataSource={history?.slice().reverse()}
            columns={columns}
            rowKey="date" // Use date as the unique key for rows
            pagination={{
              position: ["bottomCenter"], // 将分页器位置设置为底部居中
              showSizeChanger: true, // 允许用户改变每页显示的条目数
              pageSizeOptions: ["20", "30", "50"], // 每页显示条目的选项
              defaultPageSize: 20, // 默认每页显示的条目数
            }}
          />
        </Card>
      </div>
    </div>
  );
}
