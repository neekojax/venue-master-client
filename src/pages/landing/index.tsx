import { Col, Row } from "antd";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";

import MiningBenefitCard from "@/pages/landing/components/mining-benefit-card.tsx";
import MiningBenefitLine from "@/pages/landing/components/mining-benefit-line.tsx";
import MiningEfficiencyCard from "@/pages/landing/components/mining-efficiency-card.tsx";
import MiningOMCard from "@/pages/landing/components/mining-om-card.tsx";
import MiningPoolCard from "@/pages/landing/components/mining-pool-card.tsx";
import PowerLimitationTrendChart from "@/pages/landing/components/power-limit-trend-chart.tsx";
import MiningRepairTrendChart from "@/pages/landing/components/repair-trend-chart.tsx";

export default function LandingPage() {
  useAuthRedirect();

  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  return (
    <div>
      <Row gutter={24}>
        <Col span={15}>
          <Row gutter={24}>
            <Col span={24} style={{ marginTop: "16px" }}>
              <MiningPoolCard poolType={poolType} />
            </Col>
            <Col span={24} style={{ marginTop: "32px" }}>
              <MiningBenefitCard poolType={poolType} />
            </Col>
            <Col span={24} style={{ marginTop: "32px" }}>
              <MiningOMCard poolType={poolType} />
            </Col>
          </Row>
        </Col>
        <Col span={9}>
          <Row gutter={24}>
            <Col span={24} style={{ marginTop: "16px" }}>
              <MiningEfficiencyCard poolType={poolType} />
            </Col>
            <Col span={24} style={{ marginTop: "16px" }}>
              <MiningBenefitLine poolType={poolType} />
            </Col>
            <Col span={24} style={{ marginTop: "16px" }}>
              <MiningRepairTrendChart />
            </Col>
            <Col span={24} style={{ marginTop: "16px" }}>
              <PowerLimitationTrendChart />
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
