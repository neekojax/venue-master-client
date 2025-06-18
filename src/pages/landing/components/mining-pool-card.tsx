import React, { useEffect, useState } from "react";
import { FaCogs } from "react-icons/fa";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic, Tooltip } from "antd";
import { BsChevronRight } from "react-icons/bs";

import { fetchTotalLastHashStatus, fetchTotalRealTimeStatus } from "@/pages/mining/api.tsx";
import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/constants/common.ts";

interface MiningPoolCardProps {
  poolType: string; // 接收矿池类型作为 props
}

const MiningPoolCard: React.FC<MiningPoolCardProps> = ({ poolType }) => {
  const [realTimeStatus, setRealTimeStatus] = useState<any>(null); // 状态数据
  const [lastHashStatus, setLastHashStatus] = useState<any>(null); // 状态数据
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

  useEffect(() => {
    fetchData(poolType);
  }, [poolType]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Card
      title={
        <Row align="middle">
          <Col>
            <FaCogs style={{ fontSize: "24px", marginRight: "8px" }} />
          </Col>
          <Col>
            <h3 style={{ marginLeft: 10, fontSize: "24px", color: "#333" }}>效率</h3>
          </Col>
        </Row>
      }
      loading={loading}
      bordered={false}
      // style={{ background: "#f7f9fc" }}
      style={{
        background: "#f7f9fc",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        padding: "5px",
      }} // 增加边框和阴影
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
        <Col span={8}>
          <Statistic
            title="实时总算力"
            value={realTimeStatus?.totalCurrentHashRate}
            suffix={
              <span style={{ fontSize: "16px", color: "gray", fontWeight: "normal" }}>
                PH/s
                <Tooltip
                  title={
                    <>
                      主矿池算力: {realTimeStatus?.totalMasterCurrentHashrate} PH/s
                      <br />
                      备用矿池算力: {realTimeStatus?.totalBackUpCurrentHashrate} PH/s
                    </>
                  }
                >
                  <InfoCircleOutlined style={{ fontSize: "12px", marginLeft: "8px", cursor: "pointer" }} />
                </Tooltip>
              </span>
            }
            valueStyle={{ fontSize: "20px", fontWeight: "bold" }}
          />
        </Col>
        <Col span={8} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
          <Statistic
            title={`实时算力达成率`}
            value={realTimeStatus?.realTimeHashEfficiency} // 假设效率值在状态中
            valueStyle={{ fontSize: "20px", fontWeight: "bold" }}
            suffix="%"
          />
        </Col>
      </Row>
      <Row style={{ marginTop: "48px" }} gutter={16}>
        {[
          { title: "24小时算力达成率", value: lastHashStatus?.last24HourEfficiency },
          { title: "近一周平均算力达成率", value: lastHashStatus?.lastWeekEfficiency },
          { title: `${lastHashStatus?.lastMonth}月算力达成率`, value: lastHashStatus?.lastMonthEfficiency },
          { title: `${lastHashStatus?.last2Month}月算力达成率`, value: lastHashStatus?.last2MonthEfficiency },
        ].map((item, index) => (
          <Col key={index} span={6} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
            <Statistic
              title={item.title}
              value={item.value}
              valueStyle={{ fontSize: "16px", fontWeight: "bold" }}
              suffix="%"
            />
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default MiningPoolCard;
