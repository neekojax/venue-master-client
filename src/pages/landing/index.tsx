import useAuthRedirect from "@/hooks/useAuthRedirect.ts";
import { useSelector, useSettingsStore } from "@/stores";

import FaultMonitoringCard from "@/pages/landing/components/fault-monitoring-card.tsx";
import MiningBenefitCard from "@/pages/landing/components/mining-benefit-card.tsx";
import MiningBenefitLine from "@/pages/landing/components/mining-benefit-line.tsx";
import MiningEfficiencyCard from "@/pages/landing/components/mining-efficiency-card.tsx";
import MiningPoolCard from "@/pages/landing/components/mining-pool-card.tsx";
import SystemActivityCard from "@/pages/landing/components/system-activity-card.tsx";

export default function LandingPage() {
  useAuthRedirect();

  const { poolType } = useSettingsStore(useSelector(["poolType"]));

  return (
    <div>
      <div className="max-w-[1920px] mx-auto grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Row 1: Key Metrics Cards */}
        <div className="h-full">
          <MiningPoolCard poolType={poolType} />
        </div>
        <div className="h-full">
          <MiningBenefitCard poolType={poolType} />
        </div>
        <div className="h-full">
          <FaultMonitoringCard />
        </div>

        {/* Row 2: Charts & Logs */}
        <div className="h-[420px]">
          <MiningEfficiencyCard poolType={poolType} />
        </div>
        <div className="h-[420px]">
          <MiningBenefitLine poolType={poolType} />
        </div>
        <div className="h-[420px]">
          <SystemActivityCard />
        </div>
      </div>
    </div>
  );
}
