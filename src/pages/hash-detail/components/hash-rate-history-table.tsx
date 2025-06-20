import React, { useEffect, useState } from "react";
import { JSX } from "react/jsx-runtime";
import { useNavigate } from "react-router-dom";
import { LineChartOutlined } from "@ant-design/icons";
import { Card, DatePicker, Table } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { ROUTE_PATHS } from "@/constants/common.ts";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchHashRateHistory } from "@/pages/hash-detail/api.tsx";

const { RangePicker } = DatePicker;

export default function HashRateHistoryTable() {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const [hashRateHistory, setHashRateHistory] = useState<any>(null); // 状态数据

  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  // const [error, setError] = useState<string | null>(null); // 错误信息

  // 从 localStorage 中读取 dateRange，若不存在则初始化为 [null, null]
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>(
    (() => {
      const yesterday = dayjs().subtract(1, "day").startOf("day"); // 昨天的开始时间
      const today = dayjs().startOf("day"); // 今天的开始时间
      return [yesterday, today];
    })(),
  );

  const navigate = useNavigate();

  const handlePoolClick = (poolName: any) => {
    navigate(ROUTE_PATHS.poolHashHistory(poolName));
  };

  const fetchData = async (poolType: string) => {
    try {
      setHashRateHistory(null); // 清空历史数据
      const start = dateRange[0]
        ? dateRange[0].format("YYYY-MM-DD")
        : dayjs().subtract(1, "day").format("YYYY-MM-DD");
      const end = dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
      const hashCompletionRateResult = await fetchHashRateHistory(poolType, start, end);

      // 排序数据，确保最新的日期在前面
      const sortedData = hashCompletionRateResult.data?.sort(
        (a: { date: string | number | Date }, b: { date: string | number | Date }) =>
          new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setHashRateHistory(sortedData); // 假设返回数据在 result.data 中

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      /* empty */
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
      width: "300px",
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
          style={{ color: "blue", cursor: "pointer" }} // 视觉提示
        >
          {text}
        </a>
      ),
    },
    {
      title: "算力",
      dataIndex: "hash_rate",
      key: "hash_rate",
      render: (text: any) => {
        return (
          <span>
            {text} <span style={{ color: "#888" }}>PH/s</span>
          </span>
        );
      },
    },
    {
      title: "理论算力",
      dataIndex: "settlement_theoretical_hash",
      key: "settlement_theoretical_hash",

      render: (text: any) => {
        return (
          <span>
            {text} <span style={{ color: "#888" }}>PH/s</span>
          </span>
        );
      },
    },
    {
      title: "算力达成率",
      dataIndex: "hash_completion_rate",
      key: "hash_completion_rate",
      render: (text: string) => <span>{parseFloat(text).toFixed(2)}%</span>, // 将字符串转为数字并保留两位小数
      sorter: (a: { hash_completion_rate: string }, b: { hash_completion_rate: string }) =>
        parseFloat(a.hash_completion_rate) - parseFloat(b.hash_completion_rate), // 根据达成率排序
    },
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
      sorter: (a: { date: string | number | Date }, b: { date: string | number | Date }) =>
        new Date(b.date).getTime() - new Date(a.date).getTime(), // 排序函数，最新的日期在前
    },
  ];

  // 计算当前页的数据
  // const paginatedData = hashRateHistory?.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const onDateChange = (dates: Dayjs[]) => {
    if (dates && dates[0] && dates[1]) {
      const startDate = dates[0];
      const endDate = dates[1];
      setDateRange([startDate, endDate]);
    } else {
      setDateRange([null, null]);
      setHashRateHistory(null); // 清空历史数据
    }
  };

  return (
    <Card
      title={
        <span>
          <LineChartOutlined style={{ marginRight: 8 }} /> {/* 添加图标 */}
          历史算力
        </span>
      }
      bordered={false}
      extra={
        <RangePicker
          value={dateRange}
          // @ts-ignore
          onChange={onDateChange}
          style={{ width: "280px", fontSize: "12px" }} // 可以调整宽度
        />
      }
      loading={loading}
      style={{ width: "100%" }}
    >
      <Table
        dataSource={hashRateHistory}
        // @ts-ignore
        columns={columns}
        rowKey="date"
        pagination={{
          position: ["bottomCenter"], // 将分页器位置设置为底部居中
          showSizeChanger: true, // 允许用户改变每页显示的条目数
          pageSizeOptions: ["10", "20", "50"], // 每页显示条目的选项
          defaultPageSize: 10, // 默认每页显示的条目数
        }}
        // sticky
        components={{
          header: {
            cell: (
              props: JSX.IntrinsicAttributes &
                React.ClassAttributes<HTMLTableHeaderCellElement> &
                React.ThHTMLAttributes<HTMLTableHeaderCellElement>,
            ) => (
              <th
                {...props}
                style={{ color: "#888", fontSize: "12px", lineHeight: "10px", height: "10px" }}
              /> // 设置表头高度
            ),
          },
        }}
        scroll={{ x: "max-content" }} // 如果需要横向滚动
      />
    </Card>
  );
}
