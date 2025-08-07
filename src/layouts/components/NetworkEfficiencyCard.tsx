// NetworkEfficiencyCard.tsx
import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography } from "antd";

import "./index.css";

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

  useEffect(() => {
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // const currentVal = Math.floor(progress * value);
      const currentVal = parseFloat((progress * value).toFixed(5));
      setDisplayValue(currentVal);
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration]);

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
