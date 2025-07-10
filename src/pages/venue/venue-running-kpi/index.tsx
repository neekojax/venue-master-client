import React, { useEffect, useState } from "react";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Spin, Table } from "antd";
import { ReactEcharts } from "@/components/react-echarts"; // 导入自定义的 ReactEcharts 组件
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchMiningPoolRunningData } from "@/pages/venue/api.tsx";

export default function VenueRunningKpi() {
  useAuthRedirect();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const [runningData, setRunningData] = useState<any>(null); // 状态数据
  const [columns, setColumns] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 新增搜索状态
  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  // const [error] = useState<string | null>(null); // 错误信息

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchData = async (poolType: string) => {
    try {
      const runningDataResult = await fetchMiningPoolRunningData(poolType);
      setRunningData(runningDataResult.data); // 假设返回数据在 result.data 中
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // 处理错误
    } finally {
      setLoading(false);
    }
  };

  const renderEfficiencyChart = (monthEfficiencys: any[]) => {
    // 检查 monthEfficiencys 是否存在且是数组
    if (!Array.isArray(monthEfficiencys) || monthEfficiencys.length === 0) {
      return <div>数据不足</div>; // 如果没有数据，返回提示
    }

    // 提取效率数据
    const efficiencies = monthEfficiencys.map((item) => item.efficiency);

    // 检查 efficiencies 的长度，确保有至少两个数据点
    if (efficiencies.length < 2) {
      return <div>数据不足</div>; // 如果数据少于两个，返回提示
    }

    const minEfficiency = Math.min(...efficiencies); // 获取最低值
    const lastEfficiency = efficiencies[efficiencies.length - 1]; // 获取最后一个数据
    const secondLastEfficiency = efficiencies[efficiencies.length - 2]; // 获取倒数第二个数据

    // 根据最后两个数据点的值设置颜色
    const lineColor = lastEfficiency > secondLastEfficiency ? "#4CAF50" : "#ff4d4f"; // 绿色或红色

    return (
      <ReactEcharts
        option={{
          tooltip: {
            trigger: "axis",
          },
          xAxis: {
            type: "category",
            data: monthEfficiencys.map((item) => item.time), // 提取时间数据
            show: false, // 隐藏 X 轴
          },
          yAxis: {
            type: "value",
            min: minEfficiency, // 设置最小值为数据中的最低点
            show: false, // 隐藏 Y 轴
          },
          series: [
            {
              name: "效率",
              type: "line",
              data: efficiencies, // 提取效率数据
              smooth: true,
              lineStyle: {
                color: lineColor, // 动态设置曲线颜色
                width: 2, // 曲线宽度
              },
              symbol: "none", // 去掉圆点
            },
          ],
          grid: {
            left: "0%",
            right: "0%",
            bottom: "10%",
            top: "10%",
            containLabel: false,
          },
        }}
        style={{ height: "20px", width: "120px" }} // 设置图表的样式
      />
    );
  };

  useEffect(() => {
    fetchData(poolType);
    setColumns([
      {
        title: "场地",
        dataIndex: "venueName",
        fixed: "left",
        width: 180,
      },
      {
        title: "子账户",
        dataIndex: "name",
        width: 160,
      },
      {
        title: "理论算力 (PH/s)",
        dataIndex: "theoreticalHashRate",
        width: 120,
        sorter: (a: { theoreticalHashRate: number }, b: { theoreticalHashRate: number }) =>
          a.theoreticalHashRate - b.theoreticalHashRate,
      },
      {
        title: "24h算力",
        dataIndex: "lastHash",
        width: 120,
        render: (text: { split: (arg0: string) => [any, any] }) => {
          // 假设 text 的格式是 "数值 单位"，如 "100 TH"
          const [value, unit] = text.split(" "); // 分割文本为数值和单位

          return (
            <span>
              {value} <span style={{ color: "gray" }}>{unit}</span> {/* 单位用灰色渲染 */}
            </span>
          );
        },
      },
      {
        title: "当前达成率",
        dataIndex: "currentEffective",
        width: 120,
        render: (value: number) => (
          <span
            className={`${value >= 90 ? "text-green-600" : value >= 80 ? "text-yellow-600" : "text-red-600"}`}
          >
            {value.toFixed(2)}%
          </span>
        ),
        sorter: (a: { currentEffective: number }, b: { currentEffective: number }) =>
          a.currentEffective - b.currentEffective,
      },
      {
        title: "昨日算力达成率",
        dataIndex: "lastDayEffective",
        width: 140,
        render: (value: number) => (
          <span
            className={`${value >= 90 ? "text-green-600" : value >= 80 ? "text-yellow-600" : "text-red-600"}`}
          >
            {value.toFixed(2)}%
          </span>
        ),
        sorter: (a: { lastDayEffective: number }, b: { lastDayEffective: number }) =>
          a.lastDayEffective - b.lastDayEffective,
      },
      {
        title: "上周算力达成率",
        dataIndex: "lastWeekHashEfficiency",
        width: 140,
        render: (value: number) => (
          <span
            className={`${value >= 90 ? "text-green-600" : value >= 80 ? "text-yellow-600" : "text-red-600"}`}
          >
            {value.toFixed(2)}%
          </span>
        ),
        sorter: (a: { lastWeekHashEfficiency: number }, b: { lastWeekHashEfficiency: number }) =>
          a.lastWeekHashEfficiency - b.lastWeekHashEfficiency,
      },
      {
        title: "周算力达成率增幅",
        dataIndex: "weekGrowth",
        width: 160,
        render: (_text: any, record: { last2WeekHashEfficiency: number; lastWeekHashEfficiency: number }) => {
          const increase = record.last2WeekHashEfficiency - record.lastWeekHashEfficiency; // 计算增幅
          const formattedIncrease = increase.toFixed(2); // 保留两位小数

          // 根据正负值设置类名
          const colorClass = increase > 0 ? "text-green-600" : "text-red-600";

          return <span className={colorClass}>{formattedIncrease}%</span>; // 使用类名
        },
      },
      {
        title: "昨日故障率",
        dataIndex: "lastDayFault",
        width: 120,
        render: () => {
          return `-`;
        },
        // render: (value) => (
        //   <span
        //     className={`${value <= 5 ? "text-green-600" : value <= 8 ? "text-yellow-600" : "text-red-600"}`}
        //   >
        //   {value.toFixed(2)}%
        // </span>
        // ),
      },
      {
        title: "上周故障率",
        dataIndex: "lastWeekFault",
        width: 120,
        render: () => "-",
        // render: (value) => (
        //   <span
        //     className={`${value <= 5 ? "text-green-600" : value <= 8 ? "text-yellow-600" : "text-red-600"}`}
        //   >
        //   {value.toFixed(2)}%
        // </span>
        // ),
      },
      {
        title: "周故障率增幅",
        dataIndex: "lastWeekFaultDiff",
        width: 120,
        key: "lastWeekFaultDiff",
        render: () => "-",
      },
      {
        title: "月达成率曲线",
        dataIndex: "monthEfficiencys",
        width: 180,
        render: (_text: any, record: { monthEfficiencys: any[] }) =>
          renderEfficiencyChart(record.monthEfficiencys),
      },
      {
        title: "月故障率曲线",
        dataIndex: "historyMonthFault",
        width: 120,
        // render: (data) => renderMiniChart(data, "failure"),
        render: () => "-",
      },
      {
        title: "观察者链接",
        dataIndex: "observerLink",
        width: 100,
        render: (_text: any, record: string) => {
          const link = record.link; // 假设 link 字段包含链接地址
          return (
            <a
              // @ts-ignore
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800"
            >
              查看
            </a>
          );
        },
      },
      {
        title: "导出",
        key: "export",
        fixed: "right",
        width: 80,
        render: () => (
          <Button type="text" icon={<DownloadOutlined />} className="!rounded-button whitespace-nowrap" />
        ),
      },
    ]);
  }, [poolType]);

  // 搜索处理函数
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Loading 状态
  if (loading) {
    return <Spin tip="加载中..." />;
  }

  const filteredData =
    runningData?.filter((item: { [s: string]: unknown } | ArrayLike<unknown>) => {
      return Object.values(item).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }) || [];

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  return (
    <div style={{ padding: "20px" }} className="longdataTable">
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Input
            prefix={<SearchOutlined style={{ color: "rgba(0, 0, 0, 0.25)", fontSize: 18 }} />}
            placeholder="请输入搜索字段"
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: 250 }} // 设定宽度
            className="text-sm mr-10"
          />
        </div>
      </div>

      {/*<Table*/}
      {/*  dataSource={filteredData}*/}
      {/*  columns={columns}*/}
      {/*  rowKey="name"*/}
      {/*  scroll={{ x: true }}*/}
      {/*  pagination={{*/}
      {/*    position: ["bottomCenter"], // 将分页器位置设置为底部居中*/}
      {/*    showSizeChanger: true, // 允许用户改变每页显示的条目数*/}
      {/*    pageSizeOptions: ["20", "30", "50"], // 每页显示条目的选项*/}
      {/*    defaultPageSize: 20, // 默认每页显示的条目数*/}
      {/*  }}*/}
      {/*/>*/}

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredData}
        scroll={{ x: 1800, y: 600 }}
        sticky
        bordered
        className="custom-table"
        pagination={{
          position: ["bottomCenter"],
          showSizeChanger: true,
          pageSizeOptions: ["20", "30", "50"],
          defaultPageSize: 20,
          showTotal: (total) => `共 ${total} 条`,
          total: filteredData.length,
          onChange: () => {
            const tableBody = document.querySelector(".ant-table-body");
            if (tableBody) {
              tableBody.scrollTop = 0;
            }
          },
        }}
        onRow={() => ({
          onMouseEnter: () => {
            const tableBody = document.querySelector(".ant-table-body");
            if (tableBody) {
              const { scrollTop, scrollHeight, clientHeight } = tableBody;
              if (scrollHeight - scrollTop - clientHeight < 50) {
                // 触发加载更多的逻辑
                console.log("触发加载更多");
              }
            }
          },
        })}
      />
    </div>
  );
}
