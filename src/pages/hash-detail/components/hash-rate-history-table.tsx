import React, { useEffect, useState } from "react";
import { Card, DatePicker, Pagination, Table } from "antd";
import dayjs, { Dayjs } from "dayjs";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchHashRateHistory } from "@/pages/hash-detail/api.tsx";
import { LineChartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/constants/common.ts";

const { RangePicker } = DatePicker;

export default function HashRateHistoryTable() {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const [hashRateHistory, setHashRateHistory] = useState<any>(null); // 状态数据

  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  const [error, setError] = useState<string | null>(null); // 错误信息

  // 从 localStorage 中读取 dateRange，若不存在则初始化为 [null, null]
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null]>(
    (() => {
      const yesterday = dayjs().subtract(1, "day").startOf("day"); // 昨天的开始时间
      const today = dayjs().startOf("day"); // 今天的开始时间
      return [yesterday, today];
    })(),
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const navigate = useNavigate();

  const handlePoolClick = (poolName: any) => {
    navigate(ROUTE_PATHS.poolHashHistory(poolName));
  };

  const fetchData = async (poolType: string) => {
    try {
      const start = dateRange[0]
        ? dateRange[0].format("YYYY-MM-DD")
        : dayjs().subtract(1, "day").format("YYYY-MM-DD");
      const end = dateRange[1] ? dateRange[1].format("YYYY-MM-DD") : dayjs().format("YYYY-MM-DD");
      const hashCompletionRateResult = await fetchHashRateHistory(poolType, start, end);

      // 排序数据，确保最新的日期在前面
      const sortedData = hashCompletionRateResult.data?.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setHashRateHistory(sortedData); // 假设返回数据在 result.data 中

      console.log(sortedData);
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
      width: "300px",
      render: (text, record) => (
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
      render: (text) => <span>{parseFloat(text).toFixed(2)}%</span>, // 将字符串转为数字并保留两位小数
      sorter: (a, b) => parseFloat(a.hash_completion_rate) - parseFloat(b.hash_completion_rate), // 根据达成率排序
    },
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
      sorter: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(), // 排序函数，最新的日期在前
    },
  ];

  // 计算当前页的数据
  const paginatedData = hashRateHistory?.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const onDateChange = (dates: Dayjs[]) => {
    if (dates && dates[0] && dates[1]) {
      const startDate = dates[0];
      const endDate = dates[1];
      setDateRange([startDate, endDate]);
    } else {
      setDateRange([null, null]);
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
          onChange={onDateChange}
          style={{ width: "280px", fontSize: "12px" }} // 可以调整宽度
        />
      }
      loading={loading}
      style={{ width: "100%" }}
    >
      <Table
        dataSource={paginatedData}
        columns={columns}
        rowKey="date"
        pagination={false} // 如果不需要分页，可以设置为 false
        // sticky
        components={{
          header: {
            cell: (props) => (
              <th {...props} style={{ color: "#888", fontSize: "12px", lineHeight: "10px", height: "10px" }} /> // 设置表头高度
            ),
          },
        }}
        scroll={{ x: "max-content" }} // 如果需要横向滚动
      />
      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={hashRateHistory?.length} // 总数据量
          onChange={(page, pageSize) => {
            setCurrentPage(page);
            setPageSize(pageSize); // 更新每页大小
          }}
          showSizeChanger
          pageSizeOptions={[10, 20, 50]} // 提供的选项
        />
      </div>
    </Card>
  );
}
