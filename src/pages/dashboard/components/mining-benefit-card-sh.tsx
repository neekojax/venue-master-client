import React, { useEffect, useState } from "react";
import { BsChevronRight } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { Card, Col, Row } from "antd";
import { ROUTE_PATHS } from "@/constants/common.ts";

import { fetchTotalLastProfitStatus } from "@/pages/mining/api.tsx";

interface MiningPoolCardProps {
  poolType: string; // 接收矿池类型作为 props
}

const MiningBenefitShCard: React.FC<MiningPoolCardProps> = ({ poolType }) => {
  const [lastProfitStatus, setLastProfitStatus] = useState<any>(null); // 状态数据
  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  const [error] = useState<string | null>(null); // 错误信息

  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(ROUTE_PATHS.profitDetail);
  };

  const fetchData = async (poolType: string) => {
    try {
      const lastProfitStatusResult = await fetchTotalLastProfitStatus(poolType);
      setLastProfitStatus(lastProfitStatusResult.data); // 假设返回数据在 result.data 中
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

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Card
        title={"产出数量"}
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
                  {`${lastProfitStatus?.month}月产出数量`}
                </Col>
                {/* <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                  {`${lastProfitStatus?.month}月产出价值`}
                </Col>
                <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                  {`${lastProfitStatus?.month}月托管+运维`}
                </Col> */}
              </Col>
              <Col span={14}>
                <Col
                  span={24}
                  style={{ fontSize: "14px", color: "black", marginBottom: "12px", fontWeight: "bold" }}
                >
                  {`${lastProfitStatus?.month_statistics.income_btc} BTC`}
                </Col>
                {/* <Col
                  span={24}
                  style={{ fontSize: "14px", color: "black", marginBottom: "12px", fontWeight: "bold" }}
                >
                  {`${lastProfitStatus?.month_statistics.income_usd} $`}
                </Col>
                <Col
                  span={24}
                  style={{ fontSize: "14px", color: "black", marginBottom: "12px", fontWeight: "bold" }}
                >
                  {`${lastProfitStatus?.month_statistics.hosting_fee} $`}
                </Col> */}
              </Col>
            </Row>
          </Col>
        </Row>
        {/* <Row style={{ marginTop: "48px" }} gutter={24}>
          <Col span={8} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
            <Statistic
              title={`昨日电费占比`}
              value={lastProfitStatus?.last_day_hosting_fee_ratio} // 假设效率值在状态中
              valueStyle={{ fontSize: "14px", fontWeight: "bold" }}
            // suffix="%"
            />
          </Col>
          <Col span={8} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
            <Statistic
              title="近14天电费占比"
              value={lastProfitStatus?.last_2week_hosting_fee_ratio} // 假设一周平均效率在状态中
              valueStyle={{ fontSize: "14px", fontWeight: "bold" }}
            // suffix="%"
            />
          </Col>
          <Col span={8} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
            <Statistic
              title={`${lastProfitStatus?.month}月电费占比`} // 使用模板字符串来动态插入月份
              value={lastProfitStatus?.month_hosting_fee_ratio} // 假设一周平均效率在状态中
              valueStyle={{ fontSize: "14px", fontWeight: "bold" }}
            // suffix="%"
            />
          </Col>
        </Row> */}
      </Card>

      <Card
        title={"产出价值"}
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
              <Col span={24}>
                {/* <Col span={10}> */}
                {/* <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                  {`${lastProfitStatus?.month}月产出数量`}
                </Col> */}
                {/* <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                    {`${lastProfitStatus?.month}月产出价值`}
                  </Col>
                  <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                    {`${lastProfitStatus?.month}月托管+运维`}
                  </Col>
                </Col> */}

                <Col
                  span={24}
                  style={{ fontSize: "14px", color: "black", marginBottom: "12px", fontWeight: "bold" }}
                >
                  {`${lastProfitStatus?.month}月产出价值`}：{" "}
                  {`${lastProfitStatus?.month_statistics.income_usd} $`}
                </Col>
                <Col
                  span={24}
                  style={{ fontSize: "14px", color: "black", marginBottom: "12px", fontWeight: "bold" }}
                >
                  {`${lastProfitStatus?.month}月托管+运维`}：{" "}
                  {`${lastProfitStatus?.month_statistics.hosting_fee} $`}
                </Col>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default MiningBenefitShCard;
