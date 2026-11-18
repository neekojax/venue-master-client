import { useState } from "react";
import { DeploymentUnitOutlined, RadarChartOutlined } from "@ant-design/icons";
import { Tabs } from "antd";
import FaultPrediction from "./prediction/FaultPrediction";
import FaultMonitoring from "./FaultMonitoring";
import useAuthRedirect from "@/hooks/useAuthRedirect";

import "./fault-workspace.css";

import { t } from "@/locales";

export default function FaultMachineMonitorPage() {
  useAuthRedirect();
  const [activeTab, setActiveTab] = useState("monitor");

  return (
    <div className="fault-workspace">
      <Tabs
        className="fault-mode-tabs"
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "monitor",
            label: (
              <span className="fault-mode-label">
                <RadarChartOutlined />
                {t("故障监控")}
              </span>
            ),
            children: <FaultMonitoring />,
          },
          {
            key: "prediction",
            label: (
              <span className="fault-mode-label">
                <DeploymentUnitOutlined />
                {t("故障预测")}
              </span>
            ),
            children: <FaultPrediction />,
          },
        ]}
      />
    </div>
  );
}
