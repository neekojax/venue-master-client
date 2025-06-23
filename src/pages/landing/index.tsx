import { Col, Row } from "antd";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";

import MiningBenefitCard from "@/pages/landing/components/mining-benefit-card.tsx";
import MiningBenefitLine from "@/pages/landing/components/mining-benefit-line.tsx";
import MiningEfficiencyCard from "@/pages/landing/components/mining-efficiency-card.tsx";
import MiningPoolCard from "@/pages/landing/components/mining-pool-card.tsx";

export default function LandingPage() {
  useAuthRedirect();

  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  return (
    <div>
      <Row gutter={24} style={{ marginTop: "16px" }}>
        <Col span={12}>
          <MiningPoolCard poolType={poolType} />
        </Col>
        <Col span={12}>
          <MiningEfficiencyCard poolType={poolType} />
        </Col>
      </Row>
      <Row gutter={24} style={{ marginTop: "12px" }}>
        <Col span={12}>
          <MiningBenefitCard poolType={poolType} />
        </Col>
        <Col span={12}>
          <MiningBenefitLine poolType={poolType} />
        </Col>
      </Row>
    </div>
  );
}
