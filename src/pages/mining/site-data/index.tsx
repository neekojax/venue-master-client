import React, { useEffect, useState } from "react";
import { WiDirectionUpRight } from "react-icons/wi";
import { Input, Spin, Table } from "antd";
import { ReactEcharts } from "@/components/react-echarts"; // 导入自定义的 ReactEcharts 组件
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";
import { exportHashRateToExcel } from "@/utils/excel";

import { fetchMiningPoolRunningData } from "@/pages/mining/api.tsx";

export default function MiningHashRatePage() {
  useAuthRedirect();
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const [runningData, setRunningData] = useState<any>(null); // 状态数据
  const [columns, setColumns] = useState<any>([]);
  const [searchTerm, setSearchTerm] = useState(""); // 新增搜索状态
  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  const [error] = useState<string | null>(null); // 错误信息

  const fetchData = async (poolType: string) => {
    try {
      const runningDataResult = await fetchMiningPoolRunningData(poolType);
      setRunningData(runningDataResult.data); // 假设返回数据在 result.data 中
      console.log(runningDataResult.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // 处理错误
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(poolType);
    setColumns([
      {
        title: "矿池名称",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "理论算力",
        dataIndex: "theoreticalHashRate",
        key: "theoreticalHashRate",
      },
      {
        title: "24小时算力",
        dataIndex: "lastHash",
        key: "lastHash",
      },
      {
        title: "当前算力达成率",
        dataIndex: "currentEffective",
        key: "currentEffective",
      },
      {
        title: "昨日算力达成率",
        dataIndex: "lastDayEffective",
        key: "lastDayEffective",
      },
      {
        title: "上周算力达成率",
        dataIndex: "lastWeekHashEfficiency",
        key: "lastWeekHashEfficiency",
      },
      {
        title: "周算力达成率增幅",
        key: "weekDiff",
        render: (_text: any, record: { last2WeekHashEfficiency: number; lastWeekHashEfficiency: number }) => {
          const increase = record.last2WeekHashEfficiency - record.lastWeekHashEfficiency; // 计算增幅
          const formattedIncrease = increase.toFixed(2); // 保留两位小数

          // 根据正负值设置颜色
          const color = increase > 0 ? "green" : "red";

          return <span style={{ color }}>{formattedIncrease}%</span>;
        },
        width: 180,
      },
      {
        title: "昨日故障率",
        dataIndex: "lastDayFault",
        key: "lastDayEffective",
      },
      {
        title: "周故障率",
        dataIndex: "lastWeekFault",
        key: "lastWeekFault",
      },
      {
        title: "周故障率增幅",
        dataIndex: "lastWeekFaultDiff",
        key: "lastWeekFaultDiff",
      },
      {
        title: "历史月度达成率",
        dataIndex: "monthEfficiencys",
        key: "monthEfficiencys",
        render: (_text: any, record: { monthEfficiencys: any[] }) => {
          // 检查 monthEfficiencys 是否存在且是数组
          if (!Array.isArray(record.monthEfficiencys) || record.monthEfficiencys.length === 0) {
            return <div>数据不足</div>; // 如果没有数据，返回提示
          }

          // 提取效率数据
          const efficiencies = record.monthEfficiencys.map((item: { efficiency: any }) => item.efficiency);

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
                  data: record.monthEfficiencys?.map((item) => item.time), // 提取时间数据
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
                  bottom: "0%",
                  top: "0%",
                  containLabel: false,
                },
              }}
              style={{ height: "50px", width: "100%" }} // 设置图表的样式
            />
          );
        },
      },
      {
        title: "历史月度故障率",
        dataIndex: "historyMonthFault",
        key: "historyMonthFault",
      },
      {
        title: "观察者链接",
        dataIndex: "link",
        key: "link",
        render: (_text: any, record: string) => {
          const link = record.link; // 假设 link 字段包含链接地址
          return (
            // @ts-ignore
            <a href={link} target="_blank" rel="noopener noreferrer">
              <WiDirectionUpRight style={{ fontSize: "30px", color: "#1890ff" }} />
            </a>
          );
        },
      },
      {
        title: "一键导出",
        dataIndex: "export",
        key: "export",
        width: 100,
        render: () => {
          return (
            <button
              style={{
                // backgroundColor: '#4CAF50', // 绿色背景
                color: "blue", // 白色字体
                border: "none",
                padding: "10px 15px",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => {
                // 添加导出功能的逻辑，比如调用API或下载文件
                console.log("导出数据...");
              }}
            >
              导出
            </button>
          );
        },
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

  const onDownload = () => {
    exportHashRateToExcel(filteredData);
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <Input
            placeholder="请输入搜索字段"
            value={searchTerm}
            onChange={handleSearch}
            style={{ width: 250 }} // 设定宽度
            className="text-sm mr-10"
          />
        </div>
      </div>

      <Table dataSource={filteredData} columns={columns} rowKey="name" pagination={false} />
    </div>
  );
}
