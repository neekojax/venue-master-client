import { useEffect, useState } from "react";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Card, Pagination, Table } from "antd";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchAllHashCompletionRate } from "@/pages/hash-detail/api.tsx";

export default function HashCompletionRateHistoryTable() {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const [hashRate, setHashRate] = useState<any>(null); // 状态数据

  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  // const [error, setError] = useState<string | null>(null); // 错误信息

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = async (poolType: string) => {
    try {
      const hashCompletionRateResult = await fetchAllHashCompletionRate(poolType);

      // 排序数据，确保最新的日期在前面
      const sortedData = hashCompletionRateResult.data.sort(
        // @ts-ignore
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      setHashRate(sortedData); // 假设返回数据在 result.data 中
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

  const columns = [
    {
      title: "日期",
      dataIndex: "date",
      key: "date",
      sorter: (a: { date: string | number | Date }, b: { date: string | number | Date }) =>
        // @ts-ignore
        new Date(b.date).getTime() - new Date(a.date).getTime(), // 排序函数，最新的日期在前
    },
    {
      title: "算力达成率",
      dataIndex: "hash_completion_rate",
      key: "hash_completion_rate",
      render: (text: number) => <span>{text.toFixed(2)}%</span>, // 保留两位小数
    },
  ];

  // 计算当前页的数据
  const paginatedData = hashRate?.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Card
      title={
        <span>
          <CheckCircleOutlined style={{ marginRight: 8 }} /> {/* 添加图标 */}
          历史达成率
        </span>
      }
      loading={loading}
      bordered={false}
    >
      <Table
        dataSource={paginatedData}
        columns={columns}
        rowKey="date"
        pagination={false} // 如果不需要分页，可以设置为 false
        showHeader={false} // 隐藏表头
      />
      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={hashRate?.length} // 总数据量
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
