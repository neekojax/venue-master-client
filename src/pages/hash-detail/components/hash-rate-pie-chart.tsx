import { useEffect, useState } from "react";
import { Card } from "antd";
import { ReactEcharts } from "@/components/react-echarts";
import { useSelector, useSettingsStore } from "@/stores";

import { fetchRealTimeHashRateDetail } from "@/pages/hash-detail/api.tsx";

export default function HashRatePieChart() {
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const [hashRate, setHashRate] = useState<any>(null); // 状态数据

  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  // const [error, setError] = useState<string | null>(null); // 错误信息

  const fetchData = async (poolType: string) => {
    try {
      const realTimeHashResult = await fetchRealTimeHashRateDetail(poolType);
      setHashRate(realTimeHashResult.data); // 假设返回数据在 result.data 中
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

  // 获取 ECharts 配置
  const getOption = () => {
    return {
      title: {
        text: "实时总算力详情",
        left: "center",
        top: "5%",
        textStyle: {
          fontSize: 20,
          fontWeight: "bold",
          color: "black",
        },
      },
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} PH/s ({d}%)", // 显示单位
        textStyle: {
          // color: "#ffffff", // 字体颜色
          fontSize: 14, // 字体大小
        },
      },
      legend: {
        orient: "vertical",
        left: "left",
        top: "top",
        textStyle: {
          fontSize: 12,
        },
        type: "scroll", // 使图例可滚动
        padding: 10,
        itemGap: 10,
      },
      series: [
        {
          name: "实时算力",
          type: "pie",
          radius: "50%",
          data: hashRate
            ? hashRate.map(
                ({ pool_name, current_hash_rate }: { pool_name: string; current_hash_rate: number }) => ({
                  value: current_hash_rate, // 保持为数值类型
                  name: pool_name, // 只保留池名
                }),
              )
            : [],
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };
  };

  return (
    <Card
      // title="图表标题" // 设置您的卡片标题
      bordered={false}
      style={{ width: "100%" }} // 设置卡片宽度
      loading={loading}
    >
      <div>
        <ReactEcharts option={getOption()} style={{ height: 400 }} />
      </div>
    </Card>
  );
}
