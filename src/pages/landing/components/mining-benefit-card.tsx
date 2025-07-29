import React, { useEffect, useState } from "react";
import { BsChevronRight, BsCurrencyDollar } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { Card, Col, Row, Statistic } from "antd";
import { ROUTE_PATHS } from "@/constants/common.ts";

import { fetchHomesuanli, fetchTotalLastProfitStatus } from "@/pages/mining/api.tsx";

interface MiningPoolCardProps {
  poolType: string; // 接收矿池类型作为 props
}

const MiningBenefitCard: React.FC<MiningPoolCardProps> = ({ poolType }) => {
  const [lastProfitStatus, setLastProfitStatus] = useState<any>(null); // 状态数据
  const [loading, setLoading] = useState<boolean>(true); // 加载状态
  const [error] = useState<string | null>(null); // 错误信息
  const [suanlilv, setSuanlilv] = useState<any>(null); // 状态数据

  const formatNumber = (value) => {
    const num = Number(value);
    if (isNaN(num)) return ""; // 非法值返回空字符串

    return num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const navigate = useNavigate();

  const handleNavigate = () => {
    navigate(ROUTE_PATHS.profitDetail);
  };

  const fetchData = async (poolType: string) => {
    try {
      const lastProfitStatusResult = await fetchTotalLastProfitStatus(poolType);
      setLastProfitStatus(lastProfitStatusResult.data); // 假设返回数据在 result.data 中
      console.log(lastProfitStatusResult.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  const fetchSuanlilvData = async (poolType: string) => {
    try {
      const currentDate = "2025-07-26";
      const suanlilv = await fetchHomesuanli(poolType, currentDate);
      setSuanlilv(suanlilv.data); // 假设返回数据在 result.data 中
      console.log(suanlilv.data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      /* empty */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(poolType);
    fetchSuanlilvData(poolType);
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
            <BsCurrencyDollar
              style={{ fontSize: "24px", marginRight: "8px", fontWeight: "bold", color: "#1890ff" }}
            />
          </Col>
          <Col>
            <h3 style={{ marginLeft: 0, fontSize: "18px" }}>效益</h3>
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
            value={`${formatNumber(lastProfitStatus?.last_day_income_statistics.income_btc)}`} // 假设昨日总收益在状态中
            valueStyle={{ fontSize: "20px", fontWeight: "bold", color: "#3dbb32" }}
            // prefix={<BiLogoBitcoin style={{ fontSize: "20px", color: "gold" }} />}
            suffix={"BTC"}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={`昨日产出效率`}
            value={`${suanlilv?.BTCOutputPerEPower}`} // 假设昨日总收益在状态中
            valueStyle={{ fontSize: "16px", fontWeight: "600" }}
            // prefix={<BiLogoBitcoin style={{ fontSize: "20px", color: "gold" }} />}
            suffix={"BTC/EH"}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title={`昨日全网产出效率`}
            value={`${suanlilv?.BTCNetworkPerEPower}`} // 假设昨日总收益在状态中
            valueStyle={{ fontSize: "16px", fontWeight: "600" }}
            // prefix={<BiLogoBitcoin style={{ fontSize: "20px", color: "gold" }} />}
            suffix={"BTC/EH"}
          />
        </Col>
        <Col span={12} style={{ marginTop: "25px" }}>
          <Statistic
            title={`${lastProfitStatus?.month}月产出数量`}
            value={`${formatNumber(lastProfitStatus?.month_statistics.income_btc)} BTC`} // 假设昨日总收益在状态中
            valueStyle={{ fontSize: "16px", fontWeight: "bold" }}
            // prefix={<BiLogoBitcoin style={{ fontSize: "20px", color: "gold" }} />}
          />
        </Col>
        <Col span={12} style={{ marginTop: "25px" }}>
          <Statistic
            title={`${lastProfitStatus?.month}月产出价值`}
            value={`${formatNumber(lastProfitStatus?.month_statistics.income_usd)} $`} // 假设昨日总收益在状态中
            valueStyle={{ fontSize: "16px", fontWeight: "bold" }}
          />
        </Col>

        <Col span={12} style={{ marginTop: "25px" }}>
          <Statistic
            title={`${lastProfitStatus?.month}月托管+运维`}
            value={`${formatNumber(lastProfitStatus?.month_statistics.hosting_fee)} $`} // 假设昨日总收益在状态中
            valueStyle={{ fontSize: "16px", fontWeight: "bold" }}
          />
        </Col>
      </Row>
      <Row style={{ marginTop: "25px" }} gutter={24}>
        <Col span={6} style={{ paddingLeft: "10px" }}>
          <Statistic
            title={`昨日平均托管费占比`}
            value={lastProfitStatus?.last_day_hosting_fee_ratio} // 假设效率值在状态中
            valueStyle={{ fontSize: "16px", fontWeight: "bold" }}
            // suffix="%"
          />
        </Col>
        <Col span={6} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "10px" }}>
          <Statistic
            title="昨日最高托管费占比"
            value={lastProfitStatus?.max_last_day_custody_ratio} // 假设一周平均效率在状态中
            valueStyle={{ fontSize: "16px", fontWeight: "bold" }}
            suffix="%"
          />
        </Col>
        <Col span={6} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "10px" }}>
          <Statistic
            title={`${lastProfitStatus?.month}月托管费占比`} // 使用模板字符串来动态插入月份
            value={lastProfitStatus?.month_hosting_fee_ratio} // 假设一周平均效率在状态中
            valueStyle={{ fontSize: "16px", fontWeight: "bold" }}
            // suffix="%"
          />
        </Col>
        <Col span={6} style={{ borderLeft: "1px solid #f0f0f0", paddingLeft: "10px" }}>
          <Statistic
            title={`最高场地近14天平均托管费占比`} // 使用模板字符串来动态插入月份
            value={lastProfitStatus?.max_last_2week_custody_ratio + "%"} // 假设一周平均效率在状态中
            valueStyle={{ fontSize: "16px", fontWeight: "bold" }}
            // suffix="%"
          />
        </Col>
      </Row>
    </Card>
  );
};

export default MiningBenefitCard;
