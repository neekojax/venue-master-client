// MiningStatusCard.tsx
import React, { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Spin, Tooltip } from "antd";
import { BiLogoBitcoin } from "react-icons/bi";
import { InfoCircleOutlined } from '@ant-design/icons';
import { fetchTotalLastDayStatus, fetchTotalLastWeekStatus, fetchTotalRealTimeStatus } from "@/pages/mining/api.tsx";

interface MiningPoolCardProps {
  poolType: string; // 接收矿池类型作为 props
}

const MiningPoolCard: React.FC<MiningPoolCardProps> = ({ poolType }) => {
  const [realTimeStatus, setRealTimeStatus] = useState<any>(null); // 状态数据
  const [lastDayStatus, setLastDayStatus] = useState<any>(null); // 状态数据
  const [lastWeekStatus, setLastWeekStatus] = useState<any>(null); // 状态数据
  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  const [error, setError] = useState<string | null>(null); // 错误信息

  useEffect(() => {
    const fetchData = async () => {
      try {
        const realTimeStatusResult = await fetchTotalRealTimeStatus(poolType);
        setRealTimeStatus(realTimeStatusResult.data); // 假设返回数据在 result.data 中

        const lastDayStatusResult = await fetchTotalLastDayStatus(poolType);
        setLastDayStatus(lastDayStatusResult.data); // 假设返回数据在 result.data 中

        const lastWeekStatusResult = await fetchTotalLastWeekStatus(poolType);
        setLastWeekStatus(lastWeekStatusResult.data); // 假设返回数据在 result.data 中

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("获取状态失败");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [poolType]);

  if (loading) {
    return <Spin />;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <Card title={poolType} bordered={false}>
      <Row gutter={16} justify="space-between">
        <Col xs={24} sm={8}>
          <Statistic
            title="实时总算力"
            value={realTimeStatus.totalCurrentHashRate}
            suffix={
              <span style={{ fontSize: "16px", color: "gray", fontWeight: "normal" }}>
                PH/s
                <Tooltip
                  title={
                    <>
                      主矿池算力: {realTimeStatus.totalMasterCurrentHashrate} PH/s
                      <br />
                      备用矿池算力: {realTimeStatus.totalBackUpCurrentHashrate} PH/s
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
        <Col xs={24} sm={8} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
          <Statistic
            title="在线 / 离线"
            prefix={
              <span style={{ color: "#68D391", fontSize: "20px", fontWeight: "bold" }}>
                {realTimeStatus.totalOnline}
              </span>
            }
            value={"/"}
            valueStyle={{ color: "#888", fontSize: "16px" }}
            suffix={
              <span style={{ color: "#C53030", fontSize: "20px", fontWeight: "bold" }}>
                {realTimeStatus.totalOffline}
              </span>
            }
          />
        </Col>
        <Col xs={24} sm={8} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
          <Statistic
            title={`昨日算力达成率 (${lastDayStatus.lastSettlementDate})`}
            value={lastDayStatus.totalHashEfficiency} // 假设效率值在状态中
            valueStyle={{ fontSize: "20px", fontWeight: "bold" }}
            suffix="%"
          />
        </Col>
      </Row>
      <Row style={{ marginTop: "16px" }} gutter={16}>
        <Col xs={24} sm={8}>
          <Statistic
            title={`昨日总收益 (${lastDayStatus.lastSettlementDate})`}
            value={lastDayStatus.totalProfitBtc} // 假设昨日总收益在状态中
            valueStyle={{ color: "green", fontSize: "20px", fontWeight: "bold" }}
            prefix={<BiLogoBitcoin style={{ fontSize: "20px", color: "gold" }} />}
            suffix={
              <span style={{ fontSize: "16px", color: "gray", fontWeight: "normal" }}>
                PH/s
                <Tooltip
                  title={
                    <>
                      主矿池: {lastDayStatus.totalMasterProfitBtc}
                      <br />
                      备用矿池: {lastDayStatus.totalBackUpProfitBtc}
                    </>
                  }
                >
                  <InfoCircleOutlined style={{ marginLeft: "8px", fontSize: "12px", cursor: "pointer" }} />
                </Tooltip>
              </span>
            }
          />
        </Col>
        <Col xs={24} sm={8}>
          <Statistic
            title="近一周平均算力达成率"
            value={lastWeekStatus.averageEfficiency} // 假设一周平均效率在状态中
            valueStyle={{ fontSize: "20px", fontWeight: "bold" }}
            suffix="%"
          />
        </Col>
      </Row>
    </Card>
  );
};

export default MiningPoolCard;
