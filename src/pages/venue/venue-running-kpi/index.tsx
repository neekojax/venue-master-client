import React, { useEffect, useState } from "react";
import { WiDirectionUpRight } from "react-icons/wi";
import { SearchOutlined } from "@ant-design/icons";
import { Input, Spin, Table, Tooltip } from "antd";
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

  useEffect(() => {
    fetchData(poolType);
    setColumns([
      {
        title: "场地",
        dataIndex: "venueName",
        key: "venueName",
        render: (text: any) => (
          <Tooltip
            title={text}
            placement="top"
            overlayInnerStyle={{ color: "white" }}
            style={{ color: "white" }}
          >
            <div
              style={{
                width: "80px",
                overflow: "hidden",
                color: "#333",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {text}
            </div>
          </Tooltip>
        ),
      },
      {
        title: "子账户",
        dataIndex: "name",
        key: "name",
        render: (text: any) => (
          <Tooltip
            title={text}
            placement="top"
            overlayInnerStyle={{ color: "white" }}
            style={{ color: "white" }}
          >
            <div
              style={{
                width: "120px",
                overflow: "hidden",
                color: "#333",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                cursor: "pointer",
              }}
            >
              {text}
            </div>
          </Tooltip>
        ),
      },
      // {
      //   title: "算力(理论/24h)",
      //   dataIndex: "theoreticalHashRate",
      //   key: "theoreticalHashRate",
      //   width: "15%",
      //   render: (text: any, record: any) => (
      //     <span>
      //       {record.theoreticalHashRate}
      //       <span className="text-sm text-gray-400"> PH/s</span>
      //       {record.lastHash}
      //       {/* <Tag color="gold" style={{ padding: 0 }}>
      //         {record.theoreticalHashRate} PH/s
      //       </Tag>
      //       <Tag color="green" style={{ padding: 0 }}>
      //         {record.lastHash}
      //       </Tag> */}
      //     </span>
      //   // ),
      // {
      //   return `${record.theoreticalHashRate}TH/s${record.lastHash}`;
      // }

      // <span>
      //   <Tag color="gold">{record.theoreticalHashRate}</Tag>
      //   <Tag color="green">{record.lastHash}</Tag>
      // </span>
      // )
      // return `${text}TH/s`;
      // return `${record.theoreticalHashRate}TH/s ${record.lastHash}`;
      // },
      // },

      {
        title: "理论算力",
        dataIndex: "theoreticalHashRate",
        key: "theoreticalHashRate",
        render: (text: any, record: any) => (
          <span>
            <span style={{ fontSize: 12 }}>{record.theoreticalHashRate} PH/s </span>
          </span>
        ),
      },
      {
        title: "24h算力",
        dataIndex: "lastHash",
        key: "lastHash",
      },
      {
        title: "算力达成率(当前/昨日/上周)",
        dataIndex: "lastHash",
        key: "lastHash",
        width: "20%",
        render: (text: any, record: any) => (
          <span>
            <span style={{ fontSize: 12, fontWeight: "bolder" }}>{record.currentEffective} % </span>/{" "}
            <span style={{ fontSize: 12, fontWeight: "bolder" }}>{record.lastDayEffective} % </span>/{" "}
            <span style={{ fontSize: 12, fontWeight: "bolder" }}>{record.lastWeekHashEfficiency} %</span>
            {/* <Tag color="#f50">{record.currentEffective} %</Tag>
            <Tag color="#2db7f5">{record.lastDayEffective} %</Tag>
            {/* <Tag color="#87d068">#87d068</Tag> */}
            {/* <Tag color="#108ee9">{record.lastWeekHashEfficiency} %</Tag>  */}
            {/* <Tag color="gold">{record.currentEffective} %</Tag>
            <Tag color="lime">{record.lastDayEffective} %</Tag>
            <Tag color="green">{record.lastWeekHashEfficiency} %</Tag> */}
          </span>
        ),
        // {
        // return `${record.lastHash}TH/s`;
        // },
      },
      // {
      //   title: "当前算力达成率",
      //   dataIndex: "currentEffective",
      //   key: "currentEffective",
      //   render: (text) => `${text}%`, // 在这里加上单位 "%"
      // },
      // {
      //   title: "昨日算力达成率",
      //   dataIndex: "lastDayEffective",
      //   key: "lastDayEffective",
      //   render: (text) => `${text}%`, // 在这里加上单位 "%"
      // },
      // {
      //   title: "上周算力达成率",
      //   dataIndex: "lastWeekHashEfficiency",
      //   key: "lastWeekHashEfficiency",
      //   render: (text) => `${text}%`, // 在这里加上单位 "%"
      // },
      {
        title: "周算力达成率增幅",
        key: "weekDiff",
        // width: "10%",
        render: (_text: any, record: { last2WeekHashEfficiency: number; lastWeekHashEfficiency: number }) => {
          const increase = record.last2WeekHashEfficiency - record.lastWeekHashEfficiency; // 计算增幅
          const formattedIncrease = increase.toFixed(2); // 保留两位小数

          // 根据正负值设置颜色
          const color = increase > 0 ? "green" : "red";

          return <span style={{ color }}>{formattedIncrease}%</span>;
        },
        // width: 180,
      },
      {
        title: "故障率(昨日/周)",
        dataIndex: "lastDayFault",
        key: "lastDayEffective",
        render: () => {
          return `-`;
        },
      },

      // {
      //   title: "昨日故障率",
      //   dataIndex: "lastDayFault",
      //   key: "lastDayEffective",
      //   render: () => "-",
      // },
      // {
      //   title: "周故障率",
      //   dataIndex: "lastWeekFault",
      //   key: "lastWeekFault",
      //   render: () => "-",
      // },
      {
        title: "周故障率增幅",
        dataIndex: "lastWeekFaultDiff",
        key: "lastWeekFaultDiff",
        render: () => "-",
      },
      {
        title: "月达成率",
        dataIndex: "monthEfficiencys",
        key: "monthEfficiencys",
        width: 155,
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
                  bottom: "10%",
                  top: "10%",
                  containLabel: false,
                },
              }}
              style={{ height: "20px", width: "120px" }} // 设置图表的样式
            />
          );
        },
      },
      {
        title: "月故障率",
        dataIndex: "historyMonthFault",
        key: "historyMonthFault",
        // width: 10,
        render: () => "-",
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
        title: "导出",
        dataIndex: "export",
        key: "export",
        width: 50,
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

      <Table
        dataSource={filteredData}
        columns={columns}
        rowKey="name"
        scroll={{ x: true }}
        pagination={{
          position: ["bottomCenter"], // 将分页器位置设置为底部居中
          showSizeChanger: true, // 允许用户改变每页显示的条目数
          pageSizeOptions: ["20", "30", "50"], // 每页显示条目的选项
          defaultPageSize: 20, // 默认每页显示的条目数
        }}
      />
    </div>
  );
}
