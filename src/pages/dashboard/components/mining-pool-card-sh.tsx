import React, { useEffect, useState } from "react";
import { BsChevronRight } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic, Tooltip } from "antd";
import { ReactEcharts } from "@/components/react-echarts";
import { ROUTE_PATHS } from "@/constants/common.ts";

import { fetchTotalLastHashStatus, fetchTotalRealTimeStatus } from "@/pages/mining/api.tsx";

interface MiningPoolCardProps {
  poolType: string; // 接收矿池类型作为 props
}

const MiningPoolShCard: React.FC<MiningPoolCardProps> = ({ poolType }) => {
  const [realTimeStatus, setRealTimeStatus] = useState<any>(null); // 状态数据
  const [setLastHashStatus] = useState<any>(null); // 状态数据
  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  const [error] = useState<string | null>(null); // 错误信息

  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(ROUTE_PATHS.hashDetail);
  };

  const fetchData = async (poolType: string) => {
    try {
      const realTimeStatusResult = await fetchTotalRealTimeStatus(poolType);
      setRealTimeStatus(realTimeStatusResult.data); // 假设返回数据在 result.data 中

      const lastHashStatusResult = await fetchTotalLastHashStatus(poolType);
      setLastHashStatus(lastHashStatusResult.data); // 假设返回数据在 result.data 中

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setLastHashStatus({
        last24HourEfficiency: "N/A",
        lastWeekEfficiency: "N/A",
        lastMonth: "N/A",
        lastMonthEfficiency: "N/A",
        last2Month: "N/A",
        last2MonthEfficiency: "N/A",
      });
      // setError("获取状态失败");

      setRealTimeStatus({
        totalCurrentHashRate: 0, // 默认算力
        totalMasterCurrentHashrate: 0, // 默认主矿池算力
        totalBackUpCurrentHashrate: 0, // 默认备用矿池算力
        realTimeHashEfficiency: "N/A",
      });
    } finally {
      setLoading(false);
    }
  };
  const getOption = (realTimeHashEfficiency: any) => {
    //{realTimeStatus?.realTimeHashEfficiency}

    return {
      series: [
        {
          type: "gauge",
          progress: {
            show: true,
            width: 18,
          },
          axisLine: {
            lineStyle: {
              width: 18,
            },
          },
          axisTick: {
            show: false,
          },
          splitLine: {
            length: 15,
            lineStyle: {
              width: 2,
              color: "#999",
            },
          },
          axisLabel: {
            distance: 25,
            color: "#999",
            fontSize: 20,
          },
          anchor: {
            show: true,
            showAbove: true,
            size: 25,
            itemStyle: {
              borderWidth: 10,
            },
          },
          title: {
            show: false,
          },
          detail: {
            valueAnimation: true,
            fontSize: 16,
            offsetCenter: [0, realTimeHashEfficiency],
          },
          data: [
            {
              value: realTimeHashEfficiency,
            },
          ],
        },
      ],
    };
  };

  useEffect(() => {
    fetchData(poolType);
  }, [poolType]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Card
        title={"理论算力"}
        loading={loading}
        bordered={false}
        className="card-wapper"
        extra={
          <span
            onClick={handleNavigate}
            style={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              fontSize: "18px",
              color: "#1890ff",
              transition: "color 0.3s ease", // 添加过渡效果
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#40a9ff")} // 鼠标悬停变蓝色
            onMouseLeave={(e) => (e.currentTarget.style.color = "#1890ff")} // 鼠标离开恢复颜色
          >
            <BsChevronRight style={{ marginLeft: "8px" }} />
          </span>
        }
      >
        <Row gutter={24}>
          <Col span={24}>
            <Statistic
              value={realTimeStatus?.totalCurrentHashRate}
              valueStyle={{ fontSize: "2.5rem", color: "#071437", fontWeight: "600" }}
            />
            <span className="fs-6 text-gray-500 fw-semibold">
              理论总算力(PH/s){" "}
              <Tooltip
                title={
                  <>
                    主矿池算力: {realTimeStatus?.totalMasterCurrentHashrate} PH/s
                    <br />
                    备用矿池算力: {realTimeStatus?.totalBackUpCurrentHashrate} PH/s
                  </>
                }
              >
                <InfoCircleOutlined style={{ cursor: "pointer" }} />
              </Tooltip>
            </span>
          </Col>
        </Row>
      </Card>
      <Card title={"实时算力达成率"}>
        <Row gutter={24}>
          <Col span={24}>
            {/* <Statistic
              value={realTimeStatus?.totalMasterCurrentHashrate}
              valueStyle={{ fontSize: "2.5rem", color: "#071437", fontWeight: "600" }}
            />
            <span className="fs-6 text-gray-500 fw-semibold">理论主矿池算力(PH/s) <Tooltip
              title={
                <>
                  主矿池算力: {realTimeStatus?.totalMasterCurrentHashrate} PH/s
                  <br />
                  备用矿池算力: {realTimeStatus?.totalBackUpCurrentHashrate} PH/s
                </>
              }
            >
              <InfoCircleOutlined style={{ cursor: "pointer" }} />
            </Tooltip></span> */}
            <ReactEcharts
              option={getOption(realTimeStatus?.realTimeHashEfficiency)}
              style={{ height: 160 }}
            />
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MiningPoolShCard;
