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
      <Row gutter={24}>
        <Col span={12}>
          <Row gutter={24}>
            <Col span={24} style={{ marginTop: "16px" }}>
              <MiningPoolCard poolType={poolType} />
            </Col>
            <Col span={24} style={{ marginTop: "12px" }}>
              <MiningBenefitCard poolType={poolType} />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row gutter={24}>
            <Col span={24} style={{ marginTop: "16px" }}>
              <MiningEfficiencyCard poolType={poolType} />
            </Col>
            <Col span={24} style={{ marginTop: "16px" }}>
              <MiningBenefitLine poolType={poolType} />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
