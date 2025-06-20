// MiningStatusCard.tsx
import React, { useEffect, useState } from "react";
import { BsChevronRight } from "react-icons/bs";
import { Card, Col, Row } from "antd";

interface MiningPoolCardProps {
  poolType: string; // 接收矿池类型作为 props
}

const MiningOMShCard: React.FC<MiningPoolCardProps> = ({ poolType }) => {
  const [data, setData] = useState<any>(null); // 状态数据
  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  const [error] = useState<string | null>(null); // 错误信息

  const handleNavigate = () => {
    // history.push("/your-target-page"); // 替换为目标页面的路径
  };

  const fetchData = async (poolType: string) => {
    try {
      if (poolType === "NS") {
        setData({
          currentOnlineCount: 69836, // 随机生成值
          totalFaultsCount: 12070, // 随机生成值
          yesterdayPowerCutDuration: 1.5, // 随机生成值
          lastWeekPowerCutDuration: 10, // 随机生成值
          lastMonthPowerCutDuration: 28, // 随机生成值
          yesterdayFaultsCount: 49,
          lastWeekFaultsCount: 320,
          lastMonthFaultsCount: 1902,
          yesterdayFailureRate: 0.79,
          lastWeekFailureRate: 1.07,
          lastMonthFailureRate: 7.13,
        });
      } else {
        setData({
          currentOnlineCount: 88196, // 随机生成值
          totalFaultsCount: 8837, // 随机生成值
          yesterdayPowerCutDuration: 1, // 随机生成值
          lastWeekPowerCutDuration: 8, // 随机生成值
          lastMonthPowerCutDuration: 25, // 随机生成值
          yesterdayFaultsCount: 46,
          lastWeekFaultsCount: 290,
          lastMonthFaultsCount: 1804,
          yesterdayFailureRate: 0.76,
          lastWeekFailureRate: 1.27,
          lastMonthFailureRate: 6.13,
        });
      }
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
    <div>
      <Card
        title={"限电时长"}
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
              color: "#1890ff", // 默认颜色
              transition: "color 0.3s ease", // 添加过渡效果
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#40a9ff")} // 鼠标悬停颜色
            onMouseLeave={(e) => (e.currentTarget.style.color = "#1890ff")} // 鼠标离开恢复颜色
          >
            <BsChevronRight style={{ marginLeft: "8px" }} />
          </span>
        }
      >
        <Row gutter={24}>
          <Col span={24} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
            <Row gutter={24}>
              <Col span={10}>
                <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                  昨日
                </Col>
                <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                  上周
                </Col>
                <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                  上月
                </Col>
              </Col>
              <Col span={14}>
                <Col span={24} style={{ fontSize: "14px", color: "black", marginBottom: "12px" }}>
                  1.5 小时
                </Col>
                <Col span={24} style={{ fontSize: "14px", color: "black", marginBottom: "12px" }}>
                  10 小时
                </Col>
                <Col span={24} style={{ fontSize: "14px", color: "black", marginBottom: "12px" }}>
                  28 小时
                </Col>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      <Card
        title={"待定"}
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
              color: "#1890ff", // 默认颜色
              transition: "color 0.3s ease", // 添加过渡效果
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#40a9ff")} // 鼠标悬停颜色
            onMouseLeave={(e) => (e.currentTarget.style.color = "#1890ff")} // 鼠标离开恢复颜色
          >
            <BsChevronRight style={{ marginLeft: "8px" }} />
          </span>
        }
      >
        <Row gutter={24}>
          <Col span={8} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
            <Row gutter={24}>
              <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", color: "gray" }}>昨日故障数</span>
                <span style={{ fontSize: "14px", color: "black", marginLeft: "10px" }}>
                  {data?.yesterdayFaultsCount} 台
                </span>
              </Col>
              <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", color: "gray" }}>折合年维修率</span>
                <span style={{ fontSize: "14px", color: "black", marginLeft: "10px" }}>
                  {data?.yesterdayFailureRate}%
                </span>
              </Col>
            </Row>
          </Col>
          <Col span={8} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
            <Row gutter={24}>
              <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", color: "gray" }}>近一周故障数</span>
                <span style={{ fontSize: "14px", color: "black", marginLeft: "10px" }}>
                  {data?.lastWeekFaultsCount}台
                </span>
              </Col>
              <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", color: "gray" }}>折合年维修率</span>
                <span style={{ fontSize: "14px", color: "black", marginLeft: "10px" }}>
                  {data?.lastWeekFailureRate}%
                </span>
              </Col>
            </Row>
          </Col>
          <Col span={8} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
            <Row gutter={24}>
              <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", color: "gray" }}>近一月故障数</span>
                <span style={{ fontSize: "14px", color: "black", marginLeft: "10px" }}>
                  {data?.lastMonthFaultsCount} 台
                </span>
              </Col>
              <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                <span style={{ fontSize: "14px", color: "gray" }}>折合年维修率</span>
                <span style={{ fontSize: "14px", color: "black", marginLeft: "10px" }}>
                  {data?.lastMonthFailureRate}%
                </span>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MiningOMShCard;
