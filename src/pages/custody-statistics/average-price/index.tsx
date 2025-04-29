import { useEffect, useState } from "react";
import { Alert, Input, message, Space, Spin, Select } from "antd";
import EditTable from "@/components/edit-table";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";

import { useCustodyStatisticsList, useDailyAveragePriceList } from "@/pages/custody-statistics/hook/hook.ts";

// 初始化时从 localStorage 获取值
const getInitialTimeRange = () => {
  const stored = localStorage.getItem("timeRange");
  return stored ? stored : "all"; // 默认为 'all'
};

export default function StatisticsPage() {
  useAuthRedirect();

  const { data: dailyAveragePrice, error, isLoading } = useDailyAveragePriceList();

  // const { data: linksData, error, isLoading: isLoadingFields } = useCustodyInfoList();
  const [columns, setColumns] = useState<any>([]);
  const [tableData, setTableData] = useState<any>([]);

  useEffect(() => {
    if (dailyAveragePrice && dailyAveragePrice.data) {
      const newData = dailyAveragePrice.data.map(
        (
          item: {
            date: any;
            utc_avg_price: any;
          },
          index: any,
        ) => ({
          key: index + 1, // 使用 ID 作为唯一 key
          serialNumber: index + 1,
          date: item.date,
          utc_avg_price: item.utc_avg_price,
        }),
      );
      setTableData(newData); // 设置表格数据源
    }
  }, [dailyAveragePrice]);

  // 表头定义
  useEffect(() => {
    setColumns([
      {
        title: "序号", // 使用英文标题
        dataIndex: "serialNumber",
        key: "serialNumber",
        width: 100, // 设置序号列的宽度
      },
      {
        title: "日期",
        dataIndex: "date",
        key: "date",
      },
      {
        title: "日平均价格",
        dataIndex: "utc_avg_price",
        key: "utc_avg_price",
        render: (text: any) => (
          <span>
            {text} <span style={{ fontSize: "em", color: "#888" }}> USD</span>
          </span>
        ), // 渲染单位
      },

      // {
      //   title: "操作",
      //   valueType: "option",
      //   key: "operation",
      // },
    ]);
  }, []);

  // Loading 状态
  if (isLoading) {
    return <Spin tip="加载中..." />;
  }

  // 错误状态
  if (error) {
    return <Alert message="错误" description={error.message} type="error" showIcon />;
  }

  // @ts-ignore
  return (
    <div style={{ padding: "20px" }}>

      {isLoading ? (
        <Spin style={{ marginTop: 20 }} />
      ) : (
        <EditTable
          tableData={tableData}
          setTableData={setTableData}
          columns={columns}
          handleDelete={() => {}}
          handleSave={() => {}}
        />
      )}
    </div>
  );
}
