import { useState } from "react";
import { Button, Card, Space } from "antd";

import PowerLimitationTrendChart from "@/pages/dashboard/components/power-limit-trend-chart.tsx";
import MiningRepairTrendChart from "@/pages/dashboard/components/repair-trend-chart.tsx";

const TabYunweiButtons = () => {
  const [activeTab, setActiveTab] = useState("tab1");

  return (
    <div style={{ padding: 0 }}>
      <Card style={{ marginTop: 0 }}>
        <Space>
          <Button type={activeTab === "tab1" ? "primary" : "default"} onClick={() => setActiveTab("tab1")}>
            维修态曲线
          </Button>
          <Button type={activeTab === "tab2" ? "primary" : "default"} onClick={() => setActiveTab("tab2")}>
            限电率曲线
          </Button>
        </Space>

        <Card style={{ marginTop: 20 }}>
          {activeTab === "tab1" && <MiningRepairTrendChart />}
          {activeTab === "tab2" && <PowerLimitationTrendChart />}
        </Card>
      </Card>
    </div>
  );
};

export default TabYunweiButtons;
