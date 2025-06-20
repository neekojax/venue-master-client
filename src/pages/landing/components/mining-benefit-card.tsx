import React, { useEffect, useState } from "react";
import { BsChevronRight, BsCurrencyDollar } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { Card, Col, Row, Statistic } from "antd";
import { ROUTE_PATHS } from "@/constants/common.ts";

import { fetchTotalLastProfitStatus } from "@/pages/mining/api.tsx";

interface MiningPoolCardProps {
  poolType: string; // 接收矿池类型作为 props
}

const MiningBenefitCard: React.FC<MiningPoolCardProps> = ({ poolType }) => {
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
    <Card
      className="card-wapper"
      title={
        <Row align="middle">
          <Col>
            <BsCurrencyDollar style={{ fontSize: "24px", marginRight: "8px", fontWeight: "bold" }} />
          </Col>
          <Col>
            <h3 style={{ marginLeft: 10, fontSize: "24px" }}>效益</h3>
          </Col>
        </Row>
      }
      loading={loading}
      bordered={false}
      // style={{
      //   background: "#f7f9fc",
      //   borderRadius: "8px",
      //   boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      //   padding: "5px",
      // }} // 增加边框和阴影
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
            title={`昨日总收益`}
            value={lastProfitStatus?.last_day_income_statistics.income_btc} // 假设昨日总收益在状态中
            valueStyle={{ color: "green", fontSize: "20px", fontWeight: "bold" }}
            // prefix={<BiLogoBitcoin style={{ fontSize: "20px", color: "gold" }} />}
            suffix={"BTC"}
          />
        </Col>
        <Col span={14} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
          <Row gutter={24}>
            <Col span={10}>
              <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                {`${lastProfitStatus?.month}月产出数量`}
              </Col>
              <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                {`${lastProfitStatus?.month}月产出价值`}
              </Col>
              <Col span={24} style={{ fontSize: "14px", color: "gray", marginBottom: "12px" }}>
                {`${lastProfitStatus?.month}月托管+运维`}
              </Col>
            </Col>
            <Col span={14}>
              <Col
                span={24}
                style={{ fontSize: "14px", color: "black", marginBottom: "12px", fontWeight: "bold" }}
              >
                {`${lastProfitStatus?.month_statistics.income_btc} BTC`}
              </Col>
              <Col
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
              </Col>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row style={{ marginTop: "48px" }} gutter={24}>
        <Col span={6} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
          <Statistic
            title={`昨日托管费占比`}
            value={lastProfitStatus?.last_day_hosting_fee_ratio} // 假设效率值在状态中
            valueStyle={{ fontSize: "14px", fontWeight: "bold" }}
            // suffix="%"
          />
        </Col>
        <Col span={6} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
          <Statistic
            title="昨日最高托管费占比"
            value={lastProfitStatus?.max_last_day_custody_ratio} // 假设一周平均效率在状态中
            valueStyle={{ fontSize: "14px", fontWeight: "bold" }}
            suffix="%"
          />
        </Col>
        <Col span={6} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
          <Statistic
            title={`${lastProfitStatus?.month}月托管费占比`} // 使用模板字符串来动态插入月份
            value={lastProfitStatus?.month_hosting_fee_ratio} // 假设一周平均效率在状态中
            valueStyle={{ fontSize: "14px", fontWeight: "bold" }}
            // suffix="%"
          />
        </Col>
        <Col span={6} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "16px" }}>
          <Statistic
            title="最高场地近14天平均托管费占比" // 使用模板字符串来动态插入月份
            value={lastProfitStatus?.max_last_2week_custody_ratio} // 假设一周平均效率在状态中
            valueStyle={{ fontSize: "14px", fontWeight: "bold" }}
            suffix="%"
          />
        </Col>
      </Row>
    </Card>
  );
};

export default MiningBenefitCard;
