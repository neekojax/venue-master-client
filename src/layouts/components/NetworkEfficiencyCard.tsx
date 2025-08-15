// NetworkEfficiencyCard.tsx
import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography } from "antd";
import dayjs from "dayjs";
import { useSelector, useSettingsStore } from "@/stores";

import "./index.css";

import { fetchHomesuanli } from "@/pages/mining/api.tsx";

const { Text } = Typography;

interface NetworkEfficiencyCardProps {
  title: string;
  value: number;
  duration?: number; // 动画持续时间（毫秒）
  unit?: string;
}

const NetworkEfficiencyCard: React.FC<NetworkEfficiencyCardProps> = ({
  title,
  value,
  duration = 1000,
  unit = "",
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  const fetchSuanlilvData = async (poolType: string) => {
    try {
      // const currentDate = dayjs().subtract(1, 'day').format('YYYY-MM-DD');
      // 获取昨天的日期
      const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");
      const suanlilv = await fetchHomesuanli(poolType, yesterday);

      value = suanlilv.data.BTCNetworkPerEPower;
      // console.log(value);
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // const currentVal = Math.floor(progress * value);
        // const currentVal = parseFloat((progress * new_value).toFixed(5));
        const currentVal = parseFloat((progress * value).toFixed(5));
        setDisplayValue(currentVal);
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    } catch (err) {
      /* empty */
      console.log(err);
    }
  };

  useEffect(() => {
    fetchSuanlilvData(poolType);
  }, []);

  return (
    <Card
      className="my-card"
      style={{ padding: 0, borderRadius: 5, minWidth: 250, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
    >
      <Row justify="space-between" align="middle" style={{ padding: 0 }}>
        <Col>
          <Text style={{ fontSize: 14 }}>{title}</Text>
        </Col>
        <Col>
          <Text strong style={{ fontSize: 14, color: "#1890ff", fontWeight: 700 }}>
            {displayValue.toLocaleString()}
            {unit && <span style={{ fontSize: 14, marginLeft: 4 }}>{unit}</span>}
          </Text>
        </Col>
      </Row>
    </Card>
  );
};

export default NetworkEfficiencyCard;
