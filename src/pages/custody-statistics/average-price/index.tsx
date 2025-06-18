import { useEffect, useState } from "react";
import { Line } from "@ant-design/plots";
import { Alert, Spin } from "antd";
import EditTable from "@/components/edit-table";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";

import { useDailyAveragePriceList } from "@/pages/custody-statistics/hook/hook.ts";

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
  const data = [...tableData].reverse().map(({ date, utc_avg_price }) => ({
    date: date,
    value: Number(utc_avg_price),
  }));

  // 配置折线图
  const lineConfig = {
    data: data, // 翻转 tableData,
    xField: "date",
    yField: "value",
    axis: {
      y: {
        // 这部分是轴标题的配置
        title: "日平均价格 (USD)", // 修改为更合适的 y 轴标题
        titleSpacing: 30,
        titleFill: "steelblue",
        scale: {
          reverse: true, // 确保 y 轴从小到大
        },
      },
      // 配置 x 轴
      x: {
        // 这部分是轴标题的配置
        title: "日期", // 设置 x 轴标题
        // tickInterval: 10, // 每隔 10 天显示一个刻度
        // tickCount: 6, // 如果需要控制显示的刻度数量，可以调整这个属性
      },
    },

    title: "比特币价格曲线",
    description: "以 USD 计的比特币日均价格",
  };

  // @ts-ignore
  return (
    <div style={{ padding: "20px", display: "flex", gap: "100px" }}>
      <div style={{ flex: "1 1 50%", minWidth: "300px" }}>
        <Line {...lineConfig} />
      </div>

      <div style={{ flex: "1 1 50%", minWidth: "300px" }}>
        {isLoading ? (
          <Spin style={{ marginTop: 20 }} />
        ) : (
          <EditTable
            tableData={tableData}
            setTableData={setTableData}
            columns={columns}
            // @ts-ignore
            handleDelete={() => {}}
            // @ts-ignore
            handleSave={() => {}}
          />
        )}
      </div>
    </div>
  );
}
