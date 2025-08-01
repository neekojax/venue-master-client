import React, { useEffect, useState } from "react";
import { BsChevronRight } from "react-icons/bs";
import { FaCogs } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { ArrowDownOutlined, ArrowUpOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Card, Col, Flex, Progress, ProgressProps, Row, Statistic, Tooltip } from "antd";
import { ROUTE_PATHS } from "@/constants/common.ts";

import { fetchTotalLastHashStatus, fetchTotalRealTimeStatus } from "@/pages/mining/api.tsx";

interface MiningPoolCardProps {
  poolType: string; // 接收矿池类型作为 props
}

const twoColors: ProgressProps["strokeColor"] = {
  "0%": "#87d068",
  "100%": "#108ee9",
};

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

  const diffColor = (diff: number) => {
    if (diff > 0) {
      // 增加向上绿色箭头+数字百分比
      return (
        <span style={{ color: "green" }}>
          <ArrowUpOutlined style={{ color: "green" }} />+ {diff.toFixed(2)}%
        </span>
      );
    }
    if (diff < 0) {
      return (
        <span style={{ color: "red" }}>
          <ArrowDownOutlined style={{ color: "red" }} />
          {diff.toFixed(2)}%
        </span>
      );
    }
    return "";
  };

  return (
    <Card
      className="card-wapper"
      title={
        <Row align="middle">
          <Col>
            <FaCogs style={{ fontSize: "24px", marginRight: "8px", fontWeight: "bold", color: "#1890ff" }} />
          </Col>
          <Col>
            <h3 style={{ marginLeft: 2, fontSize: "18px", color: "#333" }}>效率</h3>
          </Col>
        </Row>
      }
      loading={loading}
      bordered={false}
      extra={
        <span
          onClick={handleNavigate}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            fontSize: "14px",
            color: "rgba(0, 0, 0, 0.45)",
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
            className="text-gray-500 fw-semibold"
            style={{ fontSize: "12px" }}
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
            valueStyle={{ fontSize: "22px", fontWeight: "bold" }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="理论算力"
            className="fs-6 text-gray-500 fw-semibold"
            value={realTimeStatus?.totalTheoreticalHashrate}
            suffix={<span style={{ fontSize: "16px", color: "gray", fontWeight: "normal" }}>PH/s</span>}
            valueStyle={{ fontSize: "20px", fontWeight: "bold" }}
          />
        </Col>
        {/* <Col span={8} style={{ paddingLeft: "16px" }}>
          <Statistic
            title={`理论算力`}
            value={realTimeStatus?.totalTheoreticalHashrate} // 假设效率值在状态中
            valueStyle={{ fontSize: "20px", fontWeight: "bold" }}
            suffix={<span style={{ fontSize: "16px", color: "gray", fontWeight: "normal" }}>PH/s</span>}
          />
        </Col> */}
        <Col span={8} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
          <Statistic
            title={`实时算力达成率`}
            className="fs-6 text-gray-500 fw-semibold"
            value={realTimeStatus?.realTimeHashEfficiency} // 假设效率值在状态中
            valueStyle={{ fontSize: "20px", fontWeight: "bold", color: "#3dbb32" }}
            suffix="%"
          />
        </Col>
      </Row>
      <Row style={{ marginTop: "48px" }} gutter={16}>
        <Col span={12}>
          <Flex gap="middle" vertical>
            {[
              {
                title: "昨日算力达成率",
                color: "red",
                value: lastHashStatus?.last24HourEfficiency,
                diff: lastHashStatus?.last24HourEfficiencyDiff,
              },
              // { title: "近一周平均算力达成率", value: lastHashStatus?.lastWeekEfficiency },
              {
                title: `${lastHashStatus?.lastMonth}月算力达成率`,
                color: "#09f119",
                diff: lastHashStatus?.lastMonthEfficiencyDiff,
                value: lastHashStatus?.lastMonthEfficiency,
              },
              // {
              //   title: `${lastHashStatus?.last2Month}月算力达成率`,
              //   value: lastHashStatus?.last2MonthEfficiency,
              // },
            ].map((item, index) => (
              <Flex key={index} justify="space-between" align="center">
                <Row
                  style={{
                    background: "#f9fafb",
                    padding: "0.625rem",
                    borderRadius: "0.375rem",
                    width: "100%",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5);",
                  }}
                >
                  {/* <Col span={24}>
                    <span className="text-gray-500 fs-8 fw-semibold">{item.title}</span>
                  </Col> */}
                  <Col span={12}>
                    <span className="text-gray-500 fs-8 fw-semibold">{item.title}</span>
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    <span className="text-gray-500 fs-8 fw-semibold">{diffColor(item.diff)}</span>
                  </Col>
                  <Col span={24}>
                    <span className="text-gray-800 fs-4 fw-bold">{item.value}%</span>
                  </Col>
                  <Col span={24}>
                    <Progress
                      percent={Number(item.value) || 0}
                      status="active"
                      strokeColor={item.color}
                      style={{ flex: 1 }}
                      percentPosition={{ align: "start", type: "outer" }}
                      size="small"
                    />
                  </Col>
                </Row>
              </Flex>
            ))}
          </Flex>
        </Col>
        <Col span={12}>
          <Flex gap="middle" vertical>
            {[
              // { title: "24小时算力达成率", color: "red", value: lastHashStatus?.last24HourEfficiency },
              {
                title: "近一周平均算力达成率",
                color: twoColors,
                value: lastHashStatus?.lastWeekEfficiency,
                diff: lastHashStatus?.lastWeekEfficiencyDiff,
              },
              {
                title: `${lastHashStatus?.last2Month}月算力达成率`,
                value: lastHashStatus?.last2MonthEfficiency,
                diff: lastHashStatus?.last2MonthEfficiencyDiff,
              },
            ].map((item, index) => (
              <Flex key={index} justify="space-between" align="center">
                <Row
                  style={{
                    background: "#f9fafb",
                    padding: "0.625rem",
                    borderRadius: "0.375rem",
                    width: "100%",
                  }}
                >
                  <Col span={12}>
                    <span className="text-gray-500 fs-8 fw-semibold">{item.title}</span>
                  </Col>
                  <Col span={12} style={{ textAlign: "right" }}>
                    <span className="text-gray-500 fs-8 fw-semibold">{diffColor(item.diff)}</span>
                  </Col>
                  <Col span={24}>
                    <span className="text-gray-800 fs-4 fw-bold">{item.value}%</span>
                  </Col>
                  <Col span={24}>
                    <Progress
                      percent={Number(item.value) || 0}
                      status="active"
                      strokeColor={item.color}
                      style={{ flex: 1 }}
                      percentPosition={{ align: "start", type: "outer" }}
                      size="small"
                    />
                  </Col>
                </Row>
              </Flex>
            ))}
          </Flex>
        </Col>
        {/* <Col span={12}>
          <Flex gap="middle" vertical>
            {[
              { title: "24小时算力达成率", value: lastHashStatus?.last24HourEfficiency },
              { title: "近一周平均算力达成率", value: lastHashStatus?.lastWeekEfficiency },
              {
                title: `${lastHashStatus?.lastMonth}月算力达成率`,
                value: lastHashStatus?.lastMonthEfficiency,
              },
              {
                title: `${lastHashStatus?.last2Month}月算力达成率`,
                value: lastHashStatus?.last2MonthEfficiency,
              },
            ].map((item, index) => (
              <Flex key={index} justify="space-between" align="center">
                <span style={{ width: "200px", fontSize: "14px" }}>{item.title}</span>
                <Progress
                  percent={Number(item.value) || 0}
                  status="active"
                  strokeColor={twoColors}
                  style={{ flex: 1 }}
                />
              </Flex>
            ))}
          </Flex>
        </Col> */}
      </Row>
    </Card>
  );
};

export default MiningPoolCard;
