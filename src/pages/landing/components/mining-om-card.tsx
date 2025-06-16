// MiningStatusCard.tsx
import React, { useEffect, useState } from "react";
import { BiLogoBitcoin } from "react-icons/bi";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Card, Col, Row, Spin, Statistic, Tooltip } from "antd";
import { FaTachometerAlt } from "react-icons/fa";
import { BsChevronRight } from "react-icons/bs";

import { fetchTotalLastProfitStatus, fetchTotalRealTimeStatus } from "@/pages/mining/api.tsx";

interface MiningPoolCardProps {
  poolType: string; // 接收矿池类型作为 props
}

const MiningOMCard: React.FC<MiningPoolCardProps> = ({ poolType }) => {
  const [realTimeStatus, setRealTimeStatus] = useState<any>(null); // 状态数据
  const [lastDayStatus, setLastDayStatus] = useState<any>(null); // 状态数据
  const [lastWeekStatus, setLastWeekStatus] = useState<any>(null); // 状态数据
  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  const [error, setError] = useState<string | null>(null); // 错误信息

  const handleNavigate = () => {
    // history.push("/your-target-page"); // 替换为目标页面的路径
  };

  const fetchData = async (poolType: string) => {
    try {
      const realTimeStatusResult = await fetchTotalRealTimeStatus(poolType);
      setRealTimeStatus(realTimeStatusResult.data); // 假设返回数据在 result.data 中


      const lastWeekStatusResult = await fetchTotalLastProfitStatus(poolType);
      setLastWeekStatus(lastWeekStatusResult.data); // 假设返回数据在 result.data 中

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setLastDayStatus({
        lastSettlementDate: "N/A", // 可以根据需要设置默认值
        totalHashEfficiency: 0,
        totalProfitBtc: 0,
        totalMasterProfitBtc: 0,
        totalBackUpProfitBtc: 0,
      });
      // setError("获取状态失败");

      setLastWeekStatus({
        averageEfficiency: 0, // 默认值
      });

      setRealTimeStatus({
        totalCurrentHashRate: 0, // 默认算力
        totalOnline: 0, // 默认在线人数
        totalOffline: 0, // 默认离线人数
        totalMasterCurrentHashrate: 0, // 默认主矿池算力
        totalBackUpCurrentHashrate: 0, // 默认备用矿池算力
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
            <FaTachometerAlt style={{ fontSize: "24px", marginRight: "8px" }} />
          </Col>
          <Col>
            <h3 style={{ marginLeft: 10, fontSize: "24px" }}>运维</h3>
          </Col>
        </Row>
      }
      loading={loading}
      bordered={false}
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
        <Col span={8}>
          <Statistic
            title={`当前在线数 / 累计故障下架总数`}
            // value={` 0 / 20000`} // 假设昨日总收益在状态中
            valueStyle={{ color: "green", fontSize: "20px", fontWeight: "bold" }}
            // valueStyle={{ display: 'flex', alignItems: 'center' }}
            valueRender={() => (
              <span style={{ display: "flex", alignItems: "baseline" }}>
                <span
                  style={{
                    color: "red",
                    fontWeight: "bold",
                    fontSize: "20px",
                  }}
                >
                  {/*{lastDayStatus?.totalProfitBtc}*/}1000
                </span>
                <span style={{ margin: "0 8px" }}> / </span>
                <span style={{ color: "green", fontWeight: "bold", fontSize: "20px" }}>
                  {/*{lastDayStatus?.totalFaults}*/} 200000
                </span>
              </span>
            )}
            // prefix={<BiLogoBitcoin style={{ fontSize: "20px", color: "gold" }} />}
            // suffix={
            //   <span style={{ fontSize: "16px", color: "gray", fontWeight: "normal" }}>
            //     <Tooltip
            //       title={
            //         <>
            //           主矿池: {lastDayStatus?.totalMasterProfitBtc}
            //           <br />
            //           备用矿池: {lastDayStatus?.totalBackUpProfitBtc}
            //         </>
            //       }
            //     >
            //       <InfoCircleOutlined style={{ marginLeft: "8px", fontSize: "12px", cursor: "pointer" }} />
            //     </Tooltip>
            //   </span>
            // }
          />
        </Col>
        <Col span={14} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
          <Row gutter={24}>
            <Col span={10}>
              <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                昨日限电时长
              </Col>
              <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                上周限电时长
              </Col>
              <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                上月限电时长
              </Col>
            </Col>
            <Col span={14}>
              <Col span={24} style={{ fontSize: "14px", color: "black", marginBottom: "12px" }}>
                86 小时
              </Col>
              <Col span={24} style={{ fontSize: "14px", color: "black", marginBottom: "12px" }}>
                560 小时
              </Col>
              <Col span={24} style={{ fontSize: "14px", color: "black", marginBottom: "12px" }}>
                560 小时
              </Col>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row style={{ marginTop: "48px" }} gutter={24}>
        <Col span={8} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
          <Row gutter={24}>
            <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
              <span style={{ fontSize: "14px", color: "gray" }}>昨日故障数</span>
              <span style={{ fontSize: "14px", color: "black", marginLeft: "10px" }}>123 台</span>
            </Col>
            <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
              <span style={{ fontSize: "14px", color: "gray" }}>折合年故障率</span>
              <span style={{ fontSize: "14px", color: "black", marginLeft: "10px" }}>86.09%</span>
            </Col>
          </Row>
        </Col>
        <Col span={8} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
          <Row gutter={24}>
            <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
              <span style={{ fontSize: "14px", color: "gray" }}>近一周故障数</span>
              <span style={{ fontSize: "14px", color: "black", marginLeft: "10px" }}>123 台</span>
            </Col>
            <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
              <span style={{ fontSize: "14px", color: "gray" }}>折合年故障率</span>
              <span style={{ fontSize: "14px", color: "black", marginLeft: "10px" }}>86.09%</span>
            </Col>
          </Row>
        </Col>
        <Col span={8} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
          <Row gutter={24}>
            <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
              <span style={{ fontSize: "14px", color: "gray" }}>近一月故障数</span>
              <span style={{ fontSize: "14px", color: "black", marginLeft: "10px" }}>123 台</span>
            </Col>
            <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
              <span style={{ fontSize: "14px", color: "gray" }}>折合年故障率</span>
              <span style={{ fontSize: "14px", color: "black", marginLeft: "10px" }}>86.09%</span>
            </Col>
          </Row>
        </Col>
      </Row>
    </Card>
  );
};

export default MiningOMCard;
