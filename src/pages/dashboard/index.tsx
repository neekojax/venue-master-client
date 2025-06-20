import { Col, Row } from "antd";
import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";

import MiningBenefitCard from "@/pages/dashboard/components/mining-benefit-card.tsx";
import MiningBenefitShCard from "@/pages/dashboard/components/mining-benefit-card-sh.tsx";
import MiningBenefitLine from "@/pages/dashboard/components/mining-benefit-line.tsx";
import MiningEfficiencyCard from "@/pages/dashboard/components/mining-efficiency-card.tsx";
import MiningOMCard from "@/pages/dashboard/components/mining-om-card.tsx";
import MiningOMShCard from "@/pages/dashboard/components/mining-om-card-sh.tsx";
import MiningPoolCard from "@/pages/dashboard/components/mining-pool-card.tsx";
import MiningPoolShCard from "@/pages/dashboard/components/mining-pool-card-sh.tsx";
import TabYunweiButtons from "@/pages/dashboard/components/yunwei-tab.tsx";

export default function LandingPage() {
  useAuthRedirect();

  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  return (
    <div style={{ backgroundColor: "#fcfcfc" }}>
      <Row gutter={16} justify="space-between">
        <Col span={6}>
          {" "}
          <MiningPoolCard poolType={poolType} />
        </Col>
        <Col span={6}>
          {" "}
          <MiningPoolShCard poolType={poolType} />
        </Col>
        <Col span={12}>
          {" "}
          <MiningEfficiencyCard poolType={poolType} />
        </Col>
      </Row>

      <Row gutter={16} justify="space-between">
        <Col span={6}>
          <MiningBenefitCard poolType={poolType} />
        </Col>
        <Col span={6}>
          {" "}
          <MiningBenefitShCard poolType={poolType} />
        </Col>
        <Col span={12}>
          {" "}
          <MiningBenefitLine poolType={poolType} />
        </Col>
      </Row>
      <Row gutter={16} justify="space-between">
        <Col span={6}>
          {" "}
          <MiningOMCard poolType={poolType} />
        </Col>
        <Col span={6}>
          {" "}
          <MiningOMShCard poolType={poolType} />
        </Col>
        <Col span={12}>
          {" "}
          <TabYunweiButtons />
        </Col>
      </Row>
    </div>
  );
}
